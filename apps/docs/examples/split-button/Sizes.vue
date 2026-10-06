<script setup lang="ts">
import { VMenuItem, VSplitButton } from 'vectis-ui'
</script>

<template>
  <div class="row">
    <VSplitButton
      v-for="size in ['xs', 'sm', 'md', 'lg', 'xl'] as const"
      :key="size"
      :size="size"
      label="Save"
    >
      <VMenuItem label="Save as draft" />
    </VSplitButton>
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
