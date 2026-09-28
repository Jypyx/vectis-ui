<script setup lang="ts">
import { VProgressCircular, VTypography } from 'vectis-ui'
</script>

<template>
  <div class="row">
    <div class="cell">
      <VProgressCircular :value="65" :size="96" :thickness="14" label="Upload, rounded" />
      <VTypography variant="caption" tone="muted">rounded, the default</VTypography>
    </div>

    <div class="cell">
      <VProgressCircular
        :value="65"
        :size="96"
        :thickness="14"
        shape="square"
        label="Upload, square"
      />
      <VTypography variant="caption" tone="muted">square</VTypography>
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
