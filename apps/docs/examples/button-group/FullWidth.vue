<script setup lang="ts">
import { VButton, VButtonGroup } from 'vectis-ui'
</script>

<template>
  <div class="column">
    <VButtonGroup variant="outline" tone="neutral" label="As wide as its labels">
      <VButton>Day</VButton>
      <VButton>Week</VButton>
      <VButton>Month</VButton>
    </VButtonGroup>

    <VButtonGroup full-width variant="outline" tone="neutral" label="Filling the column">
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
  gap: var(--vectis-space-3);
  inline-size: 320px;
}
</style>
