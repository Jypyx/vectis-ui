<script setup lang="ts">
import { VButton, VPopover, VTypography } from 'vectis-ui'
</script>

<template>
  <div class="column">
    <VPopover placement="bottom-start">
      <template #trigger="{ triggerProps }">
        <VButton v-bind="triggerProps" variant="outline" tone="neutral" class="wide">
          A wide trigger, a narrow panel
        </VButton>
      </template>
      <VTypography variant="body-sm">Short.</VTypography>
    </VPopover>

    <VPopover match-trigger placement="bottom-start">
      <template #trigger="{ triggerProps }">
        <VButton v-bind="triggerProps" variant="outline" tone="neutral" class="wide">
          A wide trigger, matched
        </VButton>
      </template>
      <VTypography variant="body-sm">Short.</VTypography>
    </VPopover>

    <VPopover match-trigger placement="bottom-start">
      <template #trigger="{ triggerProps }">
        <VButton v-bind="triggerProps" variant="outline" tone="neutral">Narrow</VButton>
      </template>
      <VTypography variant="body-sm">
        The content is wider than the trigger, so the panel grows past it rather than being squeezed
        into its width.
      </VTypography>
    </VPopover>
  </div>
</template>

<style scoped>
.column {
  display: grid;
  justify-items: start;
  gap: var(--vectis-space-4);
}
.wide {
  inline-size: 22rem;
}
</style>
