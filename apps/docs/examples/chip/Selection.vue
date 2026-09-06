<script setup lang="ts">
import { ref } from 'vue'
import { VChip } from 'vectis-ui'

const frameworks = ref([
  { label: 'Vue', on: true },
  { label: 'React', on: false },
  { label: 'Svelte', on: false },
])

const filters = ref([
  { label: 'Open', on: true },
  { label: 'Assigned to me', on: true },
  { label: 'Archived', on: false },
])
</script>

<template>
  <div class="row" role="group" aria-label="Frameworks">
    <VChip
      v-for="framework in frameworks"
      :key="framework.label"
      v-model:selected="framework.on"
      selectable
      tone="accent"
    >
      {{ framework.label }}
    </VChip>
  </div>

  <div class="row" role="group" aria-label="Filters">
    <VChip
      v-for="filter in filters"
      :key="filter.label"
      v-model:selected="filter.on"
      selectable
      check
      tone="accent"
    >
      {{ filter.label }}
    </VChip>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--vectis-space-2);
}
</style>
