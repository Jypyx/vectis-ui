<script setup lang="ts">
import { VButton } from 'vectis-ui'

const variants = ['solid', 'soft', 'outline', 'ghost'] as const
</script>

<template>
  <div class="row">
    <VButton v-for="variant in variants" :key="variant" :variant="variant" disabled>
      {{ variant }}
    </VButton>
  </div>

  <div class="row">
    <VButton loading>Saving</VButton>
    <VButton variant="outline" tone="neutral" loading>Checking</VButton>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--vectis-space-3);
}
</style>
