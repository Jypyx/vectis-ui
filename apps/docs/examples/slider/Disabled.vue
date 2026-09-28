<script setup lang="ts">
import { ref } from 'vue'
import { VSlider } from 'vectis-ui'

const volume = ref(30)
const budget = ref<[number, number]>([20, 60])
</script>

<template>
  <div class="demo">
    <VSlider v-model="volume" disabled label="Volume" />
    <VSlider v-model="budget" range :step="10" ticks inputs="ends" disabled label="Budget" />
  </div>
</template>

<style scoped>
.demo {
  display: grid;
  gap: var(--vectis-space-6);
  inline-size: 26rem;
}
</style>
