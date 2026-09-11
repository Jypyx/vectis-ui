<script setup lang="ts">
import { ref } from 'vue'
import { VToggle, VToggleItem } from 'vectis-ui'

const joined = ref('week')
const detached = ref('week')
</script>

<template>
  <div class="demo">
    <!-- Joined by default: the items melt into one segmented control, which is what
         says they are one choice. -->
    <div class="row">
      <p class="caption">joined, the default</p>
      <VToggle v-model="joined" item-variant="outline" label="Period, joined">
        <VToggleItem value="day" label="Day" />
        <VToggleItem value="week" label="Week" />
        <VToggleItem value="month" label="Month" />
      </VToggle>
    </div>

    <!-- Detached leaves them as separate buttons with a gap, which suits a row of
         filters that happen to share a model more than it suits one exclusive choice. -->
    <div class="row">
      <p class="caption">detached</p>
      <VToggle v-model="detached" detached item-variant="outline" label="Period, detached">
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
