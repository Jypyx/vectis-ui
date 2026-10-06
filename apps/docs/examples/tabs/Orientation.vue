<script setup lang="ts">
import { ref } from 'vue'
import { VTab, VTabPanel, VTabs } from 'vectis-ui'

const flat = ref('overview')
const framed = ref('overview')
</script>

<template>
  <div class="demo">
    <VTabs v-model="flat" orientation="vertical" label="Project">
      <VTab value="overview" label="Overview" />
      <VTab value="activity" label="Activity" />
      <VTab value="settings" label="Settings" />
      <template #panels>
        <VTabPanel value="overview">What the project is for.</VTabPanel>
        <VTabPanel value="activity">What has happened lately.</VTabPanel>
        <VTabPanel value="settings">How it is configured.</VTabPanel>
      </template>
    </VTabs>

    <VTabs v-model="framed" orientation="vertical" variant="outline" label="Project, framed">
      <VTab value="overview" label="Overview" />
      <VTab value="activity" label="Activity" />
      <VTab value="settings" label="Settings" />
      <template #panels>
        <VTabPanel value="overview">What the project is for.</VTabPanel>
        <VTabPanel value="activity">What has happened lately.</VTabPanel>
        <VTabPanel value="settings">How it is configured.</VTabPanel>
      </template>
    </VTabs>
  </div>
</template>

<style scoped>
.demo {
  display: grid;
  gap: var(--vectis-space-6);
}
</style>
