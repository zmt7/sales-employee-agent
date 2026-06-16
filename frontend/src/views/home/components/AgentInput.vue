<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useAgentInput } from '@/composables/useAgentInput'
import { useModelStore } from '@/stores/model'
import type { ImageAttachment } from '@/types'
import Icon from '@/components/ui/Icon.vue'

interface Props {
  mode?: 'centered' | 'bottom'
  streaming?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'centered',
  streaming: false,
})

const emit = defineEmits<{
  send: [content: string, images?: ImageAttachment[]]
}>()

const {
  inputText,
  canSubmit,
  clearInput,
} = useAgentInput()

const modelStore = useModelStore()

const showAttachmentMenu = ref(false)
const showProductModal = ref(false)
const showAgentModal = ref(false)

// 按钮 ref 用于计算弹框位置
const attachmentBtnRef = ref<HTMLElement | null>(null)
const modelBtnRef = ref<HTMLElement | null>(null)

// 弹框 fixed 位置
const attachmentMenuStyle = ref<Record<string, string>>({})
const agentModalStyle = ref<Record<string, string>>({})

// ====== 图片管理 ======
const uploadedImages = ref<ImageAttachment[]>([])
const fileInputRef = ref<HTMLInputElement | null>(null)

function calcDropdownPosition(btnEl: HTMLElement | null): Record<string, string> {
  if (!btnEl) return {}
  const rect = btnEl.getBoundingClientRect()
  return {
    position: 'fixed',
    left: `${rect.left}px`,
    bottom: `${window.innerHeight - rect.top + 8}px`,
  }
}

watch(showAttachmentMenu, async (val) => {
  if (val) {
    await nextTick()
    attachmentMenuStyle.value = calcDropdownPosition(attachmentBtnRef.value)
  }
})

watch(showAgentModal, async (val) => {
  if (val) {
    await nextTick()
    agentModalStyle.value = calcDropdownPosition(modelBtnRef.value)
  }
})

const currentModelLabel = computed(() => {
  if (modelStore.currentModelId === 'auto') return '自动'
  return modelStore.currentModel.name
})

/** 是否有内容可提交（文本或图片） */
const canSend = computed(() =>
  !props.streaming && (inputText.value.trim().length > 0 || uploadedImages.value.length > 0),
)

function handleSend() {
  if (!canSend.value) return
  const text = inputText.value
  const images = uploadedImages.value.length > 0 ? [...uploadedImages.value] : undefined
  clearInput()
  uploadedImages.value = []
  emit('send', text, images)
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

function selectModel(id: string) {
  modelStore.selectModel(id)
  showAgentModal.value = false
}

function selectAuto() {
  modelStore.selectAuto()
  showAgentModal.value = false
}

/** 点击「添加图片」→ 触发文件选择 */
function selectAttachment(type: string) {
  showAttachmentMenu.value = false
  if (type === 'image') {
    fileInputRef.value?.click()
  }
}

/** 处理图片选择 */
async function handleImageSelect(e: Event) {
  const input = e.target as HTMLInputElement
  const files = input.files
  if (!files || files.length === 0) return

  for (const file of files) {
    if (!file.type.startsWith('image/')) continue
    if (file.size > 10 * 1024 * 1024) {
      console.warn(`图片 ${file.name} 超过 10MB 限制，已跳过`)
      continue
    }

    const base64 = await fileToBase64(file)
    uploadedImages.value.push({
      id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      url: URL.createObjectURL(file),
      base64,
      mimeType: file.type,
    })
  }

  // 清空 input，允许重复选择同一文件
  input.value = ''
}

/** File → base64（不含 data:xxx;base64, 前缀） */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      const base64 = dataUrl.split(',')[1] || ''
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/** 删除图片 */
function removeImage(id: string) {
  const idx = uploadedImages.value.findIndex(img => img.id === id)
  if (idx !== -1) {
    const img = uploadedImages.value[idx]
    URL.revokeObjectURL(img.url)
    uploadedImages.value.splice(idx, 1)
  }
}
</script>

<template>
  <div class="relative w-full transition-all duration-500 ease-in-out max-w-4xl mx-auto">
    <!-- Input Container -->
    <div class="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <!-- Image Preview Area -->
      <div v-if="uploadedImages.length > 0" class="px-4 pt-3 flex flex-wrap gap-2">
        <div
          v-for="img in uploadedImages"
          :key="img.id"
          class="relative group w-16 h-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 shrink-0"
        >
          <img :src="img.url" class="w-full h-full object-cover" />
          <!-- 删除按钮 -->
          <button
            class="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gray-800/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
            @click="removeImage(img.id)"
          >
            <Icon name="X" :size="12" />
          </button>
        </div>
      </div>

      <!-- Text Area -->
      <div class="px-4 pt-3 pb-1">
        <textarea
          v-model="inputText"
          class="w-full min-h-[52px] max-h-[200px] resize-none outline-none text-sm text-gray-800 placeholder-gray-400 bg-transparent leading-relaxed"
          :placeholder="uploadedImages.length > 0 ? '描述图片内容或输入问题...' : '输入问题...（@ 引用文件）'"
          rows="1"
          @keydown="handleKeydown"
        />
      </div>

      <!-- Bottom Toolbar -->
      <div class="flex items-center justify-between px-3 py-2">
        <!-- Left: Tools -->
        <div class="flex items-center gap-1">
          <button
            ref="attachmentBtnRef"
            class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            @click="showAttachmentMenu = !showAttachmentMenu"
          >
            <Icon name="Plus" :size="18" />
          </button>

          <button class="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors">
            <Icon name="Sparkles" :size="15" />
            <span>插件</span>
            <Icon name="ChevronRight" :size="12" class="rotate-90 text-gray-400" />
          </button>

          <button class="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors">
            <Icon name="Shield" :size="15" />
            <span>默认权限</span>
            <Icon name="ChevronRight" :size="12" class="rotate-90 text-gray-400" />
          </button>
        </div>

        <!-- Right: Model Selector & Send -->
        <div class="flex items-center gap-2">
          <button
            ref="modelBtnRef"
            class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            @click="showAgentModal = !showAgentModal"
          >
            <Icon name="Bot" :size="15" />
            <span>{{ currentModelLabel }}</span>
            <Icon name="ChevronRight" :size="12" class="rotate-90 text-gray-400" />
          </button>

          <!-- Send Button -->
          <button
            class="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
            :class="canSend && !streaming
              ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'"
            :disabled="!canSend || streaming"
            @click="handleSend"
          >
            <template v-if="streaming">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            </template>
            <template v-else>
              <Icon name="ArrowUp" :size="16" />
            </template>
          </button>
        </div>
      </div>
    </div>

    <!-- Hidden File Input for Image -->
    <input
      ref="fileInputRef"
      type="file"
      accept="image/*"
      multiple
      class="hidden"
      @change="handleImageSelect"
    />

    <!-- Product Modal -->
    <div
      v-if="showProductModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      @click="showProductModal = false"
    >
      <div class="bg-white rounded-2xl shadow-xl w-[480px] max-h-[80vh] flex flex-col" @click.stop>
        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 class="text-base font-semibold text-gray-900">选择产品</h3>
          <button class="text-gray-400 hover:text-gray-600" @click="showProductModal = false">
            <Icon name="X" :size="18" />
          </button>
        </div>
        <div class="p-5 text-sm text-gray-500">产品列表区域（待接入数据）</div>
      </div>
    </div>

    <!-- Click outside to close dropdowns -->
    <div
      v-if="showAttachmentMenu || showAgentModal"
      class="fixed inset-0 z-40"
      @click="showAttachmentMenu = false; showAgentModal = false"
    />

    <!-- Teleported Dropdowns (挂载到 body，不受 overflow:hidden 影响) -->
    <Teleport to="body">
      <!-- Attachment Menu -->
      <div
        v-if="showAttachmentMenu"
        class="z-50 w-40 bg-white rounded-xl border border-gray-100 shadow-lg py-1.5"
        :style="attachmentMenuStyle"
      >
        <button
          class="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          @click="selectAttachment('image')"
        >
          <Icon name="Image" :size="16" class="text-gray-400" />
          <span>添加图片</span>
        </button>
      </div>

      <!-- Model Dropdown -->
      <div
        v-if="showAgentModal"
        class="z-50 w-52 bg-white rounded-xl border border-gray-100 shadow-lg py-1.5"
        :style="agentModalStyle"
      >
        <div class="px-3 py-1.5 text-xs text-gray-400 font-medium">选择模型</div>

        <!-- Auto -->
        <button
          class="w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors"
          :class="modelStore.currentModelId === 'auto' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'"
          @click="selectAuto"
        >
          <Icon name="Bot" :size="16" :class="modelStore.currentModelId === 'auto' ? 'text-blue-500' : 'text-gray-400'" />
          <span>自动</span>
        </button>

        <!-- Enabled Models -->
        <button
          v-for="model in modelStore.availableModels"
          :key="model.id"
          class="w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors"
          :class="modelStore.currentModelId === model.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'"
          @click="selectModel(model.id)"
        >
          <Icon :name="model.icon" :size="16" :class="modelStore.currentModelId === model.id ? 'text-blue-500' : 'text-gray-400'" />
          <div class="flex-1 text-left">
            <div>{{ model.name }}</div>
            <div class="text-[11px] text-gray-400">{{ model.model }}</div>
          </div>
        </button>

        <!-- Disabled Models -->
        <div
          v-for="model in modelStore.allModels.filter(m => !m.isAuto && !m.enabled)"
          :key="model.id"
          class="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-300 cursor-not-allowed"
        >
          <Icon :name="model.icon" :size="16" />
          <div class="flex-1 text-left">
            <div>{{ model.name }}</div>
            <div class="text-[11px]">暂未接入</div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
