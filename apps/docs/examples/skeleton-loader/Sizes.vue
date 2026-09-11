<script setup lang="ts">
import { VSkeletonLoader, type SkeletonLoaderSize } from 'vectis-ui'

const sizes: SkeletonLoaderSize[] = ['xs', 'sm', 'md', 'lg', 'xl']
</script>

<template>
  <div class="demo">
    <!-- The control scale, 24 to 56 pixels: an md skeleton is exactly the height of
         an md button, which is what lets a silhouette hold the place of the control
         it stands in for. -->
    <div class="row">
      <p class="caption">circle</p>
      <div class="inline">
        <VSkeletonLoader v-for="size in sizes" :key="size" shape="circle" :size="size" />
      </div>
    </div>

    <div class="row">
      <p class="caption">control</p>
      <VSkeletonLoader v-for="size in sizes" :key="size" shape="control" :size="size" />
    </div>

    <!-- compact takes 4px off the height, as everywhere else in the design system. -->
    <div class="row">
      <p class="caption">md, then md compact</p>
      <VSkeletonLoader shape="control" size="md" />
      <VSkeletonLoader shape="control" size="md" compact />
    </div>
  </div>
</template>

<style scoped>
.demo {
  display: grid;
  gap: var(--vectis-space-5);
  inline-size: 18rem;
}
.row {
  display: grid;
  gap: var(--vectis-space-2);
}
.inline {
  display: flex;
  align-items: start;
  gap: var(--vectis-space-3);
}
.caption {
  margin: 0;
  color: var(--vectis-color-text-muted);
  font-size: var(--vectis-text-caption-size);
}
</style>
