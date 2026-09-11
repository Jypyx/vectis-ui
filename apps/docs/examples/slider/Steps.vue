<script setup lang="ts">
import { ref } from 'vue'
import { VSlider } from 'vectis-ui'

const quantity = ref(50)
const opacity = ref(0.4)
const odd = ref(50)
</script>

<template>
  <div class="demo">
    <!-- The step is the gap between two values the thumb can stop on, and it is also
         what an arrow key moves by. `ticks` marks each of those stops on the track. -->
    <div class="row">
      <p class="caption">step 10, with ticks</p>
      <VSlider v-model="quantity" :step="10" ticks label="Quantity" />
    </div>

    <!-- A fractional step is fine: the value is rounded back onto the step, so a tenth
         does not accumulate the error floating point leaves behind. -->
    <div class="row">
      <p class="caption">step 0.1</p>
      <VSlider v-model="opacity" :min="0" :max="1" :step="0.1" ticks label="Opacity" />
      <p class="value">{{ opacity }}</p>
    </div>

    <!-- When the span does not divide evenly by the step, the last stop falls short of
         the maximum: here 0 to 95 by 10 stops at 90, and the ticks say so rather than
         drawing one where the thumb cannot go. Past fifty steps no tick is drawn at
         all, a comb that dense being unreadable. -->
    <div class="row">
      <p class="caption">0 to 95 by 10, so the last stop is 90</p>
      <VSlider v-model="odd" :max="95" :step="10" ticks label="Coverage" />
      <p class="value">{{ odd }}</p>
    </div>
  </div>
</template>

<style scoped>
.demo {
  display: grid;
  gap: var(--vectis-space-6);
  inline-size: 20rem;
}
.row {
  display: grid;
  gap: var(--vectis-space-2);
}
.caption,
.value {
  margin: 0;
  color: var(--vectis-color-text-muted);
  font-size: var(--vectis-text-caption-size);
}
</style>
