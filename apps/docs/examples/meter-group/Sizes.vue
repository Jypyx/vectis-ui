<script setup lang="ts">
import { VMeterGroup, type MeterGroupItem, type MeterGroupSize } from 'vectis-ui'

const ITEMS: MeterGroupItem[] = [
  { label: 'Documents', value: 32 },
  { label: 'Photos', value: 24 },
  { label: 'Apps', value: 18 },
  { label: 'System', value: 12, tone: 'neutral' },
]

const SIZES: MeterGroupSize[] = ['xs', 'sm', 'md', 'lg', 'xl']
</script>

<template>
  <div class="column">
    <VMeterGroup
      v-for="size in SIZES"
      :key="size"
      :items="ITEMS"
      :max="128"
      :size="size"
      :label="size"
      hide-legend
    />
  </div>
</template>

<style scoped>
.column {
  display: grid;
  gap: var(--vectis-space-5);
  max-inline-size: 24rem;
}
</style>
