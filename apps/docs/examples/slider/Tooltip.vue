<script setup lang="ts">
import { ref } from 'vue'
import { VSlider } from 'vectis-ui'

const volume = ref(40)
const budget = ref<[number, number]>([20, 60])
</script>

<template>
  <div class="demo">
    <VSlider v-model="volume" tooltip label="Volume" />

    <VSlider v-model="budget" tooltip range label="Budget" />
  </div>
</template>

<style scoped>
.demo {
  display: grid;
  gap: var(--vectis-space-8);
  inline-size: 20rem;
  padding-block-start: var(--vectis-space-6);
}
</style>
