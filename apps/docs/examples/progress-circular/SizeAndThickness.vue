<script setup lang="ts">
import { VProgressCircular, VTypography } from 'vectis-ui'

const SIZES = [24, 40, 64, 96]
const THICKNESSES = [2, 4, 8, 14]
</script>

<template>
  <div class="column">
    <!-- The geometry is entirely CSS: the radius is derived from the diameter and the
         thickness, so changing either recomputes nothing in JavaScript. -->
    <div class="row">
      <div v-for="size in SIZES" :key="size" class="cell">
        <VProgressCircular :value="65" :size="size" :aria-label="`Upload, ${size}px`" />
        <VTypography variant="caption" tone="muted">{{ size }}px</VTypography>
      </div>
    </div>

    <!-- Thickness is independent of the diameter, and both are always pixels whether
         given as a number or as a numeric string. -->
    <div class="row">
      <div v-for="thickness in THICKNESSES" :key="thickness" class="cell">
        <VProgressCircular
          :value="65"
          :size="64"
          :thickness="thickness"
          :aria-label="`Upload, ${thickness}px ring`"
        />
        <VTypography variant="caption" tone="muted">{{ thickness }}px ring</VTypography>
      </div>
    </div>
  </div>
</template>

<style scoped>
.column {
  display: grid;
  gap: var(--vectis-space-6);
}
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
