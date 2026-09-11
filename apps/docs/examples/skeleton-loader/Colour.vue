<script setup lang="ts">
import { VSkeletonLoader } from 'vectis-ui'
</script>

<template>
  <div class="demo">
    <!-- `color` replaces the background token. The highlight both animations use is
         derived from it by a lightness delta, so it stays right on an unusual surface
         and in either theme, with nothing else to set. -->
    <VSkeletonLoader shape="surface" color="oklch(55% 0.14 265)" />

    <!-- The case it is for: a card that paints its own ground, where the shipped grey
         would read as a hole. -->
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
