<script setup lang="ts">
import { VProgressCircular, VTypography } from 'vectis-ui'

const COLORS = [
  { value: '#7c3aed', caption: 'A hex value' },
  { value: 'teal', caption: 'A CSS colour name' },
  { value: 'oklch(0.72 0.19 45)', caption: 'An oklch() colour' },
]
</script>

<template>
  <div class="row">
    <!-- The unfilled ring's shade is derived from the colour against the theme, so one
         value is enough and it stays right in dark mode. -->
    <div v-for="colour in COLORS" :key="colour.value" class="cell">
      <VProgressCircular
        :value="65"
        :color="colour.value"
        :aria-label="`Upload, ${colour.caption}`"
      />
      <VTypography variant="caption" tone="muted">{{ colour.caption }}</VTypography>
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
