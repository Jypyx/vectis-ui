<script setup lang="ts">
import { VTypography, type TypographyTone } from 'vectis-ui'

// `on-inverse` is left out of the loop: it only means anything against a dark ground,
// so it is shown on one below.
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
    <!-- `default` sets no colour at all, so the text takes whatever surrounds it. That
         is what lets the same component sit inside a coloured toast or on an inverted
         surface without being told which one it is on. -->
    <VTypography v-for="tone in tones" :key="tone" :tone="tone">
      {{ tone }}: pack my box with five dozen jugs.
    </VTypography>

    <!-- The one tone that names its ground rather than its meaning, for text the
         inherited colour would not survive. -->
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
