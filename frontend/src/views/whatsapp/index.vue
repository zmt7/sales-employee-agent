<script setup lang="ts">
import { ref, computed } from 'vue'
import type { WhatsAppContact, WhatsAppMessage } from '@/types'
import { mockContacts, getMessagesByContact } from './mock'
import ContactList from './components/ContactList.vue'
import ChatWindow from './components/ChatWindow.vue'

const contacts = ref<WhatsAppContact[]>(mockContacts)
const selectedContactId = ref<string>(mockContacts[0]?.id || '')
const messagesMap = ref<Record<string, WhatsAppMessage[]>>({
  'contact-1': getMessagesByContact('contact-1'),
  'contact-2': getMessagesByContact('contact-2'),
})

const selectedContact = computed(() =>
  contacts.value.find(c => c.id === selectedContactId.value) || null,
)

const currentMessages = computed(() =>
  messagesMap.value[selectedContactId.value] || [],
)

function selectContact(contact: WhatsAppContact) {
  selectedContactId.value = contact.id
  contact.unread = 0
}

function handleSend(content: string, images?: { url: string; mimeType: string }[]) {
  const contactId = selectedContactId.value
  if (!contactId) return

  const newMsg: WhatsAppMessage = {
    id: `msg-${Date.now()}`,
    contactId,
    role: 'assistant',
    content: content || '',
    contentType: images && images.length > 0 ? 'image' : 'text',
    imageUrl: images?.[0]?.url,
    timestamp: Date.now(),
    status: 'sent',
  }

  const msgs = messagesMap.value[contactId] || []
  messagesMap.value[contactId] = [...msgs, newMsg]

  const contact = contacts.value.find(c => c.id === contactId)
  if (contact) {
    contact.lastMessage = content || '[图片]'
    contact.lastMessageTime = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
}

function handleUserReply() {
  const contactId = selectedContactId.value
  if (!contactId) return

  const replies = [
    '好的，谢谢！',
    '明白了，我再看看',
    '可以，就按这个方案来',
    '能再详细说一下吗？',
    '好的，稍等我看一下',
    '这个价格可以接受吗？',
    '什么时候能开始？',
  ]
  const randomReply = replies[Math.floor(Math.random() * replies.length)]

  const newMsg: WhatsAppMessage = {
    id: `msg-${Date.now()}`,
    contactId,
    role: 'user',
    content: randomReply,
    contentType: 'text',
    timestamp: Date.now(),
    status: 'read',
  }

  const msgs = messagesMap.value[contactId] || []
  messagesMap.value[contactId] = [...msgs, newMsg]

  const contact = contacts.value.find(c => c.id === contactId)
  if (contact) {
    contact.lastMessage = randomReply
    contact.lastMessageTime = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    if (selectedContactId.value !== contact.id) {
      contact.unread++
    }
  }
}
</script>

<template>
  <div class="h-full flex bg-white">
    <!-- 左侧：联系人列表 -->
    <ContactList
      :contacts="contacts"
      :selected-id="selectedContactId"
      @select="selectContact"
    />

    <!-- 右侧：聊天窗口 -->
    <ChatWindow
      :contact="selectedContact"
      :messages="currentMessages"
      @send="handleSend"
      @user-reply="handleUserReply"
    />
  </div>
</template>
