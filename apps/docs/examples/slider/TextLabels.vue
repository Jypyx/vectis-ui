<script setup lang="ts">
import { ref } from 'vue'
import { VSlider } from 'vectis-ui'

const size = ref(2)
</script>

<template>
  <div class="demo">
    <!-- One label per step, in order. They name the stops on the track, and they also
         become what a screen reader announces in place of the raw number: this slider
         says "M" and not "2". Giving labels turns the ticks on by itself, a label with
         no mark to sit under having nothing to point at. -->
    <VSlider v-model="size" :min="0" :max="4" :labels="['XS', 'S', 'M', 'L', 'XL']" label="Size" />
  </div>
</template>

<style scoped>
.demo {
  inline-size: 20rem;
  padding-inline: var(--vectis-space-4);
}
</style>
