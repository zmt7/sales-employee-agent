<script setup lang="ts">
interface Props {
  variant?: 'default' | 'primary' | 'gradient'
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
})

const variantClasses = {
  default: 'bg-gray-100 text-gray-600',
  primary: 'bg-blue-50 text-blue-600',
  gradient: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-2 py-0.5',
}
</script>

<template>
  <span
    class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium"
    :class="variantClasses[variant]"
  >
    <slot />
  </span>
</template>
