<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { VButton, VCommandPalette } from 'vectis-ui'
import type { CommandPaletteCommand, CommandPaletteItem } from 'vectis-ui'
import { add, info, notifications, schedule } from 'vectis-ui/icons'

const STORAGE_KEY = 'recent-commands'

const COMMANDS: CommandPaletteCommand[] = [
  { id: 'new', label: 'New document', icon: add },
  { id: 'sync', label: 'Sync now', icon: schedule },
  { id: 'notifications', label: 'Notification settings', icon: notifications },
  { id: 'help', label: 'Keyboard shortcuts', icon: info },
]

const open = ref(false)
const query = ref('')
const recentIds = ref<string[]>([])

// Storage is read once mounted: it does not exist during server rendering.
onMounted(() => {
  try {
    recentIds.value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    recentIds.value = []
  }
})

const items = computed<CommandPaletteItem[]>(() => {
  const recent = recentIds.value
    .map((id) => COMMANDS.find((command) => command.id === id))
    .filter((command) => command !== undefined)
  if (query.value || recent.length === 0) return COMMANDS
  return [
    { label: 'Recent', commands: recent },
    { label: 'All commands', commands: COMMANDS },
  ]
})

function remember(command: CommandPaletteCommand) {
  const id = String(command.id)
  recentIds.value = [id, ...recentIds.value.filter((other) => other !== id)].slice(0, 3)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recentIds.value))
  } catch {
    // Storage may be unavailable, in a private window for instance.
  }
}
</script>

<template>
  <VCommandPalette v-model:open="open" v-model:query="query" :items="items" @select="remember">
    <template #trigger="{ triggerProps }">
      <VButton v-bind="triggerProps" variant="outline" tone="neutral">Search commands</VButton>
    </template>
  </VCommandPalette>
</template>
