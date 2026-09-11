<script setup lang="ts">
import { VButton, VMenu, VMenuGroup, VMenuItem, VMenuSeparator } from 'vectis-ui'
import { close, description, image, schedule, search } from 'vectis-ui/icons'
</script>

<template>
  <VMenu width="16rem">
    <template #trigger="{ triggerProps }">
      <VButton v-bind="triggerProps" variant="outline" tone="neutral">Workspace</VButton>
    </template>

    <!-- A group is a named block: its label is a heading and not a command, so nothing
         happens on click and the arrows never stop on it. -->
    <VMenuGroup label="Create">
      <VMenuItem label="Document" :icon-start="description" />
      <VMenuItem label="Image board" :icon-start="image" />
    </VMenuGroup>

    <VMenuSeparator />

    <VMenuGroup label="Find">
      <VMenuItem label="Search everything" :icon-start="search" />
      <VMenuItem label="Recently opened" :icon-start="schedule" />
    </VMenuGroup>

    <VMenuSeparator />

    <VMenuItem label="Leave this workspace" :icon-start="close" tone="danger" />
  </VMenu>
</template>
