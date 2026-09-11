<script setup lang="ts">
import { ref } from 'vue'
import { VBadge, VTab, VTabs } from 'vectis-ui'
import { description, notifications, schedule, search } from 'vectis-ui/icons'

const tab = ref('files')
</script>

<template>
  <VTabs v-model="tab" label="Workspace">
    <!-- A label, an icon at either end, or both. -->
    <VTab value="files" label="Files" :icon-start="description" />
    <VTab value="recent" label="Recent" :icon-start="schedule" />

    <!-- An icon on its own still has to say what it is: with no label there is no
         accessible name, so one is given here. -->
    <VTab value="search" :icon-start="search" aria-label="Search" />

    <!-- The default slot replaces the label, for anything a string cannot hold. -->
    <VTab value="alerts">
      <VBadge :count="3">Alerts</VBadge>
    </VTab>
    <VTab value="muted" label="Muted" :icon-end="notifications" />
  </VTabs>
</template>
