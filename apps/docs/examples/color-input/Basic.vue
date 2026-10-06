<script setup lang="ts">
import { ref } from 'vue'
import { VColorInput } from 'vectis-ui'

const color = ref<string | null>('#3b82f6')
</script>

<template>
  <div class="column">
    <VColorInput v-model="color" label="Brand colour" hint="Hex, rgb(), hsl() or oklch()." />
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
