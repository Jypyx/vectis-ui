<script setup lang="ts">
import { ref } from 'vue'
import { VTimeInput } from 'vectis-ui'

const placements = ['bottom-start', 'bottom-end', 'top-start', 'top-end'] as const

const times = ref<Record<string, string | null>>({
  'bottom-start': '09:15',
  'bottom-end': '09:15',
  'top-start': '09:15',
  'top-end': '09:15',
})
</script>

<template>
  <div class="grid">
    <VTimeInput
      v-for="placement in placements"
      :key="placement"
      v-model="times[placement]"
      :placement="placement"
      :label="placement"
      mode="readonly"
    />
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
  gap: var(--vectis-space-5);
  max-inline-size: 26rem;
}
</style>
