<script setup lang="ts">
import { VProgressLinear, VTypography, type ProgressLinearTone } from 'vectis-ui'

const TONES: ProgressLinearTone[] = ['accent', 'success', 'warning', 'danger', 'neutral']
</script>

<template>
  <div class="column">
    <div v-for="tone in TONES" :key="tone" class="row">
      <VTypography variant="caption" tone="muted" class="name">{{ tone }}</VTypography>
      <VProgressLinear :value="60" :tone="tone" :aria-label="`Upload, ${tone}`" />
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
  grid-template-columns: 5rem 1fr;
  align-items: center;
  gap: var(--vectis-space-4);
}
.name {
  text-align: end;
}
</style>
