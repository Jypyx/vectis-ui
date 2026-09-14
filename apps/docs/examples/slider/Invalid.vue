<script setup lang="ts">
import { ref } from 'vue'
import { VSlider } from 'vectis-ui'

const quota = ref<[number, number]>([30, 90])
</script>

<template>
  <div class="demo">
    <VSlider v-model="quota" range inputs invalid label="Quota" />
  </div>
</template>

<style scoped>
.demo {
  display: grid;
  gap: var(--vectis-space-6);
  inline-size: 26rem;
}
</style>
