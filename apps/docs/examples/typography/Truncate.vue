<script setup lang="ts">
import { VTypography } from 'vectis-ui'

const LONG = 'A title far too long to sit on one line of a narrow column without being cut'
</script>

<template>
  <div class="demo">
    <div class="box">
      <VTypography truncate>{{ LONG }}</VTypography>
    </div>

    <VTypography truncate>{{ LONG }}</VTypography>
  </div>
</template>

<style scoped>
.demo {
  display: grid;
  justify-items: start;
  gap: var(--vectis-space-4);
}
.box {
  inline-size: 16rem;
  padding: var(--vectis-space-3);
  border: 1px dashed var(--vectis-color-border);
  border-radius: var(--vectis-radius-surface);
}
</style>
