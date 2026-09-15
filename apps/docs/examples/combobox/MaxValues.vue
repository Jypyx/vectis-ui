<script setup lang="ts">
import { ref } from 'vue'
import { VCombobox } from 'vectis-ui'

const chips = ref(['fr', 'be', 'ch', 'lu', 're'])
const text = ref(['fr', 'be', 'ch', 'lu', 're'])

const countries = [
  { value: 'be', label: 'Belgium' },
  { value: 'ca', label: 'Canada' },
  { value: 'ci', label: "Côte d'Ivoire" },
  { value: 'fr', label: 'France' },
  { value: 'lu', label: 'Luxembourg' },
  { value: 're', label: 'Réunion' },
  { value: 'ch', label: 'Switzerland' },
]
</script>

<template>
  <div class="column">
    <VCombobox
      v-model="chips"
      :options="countries"
      multiple
      :max="2"
      label="Served countries"
      hint="Two chips, the rest counted until the field is focused"
    />
    <VCombobox
      v-model="text"
      :options="countries"
      multiple
      display="text"
      :max="2"
      :overflow-text="(count) => `+${count} countries`"
      label="Served countries, as text"
    />
  </div>
</template>

<style scoped>
.column {
  display: grid;
  gap: 1rem;
  max-inline-size: 20rem;
}
</style>
