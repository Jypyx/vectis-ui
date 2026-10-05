<script setup lang="ts">
import { VEmptyState } from 'vectis-ui'
import type { EmptyStateSize } from 'vectis-ui'
import { inbox } from 'vectis-ui/icons'

const SIZES: { size: EmptyStateSize; title: string }[] = [
  { size: 'sm', title: 'Nothing in this folder' },
  { size: 'md', title: 'No messages' },
  { size: 'lg', title: 'Your workspace is empty' },
]
</script>

<template>
  <div class="stack">
    <VEmptyState
      v-for="item in SIZES"
      :key="item.size"
      class="frame"
      :size="item.size"
      :icon="inbox"
      :title="item.title"
      description="The scale follows the space it fills."
    />
  </div>
</template>

<style scoped>
.stack {
  display: grid;
  gap: var(--vectis-space-4);
}

.frame {
  border: 1px dashed var(--vectis-color-border);
  border-radius: var(--vectis-radius-surface);
}
</style>
