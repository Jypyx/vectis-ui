<script setup lang="ts">
import { ref } from 'vue'
import { VNumberInput } from 'vectis-ui'

const price = ref<number | null>(1249.9)
const discount = ref<number | null>(0.15)
const distance = ref<number | null>(42.195)
</script>

<template>
  <div class="stack">
    <VNumberInput
      v-model="price"
      label="Price"
      :min="0"
      :step="10"
      :format-options="{ style: 'currency', currency: 'EUR' }"
    />
    <VNumberInput
      v-model="discount"
      label="Discount"
      :min="0"
      :max="1"
      :step="0.05"
      :format-options="{ style: 'percent' }"
    />
    <VNumberInput
      v-model="distance"
      label="Distance"
      controls="none"
      :format-options="{ style: 'unit', unit: 'kilometer', maximumFractionDigits: 3 }"
    />
  </div>
</template>

<style scoped>
.stack {
  display: grid;
  gap: var(--vectis-space-4);
  max-inline-size: 15rem;
}
</style>
