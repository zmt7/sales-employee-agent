// ============================================
// 常量定义
// ============================================

import type { MenuGroup } from '@/types'

/** 侧边栏菜单数据 */
export const SIDEBAR_MENUS: MenuGroup[] = [
  {
    title: '创作',
    items: [
      { id: 'ai-tools', label: 'Agent', icon: 'Wand2', route: '/' },
      { id: 'whatsapp', label: 'WhatsApp', icon: 'MessageSquare', route: '/whatsapp' },
      { id: 'openclaw', label: '产品管理', icon: 'Zap', route: '/product' },
      { id: 'hot-community', label: '内容专区', icon: 'Flame', route: '/content' },
    ],
  },
  {
    title: '管理',
    items: [
      { id: 'my-assets', label: '我的资产', icon: 'FolderOpen' },
      { id: 'my-role', label: '我的角色', icon: 'User' },
      { id: 'all-tasks', label: '全部任务', icon: 'List' },
    ],
  },
]
