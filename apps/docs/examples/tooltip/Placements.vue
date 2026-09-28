<script setup lang="ts">
import { VButton, VTooltip, type TooltipPlacement } from 'vectis-ui'

const placements: TooltipPlacement[] = [
  'top',
  'top-start',
  'top-end',
  'bottom',
  'bottom-start',
  'bottom-end',
  'left',
  'right',
]
</script>

<template>
  <div class="row">
    <VTooltip
      v-for="placement in placements"
      :key="placement"
      :text="`Placed ${placement}`"
      :placement="placement"
    >
      <template #default="{ triggerProps }">
        <VButton variant="outline" tone="neutral" v-bind="triggerProps">{{ placement }}</VButton>
      </template>
    </VTooltip>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--vectis-space-6) var(--vectis-space-4);
  padding-block: var(--vectis-space-8);
}
</style>
