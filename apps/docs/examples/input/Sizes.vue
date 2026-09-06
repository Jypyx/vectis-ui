<script setup lang="ts">
import { VInput } from 'vectis-ui'
</script>

<template>
  <div class="grid">
    <VInput size="sm" label="Small" placeholder="32px" />
    <VInput size="sm" compact label="Small compact" placeholder="28px" />
    <VInput size="md" label="Medium" placeholder="40px" />
    <VInput size="md" compact label="Medium compact" placeholder="36px" />
    <VInput size="lg" label="Large" placeholder="48px" />
    <VInput size="lg" compact label="Large compact" placeholder="44px" />
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  gap: var(--vectis-space-4);
}
</style>
