<script setup lang="ts">
import { VButton, VMenu, VMenuItem } from 'vectis-ui'
import { description, image, schedule } from 'vectis-ui/icons'

const sizes = ['sm', 'md', 'lg'] as const
</script>

<template>
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
</template>
