<script setup lang="ts">
import { ref } from 'vue'
import { VSlider } from 'vectis-ui'

const volume = ref(40)
const budget = ref<[number, number]>([20, 60])
const gain = ref(60)
</script>

<template>
  <div class="demo">
    <VSlider v-model="volume" orientation="vertical" label="Volume" />
    <VSlider v-model="budget" orientation="vertical" range tooltip label="Budget" />

    <VSlider v-model="gain" class="tall" orientation="vertical" inputs="ends" label="Gain" />
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
