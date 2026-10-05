<script setup lang="ts">
import { VCard } from 'vectis-ui'
</script>

<template>
  <div class="grid">
    <VCard variant="outline" title="Outline">A border on the page surface.</VCard>
    <VCard variant="elevated" title="Elevated">A raised surface with a shadow.</VCard>
    <VCard variant="filled" title="Filled">A muted surface with no border.</VCard>
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  flex: 1;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  gap: var(--vectis-space-4);
}
</style>
