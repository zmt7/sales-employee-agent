<script setup lang="ts">
import { useAppStore } from '@/stores/app'
import Icon from '@/components/ui/Icon.vue'

const appStore = useAppStore()
</script>

<template>
  <header class="h-14 flex items-center justify-between px-6 shrink-0">
    <!-- Left: Doc Link -->
    <a
      href="#"
      class="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
    >
      <Icon name="FileText" :size="16" />
      <span>使用文档</span>
    </a>

    <!-- Right: Actions -->
    <div class="flex items-center gap-3">
      <!-- Credits -->
      <!-- <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100">
        <Icon name="CreditCard" :size="14" class="text-gray-400" />
        <span class="text-sm font-medium text-gray-700">{{ appStore.creditsDisplay }}</span>
        <span class="text-xs text-gray-400">算力</span>
        <Icon name="ChevronRight" :size="12" class="text-gray-300" />
      </div> -->

      <!-- Buy Credits -->
      <!-- <button class="px-4 py-1.5 rounded-full bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors">
        购买算力
      </button> -->

      <!-- Language -->
      <button class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors">
        <Icon name="Globe" :size="16" />
        <span>CN</span>
      </button>

      <!-- Theme Toggle -->
      <button
        class="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
        @click="appStore.toggleTheme"
      >
        <Icon :name="appStore.isDark ? 'Sun' : 'Moon'" :size="18" />
      </button>

      <!-- User Avatar -->
      <div class="relative">
        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold cursor-pointer">
          S
        </div>
        <div class="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
          5
        </div>
      </div>
    </div>
  </header>
</template>
