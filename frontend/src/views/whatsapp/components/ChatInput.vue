<script setup lang="ts">
import { ref, nextTick } from 'vue'
import Icon from '@/components/ui/Icon.vue'

const emit = defineEmits<{
  send: [content: string, images?: { url: string; mimeType: string }[]]
}>()

const inputText = ref('')
const showEmoji = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)
const uploadedImages = ref<{ id: string; url: string; mimeType: string }[]>([])

// ====== 常用表情 ======
const emojis = [
  '😀', '😂', '🤣', '😊', '😍', '🥰', '😘', '😜', '🤔', '😅',
  '👍', '👎', '👏', '🙏', '💪', '🤝', '❤️', '🔥', '⭐', '✨',
  '🎉', '💰', '📱', '💻', '📦', '🛒', '📊', '📈',
]

function insertEmoji(emoji: string) {
  inputText.value += emoji
}

function toggleEmoji() {
  showEmoji.value = !showEmoji.value
  // 关闭时聚焦输入框
  if (!showEmoji.value) {
    nextTick(() => {
      const textarea = document.querySelector<HTMLTextAreaElement>('.wa-textarea')
      if (textarea) textarea.focus()
    })
  }
}

/** 发送 */
function handleSend() {
  const text = inputText.value.trim()
  const images = uploadedImages.value.length > 0
    ? uploadedImages.value.map(img => ({ url: img.url, mimeType: img.mimeType }))
    : undefined

  if (!text && !images) return

  emit('send', text, images)
  inputText.value = ''
  uploadedImages.value = []
  showEmoji.value = false
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

function triggerImageUpload() {
  fileInputRef.value?.click()
}

function handleImageSelect(e: Event) {
  const input = e.target as HTMLInputElement
  const files = input.files
  if (!files || files.length === 0) return

  for (const file of files) {
    if (!file.type.startsWith('image/')) continue
    uploadedImages.value.push({
      id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      url: URL.createObjectURL(file),
      mimeType: file.type,
    })
  }
  input.value = ''
}

function removeImage(id: string) {
  const idx = uploadedImages.value.findIndex(img => img.id === id)
  if (idx !== -1) {
    URL.revokeObjectURL(uploadedImages.value[idx].url)
    uploadedImages.value.splice(idx, 1)
  }
}
</script>

<template>
  <div class="shrink-0 px-4 py-3 bg-[#f0f2f5] border-t border-gray-200/60">
    <!-- 图片预览 -->
    <div v-if="uploadedImages.length > 0" class="flex gap-2 mb-2 pb-1 px-0.5">
      <div
        v-for="img in uploadedImages"
        :key="img.id"
        class="relative group w-14 h-14 rounded-lg overflow-hidden bg-gray-200 shrink-0 ring-1 ring-gray-300/50"
      >
        <img :src="img.url" class="w-full h-full object-cover" />
        <button
          class="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gray-700 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600"
          @click="removeImage(img.id)"
        >
          <Icon name="X" :size="12" />
        </button>
      </div>
    </div>

    <!-- 输入区域：仿 WhatsApp 底部 -->
    <div class="flex items-end gap-1.5">
      <!-- 表情按钮 -->
      <div class="relative">
        <button
          class="w-9 h-9 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-200/70 transition-colors shrink-0"
          @click="toggleEmoji"
        >
          <Icon name="Smile" :size="22" />
        </button>

        <!-- Emoji 面板 -->
        <Transition name="emoji-fade">
          <div
            v-if="showEmoji"
            class="absolute bottom-full left-[-8px] mb-2 w-[320px] bg-white rounded-xl shadow-xl border border-gray-200 p-3 z-50"
          >
            <div class="grid grid-cols-10 gap-0.5">
              <button
                v-for="emoji in emojis"
                :key="emoji"
                class="h-9 flex items-center justify-center text-lg hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer active:scale-90"
                @click="insertEmoji(emoji)"
              >
                {{ emoji }}
              </button>
            </div>
          </div>
        </Transition>
      </div>

      <!-- 图片上传按钮 -->
      <button
        class="w-9 h-9 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-200/70 transition-colors shrink-0"
        title="发送图片"
        @click="triggerImageUpload"
      >
        <Icon name="Image" :size="20" />
      </button>
      <input
        ref="fileInputRef"
        type="file"
        accept="image/*"
        multiple
        class="hidden"
        @change="handleImageSelect"
      />

      <!-- 文本输入框 -->
      <div class="flex-1 bg-white rounded-2xl shadow-sm ring-1 ring-gray-200/80 focus-within:ring-emerald-500/40 transition-all">
        <textarea
          v-model="inputText"
          class="wa-textarea w-full min-h-[38px] max-h-[100px] resize-none outline-none text-sm text-gray-800 placeholder-transparent leading-snug rounded-2xl px-4 py-2 bg-transparent"
          placeholder="输入消息..."
          rows="1"
          @keydown="handleKeydown"
        />
      </div>

      <!-- 发送按钮 -->
      <button
        class="w-10 h-10 flex items-center justify-center rounded-full shrink-0 transition-all"
        :class="inputText.trim() || uploadedImages.length > 0
          ? 'bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95 shadow-md'
          : 'bg-gray-200 text-gray-400'"
        :disabled="!inputText.trim() && uploadedImages.length === 0"
        @click="handleSend"
      >
        <Icon name="Send" :size="17" />
      </button>
    </div>

    <!-- 点击外部关闭表情面板 -->
    <div
      v-if="showEmoji"
      class="fixed inset-0 z-40"
      @click="showEmoji = false"
    />
  </div>
</template>

<style scoped>
.emoji-fade-enter-active,
.emoji-fade-leave-active {
  transition: all 0.15s ease;
}
.emoji-fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.emoji-fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>
