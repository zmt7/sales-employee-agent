<script setup lang="ts">
import { ref } from 'vue'
import type { ChatMessage } from '@/types'
import Icon from '@/components/ui/Icon.vue'

defineProps<{
  message: ChatMessage
}>()

const emit = defineEmits<{
  regenerate: []
}>()

const copied = ref(false)

async function handleCopy(content: string) {
  try {
    await navigator.clipboard.writeText(content)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    // 降级方案
    const textarea = document.createElement('textarea')
    textarea.value = content
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  }
}

function handleRegenerate() {
  emit('regenerate')
}

// 简单的 Markdown 渲染（粗体、引用块）
function renderContent(text: string): string {
  if (!text) return ''
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-2 border-blue-300 pl-3 my-1 text-gray-500 italic">$1</blockquote>')
    .replace(/\n/g, '<br>')
}
</script>

<template>
  <div
    class="flex gap-4 py-6 px-8"
    :class="message.role === 'user' ? 'flex-row-reverse' : ''"
  >
    <!-- Avatar -->
    <div class="shrink-0">
      <div
        v-if="message.role === 'assistant'"
        class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center"
      >
        <Icon name="Bot" :size="16" class="text-white" />
      </div>
      <div
        v-else
        class="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm font-bold"
      >
        U
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 min-w-0" :class="message.role === 'user' ? 'flex flex-col items-end' : ''">
      <!-- Role Label -->
      <div class="text-xs font-medium text-gray-400 mb-1.5">
        {{ message.role === 'assistant' ? 'Clipcat AI' : '你' }}
      </div>

      <!-- Message Body -->
      <div
        v-if="message.role === 'user'"
        class="max-w-[75%] bg-blue-50 rounded-2xl rounded-tr-md px-4 py-2.5"
      >
        <p class="text-sm text-gray-800 whitespace-pre-wrap">{{ message.content }}</p>
        <!-- Attachments -->
        <div v-if="message.attachments?.length" class="flex gap-2 mt-2">
          <div
            v-for="att in message.attachments"
            :key="att.url"
            class="w-16 h-16 rounded-lg overflow-hidden border border-gray-200"
          >
            <img :src="att.url" class="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      <div
        v-else
        class="max-w-[85%]"
      >
        <!-- Thinking State -->
        <div
          v-if="message.status === 'thinking'"
          class="flex items-center gap-2 text-gray-400"
        >
          <div class="flex gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style="animation-delay: 0ms" />
            <span class="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style="animation-delay: 150ms" />
            <span class="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style="animation-delay: 300ms" />
          </div>
          <span class="text-sm">思考中...</span>
        </div>

        <!-- Content -->
        <div
          v-if="message.content"
          class="text-sm text-gray-700 leading-relaxed"
          v-html="renderContent(message.content)"
        />

        <!-- Streaming Cursor -->
        <span
          v-if="message.status === 'streaming'"
          class="inline-block w-1.5 h-4 bg-blue-500 animate-pulse ml-0.5 align-text-bottom rounded-sm"
        />

        <!-- Done: Action Buttons -->
        <div
          v-if="message.status === 'done'"
          class="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100"
        >
          <button
            class="flex items-center gap-1.5 text-xs transition-colors"
            :class="copied ? 'text-emerald-500' : 'text-gray-400 hover:text-gray-600'"
            @click="handleCopy(message.content)"
          >
            <Icon :name="copied ? 'Check' : 'FileText'" :size="13" />
            <span>{{ copied ? '已复制' : '复制' }}</span>
          </button>
          <button
            class="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            @click="handleRegenerate"
          >
            <Icon name="Sparkles" :size="13" />
            <span>重新生成</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
