<script setup lang="ts">
import { VRating } from 'vectis-ui'
</script>

<template>
  <div class="sizes">
    <VRating :model-value="4" size="sm" label="Small" />
    <VRating :model-value="4" label="Medium" />
    <VRating :model-value="4" size="lg" label="Large" />
  </div>
</template>

<style scoped>
.sizes {
  display: grid;
  gap: var(--vectis-space-4);
}
</style>
