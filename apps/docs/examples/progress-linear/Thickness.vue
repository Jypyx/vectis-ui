<script setup lang="ts">
import { VProgressLinear, VTypography } from 'vectis-ui'

const THICKNESSES = [2, 4, 8, 16]
</script>

<template>
  <div class="column">
    <!-- Always pixels, whether a number or a numeric string. The bar takes the width of
         whatever holds it, so its length is the container's business and not a prop. -->
    <div v-for="thickness in THICKNESSES" :key="thickness" class="row">
      <VTypography variant="caption" tone="muted" class="name">{{ thickness }}px</VTypography>
      <VProgressLinear :value="60" :thickness="thickness" :aria-label="`Upload, ${thickness}px`" />
    </div>
  </div>
</template>

<style scoped>
.column {
  display: grid;
  gap: var(--vectis-space-4);
  max-inline-size: 28rem;
}
.row {
  display: grid;
  grid-template-columns: 4rem 1fr;
  align-items: center;
  gap: var(--vectis-space-4);
}
.name {
  text-align: end;
}
</style>
