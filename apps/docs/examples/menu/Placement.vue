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
    <!-- Only the block axis is offered: a list of commands opening beside its button
         would leave the reader looking in the wrong place. -->
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
  /* Room above and below, so a menu is never flipped by a shortage of space. */
  padding-block: var(--vectis-space-10);
}
</style>
