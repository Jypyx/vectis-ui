<script setup lang="ts">
import { ref } from 'vue'
import { VTab, VTabPanel, VTabs } from 'vectis-ui'

const tab = ref('overview')
</script>

<template>
  <VTabs v-model="tab" label="Project">
    <VTab value="overview" label="Overview" />
    <VTab value="activity" label="Activity" disabled />
    <VTab value="settings" label="Settings" />
    <template #panels>
      <VTabPanel value="overview">What the project is for.</VTabPanel>
      <VTabPanel value="activity">Never reached.</VTabPanel>
      <VTabPanel value="settings">How it is configured.</VTabPanel>
    </template>
  </VTabs>
</template>
