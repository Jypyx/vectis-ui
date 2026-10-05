<script setup lang="ts">
import { VButton, VCard } from 'vectis-ui'
</script>

<template>
  <VCard title="Coastal trail" subtitle="12 km · 4 hours" class="card">
    A cliff path above the sea, with two beaches to stop at and a lighthouse at the end.
    <template #footer>
      <VButton size="sm">Book a guide</VButton>
    </template>
  </VCard>
</template>

<style scoped>
.card {
  max-inline-size: 22rem;
}
</style>
