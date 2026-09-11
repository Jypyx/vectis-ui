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
  <!-- Eight sides, four of them aligned to an edge of the trigger rather than centred
       on it. The placement names a preference and not a position: with no room on that
       side the browser moves the panel by itself. -->
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
  /* Room above and below for the panels, which are drawn outside this box. */
  padding-block: var(--vectis-space-8);
}
</style>
