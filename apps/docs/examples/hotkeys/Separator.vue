<script setup lang="ts">
import { VHotkeys, VTypography } from 'vectis-ui'

/* The caps are laid out with a gap of their own, so the separator is what is WRITTEN
   between them and never the space around it: an empty string leaves the gap alone
   and gives the macOS convention, where the symbols simply follow one another. */
const SEPARATORS = [
  { value: '+', label: 'The default' },
  { value: '', label: 'Nothing, the macOS convention' },
  { value: '·', label: 'A middle dot' },
  { value: '/', label: 'A slash' },
]
</script>

<template>
  <div class="grid">
    <template v-for="separator in SEPARATORS" :key="separator.label">
      <VHotkeys keys="mod+shift+k" :separator="separator.value" variant="outlined" />
      <VTypography variant="caption" tone="muted">{{ separator.label }}</VTypography>
    </template>
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: var(--vectis-space-3) var(--vectis-space-5);
  justify-items: start;
}
</style>
