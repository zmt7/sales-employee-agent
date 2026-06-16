// ============================================
// 全局类型定义
// ============================================

/** 侧边栏菜单项 */
export interface MenuItem {
  id: string
  label: string
  icon: string
  route?: string
  children?: MenuItem[]
}

/** 菜单分组 */
export interface MenuGroup {
  title: string
  items: MenuItem[]
}

/** 用户状态 */
export interface UserState {
  credits: number
  avatar: string
  name: string
}

/** 主题类型 */
export type Theme = 'light' | 'dark'

/** 对话消息 */
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  attachments?: ChatAttachment[]
  status?: 'thinking' | 'streaming' | 'done' | 'error'
}

/** 消息附件 */
export interface ChatAttachment {
  type: 'image' | 'video' | 'link'
  url: string
  name?: string
}

/** 首页视图状态 */
export type HomeViewMode = 'idle' | 'chat'

// ============================================
// 模型相关类型
// ============================================

/** 模型提供商 */
export type ModelProvider = 'deepseek' | 'openai' | 'anthropic' | 'custom'

/** 模型配置 */
export interface ModelConfig {
  id: string
  name: string
  provider: ModelProvider
  model: string
  icon: string
  /** 是否自动选择 */
  isAuto?: boolean
  /** 是否启用 */
  enabled: boolean
}

/** 图片附件数据 */
export interface ImageAttachment {
  id: string
  /** 本地 blob URL 或 base64 data URL */
  url: string
  /** base64 数据（不含 data:xxx;base64, 前缀） */
  base64: string
  /** MIME 类型 */
  mimeType: string
}

/** 模型服务接口：所有模型服务必须实现 */
export interface IModelService {
  chat(messages: ChatMessage[], images?: ImageAttachment[]): Promise<string>
}

// ============================================
// WhatsApp 模块相关类型
// ============================================

/** WhatsApp 客户 */
export interface WhatsAppContact {
  id: string
  name: string
  phone: string
  avatar?: string
  lastMessage: string
  lastMessageTime: string
  unread: number
  online: boolean
}

/** WhatsApp 消息 */
export interface WhatsAppMessage {
  id: string
  contactId: string
  role: 'user' | 'assistant'
  content: string
  contentType: 'text' | 'image'
  imageUrl?: string
  timestamp: number
  status: 'sent' | 'delivered' | 'read'
}
