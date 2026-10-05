<script setup lang="ts">
import { VRating, VTypography } from 'vectis-ui'
</script>

<template>
  <div class="summary">
    <VRating
      :model-value="3.7"
      readonly
      size="sm"
      tone="warning"
      label="Average rating"
      hide-label
    />
    <VTypography variant="body-sm" tone="muted">3.7 · 128 reviews</VTypography>
  </div>
</template>

<style scoped>
.summary {
  display: flex;
  align-items: center;
  gap: var(--vectis-space-2);
}
</style>
