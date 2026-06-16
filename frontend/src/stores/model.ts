// ============================================
// 模型选择状态管理 (Pinia)
// ============================================

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ModelConfig } from '@/types'
import { MODEL_REGISTRY, getAutoModel, getEnabledModels } from '@/services/models/config'

export const useModelStore = defineStore('model', () => {
  const currentModelId = ref('auto')

  const currentModel = computed<ModelConfig>(() => {
    if (currentModelId.value === 'auto') return getAutoModel()
    return MODEL_REGISTRY.find(m => m.id === currentModelId.value) || getAutoModel()
  })

  const availableModels = computed(() => getEnabledModels())
  const allModels = computed(() => MODEL_REGISTRY)

  function selectModel(id: string) {
    const model = MODEL_REGISTRY.find(m => m.id === id)
    if (model && model.enabled) {
      currentModelId.value = id
    }
  }

  function selectAuto() {
    currentModelId.value = 'auto'
  }

  return {
    currentModelId,
    currentModel,
    availableModels,
    allModels,
    selectModel,
    selectAuto,
  }
})
