<script setup lang="ts">
import { VSkeletonLoader, type SkeletonLoaderShape } from 'vectis-ui'

const shapes: SkeletonLoaderShape[] = ['text', 'control', 'pill', 'circle', 'surface']
</script>

<template>
  <div class="demo">
    <div v-for="shape in shapes" :key="shape" class="row">
      <p class="caption">{{ shape }}</p>
      <VSkeletonLoader :shape="shape" />
    </div>

    <div class="row">
      <p class="caption">width</p>
      <VSkeletonLoader shape="control" :width="180" />
      <VSkeletonLoader shape="control" width="60%" />
    </div>

    <div class="row">
      <p class="caption">height</p>
      <VSkeletonLoader shape="surface" :height="48" />
    </div>
  </div>
</template>

<style scoped>
.demo {
  display: grid;
  gap: var(--vectis-space-5);
  inline-size: 22rem;
}
.row {
  display: grid;
  gap: var(--vectis-space-2);
}
.caption {
  margin: 0;
  color: var(--vectis-color-text-muted);
  font-size: var(--vectis-text-caption-size);
}
</style>
