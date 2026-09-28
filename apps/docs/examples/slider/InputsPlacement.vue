<script setup lang="ts">
import { ref } from 'vue'
import { VSlider } from 'vectis-ui'

const budget = ref<[number, number]>([20, 60])
const volume = ref(40)
const gain = ref<[number, number]>([30, 70])
</script>

<template>
  <div class="demo">
    <!-- A row of its own above or below the track, which then takes the full width.
         Each field sits at the edge of the value it holds. -->
    <VSlider v-model="budget" inputs="top" range label="Budget" />
    <VSlider v-model="volume" inputs="bottom" label="Volume" />

    <VSlider v-model="gain" orientation="vertical" inputs="top" range label="Gain" />
  </div>
</template>

<style scoped>
.demo {
  display: grid;
  gap: var(--vectis-space-6);
  inline-size: 26rem;
}
</style>
