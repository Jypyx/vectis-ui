<script setup lang="ts">
import { VButton, VButtonGroup } from 'vectis-ui'
</script>

<template>
  <div class="column">
    <VButtonGroup variant="outline" tone="neutral" aria-label="With lines">
      <VButton>Day</VButton>
      <VButton>Week</VButton>
      <VButton>Month</VButton>
    </VButtonGroup>

    <VButtonGroup seamless variant="outline" tone="neutral" aria-label="Seamless">
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
}
</style>
