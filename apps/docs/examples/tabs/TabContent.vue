<script setup lang="ts">
import { ref } from 'vue'
import { VBadge, VTab, VTabs } from 'vectis-ui'
import { description, notifications, schedule, search } from 'vectis-ui/icons'

const tab = ref('files')
</script>

<template>
  <VTabs v-model="tab" label="Workspace">
    <VTab value="files" label="Files" :icon-start="description" />
    <VTab value="recent" label="Recent" :icon-start="schedule" />

    <VTab value="search" :icon-start="search" aria-label="Search" />

    <VTab value="alerts">
      <VBadge :count="3">Alerts</VBadge>
    </VTab>
    <VTab value="muted" label="Muted" :icon-end="notifications" />
  </VTabs>
</template>
