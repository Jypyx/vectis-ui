<script setup lang="ts">
import { ref } from 'vue'
import { VButton, VContextMenu, VMenuItem, VTypography } from 'vectis-ui'

const open = ref(false)
</script>

<template>
  <div class="column">
    <VContextMenu v-model:open="open" class="zone" tabindex="0">
      Right-click this area.
      <template #menu>
        <VMenuItem label="Copy" />
        <VMenuItem label="Paste" />
      </template>
    </VContextMenu>

    <div class="row">
      <VButton variant="ghost" tone="neutral" @click="open = true">Open from code</VButton>
      <VTypography variant="body-sm" tone="muted">
        The menu is {{ open ? 'open' : 'closed' }}.
      </VTypography>
    </div>
  </div>
</template>

<style scoped>
.column {
  display: grid;
  gap: var(--vectis-space-3);
}
.row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
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
