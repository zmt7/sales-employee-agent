<script setup lang="ts">
interface Props {
  variant?: 'default' | 'primary' | 'ghost' | 'gradient'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md',
})

const variantClasses = {
  default: 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300',
  primary: 'bg-blue-600 text-white hover:bg-blue-700 border-transparent shadow-sm',
  ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 border-transparent',
  gradient: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent shadow-md hover:shadow-lg',
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-2.5 text-base gap-2.5',
}
</script>

<template>
  <button
    :disabled="disabled || loading"
    class="inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    :class="[variantClasses[variant], sizeClasses[size]]"
  >
    <slot />
  </button>
</template>
