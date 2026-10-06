<script setup lang="ts">
import { ref } from 'vue'
import { VColorInput } from 'vectis-ui'

const color = ref<string | null>('rgb(14 165 233 / 0.6)')
const swatches = ['#0ea5e9', '#16a34a', '#f59e0b', '#e11d48', '#7c3aed', '#0f172a']
</script>

<template>
  <div class="column">
    <VColorInput v-model="color" format="rgb" alpha :swatches="swatches" label="Background" />
  </div>
</template>

<style scoped>
.column {
  display: flex;
  flex-direction: column;
  gap: var(--vectis-space-5);
  max-inline-size: 20rem;
}
</style>
