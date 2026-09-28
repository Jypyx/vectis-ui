<script setup lang="ts">
import { VAvatar, VButton, VChip, VInput, VSkeletonLoader, VTypography } from 'vectis-ui'
</script>

<template>
  <div class="grid">
    <VTypography variant="overline" tone="muted" as="p">Component</VTypography>
    <VTypography variant="overline" tone="muted" as="p">Skeleton</VTypography>

    <VButton size="md">Save</VButton>
    <VSkeletonLoader shape="control" size="md" :width="128" />

    <VAvatar size="lg" name="Ada Lovelace" />
    <VSkeletonLoader shape="circle" size="lg" />

    <VChip size="xs">Active filter</VChip>
    <VSkeletonLoader shape="pill" size="xs" :width="88" />

    <VInput size="md" label="Name" model-value="Ada Lovelace" />
    <div class="field">
      <VSkeletonLoader width="40%" />
      <VSkeletonLoader shape="control" size="md" />
    </div>

    <div class="card">
      <VTypography variant="heading-4">Sales analysis</VTypography>
      <VTypography variant="body-sm" tone="muted">
        The quarter closes on a 12% rise in revenue.
      </VTypography>
    </div>
    <div class="card">
      <VSkeletonLoader shape="control" size="sm" width="60%" />
      <VSkeletonLoader :lines="3" />
    </div>
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--vectis-space-6) var(--vectis-space-8);
  align-items: start;
  inline-size: 100%;
}
.field,
.card {
  display: grid;
  gap: var(--vectis-space-3);
}
.card {
  padding: var(--vectis-space-4);
  border: 1px solid var(--vectis-color-border);
  border-radius: var(--vectis-radius-surface);
}
</style>
