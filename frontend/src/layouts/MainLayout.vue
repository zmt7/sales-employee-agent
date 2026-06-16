<script setup lang="ts">
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
</script>

<template>
  <div class="h-screen flex bg-gray-50/50 overflow-hidden">
    <!-- Sidebar -->
    <AppSidebar />

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Header -->
      <AppHeader />

      <!-- Content: 满右侧区域滚动 -->
      <main class="flex-1 min-h-0 overflow-y-auto">
        <router-view />
      </main>
    </div>
  </div>
</template>
