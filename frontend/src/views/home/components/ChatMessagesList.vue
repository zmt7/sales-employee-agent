<script setup lang="ts">
import type { ChatMessage } from '@/types'
import ChatMessageItem from './ChatMessageItem.vue'
import Icon from '@/components/ui/Icon.vue'

defineProps<{
  messages: ChatMessage[]
}>()

const emit = defineEmits<{
  newConversation: []
  regenerate: []
}>()
</script>

<template>
  <div class="flex-1">
    <div class="max-w-4xl mx-auto">
      <!-- New Conversation Button -->
      <div class="flex justify-center pt-4 pb-2">
        <button
          class="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          @click="emit('newConversation')"
        >
          <Icon name="Sparkles" :size="14" />
          <span>新建对话</span>
        </button>
      </div>

      <ChatMessageItem
        v-for="msg in messages"
        :key="msg.id"
        :message="msg"
        @regenerate="emit('regenerate')"
      />
    </div>
  </div>
</template>
