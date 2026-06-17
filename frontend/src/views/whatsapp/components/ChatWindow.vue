<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import type { WhatsAppContact, WhatsAppMessage } from '@/types'
import Icon from '@/components/ui/Icon.vue'
import ChatBubble from './ChatBubble.vue'
import ChatInput from './ChatInput.vue'

const props = defineProps<{
  contact: WhatsAppContact | null
  messages: WhatsAppMessage[]
  loading?: boolean
  sending?: boolean
}>()

const emit = defineEmits<{
  send: [content: string, images?: { url: string; mimeType: string }[]]
}>()

const chatBodyRef = ref<HTMLElement | null>(null)

function scrollToBottom() {
  nextTick(() => {
    if (chatBodyRef.value) {
      chatBodyRef.value.scrollTop = chatBodyRef.value.scrollHeight
    }
  })
}

watch(
  () => props.messages.length,
  () => scrollToBottom(),
)
watch(
  () => props.contact?.id,
  () => scrollToBottom(),
)

function handleSend(content: string, images?: { url: string; mimeType: string }[]) {
  emit('send', content, images)
  scrollToBottom()
}

function getInitial(name: string): string {
  return name.charAt(0)
}

function avatarColor(id: string): string {
  const colors = [
    'bg-blue-500', 'bg-emerald-500', 'bg-purple-500',
    'bg-orange-500', 'bg-pink-500', 'bg-teal-500',
    'bg-cyan-500', 'bg-amber-500',
  ]
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return colors[hash % colors.length]
}
</script>

<template>
  <div class="flex-1 flex flex-col min-w-0 bg-[#f0f2f5] h-full">
    <!-- ====== 未选择联系人 ====== -->
    <div
      v-if="!contact"
      class="flex-1 flex flex-col items-center justify-center"
    >
      <div class="w-24 h-24 rounded-full bg-gray-100/80 flex items-center justify-center mb-5">
        <Icon name="Phone" :size="40" class="text-gray-300" />
      </div>
      <p class="text-sm text-gray-400 font-medium">WhatsApp Web</p>
      <p class="text-xs text-gray-400 mt-1">从左侧选择一个联系人开始对话</p>
    </div>

    <!-- ====== 聊天区域 ====== -->
    <template v-else>
      <!-- 顶部栏：仿 WhatsApp 绿色顶栏 -->
      <div class="shrink-0 px-4 py-2.5 border-b border-gray-200/60 bg-white">
        <div class="flex items-center gap-3">
          <!-- 头像 -->
          <div class="relative shrink-0">
            <div
              class="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold"
              :class="avatarColor(contact.id)"
            >
              {{ getInitial(contact.name) }}
            </div>
            <div
              v-if="contact.online"
              class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-white border-[1.5px] border-emerald-500"
            />
          </div>

          <!-- 名字 & 状态 -->
          <div class="min-w-0 flex-1">
            <div class="text-sm font-semibold text-gray-900">{{ contact.name }}</div>
            <div class="text-[11px]" :class="contact.online ? 'text-emerald-600' : 'text-gray-400'">
              {{ contact.online ? '在线' : `上次活跃 ${contact.lastMessageTime}` }}
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex items-center gap-0.5 text-gray-500">
            <button class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors" title="搜索消息">
              <Icon name="Search" :size="16" />
            </button>
            <button class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors" title="语音通话">
              <Icon name="Phone" :size="15" />
            </button>
            <button class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors" title="更多选项">
              <Icon name="MoreVertical" :size="16" />
            </button>
          </div>
        </div>
      </div>

      <!-- 消息列表区域 -->
      <div
        ref="chatBodyRef"
        class="flex-1 overflow-y-auto px-4 py-3 space-y-0.5"
      >
        <!-- 加载中 -->
        <div v-if="props.loading" class="flex justify-center py-12">
          <span class="text-xs text-gray-400">加载中...</span>
        </div>

        <!-- 日期分割线 -->
        <div v-if="props.messages.length > 0" class="flex justify-center pt-3 pb-1">
          <span class="text-[10px] text-gray-400 bg-[#f0f2f5] px-2.5 py-0.5 rounded-md">
            最近消息
          </span>
        </div>

        <ChatBubble
          v-for="msg in messages"
          :key="msg.id"
          :message="msg"
          :contact-name="contact.name"
        />

        <!-- 发送中 加载指示器 -->
        <div v-if="props.sending" class="flex justify-end mb-3">
          <span class="text-[11px] text-gray-400 bg-white/70 px-3 py-2 rounded-lg shadow-sm">AI 回复中...</span>
        </div>

        <!-- 空状态 -->
        <div
          v-if="!props.loading && props.messages.length === 0"
          class="flex flex-col items-center justify-center py-16"
        >
          <div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <Icon name="MessageSquare" :size="28" class="text-gray-300" />
          </div>
          <p class="text-xs text-gray-400">暂无聊天记录</p>
          <p class="text-[10px] text-gray-400 mt-1">发送消息开始对话</p>
        </div>

        <!-- 底部留白 -->
        <div class="h-4" />
      </div>

      <!-- 输入框区域 -->
      <ChatInput :disabled="props.sending" @send="handleSend" />
    </template>
  </div>
</template>
