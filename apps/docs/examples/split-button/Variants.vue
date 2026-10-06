<script setup lang="ts">
import { VMenuItem, VSplitButton } from 'vectis-ui'
</script>

<template>
  <div class="row">
    <VSplitButton label="Publish">
      <VMenuItem label="Schedule" />
    </VSplitButton>
    <VSplitButton label="Publish" variant="soft">
      <VMenuItem label="Schedule" />
    </VSplitButton>
    <VSplitButton label="Export" variant="outline" tone="neutral">
      <VMenuItem label="Export as CSV" />
    </VSplitButton>
    <VSplitButton label="Delete" variant="ghost" tone="danger">
      <VMenuItem label="Delete all versions" tone="danger" />
    </VSplitButton>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--vectis-space-4);
}
</style>
