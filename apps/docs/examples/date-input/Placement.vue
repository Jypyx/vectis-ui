<script setup lang="ts">
import { ref } from 'vue'
import { VDateInput } from 'vectis-ui'

const placements = ['bottom-start', 'bottom-end', 'top-start', 'top-end'] as const

const dates = ref<Record<string, string | null>>({
  'bottom-start': '2026-06-10',
  'bottom-end': '2026-06-10',
  'top-start': '2026-06-10',
  'top-end': '2026-06-10',
})
</script>

<template>
  <div class="grid">
    <VDateInput
      v-for="placement in placements"
      :key="placement"
      v-model="dates[placement]"
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
