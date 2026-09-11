<script setup lang="ts">
import { ref } from 'vue'
import { VTab, VTabPanel, VTabs } from 'vectis-ui'

const tab = ref('overview')
</script>

<template>
  <!-- A disabled tab is a disabled button: it stops responding, greys out through the
       colour tokens rather than through an opacity, and the arrow keys step over it as
       if it were not in the row. Its panel is simply never shown. -->
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
