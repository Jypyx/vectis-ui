<script setup lang="ts">
import { VSwitch } from 'vectis-ui'
</script>

<template>
  <div class="stack">
    <VSwitch>Label after the switch, the default</VSwitch>
    <VSwitch label-position="start">Label before the switch</VSwitch>
  </div>
</template>

<style scoped>
/* Keep the clickable label from stretching across the grid. */
.stack {
  display: grid;
  justify-items: start;
  gap: var(--vectis-space-3);
}
</style>
