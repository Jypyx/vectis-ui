<script setup lang="ts">
import { VChip } from 'vectis-ui'
</script>

<template>
  <div class="row">
    <VChip size="xs">Extra small</VChip>
    <VChip size="sm">Small</VChip>
  </div>

  <div class="row">
    <VChip size="xs" compact>Extra small</VChip>
    <VChip size="sm" compact>Small</VChip>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--vectis-space-2);
}
</style>
