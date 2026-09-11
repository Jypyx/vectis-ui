<script setup lang="ts">
import { ref } from 'vue'
import { VSlider } from 'vectis-ui'

const volume = ref(40)
const budget = ref<[number, number]>([20, 60])
const gain = ref(60)
</script>

<template>
  <div class="demo">
    <!-- Upright, with the lowest value at the bottom. Everything else is unchanged:
         the ticks, the labels, the bubbles and the number fields all follow the axis,
         and the keyboard is still the browser's. -->
    <VSlider v-model="volume" orientation="vertical" label="Volume" />
    <VSlider v-model="budget" orientation="vertical" range tooltip label="Budget" />

    <!-- A vertical slider has no container to take its length from, so it reads a
         token instead. Override that token to make it longer or shorter. -->
    <VSlider v-model="gain" class="tall" orientation="vertical" inputs label="Gain" />
  </div>
</template>

<style scoped>
.demo {
  display: flex;
  align-items: start;
  gap: var(--vectis-space-8);
}
.tall {
  --vectis-control-size-slider-length: 16rem;
}
</style>
