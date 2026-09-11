<script setup lang="ts">
import { VButton, VMenu, VMenuItem } from 'vectis-ui'
</script>

<template>
  <!-- Left alone, the panel sits between a floor and a ceiling of its own. -->
  <VMenu>
    <template #trigger="{ triggerProps }">
      <VButton v-bind="triggerProps" variant="outline" tone="neutral">Default</VButton>
    </template>
    <VMenuItem label="10" />
    <VMenuItem label="25" />
    <VMenuItem label="50" />
  </VMenu>

  <!-- Any CSS length or keyword. `max-content` shrinks the panel to its longest row. -->
  <VMenu width="max-content">
    <template #trigger="{ triggerProps }">
      <VButton v-bind="triggerProps" variant="outline" tone="neutral">max-content</VButton>
    </template>
    <VMenuItem label="10" />
    <VMenuItem label="25" />
    <VMenuItem label="50" />
  </VMenu>

  <VMenu width="22rem">
    <template #trigger="{ triggerProps }">
      <VButton v-bind="triggerProps" variant="outline" tone="neutral">22rem</VButton>
    </template>
    <VMenuItem label="Rename" />
    <VMenuItem label="Duplicate" />
  </VMenu>

  <!-- The panel can no longer be narrower than the button that opened it, while
       staying free to grow for a longer row. -->
  <VMenu match-trigger>
    <template #trigger="{ triggerProps }">
      <VButton v-bind="triggerProps" variant="outline" tone="neutral">
        Match this wide trigger
      </VButton>
    </template>
    <VMenuItem label="A to Z" />
    <VMenuItem label="Z to A" />
  </VMenu>
</template>
