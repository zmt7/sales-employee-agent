// ============================================
// Agent 输入框逻辑 Composable
// ============================================

import { ref, computed } from 'vue'

const MAX_LENGTH = 4000
const inputText = ref('')
const isFocused = ref(false)

export function useAgentInput() {
  const charCount = computed(() => inputText.value.length)
  const isOverLimit = computed(() => charCount.value > MAX_LENGTH)
  const canSubmit = computed(() => charCount.value > 0 && !isOverLimit.value)
  const progressPercent = computed(() =>
    Math.min((charCount.value / MAX_LENGTH) * 100, 100)
  )

  const setFocus = (focused: boolean) => {
    isFocused.value = focused
  }

  const clearInput = () => {
    inputText.value = ''
  }

  return {
    inputText,
    isFocused: computed(() => isFocused.value),
    charCount,
    maxLength: MAX_LENGTH,
    isOverLimit,
    canSubmit,
    progressPercent,
    setFocus,
    clearInput,
  }
}
