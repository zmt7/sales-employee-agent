<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { WhatsAppContact, WhatsAppMessage } from '@/types'
import {
  fetchConversations,
  fetchMessages,
  sendMessage as apiSendMessage,
} from '@/services/whatsapp'
import ContactList from './components/ContactList.vue'
import ChatWindow from './components/ChatWindow.vue'

const contacts = ref<WhatsAppContact[]>([])
const selectedContactId = ref<string>('')
const messagesMap = ref<Record<string, WhatsAppMessage[]>>({})
const isLoadingConversations = ref(false)
const isLoadingMessages = ref(false)
const isSending = ref(false)

const selectedContact = computed(() =>
  contacts.value.find(c => c.id === selectedContactId.value) || null,
)

const currentMessages = computed(() =>
  messagesMap.value[selectedContactId.value] || [],
)

/** 页面加载时获取对话列表 */
onMounted(async () => {
  isLoadingConversations.value = true
  try {
    const list = await fetchConversations()
    console.log('对话列表:', list)
    contacts.value = list
    if (list.length > 0) {
      selectedContactId.value = list[0].id
      await loadMessages(list[0].id)
    }
  } catch (err: any) {
    console.error('加载对话列表失败:', err.message)
  } finally {
    isLoadingConversations.value = false
  }
})

/** 选择联系人时加载消息 */
async function selectContact(contact: WhatsAppContact) {
  selectedContactId.value = contact.id
  contact.unread = 0
  if (!messagesMap.value[contact.id]) {
    await loadMessages(contact.id)
  }
}

/** 加载指定用户的聊天记录 */
async function loadMessages(phone: string) {
  isLoadingMessages.value = true
  try {
    const msgs = await fetchMessages(phone)
    messagesMap.value[phone] = msgs
  } catch (err: any) {
    console.error('加载消息失败:', err.message)
    messagesMap.value[phone] = []
  } finally {
    isLoadingMessages.value = false
  }
}

/** 发送消息 */
async function handleSend(content: string, _images?: { url: string; mimeType: string }[]) {
  const phone = selectedContactId.value
  if (!phone || !content.trim()) return
  if (isSending.value) return

  isSending.value = true
  try {
    const [userMsg, assistantMsg] = await apiSendMessage(phone, content)

    // 追加到消息列表
    const msgs = messagesMap.value[phone] || []
    messagesMap.value[phone] = [...msgs, userMsg, assistantMsg]

    // 更新联系人摘要
    const contact = contacts.value.find(c => c.id === phone)
    if (contact) {
      contact.lastMessage = assistantMsg.content.slice(0, 30) + (assistantMsg.content.length > 30 ? '...' : '')
      contact.lastMessageTime = new Date(assistantMsg.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    }
  } catch (err: any) {
    console.error('发送消息失败:', err.message)
    alert(`发送失败: ${err.message}`)
  } finally {
    isSending.value = false
  }
}
</script>

<template>
  <div class="h-full flex bg-white">
    <!-- 左侧：联系人列表 -->
    <ContactList
      :contacts="contacts"
      :selected-id="selectedContactId"
      :loading="isLoadingConversations"
      @select="selectContact"
    />

    <!-- 右侧：聊天窗口 -->
    <ChatWindow
      :contact="selectedContact"
      :messages="currentMessages"
      :loading="isLoadingMessages"
      :sending="isSending"
      @send="handleSend"
    />
  </div>
</template>
