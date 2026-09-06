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
/* `justify-items: start` keeps each row as wide as its own label: the clickable area is
   the whole <label>, so a stretched row would be clickable well past its text. */
.stack {
  display: grid;
  justify-items: start;
  gap: var(--vectis-space-3);
}
</style>
