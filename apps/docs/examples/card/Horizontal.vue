<script setup lang="ts">
import { VButton, VCard } from 'vectis-ui'
</script>

<template>
  <VCard orientation="horizontal" title="Coastal trail" subtitle="12 km · 4 hours" class="card">
    <template #media>
      <div class="cover" />
    </template>
    A cliff path above the sea, with two beaches to stop at and a lighthouse at the end.
    <template #footer>
      <VButton size="sm">Book a guide</VButton>
    </template>
  </VCard>
</template>

<style scoped>
.card {
  flex: 1;
}

.cover {
  min-block-size: 8rem;
  background: linear-gradient(135deg, oklch(0.6 0.12 230), oklch(0.4 0.1 250));
}
</style>
