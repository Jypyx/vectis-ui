<script setup lang="ts">
import { VChip } from 'vectis-ui'

const variants = ['soft', 'solid', 'outline'] as const
const tones = ['neutral', 'accent', 'success', 'warning', 'danger'] as const
</script>

<template>
  <div v-for="tone in tones" :key="tone" class="row">
    <VChip v-for="variant in variants" :key="variant" :variant="variant" :tone="tone">
      {{ tone }} {{ variant }}
    </VChip>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--vectis-space-2);
}
</style>
