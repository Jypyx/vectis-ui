<script setup lang="ts">
import { VButton, VButtonGroup } from 'vectis-ui'
</script>

<template>
  <div class="column">
    <VButtonGroup disabled variant="outline" tone="neutral" aria-label="Row switched off">
      <VButton>Rename</VButton>
      <VButton>Duplicate</VButton>
      <VButton>Delete</VButton>
    </VButtonGroup>

    <VButtonGroup variant="outline" tone="neutral" aria-label="One segment at a time">
      <VButton>Rename</VButton>
      <VButton disabled>Duplicate</VButton>
      <VButton loading>Deleting</VButton>
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
