<script setup lang="ts">
import { VButton, VButtonGroup } from 'vectis-ui'

const variants = ['solid', 'soft', 'outline', 'ghost'] as const
const tones = ['accent', 'neutral', 'danger'] as const
</script>

<template>
  <div v-for="tone in tones" :key="tone" class="row">
    <VButtonGroup
      v-for="variant in variants"
      :key="variant"
      :variant="variant"
      :tone="tone"
      :aria-label="`${variant} ${tone}`"
    >
      <VButton>Day</VButton>
      <VButton>Week</VButton>
      <VButton>Month</VButton>
    </VButtonGroup>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--vectis-space-4);
}
</style>
