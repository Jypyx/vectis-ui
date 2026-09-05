<script setup lang="ts">
import { VButton, VButtonGroup } from 'vectis-ui'
</script>

<template>
  <div class="column">
    <VButtonGroup variant="ghost" tone="neutral" aria-label="Flat">
      <VButton>Day</VButton>
      <VButton>Week</VButton>
      <VButton>Month</VButton>
    </VButtonGroup>

    <VButtonGroup elevated variant="ghost" tone="neutral" aria-label="Raised">
      <VButton>Day</VButton>
      <VButton>Week</VButton>
      <VButton>Month</VButton>
    </VButtonGroup>

    <VButtonGroup elevated detached variant="ghost" tone="neutral" aria-label="Raised, detached">
      <VButton>Day</VButton>
      <VButton>Week</VButton>
      <VButton>Month</VButton>
    </VButtonGroup>
  </div>
</template>

<style scoped>
.column {
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: var(--vectis-space-4);
}
</style>
