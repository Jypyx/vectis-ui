<script setup lang="ts">
import { ref } from 'vue'
import { VSlider } from 'vectis-ui'

const volume = ref(30)
const budget = ref<[number, number]>([20, 60])
</script>

<template>
  <div class="demo">
    <!-- The only state the slider has. It greys the track, the thumb and the ticks
         through the colour tokens rather than through an opacity, takes the thumbs out
         of the tab order, and disables the number fields along with them: there is no
         half-usable slider whose value can still be typed. -->
    <VSlider v-model="volume" disabled label="Volume" />
    <VSlider v-model="budget" range :step="10" ticks inputs disabled label="Budget" />
  </div>
</template>

<style scoped>
.demo {
  display: grid;
  gap: var(--vectis-space-6);
  inline-size: 26rem;
}
</style>
