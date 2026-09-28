<script setup lang="ts">
import { ref } from 'vue'
import { VTab, VTabs } from 'vectis-ui'

const tab = ref('day')
const wide = ref('overview')
</script>

<template>
  <div class="demo">
    <VTabs v-model="tab" variant="inset" full-width label="Range">
      <VTab value="day" label="Day" />
      <VTab value="week" label="Week" />
      <VTab value="month" label="Month" />
    </VTabs>

    <VTabs v-model="wide" full-width label="Project">
      <VTab value="overview" label="Overview" />
      <VTab value="activity" label="Activity and recent changes" />
      <VTab value="settings" label="Settings" />
    </VTabs>
  </div>
</template>

<style scoped>
.demo {
  display: grid;
  gap: var(--vectis-space-6);
  max-inline-size: 28rem;
}
</style>
