// ============================================
// WhatsApp Webhook 控制器
// ============================================

import { env } from '../config/env.js'
import logger from '../utils/logger.js'
import { saveMessage, saveToRedisHistory, getRedisHistory } from '../services/message.service.js'
import { askAI } from '../services/ai.service.js'
import { sendTextMessage } from '../services/whatsapp.service.js'

/**
 * GET /webhook — 验证 Webhook
 *
 * WhatsApp 在注册 webhook 时会发送 GET 请求验证
 * 需要返回 hub.challenge 值
 */
export async function verifyWebhook(req, res) {
  const mode = req.query['hub.mode']
  const token = req.query['hub.verify_token']
  const challenge = req.query['hub.challenge']

  logger.info(`[Webhook Verify] mode=${mode}, token=${token}`)

  if (mode === 'subscribe' && token === env.WHATSAPP_VERIFY_TOKEN) {
    logger.info('[Webhook Verify] 验证成功')
    return res.status(200).send(challenge)
  }

  logger.warn('[Webhook Verify] 验证失败：token 不匹配')
  return res.sendStatus(403)
}

/**
 * POST /webhook — 接收 WhatsApp 消息
 *
 * WhatsApp Cloud API 会在用户发送消息时 POST 到该端点
 */
export async function handleWebhook(req, res) {
  try {
    const body = req.body
    logger.info('[Webhook] 收到推送', JSON.stringify(body).slice(0, 500))

    // WhatsApp 要求尽快返回 200，避免重试
    res.status(200).send('OK')

    // 解析消息（异步处理，不阻塞响应）
    await processWebhookBody(body)
  } catch (error) {
    logger.error('[Webhook] 处理失败', error)
    // 即使出错也返回 200，避免 WhatsApp 重试
    if (!res.headersSent) {
      res.status(200).send('OK')
    }
  }
}

/**
 * 解析并处理 Webhook body
 */
async function processWebhookBody(body) {
  // WhatsApp Cloud API 消息结构：
  // body.entry[0].changes[0].value.messages[0]
  // body.entry[0].changes[0].value.contacts[0]

  if (!body.entry || !Array.isArray(body.entry)) {
    logger.warn('[Webhook] 无效的消息结构：缺少 entry')
    return
  }

  for (const entry of body.entry) {
    if (!entry.changes || !Array.isArray(entry.changes)) continue

    for (const change of entry.changes) {
      const value = change.value || {}

      // 获取消息列表
      const messages = value.messages || []
      // 获取联系人列表
      const contacts = value.contacts || []

      for (const msg of messages) {
        await handleIncomingMessage(msg, contacts)
      }
    }
  }
}

/**
 * 处理单条传入消息
 */
async function handleIncomingMessage(msg, contacts) {
  try {
    const phone = msg.from // 发送者手机号

    // 提取消息内容
    let content = ''
    if (msg.type === 'text') {
      content = msg.text?.body || ''
    } else if (msg.type === 'image') {
      content = '[图片消息]'
      if (msg.image?.caption) {
        content += ' 附文：' + msg.image.caption
      }
    } else if (msg.type === 'audio') {
      content = '[语音消息]'
    } else if (msg.type === 'video') {
      content = '[视频消息]'
    } else if (msg.type === 'document') {
      content = '[文件消息]'
      if (msg.document?.filename) {
        content += ` (${msg.document.filename})`
      }
    } else if (msg.type === 'location') {
      content = '[位置消息]'
    } else {
      content = `[${msg.type} 类型消息]`
    }

    if (!content.trim()) {
      logger.warn(`[Webhook] 空消息，跳过: phone=${phone}`)
      return
    }

    logger.info(`[Webhook] 收到消息: phone=${phone}, type=${msg.type}, content=${content.slice(0, 80)}`)

    // 获取联系人名称（可选）
    const contact = contacts.find((c) => c.wa_id === phone)
    const contactName = contact?.profile?.name || phone

    // ====== 主流程 ======

    // 1. 保存用户消息到 MySQL
    await saveMessage(phone, 'user', content)

    // 2. 写入 Redis 对话历史
    await saveToRedisHistory(phone, 'user', content)

    // 3. 获取对话历史
    const history = await getRedisHistory(phone)

    // 4. 调用 AI 获取回复
    const aiReply = await askAI(content, history)

    // 5. 保存 AI 回复到 MySQL
    await saveMessage(phone, 'assistant', aiReply)

    // 6. 写入 Redis 对话历史
    await saveToRedisHistory(phone, 'assistant', aiReply)

    // 7. 通过 WhatsApp 发送回复
    await sendTextMessage(phone, aiReply)

    logger.info(`[Webhook] 处理完成: phone=${phone}, contact=${contactName}`)
  } catch (error) {
    logger.error(`[Webhook] 处理消息失败: ${error.message}`, error)
  }
}

export default { verifyWebhook, handleWebhook }
