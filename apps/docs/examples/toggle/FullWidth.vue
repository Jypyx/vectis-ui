<script setup lang="ts">
import { ref } from 'vue'
import { VToggle, VToggleItem } from 'vectis-ui'

const natural = ref('week')
const filling = ref('week')
</script>

<template>
  <div class="column">
    <VToggle v-model="natural" item-variant="outline" label="Period, as wide as its labels">
      <VToggleItem value="day" label="Day" />
      <VToggleItem value="week" label="Week" />
      <VToggleItem value="month" label="Month" />
    </VToggle>

    <VToggle v-model="filling" full-width item-variant="outline" label="Period, filling the column">
      <VToggleItem value="day" label="Day" />
      <VToggleItem value="week" label="Week" />
      <VToggleItem value="month" label="Month" />
    </VToggle>
  </div>
</template>

<style scoped>
.column {
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: var(--vectis-space-3);
  inline-size: 320px;
}
</style>
