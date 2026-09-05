<script setup lang="ts">
import { VButton, VButtonGroup, VIconButton } from 'vectis-ui'
import {
  arrow_downward as arrowDownward,
  arrow_upward as arrowUpward,
  description,
  image,
  swap_vert as swapVert,
  table_chart as tableChart,
} from 'vectis-ui/icons'
</script>

<template>
  <VButtonGroup variant="outline" tone="neutral" aria-label="View">
    <VButton :icon-start="description">List</VButton>
    <VButton :icon-start="tableChart">Table</VButton>
    <VButton :icon-start="image">Gallery</VButton>
  </VButtonGroup>

  <VButtonGroup role="toolbar" variant="outline" tone="neutral" aria-label="Sort">
    <VIconButton :icon="arrowUpward" label="Ascending" />
    <VIconButton :icon="swapVert" label="Unsorted" />
    <VIconButton :icon="arrowDownward" label="Descending" />
  </VButtonGroup>
</template>
