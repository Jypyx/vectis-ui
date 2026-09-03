<script setup lang="ts">
import { VButton } from 'vectis-ui'

const variants = ['solid', 'soft', 'outline', 'ghost'] as const
const tones = ['accent', 'neutral', 'danger'] as const
</script>

<template>
  <div v-for="tone in tones" :key="tone" class="row">
    <VButton v-for="variant in variants" :key="variant" :variant="variant" :tone="tone">
      {{ variant }}
    </VButton>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--vectis-space-3);
}
</style>
