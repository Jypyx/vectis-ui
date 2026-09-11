<script setup lang="ts">
import { ref } from 'vue'
import { VToggle, VToggleItem } from 'vectis-ui'

const segmented = ref('week')
const seamless = ref('week')
</script>

<template>
  <div class="demo">
    <!-- Joined, a line is drawn between two items: the row reads as a set of segments,
         each one of them a target. -->
    <div class="row">
      <p class="caption">with the seams</p>
      <VToggle v-model="segmented" item-variant="outline" label="Period, segmented">
        <VToggleItem value="day" label="Day" />
        <VToggleItem value="week" label="Week" />
        <VToggleItem value="month" label="Month" />
      </VToggle>
    </div>

    <!-- Seamless takes those lines out, and the row reads as one frame holding a
         highlight that moves. It has no effect under `detached`, where the items are
         separate buttons already. -->
    <div class="row">
      <p class="caption">seamless</p>
      <VToggle v-model="seamless" seamless item-variant="outline" label="Period, seamless">
        <VToggleItem value="day" label="Day" />
        <VToggleItem value="week" label="Week" />
        <VToggleItem value="month" label="Month" />
      </VToggle>
    </div>
  </div>
</template>

<style scoped>
.demo {
  display: grid;
  justify-items: start;
  gap: var(--vectis-space-5);
}
.row {
  display: grid;
  justify-items: start;
  gap: var(--vectis-space-2);
}
.caption {
  margin: 0;
  color: var(--vectis-color-text-muted);
  font-size: var(--vectis-text-caption-size);
}
</style>
