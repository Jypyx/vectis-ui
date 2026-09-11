<script setup lang="ts">
import { VSkeletonLoader, type SkeletonLoaderAnimation } from 'vectis-ui'

const animations: SkeletonLoaderAnimation[] = ['wave', 'pulse', 'none']
</script>

<template>
  <div class="demo">
    <!-- Both animations lighten the silhouette with the same highlight, derived from
         its own background: the wave sends it across, the pulse raises and lowers it
         in place. Neither fades the silhouette towards the page, which would lighten
         it in one theme and darken it in the other. `none` freezes it, for printing,
         a screenshot, or a parent that is already animating. -->
    <div v-for="animation in animations" :key="animation" class="row">
      <p class="caption">{{ animation }}</p>
      <VSkeletonLoader shape="surface" :animation="animation" />
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
