<script setup lang="ts">
import { ref } from 'vue'
import { VTab, VTabPanel, VTabs } from 'vectis-ui'

const tab = ref('overview')
</script>

<template>
  <VTabs v-model="tab" label="Project">
    <VTab value="overview" label="Overview" />
    <VTab value="activity" label="Activity" />
    <template #panels>
      <VTabPanel value="overview">What the project is for.</VTabPanel>
      <VTabPanel value="activity">What has happened lately.</VTabPanel>
    </template>
  </VTabs>
</template>
