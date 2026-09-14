<script setup lang="ts">
import { ref } from 'vue'
import { VSlider } from 'vectis-ui'

const volume = ref(40)
const budget = ref<[number, number]>([20, 60])
</script>

<template>
  <div class="demo">
    <!-- The thumbs stay focusable and announced, but neither a key nor the pointer
         moves them, and the number fields turn read-only with them. -->
    <VSlider v-model="volume" readonly label="Volume" />
    <VSlider v-model="budget" range inputs readonly label="Budget" />
  </div>
</template>

<style scoped>
.demo {
  display: grid;
  gap: var(--vectis-space-6);
  inline-size: 26rem;
}
</style>
