<script setup lang="ts">
import { VCheckbox } from 'vectis-ui'
</script>

<template>
  <div class="stack">
    <VCheckbox>Label after the box, the default</VCheckbox>
    <VCheckbox label-position="start">Label before the box</VCheckbox>
  </div>
</template>

<style scoped>
/* Keep the clickable label from stretching across the grid. */
.stack {
  display: grid;
  justify-items: start;
  gap: var(--vectis-space-2);
}
</style>
