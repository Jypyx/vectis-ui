<script setup lang="ts">
import { ref } from 'vue'
import { VSlider } from 'vectis-ui'

const small = ref(20)
const medium = ref(40)
const large = ref(60)
</script>

<template>
  <div class="demo">
    <VSlider v-model="small" inputs size="sm" label="Small" />
    <VSlider v-model="medium" inputs label="Medium" />
    <VSlider v-model="large" inputs size="lg" label="Large" />
  </div>
</template>

<style scoped>
.demo {
  display: grid;
  gap: var(--vectis-space-6);
  inline-size: 26rem;
}
</style>
