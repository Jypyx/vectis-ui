<script setup lang="ts">
import { VProgressLinear, VTypography } from 'vectis-ui'
</script>

<template>
  <div class="row">
    <!-- Upright, the bar fills from the BOTTOM up: zero is anchored to the bottom edge,
         so a vertical bar reads the way a gauge does. It takes the height of whatever
         holds it, the way the horizontal one takes the width. -->
    <div v-for="value in [25, 60, 90]" :key="value" class="gauge">
      <VProgressLinear
        :value="value"
        orientation="vertical"
        thickness="14"
        :aria-label="`Tank, ${value} percent`"
      />
      <VTypography variant="caption" tone="muted">{{ value }}%</VTypography>
    </div>

    <div class="gauge">
      <VProgressLinear indeterminate orientation="vertical" thickness="14" aria-label="Filling" />
      <VTypography variant="caption" tone="muted">indeterminate</VTypography>
    </div>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  align-items: end;
  gap: var(--vectis-space-6);
}
.gauge {
  display: grid;
  justify-items: center;
  gap: var(--vectis-space-2);
  /* The bar takes the height it is given, exactly as the horizontal one takes a width. */
  block-size: 9rem;
  grid-template-rows: 1fr auto;
}
</style>
