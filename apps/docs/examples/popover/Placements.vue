<script setup lang="ts">
import { VButton, VPopover, VTypography, type PopoverPlacement } from 'vectis-ui'

const PLACEMENTS: PopoverPlacement[] = [
  'top-start',
  'top',
  'top-end',
  'bottom-start',
  'bottom',
  'bottom-end',
  'left-start',
  'left',
  'left-end',
  'right-start',
  'right',
  'right-end',
]
</script>

<template>
  <div class="grid">
    <!-- A preference rather than a position: a browser short of room on that side flips
         the panel to the opposite one by itself. -->
    <VPopover v-for="placement in PLACEMENTS" :key="placement" :placement="placement">
      <template #trigger="{ triggerProps }">
        <VButton v-bind="triggerProps" variant="outline" tone="neutral" size="sm">
          {{ placement }}
        </VButton>
      </template>
      <VTypography variant="body-sm">Placed {{ placement }}</VTypography>
    </VPopover>
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(3, max-content);
  justify-content: center;
  gap: var(--vectis-space-4);
  /* Room on every side, so nothing is flipped for want of space in the demo. */
  padding: var(--vectis-space-10) var(--vectis-space-12);
}
</style>
