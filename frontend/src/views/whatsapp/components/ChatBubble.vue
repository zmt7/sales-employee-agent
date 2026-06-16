<script setup lang="ts">
import { computed } from 'vue'
import type { WhatsAppMessage } from '@/types'
import Icon from '@/components/ui/Icon.vue'

const props = defineProps<{
  message: WhatsAppMessage
  contactName: string
}>()

const isUser = computed(() => props.message.role === 'user')
const isImage = computed(() => props.message.contentType === 'image')

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

function renderContent(text: string): string {
  if (!text) return ''
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
    .replace(/\n/g, '<br>')
}
</script>

<template>
  <div
    class="flex mb-3"
    :class="isUser ? 'justify-start' : 'justify-end'"
  >
    <!-- ====== 用户消息（左侧白底） ====== -->
    <div
      v-if="isUser"
      class="max-w-[70%] flex gap-1.5"
    >
      <!-- 头像 -->
      <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-auto">
        {{ contactName.charAt(0) }}
      </div>
      <!-- 气泡 + 时间 -->
      <div>
        <div class="bg-[#ffffff] rounded-lg rounded-tl-md px-3 py-2 shadow-sm">
          <img
            v-if="isImage && message.imageUrl"
            :src="message.imageUrl"
            class="max-w-[260px] max-h-[220px] rounded-lg object-cover"
          />
          <p
            v-else
            class="text-[13px] text-gray-800 leading-relaxed"
            v-html="renderContent(message.content)"
          />
        </div>
        <div class="text-[10px] text-gray-400 mt-1 px-0.5">{{ formatTime(message.timestamp) }}</div>
      </div>
    </div>

    <!-- ====== 本人消息（右侧绿底） ====== -->
    <div
      v-else
      class="max-w-[70%] flex items-end gap-1.5"
    >
      <!-- 气泡 + 时间 -->
      <div>
        <div class="bg-[#e7ffdb] rounded-lg rounded-tr-md px-3 py-2 shadow-sm">
          <img
            v-if="isImage && message.imageUrl"
            :src="message.imageUrl"
            class="max-w-[260px] max-h-[220px] rounded-lg object-cover"
          />
          <p
            v-else
            class="text-[13px] text-gray-800 leading-relaxed"
            v-html="renderContent(message.content)"
          />
        </div>
        <div class="flex items-center justify-end gap-1 mt-1 pr-0.5">
          <span class="text-[10px] text-gray-400">{{ formatTime(message.timestamp) }}</span>
          <Icon name="Check" :size="12" class="text-emerald-500/70" />
        </div>
      </div>
      <!-- Bot 头像 -->
      <div class="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
        <Icon name="Bot" :size="14" />
      </div>
    </div>
  </div>
</template>
