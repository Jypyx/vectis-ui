<script setup lang="ts">
import { ref } from 'vue'
import { VTab, VTabs } from 'vectis-ui'

const tab = ref('day')
const wide = ref('overview')
</script>

<template>
  <div class="demo">
    <!-- The tabs share the whole bar between them, in equal parts whatever their
         labels are worth. It is what turns a short row into a segmented control that
         spans its container. -->
    <VTabs v-model="tab" variant="inset" grow label="Range">
      <VTab value="day" label="Day" />
      <VTab value="week" label="Week" />
      <VTab value="month" label="Month" />
    </VTabs>

    <!-- A label too long for its share is truncated rather than allowed to widen it.
         Growing and scrolling are incompatible by construction: tabs told to fill the
         bar can never overflow it. -->
    <VTabs v-model="wide" grow label="Project">
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
