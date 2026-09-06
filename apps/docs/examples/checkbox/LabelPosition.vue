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
/* `justify-items: start` keeps each row as wide as its own label: the clickable area is
   the whole <label>, so a stretched row would be clickable well past its text. */
.stack {
  display: grid;
  justify-items: start;
  gap: var(--vectis-space-2);
}
</style>
