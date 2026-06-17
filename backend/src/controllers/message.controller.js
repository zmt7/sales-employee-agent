// ============================================
// 消息管理控制器（供前端 Vue 界面使用）
// ============================================

import { v4 as uuidv4 } from 'uuid'
import logger from '../utils/logger.js'
import {
  saveMessage,
  getRecentMessages,
  saveToRedisHistory,
  getRedisHistory,
} from '../services/message.service.js'
import { askAI } from '../services/ai.service.js'
import { sendTextMessage } from '../services/whatsapp.service.js'

/**
 * GET /api/messages
 * 获取指定用户的最近消息
 *
 * Query params:
 *   - phone: 用户手机号
 *   - limit: 返回条数（默认 50）
 */
export async function getMessages(req, res) {
  try {
    const { phone, limit = '50' } = req.query

    if (!phone) {
      return res.status(400).json({
        success: false,
        error: '缺少 phone 参数',
      })
    }

    const messages = await getRecentMessages(phone, parseInt(limit, 10))

    return res.json({
      success: true,
      data: messages,
    })
  } catch (error) {
    logger.error('[Message API] 获取消息失败', error)
    return res.status(500).json({
      success: false,
      error: '获取消息失败',
    })
  }
}

/**
 * POST /api/messages/send
 * 从前端发送消息并获取 AI 回复
 *
 * Body:
 *   - phone: 用户手机号
 *   - content: 消息内容
 */
export async function sendMessage(req, res) {
  try {
    const { phone, content } = req.body

    if (!phone || !content) {
      return res.status(400).json({
        success: false,
        error: '缺少 phone 或 content 参数',
      })
    }

    if (typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: '消息内容不能为空',
      })
    }

    const trimmedContent = content.trim()

    // 1. 保存用户消息到 MySQL
    const userMsg = await saveMessage(phone, 'user', trimmedContent)

    // 2. 写入 Redis 历史
    await saveToRedisHistory(phone, 'user', trimmedContent)

    // 3. 获取对话历史
    const history = await getRedisHistory(phone)

    // 4. 调用 AI
    const aiReply = await askAI(trimmedContent, history)

    // 5. 保存 AI 回复
    const assistantMsg = await saveMessage(phone, 'assistant', aiReply)

    // 6. 写入 Redis 历史
    await saveToRedisHistory(phone, 'assistant', aiReply)

    // 7. 通过 WhatsApp 发送给用户（异步，失败不影响返回）
    sendTextMessage(phone, aiReply).catch((err) => {
      logger.error('[Message API] WhatsApp 发送失败', err.message)
    })

    return res.json({
      success: true,
      data: {
        userMessage: userMsg,
        assistantMessage: assistantMsg,
      },
    })
  } catch (error) {
    logger.error('[Message API] 发送消息失败', error)
    return res.status(500).json({
      success: false,
      error: '发送消息失败',
    })
  }
}

/**
 * GET /api/conversations
 * 获取所有有对话记录的用户列表
 */
export async function getConversations(req, res) {
  try {
    const { query: dbQuery } = await import('../db/mysql.js')
    const sql = `
      SELECT
        phone,
        MAX(created_at) as last_message_at,
        COUNT(*) as message_count
      FROM messages
      GROUP BY phone
      ORDER BY last_message_at DESC
      LIMIT 50
    `
    const rows = await dbQuery(sql)

    return res.json({
      success: true,
      data: rows,
    })
  } catch (error) {
    logger.error('[Message API] 获取对话列表失败', error)
    return res.status(500).json({
      success: false,
      error: '获取对话列表失败',
    })
  }
}

export default { getMessages, sendMessage, getConversations }
