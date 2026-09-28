<script setup lang="ts">
import { ref } from 'vue'
import { VSlider } from 'vectis-ui'

const volume = ref(40)
const budget = ref<[number, number]>([20, 60])
</script>

<template>
  <div class="demo">
    <!--
      The bubble shows the value above the thumb while it is being dragged or while it holds
      keyboard focus, which a track with no numbers on it needs. It is decorative: the value is
      already in the slider's own announcement, so nothing is said twice.
    -->
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
