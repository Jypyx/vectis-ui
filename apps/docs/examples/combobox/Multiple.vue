<script setup lang="ts">
import { ref } from 'vue'
import { VCombobox } from 'vectis-ui'

const served = ref(['fr', 'be'])

const countries = [
  { value: 'be', label: 'Belgium' },
  { value: 'ca', label: 'Canada' },
  { value: 'ci', label: "Côte d'Ivoire" },
  { value: 'fr', label: 'France' },
  { value: 'lu', label: 'Luxembourg' },
  { value: 'mc', label: 'Monaco', disabled: true },
  { value: 're', label: 'Réunion' },
  { value: 'ch', label: 'Switzerland' },
]
</script>

<template>
  <div class="column">
    <VCombobox
      v-model="served"
      :options="countries"
      multiple
      clearable
      label="Served countries"
      hint="Click elsewhere: the search field folds away and only the chips remain"
      placeholder="Add a country"
    />
    <output class="value" aria-label="Chosen values">{{ served.join(', ') || 'none' }}</output>
  </div>
</template>

<style scoped>
.column {
  display: grid;
  gap: var(--vectis-space-3);
  max-inline-size: 26rem;
}
.value {
  font-family: var(--vectis-text-family-code);
  font-size: var(--vectis-text-body-sm-size);
  color: var(--vectis-color-text-muted);
}
</style>
