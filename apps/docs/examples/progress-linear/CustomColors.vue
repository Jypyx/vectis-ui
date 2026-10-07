<script setup lang="ts">
import { VProgressLinear, VTypography } from 'vectis-ui'

const COLORS = [
  { value: '#7c3aed', caption: 'A hex value' },
  { value: 'teal', caption: 'A CSS colour name' },
  { value: 'oklch(0.72 0.19 45)', caption: 'An oklch() colour' },
]
</script>

<template>
  <div class="column">
    <div v-for="colour in COLORS" :key="colour.value" class="row">
      <VTypography variant="caption" tone="muted" class="name">{{ colour.caption }}</VTypography>
      <VProgressLinear
        :value="60"
        :color="colour.value"
        :label="`Upload, ${colour.caption}`"
        hide-label
      />
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
  grid-template-columns: 9rem 1fr;
  align-items: center;
  gap: var(--vectis-space-4);
}
.name {
  text-align: end;
}
</style>
