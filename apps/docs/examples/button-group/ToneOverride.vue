<script setup lang="ts">
import { VButton, VButtonGroup } from 'vectis-ui'
</script>

<template>
  <div class="column">
    <VButtonGroup variant="outline" tone="neutral" aria-label="Row actions, outline">
      <VButton>Rename</VButton>
      <VButton>Duplicate</VButton>
      <VButton tone="danger">Delete</VButton>
    </VButtonGroup>

    <VButtonGroup variant="soft" tone="neutral" aria-label="Row actions, tonal">
      <VButton>Rename</VButton>
      <VButton>Duplicate</VButton>
      <VButton tone="danger">Delete</VButton>
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
