<script setup lang="ts">
import { VIconButton } from 'vectis-ui'
import { search } from 'vectis-ui/icons'

const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
</script>

<template>
  <div class="row">
    <VIconButton
      v-for="size in sizes"
      :key="size"
      :icon="search"
      :size="size"
      variant="outline"
      :label="`Search, ${size}`"
    />
  </div>

  <div class="row">
    <VIconButton
      v-for="size in sizes"
      :key="size"
      :icon="search"
      :size="size"
      compact
      variant="outline"
      :label="`Search, ${size} compact`"
    />
  </div>
</template>

<style scoped>
.row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--vectis-space-3);
}
</style>
