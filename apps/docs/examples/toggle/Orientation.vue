<script setup lang="ts">
import { ref } from 'vue'
import { VToggle, VToggleItem } from 'vectis-ui'

const joined = ref('week')
const detached = ref('week')
</script>

<template>
  <div class="demo">
    <!-- Down the page instead of across. The joins move to the horizontal edges, the
         corners are carved at the top and the bottom of the column, and the arrow keys
         follow the axis. -->
    <VToggle v-model="joined" orientation="vertical" item-variant="outline" label="Period">
      <VToggleItem value="day" label="Day" />
      <VToggleItem value="week" label="Week" />
      <VToggleItem value="month" label="Month" />
    </VToggle>

    <VToggle
      v-model="detached"
      orientation="vertical"
      detached
      item-variant="outline"
      label="Period, detached"
    >
      <VToggleItem value="day" label="Day" />
      <VToggleItem value="week" label="Week" />
      <VToggleItem value="month" label="Month" />
    </VToggle>
  </div>
</template>

<style scoped>
.demo {
  display: flex;
  align-items: start;
  gap: var(--vectis-space-8);
}
</style>
