<script setup lang="ts">
import { ref } from 'vue'
import { VCombobox } from 'vectis-ui'

const countries = [
  { value: 'be', label: 'Belgium' },
  { value: 'ca', label: 'Canada' },
  { value: 'fr', label: 'France' },
  { value: 'ch', label: 'Switzerland' },
]

const rows = ref(
  (['sm', 'md', 'lg'] as const).map((size) => ({ key: size, size, label: size, selected: ['fr'] })),
)
</script>

<template>
  <div class="column">
    <VCombobox
      v-for="row in rows"
      :key="row.key"
      v-model="row.selected"
      :options="countries"
      :size="row.size"
      :label="row.label"
      multiple
    />
  </div>
</template>

<style scoped>
.column {
  display: flex;
  flex-direction: column;
  gap: var(--vectis-space-5);
  max-inline-size: 26rem;
}
</style>
