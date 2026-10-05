<script setup lang="ts">
import { VCard } from 'vectis-ui'
</script>

<template>
  <div class="grid">
    <VCard size="sm" title="Small" subtitle="Dense lists">Less padding.</VCard>
    <VCard size="md" title="Medium" subtitle="The default">Standard padding.</VCard>
    <VCard size="lg" title="Large" subtitle="Featured content">More padding.</VCard>
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  flex: 1;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  align-items: start;
  gap: var(--vectis-space-4);
}
</style>
