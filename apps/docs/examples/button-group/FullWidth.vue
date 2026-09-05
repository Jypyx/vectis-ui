<script setup lang="ts">
import { VButton, VButtonGroup } from 'vectis-ui'
</script>

<template>
  <div class="column">
    <VButtonGroup variant="outline" tone="neutral" aria-label="As wide as its labels">
      <VButton>Day</VButton>
      <VButton>Week</VButton>
      <VButton>Month</VButton>
    </VButtonGroup>

    <VButtonGroup full-width variant="outline" tone="neutral" aria-label="Filling the column">
      <VButton>Day</VButton>
      <VButton>Week</VButton>
      <VButton>Month</VButton>
    </VButtonGroup>
  </div>
</template>

<style scoped>
/* A column narrower than the page, so that filling it is something to see. The rows are
   aligned to the start, which is what leaves the first at the width of its own labels. */
.column {
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: var(--vectis-space-3);
  inline-size: 320px;
}
</style>
