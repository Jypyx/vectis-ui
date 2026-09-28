<script setup lang="ts">
import { ref } from 'vue'
import { VSlider } from 'vectis-ui'

const volume = ref(40)
const budget = ref<[number, number]>([20, 60])
</script>

<template>
  <div class="demo">
    <!--
      What is typed is committed when the field is left or on Enter, never as it is typed, or
      the 1 of 15 would be clamped before the 5 was pressed. An out of bounds entry is brought
      back inside, an unreadable one puts the previous value back.
    -->
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
