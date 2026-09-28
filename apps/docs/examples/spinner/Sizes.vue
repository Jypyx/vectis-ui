<script setup lang="ts">
import { VSpinner } from 'vectis-ui'
</script>

<template>
  <div class="demo">
    <p class="small"><VSpinner /> Follows small text</p>
    <p class="large"><VSpinner /> Follows large text</p>

    <p><VSpinner :size="32" /> 32 pixels, whatever the text does</p>
  </div>
</template>

<style scoped>
.demo {
  display: grid;
  gap: var(--vectis-space-4);
}
.demo p {
  display: flex;
  align-items: center;
  gap: var(--vectis-space-3);
  margin: 0;
}
.small {
  font-size: var(--vectis-text-body-sm-size);
}
.large {
  font-size: var(--vectis-text-heading-3-size);
}
</style>
