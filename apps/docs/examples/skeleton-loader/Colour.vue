<script setup lang="ts">
import { VSkeletonLoader } from 'vectis-ui'
</script>

<template>
  <div class="demo">
    <VSkeletonLoader shape="surface" color="oklch(55% 0.14 265)" />

    <div class="inverse">
      <VSkeletonLoader shape="control" size="sm" width="60%" color="oklch(38% 0.01 260)" />
      <VSkeletonLoader :lines="3" color="oklch(38% 0.01 260)" />
    </div>
  </div>
</template>

<style scoped>
.demo {
  display: grid;
  gap: var(--vectis-space-5);
  inline-size: 22rem;
}
.inverse {
  display: grid;
  gap: var(--vectis-space-3);
  padding: var(--vectis-space-4);
  border-radius: var(--vectis-radius-surface);
  background: var(--vectis-color-surface-inverse);
}
</style>
