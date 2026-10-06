<script setup lang="ts">
import { ref } from 'vue'
import { VButton, VCommandPalette } from 'vectis-ui'
import type { CommandPaletteItem } from 'vectis-ui'
import { open_in_new as openInNew } from 'vectis-ui/icons'

const open = ref(false)

const items: CommandPaletteItem[] = [
  {
    label: 'Components',
    commands: [
      { label: 'Button', href: '#button' },
      { label: 'Dialog', href: '#dialog' },
      { label: 'Drawer', href: '#drawer' },
    ],
  },
  {
    label: 'Resources',
    commands: [
      { label: 'Vue documentation', href: 'https://vuejs.org', icon: openInNew },
      { label: 'Changelog', href: '#changelog', disabled: true },
    ],
  },
]
</script>

<template>
  <VCommandPalette v-model:open="open" :items="items" placeholder="Go to a page…">
    <template #trigger="{ triggerProps }">
      <VButton v-bind="triggerProps" variant="outline" tone="neutral">Go to</VButton>
    </template>
  </VCommandPalette>
</template>
