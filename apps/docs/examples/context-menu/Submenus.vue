<script setup lang="ts">
import { VContextMenu, VMenuItem, VMenuSeparator } from 'vectis-ui'
</script>

<template>
  <VContextMenu class="zone" tabindex="0">
    Right-click this area.
    <template #menu>
      <VMenuItem label="Paste" />
      <VMenuItem label="Sort by">
        <template #submenu>
          <VMenuItem label="Name" selected />
          <VMenuItem label="Date modified" />
          <VMenuItem label="Size" />
        </template>
      </VMenuItem>
      <VMenuSeparator />
      <VMenuItem label="New folder" />
    </template>
  </VContextMenu>
</template>

<style scoped>
.zone {
  display: grid;
  place-items: center;
  min-block-size: 8rem;
  border: 1px dashed var(--vectis-color-border);
  border-radius: var(--vectis-radius-md);
  color: var(--vectis-color-text-muted);
}
</style>
