<script setup lang="ts">
import Icon from '@/components/ui/Icon.vue'
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-[60vh] px-6">
    <div class="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center mb-6">
      <Icon name="FileText" :size="32" class="text-purple-500" />
    </div>
    <h1 class="text-2xl font-bold text-gray-900 mb-2">内容管理</h1>
    <p class="text-gray-500 text-center max-w-md">
      内容管理页面，用于管理和发布您的营销内容。
    </p>
  </div>
</template>
