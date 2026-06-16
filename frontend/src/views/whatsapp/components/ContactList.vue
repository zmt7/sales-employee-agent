<script setup lang="ts">
import type { WhatsAppContact } from '@/types'
import Icon from '@/components/ui/Icon.vue'

const props = defineProps<{
  contacts: WhatsAppContact[]
  selectedId: string
}>()

const emit = defineEmits<{
  select: [contact: WhatsAppContact]
}>()

function getInitial(name: string): string {
  return name.charAt(0)
}

function avatarColor(id: string): string {
  const colors = [
    'bg-blue-500', 'bg-emerald-500', 'bg-purple-500',
    'bg-orange-500', 'bg-pink-500', 'bg-teal-500',
    'bg-cyan-500', 'bg-amber-500',
  ]
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return colors[hash % colors.length]
}
</script>

<template>
  <div class="w-[280px] shrink-0 border-r border-gray-200 bg-white flex flex-col h-full">
    <!-- Header -->
    <div class="px-4 py-3 border-b border-gray-100">
      <h2 class="text-base font-semibold text-gray-800">消息</h2>
    </div>

    <!-- 搜索框 -->
    <div class="px-3 py-2 border-b border-gray-100">
      <div class="relative">
        <Icon name="Search" :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="搜索"
          class="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 border-none outline-none focus:bg-white focus:ring-0 placeholder:text-gray-400 transition-colors rounded-lg"
        />
      </div>
    </div>

    <!-- Contact List -->
    <div class="flex-1 overflow-y-auto">
      <div
        v-for="contact in props.contacts"
        :key="contact.id"
        class="flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors mx-1 my-0.5 rounded-lg hover:bg-emerald-50/60"
        :class="selectedId === contact.id ? 'bg-emerald-50' : ''"
        @click="emit('select', contact)"
      >
        <!-- Avatar -->
        <div class="relative shrink-0">
          <div
            class="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-sm"
            :class="avatarColor(contact.id)"
          >
            {{ getInitial(contact.name) }}
          </div>
          <div
            v-if="contact.online"
            class="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-white border-2 border-emerald-500"
          />
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0 flex flex-col gap-0.5">
          <div class="flex items-center justify-between">
            <span class="text-sm font-semibold text-gray-900 truncate">{{ contact.name }}</span>
            <span class="text-[10px] text-gray-400 shrink-0 ml-1">{{ contact.lastMessageTime }}</span>
          </div>
          <span class="text-xs text-gray-500 truncate leading-tight">{{ contact.lastMessage }}</span>
        </div>

        <!-- Unread Badge -->
        <span
          v-if="contact.unread > 0 && selectedId !== contact.id"
          class="shrink-0 w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center"
        >
          {{ contact.unread > 9 ? '9+' : contact.unread }}
        </span>
      </div>

      <!-- Empty State -->
      <div
        v-if="props.contacts.length === 0"
        class="flex flex-col items-center justify-center py-16 px-4 text-center"
      >
        <div class="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-3">
          <Icon name="MessageSquare" :size="28" class="text-gray-300" />
        </div>
        <p class="text-xs text-gray-400">暂无消息</p>
      </div>
    </div>
  </div>
</template>
