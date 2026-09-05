<script setup lang="ts">
import { VButton, VButtonGroup } from 'vectis-ui'

const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
</script>

<template>
  <div class="column">
    <VButtonGroup
      v-for="size in sizes"
      :key="size"
      :size="size"
      variant="outline"
      tone="neutral"
      :aria-label="`Range, ${size}`"
    >
      <VButton>Day</VButton>
      <VButton>Week</VButton>
      <VButton>Month</VButton>
    </VButtonGroup>
  </div>
</template>

<style scoped>
.column {
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: var(--vectis-space-3);
}
</style>
