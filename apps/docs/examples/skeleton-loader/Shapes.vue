<script setup lang="ts">
import { VSkeletonLoader, type SkeletonLoaderShape } from 'vectis-ui'

const shapes: SkeletonLoaderShape[] = ['text', 'control', 'pill', 'circle', 'surface']
</script>

<template>
  <div class="demo">
    <!-- Each shape sets a corner radius and a way of being sized: text follows the
         typography around it, control, pill and circle read the control scale, and a
         surface has a height of its own. -->
    <div v-for="shape in shapes" :key="shape" class="row">
      <p class="caption">{{ shape }}</p>
      <VSkeletonLoader :shape="shape" />
    </div>

    <!-- A number is read as pixels, anything else as a CSS length of your own. Left
         out, the silhouette takes all the width available, which is why a container
         has to give it one. -->
    <div class="row">
      <p class="caption">width</p>
      <VSkeletonLoader shape="control" :width="180" />
      <VSkeletonLoader shape="control" width="60%" />
    </div>

    <!-- `height` wins over the shape and the size, for a silhouette no shape
         describes. -->
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
