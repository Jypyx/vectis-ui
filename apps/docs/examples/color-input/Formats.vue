<script setup lang="ts">
import { ref } from 'vue'
import { VColorInput } from 'vectis-ui'

const rgb = ref<string | null>('rgb(22 163 74)')
const oklch = ref<string | null>('oklch(62.7% 0.17 149.2)')
</script>

<template>
  <div class="column">
    <VColorInput v-model="rgb" format="rgb" label="RGB" />
    <VColorInput v-model="oklch" format="oklch" label="OKLCH" />
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
