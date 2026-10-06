<script setup lang="ts">
import { VResizable, VResizablePanel } from 'vectis-ui'
</script>

<template>
  <VResizable class="group">
    <VResizablePanel class="pane" label="Navigation" :default-size="30">Navigation</VResizablePanel>
    <VResizablePanel class="pane">Content</VResizablePanel>
  </VResizable>
</template>

<style scoped>
.group {
  block-size: 14rem;
  border: 1px solid var(--vectis-color-border);
  border-radius: var(--vectis-radius-surface);
}

.pane {
  padding: var(--vectis-space-4);
}
</style>
