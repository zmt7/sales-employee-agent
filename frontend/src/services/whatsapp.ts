// ============================================
// WhatsApp 后端 API 调用封装
// ============================================

import type { WhatsAppContact, WhatsAppMessage } from '@/types'

interface ConversationRaw {
  phone: string
  last_message_at: string
  message_count: number
}

interface MessageRaw {
  id: string
  phone: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

interface SendMessageRaw {
  userMessage: MessageRaw
  assistantMessage: MessageRaw
}

interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
}

const BASE = '/api/messages'

/**
 * 格式化电话号码为显示格式
 * 例如 "8613800010001" → "+86 138-0001-0001"
 */
function formatPhone(phone: string): string {
  if (phone.startsWith('86') && phone.length === 13) {
    return `+86 ${phone.slice(2, 5)}-${phone.slice(5, 9)}-${phone.slice(9)}`
  }
  return phone
}

/**
 * 将后端消息数据转为前端类型
 */
function toWhatsAppMessage(msg: MessageRaw): WhatsAppMessage {
  return {
    id: msg.id,
    contactId: msg.phone,
    role: msg.role,
    content: msg.content,
    contentType: 'text',
    timestamp: new Date(msg.created_at).getTime(),
    status: msg.role === 'assistant' ? 'sent' : 'read',
  }
}

/**
 * 获取所有对话列表（联系人）
 */
export async function fetchConversations(): Promise<WhatsAppContact[]> {
  const res = await fetch(`${BASE}/conversations`)
  const json: ApiResponse<ConversationRaw[]> = await res.json()

  if (!json.success) {
    throw new Error(json.error || '获取对话列表失败')
  }

  return json.data.map((item) => ({
    id: item.phone,
    name: `客户 ${item.phone.slice(-4)}`,
    phone: formatPhone(item.phone),
    lastMessage: `${item.message_count} 条消息`,
    lastMessageTime: formatTime(item.last_message_at),
    unread: 0,
    online: false,
  }))
}

/**
 * 获取指定用户的消息列表
 */
export async function fetchMessages(phone: string): Promise<WhatsAppMessage[]> {
  const res = await fetch(`${BASE}?phone=${encodeURIComponent(phone)}`)
  const json: ApiResponse<MessageRaw[]> = await res.json()

  if (!json.success) {
    throw new Error(json.error || '获取消息失败')
  }

  return json.data.map(toWhatsAppMessage)
}

/**
 * 发送消息并获取 AI 回复
 * @returns [用户消息, AI回复]
 */
export async function sendMessage(
  phone: string,
  content: string,
): Promise<[WhatsAppMessage, WhatsAppMessage]> {
  const res = await fetch(`${BASE}/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, content }),
  })
  const json: ApiResponse<SendMessageRaw> = await res.json()

  if (!json.success) {
    throw new Error(json.error || '发送消息失败')
  }

  return [
    toWhatsAppMessage(json.data.userMessage),
    toWhatsAppMessage(json.data.assistantMessage),
  ]
}

/**
 * 格式化 ISO 时间戳为 HH:mm
 */
function formatTime(isoString: string): string {
  const d = new Date(isoString)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const oneDay = 86400000

  if (diff < oneDay && d.getDate() === now.getDate()) {
    return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}
