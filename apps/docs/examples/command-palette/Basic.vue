<script setup lang="ts">
import { ref } from 'vue'
import { VButton, VCommandPalette, VHotkeys } from 'vectis-ui'
import type { CommandPaletteItem } from 'vectis-ui'
import { add, notifications, schedule, table_chart as tableChart } from 'vectis-ui/icons'

const open = ref(false)
const last = ref('')

const items: CommandPaletteItem[] = [
  { label: 'New document', icon: add },
  { label: 'Open reports', icon: tableChart },
  { label: 'Sync now', icon: schedule },
  { label: 'Notification settings', icon: notifications },
]
</script>

<template>
  <div class="demo">
    <VCommandPalette
      v-model:open="open"
      :items="items"
      shortcut="alt+k"
      @select="(command) => (last = command.label)"
    >
      <template #trigger="{ triggerProps }">
        <VButton v-bind="triggerProps" variant="outline" tone="neutral">
          Search commands
          <VHotkeys keys="alt+k" />
        </VButton>
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
