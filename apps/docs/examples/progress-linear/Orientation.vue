<script setup lang="ts">
import { VProgressLinear, VTypography } from 'vectis-ui'
</script>

<template>
  <div class="row">
    <div v-for="value in [25, 60, 90]" :key="value" class="gauge">
      <VProgressLinear
        :value="value"
        orientation="vertical"
        thickness="14"
        :label="`Tank, ${value} percent`"
      />
      <VTypography variant="caption" tone="muted">{{ value }}%</VTypography>
    </div>

    <div class="gauge">
      <VProgressLinear indeterminate orientation="vertical" thickness="14" label="Filling" />
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
  block-size: 9rem;
  grid-template-rows: 1fr auto;
}
</style>
