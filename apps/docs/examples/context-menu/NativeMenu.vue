<script setup lang="ts">
import { ref } from 'vue'
import { VContextMenu, VMenuItem, VSwitch } from 'vectis-ui'

const disabled = ref(false)
</script>

<template>
  <div class="column">
    <VSwitch v-model="disabled" label="Use the browser's menu" />
    <VContextMenu :disabled="disabled" class="zone" tabindex="0">
      Right-click this area, with or without Shift.
      <template #menu>
        <VMenuItem label="Copy" />
        <VMenuItem label="Paste" />
      </template>
    </VContextMenu>
  </div>
</template>

<style scoped>
.column {
  display: grid;
  gap: var(--vectis-space-3);
}
.zone {
  display: grid;
  place-items: center;
  min-block-size: 8rem;
  border: 1px dashed var(--vectis-color-border);
  border-radius: var(--vectis-radius-md);
  color: var(--vectis-color-text-muted);
}
</style>
