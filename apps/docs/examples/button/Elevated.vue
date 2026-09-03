<script setup lang="ts">
import { VButton } from 'vectis-ui'

const variants = ['solid', 'soft', 'outline', 'ghost'] as const
</script>

<template>
  <div class="row">
    <VButton v-for="variant in variants" :key="variant" :variant="variant">
      {{ variant }}
    </VButton>
  </div>

  <div class="row">
    <VButton v-for="variant in variants" :key="variant" :variant="variant" elevated>
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
