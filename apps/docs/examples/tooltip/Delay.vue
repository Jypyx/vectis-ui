<script setup lang="ts">
import { VButton, VTooltip } from 'vectis-ui'
</script>

<template>
  <div class="demo">
    <VTooltip text="Appears after the default wait">
      <template #default="{ triggerProps }">
        <VButton variant="outline" tone="neutral" v-bind="triggerProps">300ms</VButton>
      </template>
    </VTooltip>

    <VTooltip text="Appears after a longer wait" :open-delay="800">
      <template #default="{ triggerProps }">
        <VButton variant="outline" tone="neutral" v-bind="triggerProps">800ms</VButton>
      </template>
    </VTooltip>

    <VTooltip text="Appears at once" :open-delay="0">
      <template #default="{ triggerProps }">
        <VButton variant="outline" tone="neutral" v-bind="triggerProps">No wait</VButton>
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
