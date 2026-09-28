<script setup lang="ts">
import { ref } from 'vue'
import { VInput, VTab, VTabPanel, VTabs } from 'vectis-ui'

const withPanels = ref('overview')
const bare = ref('day')
</script>

<template>
  <div class="demo">
    <VTabs v-model="withPanels" label="Project">
      <VTab value="overview" label="Overview" />
      <VTab value="details" label="Details" />
      <VTab value="history" label="History" />
      <template #panels>
        <VTabPanel value="overview">What the project is for.</VTabPanel>
        <VTabPanel value="details">
          <VInput label="Reference" model-value="INV-2481" />
          <p class="note">Type here, switch tab and come back: the value is still there.</p>
        </VTabPanel>
        <VTabPanel value="history" lazy>Built the first time this tab is opened.</VTabPanel>
      </template>
    </VTabs>

    <VTabs v-model="bare" variant="inset" label="Range">
      <VTab value="day" label="Day" />
      <VTab value="week" label="Week" />
      <VTab value="month" label="Month" />
    </VTabs>
  </div>
</template>

<style scoped>
.demo {
  display: grid;
  gap: var(--vectis-space-6);
}
.note {
  margin: var(--vectis-space-3) 0 0;
  color: var(--vectis-color-text-muted);
  font-size: var(--vectis-text-caption-size);
}
</style>
