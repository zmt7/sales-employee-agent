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

  /**
   * 根据当前路由路径同步侧边栏高亮
   * 解决页面刷新后 activeMenuId 回退到默认值的问题
   */
  const syncFromRoute = (path: string) => {
    const flatItems = SIDEBAR_MENUS.flatMap((g) => g.items)
    const match = flatItems.find((item) => item.route === path)
    if (match) {
      activeMenuId.value = match.id
    }
  }

  return {
    isCollapsed: computed(() => isCollapsed.value),
    activeMenuId: computed(() => activeMenuId.value),
    menus,
    toggleCollapse,
    setActiveMenu,
    syncFromRoute,
  }
}
