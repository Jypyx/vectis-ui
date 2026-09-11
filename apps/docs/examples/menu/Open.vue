<script setup lang="ts">
import { ref } from 'vue'
import { VButton, VMenu, VMenuItem, VTypography } from 'vectis-ui'

const open = ref(false)
</script>

<template>
  <div class="column">
    <div class="row">
      <VMenu v-model:open="open">
        <template #trigger="{ triggerProps }">
          <VButton v-bind="triggerProps" variant="outline" tone="neutral">Actions</VButton>
        </template>
        <VMenuItem label="Rename" />
        <VMenuItem label="Duplicate" />
        <VMenuItem label="Move to archive" />
      </VMenu>

      <VButton variant="ghost" tone="neutral" @click="open = true">Open from code</VButton>
      <VButton variant="ghost" tone="neutral" @click="open = false">Close from code</VButton>
    </div>

    <!-- The model is fed BY the panel, so every dismissal writes back to it: a click
         outside, Escape, or choosing a command. Nothing has to be reset by hand. -->
    <VTypography variant="body-sm" tone="muted">
      The menu is {{ open ? 'open' : 'closed' }}.
    </VTypography>
  </div>
</template>

<style scoped>
.column {
  display: grid;
  justify-items: start;
  gap: var(--vectis-space-3);
}
.row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--vectis-space-3);
}
</style>
