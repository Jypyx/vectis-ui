<script setup lang="ts">
import { ref } from 'vue'
import { VTab, VTabPanel, VTabs } from 'vectis-ui'

const flat = ref('overview')
const framed = ref('overview')
</script>

<template>
  <div class="demo">
    <!-- Down the side instead of across: the panels then sit beside the tabs rather
         than under them, and the arrow keys follow the axis. -->
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

    <!-- Framed, the rule between the tabs and the panels moves to the other edge of
         the column: the frame already draws the outer one, and what is missing is the
         boundary between the two halves. -->
    <VTabs v-model="framed" orientation="vertical" variant="outlined" label="Project, framed">
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
