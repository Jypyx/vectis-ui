<script setup lang="ts">
import { VProgressCircular, VTypography } from 'vectis-ui'
</script>

<template>
  <div class="row">
    <!-- The shape is the end of the drawn arc, rounded or cut square. It shows on a
         thick ring and is all but invisible on a thin one. -->
    <div class="cell">
      <VProgressCircular :value="65" :size="96" :thickness="14" aria-label="Upload, rounded" />
      <VTypography variant="caption" tone="muted">rounded, the default</VTypography>
    </div>

    <div class="cell">
      <VProgressCircular
        :value="65"
        :size="96"
        :thickness="14"
        shape="square"
        aria-label="Upload, square"
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
