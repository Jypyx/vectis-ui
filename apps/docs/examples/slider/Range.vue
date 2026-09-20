<script setup lang="ts">
import { ref } from 'vue'
import { VSlider } from 'vectis-ui'

const budget = ref<[number, number]>([20, 60])
</script>

<template>
  <div class="demo">
    <!-- `range` is what settles the mode, and the model then holds a pair. A thumb taken
         past its sibling pushes it along, so the pair stays ordered whatever the reader
         does and a range closed onto a single value can still be opened again. Each thumb
         is announced as the start or the end of the range rather than as two sliders with
         the same name. -->
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
