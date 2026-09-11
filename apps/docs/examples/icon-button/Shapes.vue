<script setup lang="ts">
import { VButtonGroup, VIconButton } from 'vectis-ui'
import {
  arrow_downward as arrowDownward,
  arrow_upward as arrowUpward,
  close,
  swap_vert as swapVert,
} from 'vectis-ui/icons'

const sizes = ['sm', 'md', 'lg'] as const
</script>

<template>
  <div class="stack">
    <div class="row">
      <VIconButton
        v-for="size in sizes"
        :key="size"
        :icon="close"
        :size="size"
        variant="outline"
        :label="`Close, ${size}`"
      />
      <VIconButton
        v-for="size in sizes"
        :key="`${size}-circular`"
        :icon="close"
        :size="size"
        shape="circular"
        variant="outline"
        :label="`Close, circular ${size}`"
      />
    </div>

    <!-- Inside a group the corner rules are the row's, and they win: a circular segment
         keeps square seams so the row still reads as one object. Intended, and the
         reason a shape is worth choosing before grouping rather than after. -->
    <VButtonGroup variant="outline">
      <VIconButton :icon="arrowUpward" shape="circular" label="Sort ascending" />
      <VIconButton :icon="swapVert" shape="circular" label="Unsorted" />
      <VIconButton :icon="arrowDownward" shape="circular" label="Sort descending" />
    </VButtonGroup>
  </div>
</template>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  gap: var(--vectis-space-5);
  align-items: start;
}
.row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--vectis-space-3);
}
</style>
