<script setup lang="ts">
import { VCard } from 'vectis-ui'
</script>

<template>
  <VCard title="Forest loop" subtitle="6 km · 2 hours" class="card">
    <template #media>
      <div class="cover" />
    </template>
    A shaded walk under old oaks, suitable for children.
  </VCard>
</template>

<style scoped>
.card {
  max-inline-size: 22rem;
}

.cover {
  aspect-ratio: 16 / 9;
  background: linear-gradient(135deg, oklch(0.55 0.12 150), oklch(0.35 0.08 170));
}
</style>
