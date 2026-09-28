<script setup lang="ts">
import { VButton, VTooltip } from 'vectis-ui'
</script>

<template>
  <!-- Scroll the triggers near the viewport edges to observe placement flipping. -->
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
