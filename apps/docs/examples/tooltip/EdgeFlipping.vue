<script setup lang="ts">
import { VButton, VTooltip } from 'vectis-ui'
</script>

<template>
  <!-- The flip is pure CSS and costs no JavaScript: the panel names the side it would
       rather be on, and the browser falls back to the opposite one when the viewport
       has no room there. Scroll these buttons up against the top and the bottom of the
       window to see it happen. -->
  <div class="demo">
    <VTooltip text="Asks for the top, takes the bottom near the edge" placement="top">
      <template #default="{ triggerProps }">
        <VButton variant="outline" tone="neutral" v-bind="triggerProps"> Prefers the top </VButton>
      </template>
    </VTooltip>

    <VTooltip text="Asks for the bottom, takes the top near the edge" placement="bottom">
      <template #default="{ triggerProps }">
        <VButton variant="outline" tone="neutral" v-bind="triggerProps">
          Prefers the bottom
        </VButton>
      </template>
    </VTooltip>
  </div>
</template>

<style scoped>
.demo {
  display: flex;
  flex-wrap: wrap;
  gap: var(--vectis-space-4);
}
</style>
