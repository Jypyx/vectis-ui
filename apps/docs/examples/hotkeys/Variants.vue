<script setup lang="ts">
import { VHotkeys, VTypography, type HotkeysVariant } from 'vectis-ui'

const VARIANTS: HotkeysVariant[] = ['flat', 'outlined', 'elevated']
</script>

<template>
  <div class="row">
    <div v-for="variant in VARIANTS" :key="variant" class="cell">
      <VHotkeys keys="mod+shift+p" :variant="variant" />
      <VTypography variant="caption" tone="muted">{{ variant }}</VTypography>
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
