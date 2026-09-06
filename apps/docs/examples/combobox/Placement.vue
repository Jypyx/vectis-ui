<script setup lang="ts">
import { ref } from 'vue'
import { VCombobox } from 'vectis-ui'

/* Labels wider than the field: the panel is at least as wide as what it is anchored to,
   so it takes more than that here and the two alignments become visible. */
const departments = [
  { value: 'ops', label: 'Operations and logistics' },
  { value: 'fin', label: 'Finance and accounting' },
  { value: 'eng', label: 'Engineering and platform' },
  { value: 'hr', label: 'People and culture' },
]

const placements = ['bottom-start', 'bottom-end', 'top-start', 'top-end'] as const

const chosen = ref<Record<string, string>>({
  'bottom-start': 'ops',
  'bottom-end': 'fin',
  'top-start': 'eng',
  'top-end': 'hr',
})
</script>

<template>
  <div class="grid">
    <VCombobox
      v-for="placement in placements"
      :key="placement"
      v-model="chosen[placement]"
      :options="departments"
      :placement="placement"
      :label="placement"
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
