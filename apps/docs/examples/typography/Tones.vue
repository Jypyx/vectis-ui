<script setup lang="ts">
import { VTypography, type TypographyTone } from 'vectis-ui'

// Show on-inverse against an inverted surface.
const tones: TypographyTone[] = [
  'default',
  'muted',
  'subtle',
  'accent',
  'danger',
  'success',
  'warning',
]
</script>

<template>
  <div class="demo">
    <VTypography v-for="tone in tones" :key="tone" :tone="tone">
      {{ tone }}: pack my box with five dozen jugs.
    </VTypography>

    <div class="inverse">
      <VTypography tone="on-inverse">on-inverse: pack my box with five dozen jugs.</VTypography>
    </div>
  </div>
</template>

<style scoped>
.demo {
  display: grid;
  justify-items: start;
  gap: var(--vectis-space-2);
}
.inverse {
  margin-block-start: var(--vectis-space-2);
  padding: var(--vectis-space-2) var(--vectis-space-3);
  border-radius: var(--vectis-radius-surface);
  background: var(--vectis-color-surface-inverse);
}
</style>
