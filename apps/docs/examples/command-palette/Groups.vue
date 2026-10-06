<script setup lang="ts">
import { ref } from 'vue'
import { VButton, VCommandPalette } from 'vectis-ui'
import type { CommandPaletteItem } from 'vectis-ui'
import { add, info, notifications, schedule } from 'vectis-ui/icons'

const open = ref(false)
const last = ref('')

const items: CommandPaletteItem[] = [
  {
    label: 'Actions',
    commands: [
      {
        label: 'New document',
        description: 'A blank document in this workspace',
        icon: add,
        shortcut: 'mod+alt+n',
      },
      { label: 'Sync now', icon: schedule, keywords: ['refresh', 'reload'] },
      { label: 'Notification settings', icon: notifications },
    ],
  },
  { separator: true },
  {
    label: 'Help',
    commands: [{ label: 'Keyboard shortcuts', icon: info, shortcut: 'shift+/' }],
  },
]
</script>

<template>
  <div class="demo">
    <VCommandPalette
      v-model:open="open"
      :items="items"
      @select="(command) => (last = command.label)"
    >
      <template #trigger="{ triggerProps }">
        <VButton v-bind="triggerProps" variant="outline" tone="neutral">Open the palette</VButton>
      </template>
    </VCommandPalette>
    <p v-if="last">Ran: {{ last }}</p>
  </div>
</template>

<style scoped>
.demo {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--vectis-space-4);
}

p {
  margin: 0;
}
</style>
