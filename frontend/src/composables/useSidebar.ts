// ============================================
// 侧边栏状态管理 Composable
// ============================================

import { ref, computed } from 'vue'
import { SIDEBAR_MENUS } from '@/utils/constants'
import type { MenuGroup } from '@/types'

const isCollapsed = ref(false)
const activeMenuId = ref('ai-tools')

export function useSidebar() {
  const menus = computed<MenuGroup[]>(() => SIDEBAR_MENUS)

  const toggleCollapse = () => {
    isCollapsed.value = !isCollapsed.value
  }

  const setActiveMenu = (id: string) => {
    activeMenuId.value = id
  }

  return {
    isCollapsed: computed(() => isCollapsed.value),
    activeMenuId: computed(() => activeMenuId.value),
    menus,
    toggleCollapse,
    setActiveMenu,
  }
}
