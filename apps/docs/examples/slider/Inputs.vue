<script setup lang="ts">
import { ref } from 'vue'
import { VSlider } from 'vectis-ui'

const volume = ref(40)
const budget = ref<[number, number]>([20, 60])
</script>

<template>
  <div class="demo">
    <!-- Commit on blur or Enter to avoid clamping partially typed numbers. -->
    <VSlider v-model="volume" inputs="ends" label="Volume" />
    <VSlider v-model="budget" inputs="ends" range label="Budget" />
  </div>
</template>

<style scoped>
.demo {
  display: grid;
  gap: var(--vectis-space-6);
  inline-size: 26rem;
}
</style>
