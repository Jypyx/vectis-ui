<script setup lang="ts">
import { ref } from 'vue'
import { VSlider } from 'vectis-ui'

const quantity = ref(50)
const opacity = ref(0.4)
const odd = ref(50)
</script>

<template>
  <div class="demo">
    <div class="row">
      <p class="caption">step 10, with ticks</p>
      <VSlider v-model="quantity" :step="10" ticks label="Quantity" />
    </div>

    <div class="row">
      <p class="caption">step 0.1</p>
      <VSlider v-model="opacity" :min="0" :max="1" :step="0.1" ticks label="Opacity" />
      <p class="value">{{ opacity }}</p>
    </div>

    <!-- This step ends at 90, below max 95. More than fifty steps hides the ticks. -->
    <div class="row">
      <p class="caption">0 to 95 by 10, so the last stop is 90</p>
      <VSlider v-model="odd" :max="95" :step="10" ticks label="Coverage" />
      <p class="value">{{ odd }}</p>
    </div>
  </div>
</template>

<style scoped>
.demo {
  display: grid;
  gap: var(--vectis-space-6);
  inline-size: 20rem;
}
.row {
  display: grid;
  gap: var(--vectis-space-2);
}
.caption,
.value {
  margin: 0;
  color: var(--vectis-color-text-muted);
  font-size: var(--vectis-text-caption-size);
}
</style>
