<script setup lang="ts">
import { computed } from 'vue'
import { useChatWorkspace } from '@/composables/useChatWorkspace'
import type { ImageAttachment } from '@/types'
import AgentHero from './components/AgentHero.vue'
import AgentInput from './components/AgentInput.vue'
import ChatMessagesList from './components/ChatMessagesList.vue'

const {
  viewMode,
  messages,
  isStreaming,
  sendMessage,
  newConversation,
  regenerate,
} = useChatWorkspace()

function handleSend(content: string, images?: ImageAttachment[]) {
  sendMessage(content, undefined, images)
}

const isChat = computed(() => viewMode.value === 'chat')
</script>

<template>
  <!-- ============================================ -->
  <!-- Chat Mode -->
  <!-- ============================================ -->
  <template v-if="isChat">
    <div class="min-h-full flex flex-col">
      <ChatMessagesList
        :messages="messages"
        @new-conversation="newConversation"
        @regenerate="regenerate"
      />

      <div class="sticky bottom-0 px-4 pb-3 pt-2 bg-gradient-to-t from-gray-50/50 via-gray-50/50">
        <AgentInput
          mode="bottom"
          :streaming="isStreaming"
          @send="handleSend"
        />
      </div>
    </div>
  </template>

  <!-- ============================================ -->
  <!-- Idle Mode -->
  <!-- ============================================ -->
  <div v-else class="flex flex-col items-center py-10 px-6 gap-8">
    <AgentHero />
    <AgentInput mode="centered" @send="handleSend" />
  </div>
</template>
