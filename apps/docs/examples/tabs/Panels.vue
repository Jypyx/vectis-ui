<script setup lang="ts">
import { ref } from 'vue'
import { VInput, VTab, VTabPanel, VTabs } from 'vectis-ui'

const withPanels = ref('overview')
const bare = ref('day')
</script>

<template>
  <div class="demo">
    <!-- A hidden panel is hidden and not destroyed: what it holds keeps its state, and
         a field inside it is still submitted with the form. `lazy` is the exception,
         and only for the first showing: it holds the content back until the panel is
         opened once, then keeps it like the others. -->
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

    <!-- Leave the slot out and no panel area is rendered at all: the same component is
         then a plain bar, or a segmented control switching a view that lives
         somewhere else on the page. -->
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
