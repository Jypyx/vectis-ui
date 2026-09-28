<script setup lang="ts">
import { VButton, VMenu, VMenuItem, type MenuPlacement } from 'vectis-ui'

const PLACEMENTS: MenuPlacement[] = [
  'bottom-start',
  'bottom',
  'bottom-end',
  'top-start',
  'top',
  'top-end',
]
</script>

<template>
  <div class="grid">
    <VMenu v-for="placement in PLACEMENTS" :key="placement" :placement="placement">
      <template #trigger="{ triggerProps }">
        <VButton v-bind="triggerProps" variant="outline" tone="neutral">
          {{ placement }}
        </VButton>
      </template>
      <VMenuItem label="Rename" />
      <VMenuItem label="Duplicate" />
      <VMenuItem label="Move to archive" />
    </VMenu>
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(3, max-content);
  gap: var(--vectis-space-4);
  /* Leave room on both sides to demonstrate the requested placement without flipping. */
  padding-block: var(--vectis-space-10);
}
</style>
