<script setup lang="ts">
import Icon from '@/components/ui/Icon.vue'
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-[60vh] px-6">
    <div class="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-6">
      <Icon name="ShoppingBag" :size="32" class="text-blue-500" />
    </div>
    <h1 class="text-2xl font-bold text-gray-900 mb-2">产品中心</h1>
    <p class="text-gray-500 text-center max-w-md">
      产品管理页面，用于管理和配置您的电商产品信息。
    </p>
  </div>
</template>
