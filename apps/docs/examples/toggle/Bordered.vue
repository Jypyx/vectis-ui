<script setup lang="ts">
import { ref } from 'vue'
import { VToggle, VToggleItem } from 'vectis-ui'

const seamless = ref('week')
const bordered = ref('week')
</script>

<template>
  <div class="demo">
    <div class="row">
      <p class="caption">without the seams, the default</p>
      <VToggle v-model="seamless" item-variant="outline" label="Period, seamless">
        <VToggleItem value="day" label="Day" />
        <VToggleItem value="week" label="Week" />
        <VToggleItem value="month" label="Month" />
      </VToggle>
    </div>

    <div class="row">
      <p class="caption">bordered</p>
      <VToggle v-model="bordered" bordered item-variant="outline" label="Period, bordered">
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
