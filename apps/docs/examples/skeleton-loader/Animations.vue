<script setup lang="ts">
import { VSkeletonLoader, type SkeletonLoaderAnimation } from 'vectis-ui'

const animations: SkeletonLoaderAnimation[] = ['wave', 'pulse', 'none']
</script>

<template>
  <div class="demo">
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
