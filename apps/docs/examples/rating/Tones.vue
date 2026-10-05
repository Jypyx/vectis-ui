<script setup lang="ts">
import { VRating } from 'vectis-ui'
</script>

<template>
  <div class="tones">
    <VRating :model-value="4" label="Accent" />
    <VRating :model-value="4" tone="warning" label="Warning" />
    <VRating :model-value="4" tone="neutral" label="Neutral" />
    <VRating :model-value="4" color="#e91e63" label="Custom colour" />
  </div>
</template>

<style scoped>
.tones {
  display: grid;
  gap: var(--vectis-space-4);
}
</style>
