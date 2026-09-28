<script setup lang="ts">
import { VSkeletonLoader } from 'vectis-ui'
</script>

<template>
  <div class="demo">
    <!-- Announce only one skeleton per loading region. -->
    <VSkeletonLoader shape="control" size="sm" label="Loading the results" />

    <VSkeletonLoader v-for="n in 7" :key="n" shape="control" size="sm" />
  </div>
</template>

<style scoped>
.demo {
  display: grid;
  gap: var(--vectis-space-2);
  inline-size: 20rem;
}
</style>
