<script setup lang="ts">
import { VResizable, VResizablePanel } from 'vectis-ui'
</script>

<template>
  <VResizable class="group" orientation="vertical" grip>
    <VResizablePanel class="pane" label="Editor">Editor</VResizablePanel>
    <VResizablePanel class="pane" label="Terminal" :default-size="35">Terminal</VResizablePanel>
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
