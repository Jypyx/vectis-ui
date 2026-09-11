<script setup lang="ts">
import { VTypography } from 'vectis-ui'

const LONG = 'A title far too long to sit on one line of a narrow column without being cut'
</script>

<template>
  <div class="demo">
    <!-- One line, ended with an ellipsis. The element needs a width to be cut against:
         as a block or a flex item it takes its parent's, which is what the box below
         gives it. -->
    <div class="box">
      <VTypography truncate>{{ LONG }}</VTypography>
    </div>

    <!-- With nothing to overflow, there is nothing to cut and the text simply stays
         whole: the same element, left to size itself. -->
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
