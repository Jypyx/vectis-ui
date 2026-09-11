<script setup lang="ts">
import { VButton, VMenu, VMenuItem } from 'vectis-ui'
import { description, image, schedule } from 'vectis-ui/icons'

const sizes = ['sm', 'md', 'lg'] as const
</script>

<template>
  <!-- The size is set once on the menu and every row follows, submenus included: the
       panel carries it and the rows read it from there. -->
  <VMenu v-for="size in sizes" :key="size" :size="size">
    <template #trigger="{ triggerProps }">
      <VButton v-bind="triggerProps" :size="size" variant="outline" tone="neutral">
        {{ size }}
      </VButton>
    </template>
    <VMenuItem label="Open" :icon-start="description" />
    <VMenuItem label="Export" :icon-start="image" />
    <VMenuItem label="Remind me later" :icon-start="schedule" />
  </VMenu>

  <VMenu size="md" compact>
    <template #trigger="{ triggerProps }">
      <VButton v-bind="triggerProps" size="md" compact variant="outline" tone="neutral">
        md compact
      </VButton>
    </template>
    <VMenuItem label="Open" :icon-start="description" />
    <VMenuItem label="Export" :icon-start="image" />
    <VMenuItem label="Remind me later" :icon-start="schedule" />
  </VMenu>
</template>
