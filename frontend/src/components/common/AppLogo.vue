<script setup lang="ts">
interface Props {
  collapsed?: boolean
}

defineProps<Props>()
</script>

<template>
  <div class="flex items-center gap-2.5 px-3">
    <!-- Logo Icon -->
    <div class="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center shrink-0">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    </div>
    <!-- Logo Text -->
    <span
      v-if="!collapsed"
      class="text-lg font-bold text-gray-900 tracking-tight transition-all duration-300"
    >
      AI数字员工
    </span>
  </div>
</template>
