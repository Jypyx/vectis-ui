<script setup lang="ts">
import { ref } from 'vue'
import { VSlider } from 'vectis-ui'

const price = ref<[number, number]>([120, 300])
const discount = ref(0.25)

const euros = { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 } as const
const percent = { style: 'percent' } as const
</script>

<template>
  <div class="demo">
    <VSlider
      v-model="price"
      range
      :max="500"
      :step="10"
      inputs="ends"
      tooltip
      label="Price"
      :format-options="euros"
    />
    <VSlider
      v-model="discount"
      :max="1"
      :step="0.05"
      tooltip
      label="Discount"
      :format-options="percent"
    />
  </div>
</template>

<style scoped>
.demo {
  display: grid;
  gap: var(--vectis-space-6);
  inline-size: 26rem;
  padding-block-start: var(--vectis-space-6);
}
</style>
