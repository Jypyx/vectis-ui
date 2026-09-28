<script setup lang="ts">
import { ref } from 'vue'
import { VSlider } from 'vectis-ui'

const budget = ref<[number, number]>([20, 60])
</script>

<template>
  <div class="demo">
    <VSlider v-model="budget" range label="Budget" />
    <p class="value">{{ budget[0] }} to {{ budget[1] }}</p>
  </div>
</template>

<style scoped>
.demo {
  display: grid;
  gap: var(--vectis-space-3);
  inline-size: 20rem;
}
.value {
  margin: 0;
  color: var(--vectis-color-text-muted);
  font-size: var(--vectis-text-caption-size);
}
</style>
