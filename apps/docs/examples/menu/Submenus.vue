<script setup lang="ts">
import { VButton, VMenu, VMenuItem, VMenuSeparator } from 'vectis-ui'
import { close, description, folder_zip as folderZip, image } from 'vectis-ui/icons'
</script>

<template>
  <VMenu width="15rem">
    <template #trigger="{ triggerProps }">
      <VButton v-bind="triggerProps" variant="outline" tone="neutral">Document</VButton>
    </template>

    <VMenuItem label="Open" :icon-start="description" />

    <!-- A row given a `#submenu` slot opens a panel of its own. Hovering it opens the
         panel after a short delay; from the keyboard the right arrow enters it, and
         the left arrow or Escape goes back one level. -->
    <VMenuItem label="Export as" :icon-start="image">
      <template #submenu>
        <VMenuItem label="PDF" />
        <VMenuItem label="PNG" />
        <VMenuItem label="SVG" />
      </template>
    </VMenuItem>

    <VMenuItem label="Move to" :icon-start="folderZip">
      <template #submenu>
        <VMenuItem label="Drafts" />
        <VMenuItem label="Published" />
        <VMenuSeparator />
        <VMenuItem label="Archive" />
      </template>
    </VMenuItem>

    <VMenuSeparator />

    <VMenuItem label="Delete" :icon-start="close" tone="danger" />
  </VMenu>
</template>
