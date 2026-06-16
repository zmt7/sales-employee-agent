// ============================================
// 对话工作区状态管理 Composable
// ============================================

import { ref, computed, triggerRef } from 'vue'
import type { ChatMessage, HomeViewMode, ImageAttachment } from '@/types'
import { useModelStore } from '@/stores/model'
import { getModelService } from '@/services/models/factory'

const mode = ref<HomeViewMode>('idle')
const messages = ref<ChatMessage[]>([])
const isStreaming = ref(false)

let _messageId = 0
function generateId(): string {
  return `msg-${Date.now()}-${++_messageId}`
}

/** 调用当前选中的模型 */
async function callCurrentModel(history: ChatMessage[], images?: ImageAttachment[]): Promise<string> {
  const modelStore = useModelStore()
  const service = getModelService(modelStore.currentModel.provider)
  return service.chat(history, images)
}

export function useChatWorkspace() {
  const viewMode = computed(() => mode.value)
  const hasMessages = computed(() => messages.value.length > 0)

  /** 发送消息 */
  async function sendMessage(content: string, attachments?: ChatMessage['attachments'], images?: ImageAttachment[]) {
    if ((!content.trim() && (!images || images.length === 0)) || isStreaming.value) return

    // 添加用户消息
    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
      attachments,
    }
    messages.value.push(userMsg)

    if (mode.value === 'idle') {
      mode.value = 'chat'
    }

    // AI 占位消息
    const assistantMsg: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      status: 'thinking',
    }
    messages.value.push(assistantMsg)
    triggerRef(messages)
    isStreaming.value = true

    const history = messages.value.slice(0, -1)

    try {
      const reply = await callCurrentModel(history, images)
      const idx = messages.value.findIndex(m => m.id === assistantMsg.id)
      if (idx !== -1) {
        messages.value[idx] = { ...messages.value[idx], content: reply, status: 'done' }
        triggerRef(messages)
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      console.error('[Model] 请求失败:', err)
      const idx = messages.value.findIndex(m => m.id === assistantMsg.id)
      if (idx !== -1) {
        messages.value[idx] = { ...messages.value[idx], content: `抱歉，请求出错了：${err.message}`, status: 'error' }
        triggerRef(messages)
      }
    } finally {
      isStreaming.value = false
    }
  }

  /** 新建对话 */
  function newConversation() {
    messages.value = []
    mode.value = 'idle'
  }

  /** 重新生成 */
  async function regenerate() {
    if (isStreaming.value) return

    const lastAiIdx = [...messages.value].reverse().findIndex(m => m.role === 'assistant')
    if (lastAiIdx === -1) return
    const aiIndex = messages.value.length - 1 - lastAiIdx

    messages.value.splice(aiIndex, 1)
    triggerRef(messages)

    if (mode.value === 'idle') mode.value = 'chat'

    const assistantMsg: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      status: 'thinking',
    }
    messages.value.push(assistantMsg)
    triggerRef(messages)
    isStreaming.value = true

    const history = messages.value.slice(0, -1)

    try {
      const reply = await callCurrentModel(history)
      const idx = messages.value.findIndex(m => m.id === assistantMsg.id)
      if (idx !== -1) {
        messages.value[idx] = { ...messages.value[idx], content: reply, status: 'done' }
        triggerRef(messages)
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      console.error('[Model] 请求失败:', err)
      const idx = messages.value.findIndex(m => m.id === assistantMsg.id)
      if (idx !== -1) {
        messages.value[idx] = { ...messages.value[idx], content: `抱歉，请求出错了：${err.message}`, status: 'error' }
        triggerRef(messages)
      }
    } finally {
      isStreaming.value = false
    }
  }

  return {
    viewMode,
    messages,
    hasMessages,
    isStreaming: computed(() => isStreaming.value),
    sendMessage,
    newConversation,
    regenerate,
  }
}
