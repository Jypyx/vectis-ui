<script setup lang="ts">
import { VHotkeys, VTypography, type HotkeysSize } from 'vectis-ui'

/* Two sizes only. A shortcut is chrome beside other text, so `xs` is the default and
   `sm` is already as large as one usefully gets. */
const SIZES: HotkeysSize[] = ['xs', 'sm']
</script>

<template>
  <div class="row">
    <div v-for="size in SIZES" :key="size" class="cell">
      <VHotkeys keys="mod+k" :size="size" variant="outlined" />
      <VTypography variant="caption" tone="muted">{{ size }}</VTypography>
    </div>

    <div v-for="size in SIZES" :key="`${size}-compact`" class="cell">
      <VHotkeys keys="mod+k" :size="size" compact variant="outlined" />
      <VTypography variant="caption" tone="muted">{{ size }} compact</VTypography>
    </div>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  gap: var(--vectis-space-6);
}
.cell {
  display: grid;
  justify-items: center;
  gap: var(--vectis-space-2);
}
</style>
