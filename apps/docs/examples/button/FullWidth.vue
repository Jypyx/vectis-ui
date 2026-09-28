<script setup lang="ts">
import { VButton } from 'vectis-ui'
</script>

<template>
  <div class="column">
    <VButton>Save</VButton>
    <VButton variant="outline" tone="neutral">Cancel</VButton>
  </div>

  <div class="column">
    <VButton full-width>Save</VButton>
    <VButton full-width variant="outline" tone="neutral">Cancel</VButton>
  </div>
</template>

<style scoped>
.column {
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: var(--vectis-space-3);
  inline-size: 220px;
}
</style>
