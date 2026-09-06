<script setup lang="ts">
import { VChip } from 'vectis-ui'

const variants = ['soft', 'solid', 'outline'] as const
const shapes = ['chip', 'pill'] as const
</script>

<template>
  <div v-for="shape in shapes" :key="shape" class="row">
    <VChip
      v-for="variant in variants"
      :key="variant"
      :shape="shape"
      :variant="variant"
      tone="accent"
    >
      {{ shape }} {{ variant }}
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
