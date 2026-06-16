<script setup lang="ts">
import { computed } from 'vue'
import { useSidebar } from '@/composables/useSidebar'
import AppLogo from '@/components/common/AppLogo.vue'
import Icon from '@/components/ui/Icon.vue'

const { isCollapsed, activeMenuId, menus, toggleCollapse, setActiveMenu } = useSidebar()

const sidebarWidth = computed(() => isCollapsed.value ? 'w-16' : 'w-60')
</script>

<template>
  <aside
    class="h-screen bg-white border-r border-gray-100 flex flex-col shrink-0 transition-all duration-300 ease-in-out"
    :class="sidebarWidth"
  >
    <!-- Logo Area -->
    <div class="h-14 flex items-center shrink-0">
      <AppLogo :collapsed="isCollapsed" />
    </div>

    <!-- Menu Groups -->
    <nav class="flex-1 overflow-y-auto py-2 px-2 space-y-6">
      <div v-for="group in menus" :key="group.title">
        <!-- Group Title -->
        <div
          v-if="!isCollapsed"
          class="px-3 mb-2 text-[11px] font-medium text-gray-400 uppercase tracking-wider"
        >
          {{ group.title }}
        </div>

        <!-- Menu Items -->
        <div class="space-y-0.5">
          <router-link
            v-for="item in group.items"
            :key="item.id"
            :to="item.route || '#'"
            class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 group"
            :class="[
              activeMenuId === item.id
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
              isCollapsed ? 'justify-center' : '',
            ]"
            @click="setActiveMenu(item.id)"
          >
            <Icon
              :name="item.icon"
              :size="18"
              :class="activeMenuId === item.id ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'"
            />
            <span
              v-if="!isCollapsed"
              class="truncate transition-opacity duration-300"
            >
              {{ item.label }}
            </span>
          </router-link>
        </div>
      </div>
    </nav>

    <!-- Bottom Actions -->
    <div class="shrink-0 border-t border-gray-100 p-2 space-y-1">
      <!-- My Tasks Section -->
      <div v-if="!isCollapsed" class="px-3 py-2">
        <div class="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-2">我的任务</div>
        <div class="text-xs text-gray-400">暂无历史对话</div>
      </div>

      <!-- Join Group Button -->
      <!-- <button
        class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
        :class="isCollapsed ? 'justify-center' : ''"
      >
        <Icon name="MessageSquare" :size="16" />
        <span v-if="!isCollapsed">加入交流群</span>
      </button> -->

      <!-- Collapse Toggle -->
      <button
        class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        :class="isCollapsed ? 'justify-center' : ''"
        @click="toggleCollapse"
      >
        <Icon :name="isCollapsed ? 'ChevronRight' : 'ChevronLeft'" :size="16" />
        <span v-if="!isCollapsed">收起导航</span>
      </button>
    </div>
  </aside>
</template>
