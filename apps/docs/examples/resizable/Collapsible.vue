<script setup lang="ts">
import { ref } from 'vue'
import { VButton, VResizable, VResizablePanel } from 'vectis-ui'

const collapsed = ref(false)
</script>

<template>
  <VResizable class="group">
    <VResizablePanel
      v-model:collapsed="collapsed"
      class="pane"
      :class="{ rail: collapsed }"
      label="Sidebar"
      :default-size="30"
      :min-size="20"
      collapsible
      collapsed-size="3.5rem"
    >
      <VButton
        size="sm"
        variant="ghost"
        :aria-label="collapsed ? 'Expand the sidebar' : 'Collapse the sidebar'"
        @click="collapsed = !collapsed"
      >
        {{ collapsed ? '»' : '«' }}
      </VButton>
      <p v-if="!collapsed">Drag the line to the edge, or press Enter on it.</p>
    </VResizablePanel>
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

.rail {
  padding: var(--vectis-space-2);
}
</style>
