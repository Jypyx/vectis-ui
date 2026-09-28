<script setup lang="ts">
import { VButton, VTooltip } from 'vectis-ui'
</script>

<template>
  <div class="demo">
    <!-- Keyboard focus opens it at once instead: the intent is not in doubt there. -->
    <VTooltip text="Appears after the default wait">
      <template #default="{ triggerProps }">
        <VButton variant="outline" tone="neutral" v-bind="triggerProps">300ms</VButton>
      </template>
    </VTooltip>

    <VTooltip text="Appears after a longer wait" :delay="800">
      <template #default="{ triggerProps }">
        <VButton variant="outline" tone="neutral" v-bind="triggerProps">800ms</VButton>
      </template>
    </VTooltip>

    <VTooltip text="Appears at once" :delay="0">
      <template #default="{ triggerProps }">
        <VButton variant="outline" tone="neutral" v-bind="triggerProps">No wait</VButton>
      </template>
    </VTooltip>

    <!-- Tab to any of these and the tooltip opens immediately; Escape closes it
         without taking the focus away, and pressing the trigger closes it too. -->
  </div>
</template>

<style scoped>
.demo {
  display: flex;
  flex-wrap: wrap;
  gap: var(--vectis-space-4);
}
</style>
