<script setup lang="ts">
import { VProgressLinear, VTypography } from 'vectis-ui'
</script>

<template>
  <div class="column">
    <div class="labelled">
      <VTypography variant="caption" tone="muted">rounded, the default</VTypography>
      <VProgressLinear :value="60" thickness="14" aria-label="Upload, rounded" />
    </div>

    <div class="labelled">
      <VTypography variant="caption" tone="muted">square</VTypography>
      <VProgressLinear :value="60" thickness="14" shape="square" aria-label="Upload, square" />
    </div>
  </div>
</template>

<style scoped>
.column {
  display: grid;
  gap: var(--vectis-space-5);
  max-inline-size: 28rem;
}
.labelled {
  display: grid;
  gap: var(--vectis-space-2);
}
</style>
