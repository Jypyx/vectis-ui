<script setup lang="ts">
import { ref } from 'vue'
import { VTab, VTabPanel, VTabs } from 'vectis-ui'

const manual = ref('overview')
const automatic = ref('overview')
</script>

<template>
  <div class="demo">
    <!-- Manual by default: an arrow key moves the focus and Enter or Space selects.
         That is what a panel costing a request needs, since otherwise every tab passed
         over on the way would fire one. -->
    <div class="row">
      <p class="caption">manual, the default</p>
      <VTabs v-model="manual" label="Project, manual">
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

    <!-- Selecting on arrival is what the ARIA authoring practices recommend when the
         panel appears instantly: the reader hears the panel as they walk the row,
         instead of having to confirm each one. Focus a tab and press an arrow key. -->
    <div class="row">
      <p class="caption">automatic</p>
      <VTabs v-model="automatic" activation="automatic" label="Project, automatic">
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
  </div>
</template>

<style scoped>
.demo {
  display: grid;
  gap: var(--vectis-space-6);
}
.row {
  display: grid;
  gap: var(--vectis-space-2);
}
.caption {
  margin: 0;
  color: var(--vectis-color-text-muted);
  font-size: var(--vectis-text-caption-size);
}
</style>
