<script setup lang="ts">
import { VButton, VButtonGroup } from 'vectis-ui'

const sizes = ['sm', 'md', 'lg'] as const
</script>

<template>
  <div v-for="size in sizes" :key="size" class="row">
    <VButtonGroup :size="size" variant="outline" tone="neutral" :aria-label="size">
      <VButton>Day</VButton>
      <VButton>Week</VButton>
      <VButton>Month</VButton>
    </VButtonGroup>

    <VButtonGroup
      :size="size"
      compact
      variant="outline"
      tone="neutral"
      :aria-label="`${size} compact`"
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
  align-items: center;
  gap: var(--vectis-space-4);
}
</style>
