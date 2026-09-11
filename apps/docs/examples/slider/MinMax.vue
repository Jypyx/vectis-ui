<script setup lang="ts">
import { ref } from 'vue'
import { VSlider } from 'vectis-ui'

const temperature = ref(19)
const rating = ref(3)
</script>

<template>
  <div class="demo">
    <!-- The bounds are 0 and 100 by default, and both may be anything, negatives
         included. -->
    <div class="row">
      <p class="caption">Temperature, -10 to 40</p>
      <VSlider v-model="temperature" :min="-10" :max="40" label="Temperature" />
      <p class="value">{{ temperature }} °C</p>
    </div>

    <!-- A short span is what makes each stop reachable from the keyboard in a few
         presses, and what makes the ticks worth drawing. -->
    <div class="row">
      <p class="caption">Rating, 1 to 5</p>
      <VSlider v-model="rating" :min="1" :max="5" ticks label="Rating" />
      <p class="value">{{ rating }} out of 5</p>
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
