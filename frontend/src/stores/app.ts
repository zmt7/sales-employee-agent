// ============================================
// App 全局状态管理 (Pinia)
// ============================================

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Theme, UserState } from '@/types'

export const useAppStore = defineStore('app', () => {
  // State
  const theme = ref<Theme>('light')
  const user = ref<UserState>({
    credits: 0,
    avatar: '',
    name: '用户',
  })
  const sidebarCollapsed = ref(false)

  // Getters
  const isDark = computed(() => theme.value === 'dark')
  const creditsDisplay = computed(() => user.value.credits.toLocaleString())

  // Actions
  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  function setTheme(newTheme: Theme) {
    theme.value = newTheme
  }

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function setSidebarCollapsed(collapsed: boolean) {
    sidebarCollapsed.value = collapsed
  }

  return {
    theme,
    user,
    sidebarCollapsed,
    isDark,
    creditsDisplay,
    toggleTheme,
    setTheme,
    toggleSidebar,
    setSidebarCollapsed,
  }
})
