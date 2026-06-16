// ============================================
// WhatsApp Cloud API 服务
// ============================================

import axios from 'axios'
import { env } from '../config/env.js'
import logger from '../utils/logger.js'

const WHATSAPP_API_BASE = `https://graph.facebook.com/${env.WHATSAPP_API_VERSION}/${env.WHATSAPP_PHONE_NUMBER_ID}`

/**
 * 构建 WhatsApp API 请求头
 */
function getHeaders() {
  return {
    Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  }
}

/**
 * 发送 WhatsApp 文本消息
 *
 * @param {string} to - 接收者手机号（国际格式，如 8613800138000）
 * @param {string} text - 消息内容
 * @returns {Promise<Object>} API 响应
 */
export async function sendTextMessage(to, text) {
  if (!env.WHATSAPP_ACCESS_TOKEN || !env.WHATSAPP_PHONE_NUMBER_ID) {
    logger.warn('[WhatsApp] 未配置 ACCESS_TOKEN 或 PHONE_NUMBER_ID，跳过实际发送')
    logger.info(`[WhatsApp Mock] 发送给 ${to}：${text.slice(0, 100)}...`)
    return { mock: true, to, text }
  }

  try {
    const url = `${WHATSAPP_API_BASE}/messages`
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: {
        preview_url: false,
        body: text.slice(0, 4096), // WhatsApp 文本限制 4096 字符
      },
    }

    const response = await axios.post(url, payload, { headers: getHeaders() })
    logger.info(`[WhatsApp] 消息已发送给 ${to}，message_id: ${response.data?.messages?.[0]?.id}`)
    return response.data
  } catch (error) {
    logger.error('[WhatsApp] 发送消息失败', {
      to,
      error: error.response?.data || error.message,
    })
    throw error
  }
}

/**
 * 发送 WhatsApp 模板消息
 *
 * @param {string} to - 接收者手机号
 * @param {string} templateName - 模板名称
 * @param {Array} parameters - 模板参数
 */
export async function sendTemplateMessage(to, templateName, parameters = []) {
  try {
    const url = `${WHATSAPP_API_BASE}/messages`
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'template',
      template: {
        name: templateName,
        language: { code: 'zh_CN' },
        components: [
          {
            type: 'body',
            parameters: parameters.map((value) => ({
              type: 'text',
              text: value,
            })),
          },
        ],
      },
    }

    const response = await axios.post(url, payload, { headers: getHeaders() })
    logger.info(`[WhatsApp] 模板消息已发送给 ${to}`)
    return response.data
  } catch (error) {
    logger.error('[WhatsApp] 发送模板消息失败', {
      to,
      templateName,
      error: error.response?.data || error.message,
    })
    throw error
  }
}

/**
 * 标记消息为已读
 *
 * @param {string} messageId - WhatsApp 消息 ID
 */
export async function markMessageAsRead(messageId) {
  try {
    const url = `${WHATSAPP_API_BASE}/messages`
    const payload = {
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId,
    }

    const response = await axios.post(url, payload, { headers: getHeaders() })
    logger.debug(`[WhatsApp] 消息已标记为已读: ${messageId}`)
    return response.data
  } catch (error) {
    logger.warn('[WhatsApp] 标记已读失败', error.message)
    // 标记已读失败不影响主流程
  }
}

export default {
  sendTextMessage,
  sendTemplateMessage,
  markMessageAsRead,
}
