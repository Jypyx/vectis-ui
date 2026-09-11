<script setup lang="ts">
import { VProgressCircular, VTypography, type ProgressCircularTone } from 'vectis-ui'

const TONES: ProgressCircularTone[] = ['accent', 'success', 'warning', 'danger', 'neutral']
</script>

<template>
  <div class="row">
    <div v-for="tone in TONES" :key="tone" class="cell">
      <VProgressCircular :value="65" :tone="tone" :aria-label="`Upload, ${tone}`" />
      <VTypography variant="caption" tone="muted">{{ tone }}</VTypography>
    </div>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--vectis-space-6);
}
.cell {
  display: grid;
  justify-items: center;
  gap: var(--vectis-space-2);
}
</style>
