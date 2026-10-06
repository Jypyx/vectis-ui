<script setup lang="ts">
import { VResizable, VResizablePanel } from 'vectis-ui'
</script>

<template>
  <VResizable class="group">
    <VResizablePanel class="pane" label="Files" :default-size="25" min-size="10rem" max-size="40%">
      Files: 10rem to 40%
    </VResizablePanel>
    <VResizablePanel class="pane" label="Editor" :min-size="20"
      >Editor: at least 20%</VResizablePanel
    >
    <VResizablePanel class="pane" label="Outline" :default-size="25" :min-size="15">
      Outline: at least 15%
    </VResizablePanel>
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
