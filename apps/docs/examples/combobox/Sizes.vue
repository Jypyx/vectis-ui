<script setup lang="ts">
import { ref } from 'vue'
import { VCombobox } from 'vectis-ui'

const countries = [
  { value: 'be', label: 'Belgium' },
  { value: 'ca', label: 'Canada' },
  { value: 'fr', label: 'France' },
  { value: 'ch', label: 'Switzerland' },
]

/* Multiple mode on every row: the chips are what shows that the panel and the field are
   not the only things following the step. */
const rows = ref(
  (['sm', 'md', 'lg'] as const).flatMap((size) => [
    { key: size, size, compact: false, label: size, selected: ['fr'] },
    { key: `${size}-compact`, size, compact: true, label: `${size}, compact`, selected: ['fr'] },
  ]),
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
      :compact="row.compact"
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
