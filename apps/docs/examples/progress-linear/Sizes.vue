<script setup lang="ts">
import { VProgressLinear, VTypography, type ProgressLinearSize } from 'vectis-ui'

const SIZES: ProgressLinearSize[] = ['xs', 'sm', 'md', 'lg', 'xl']
</script>

<template>
  <div class="column">
    <div v-for="size in SIZES" :key="size" class="row">
      <VTypography variant="caption" tone="muted" class="name">{{ size }}</VTypography>
      <VProgressLinear :value="60" :size="size" :label="`Upload, ${size}`" hide-label />
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
