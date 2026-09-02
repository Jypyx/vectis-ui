<script setup lang="ts">
import { VButton, VMenu, VMenuItem, VMenuSeparator } from 'vectis-ui'
</script>

<template>
  <VMenu>
    <template #trigger="{ triggerProps }">
      <VButton variant="outline" tone="neutral" v-bind="triggerProps">Actions</VButton>
    </template>
    <VMenuItem label="Rename" />
    <VMenuItem label="Duplicate" />
    <VMenuSeparator />
    <VMenuItem label="Delete" danger />
  </VMenu>
</template>
