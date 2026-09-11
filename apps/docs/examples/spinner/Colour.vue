<script setup lang="ts">
import { VSpinner } from 'vectis-ui'
</script>

<template>
  <div class="demo">
    <!-- There is no colour prop: the ring is painted in `currentcolor`, so it takes
         the colour of the text around it. Set `color` on the spinner or on anything
         above it, and it follows. -->
    <p><VSpinner /> The colour of the text it sits in</p>
    <p class="accent"><VSpinner label="Sending" /> Sending</p>
    <p class="danger"><VSpinner label="Retrying" /> Retrying</p>
  </div>
</template>

<style scoped>
.demo {
  display: grid;
  gap: var(--vectis-space-3);
}
.demo p {
  display: flex;
  align-items: center;
  gap: var(--vectis-space-3);
  margin: 0;
}
.accent {
  color: var(--vectis-color-accent-text);
}
.danger {
  color: var(--vectis-color-danger-text);
}
</style>
