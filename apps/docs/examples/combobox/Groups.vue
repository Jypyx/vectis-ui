<script setup lang="ts">
import { ref } from 'vue'
import { VCombobox, type ComboboxItem } from 'vectis-ui'

const country = ref('fr')

/* An entry is an option, a named block, or a separator, and the three mix freely. A group
   the search empties disappears with its name, and a stranded separator is dropped. */
const items: ComboboxItem[] = [
  {
    label: 'Europe',
    options: [
      { value: 'fr', label: 'France' },
      { value: 'be', label: 'Belgium' },
      { value: 'ch', label: 'Switzerland' },
      { value: 'lu', label: 'Luxembourg' },
    ],
  },
  { separator: true },
  {
    label: 'Africa',
    options: [
      { value: 're', label: 'Réunion' },
      { value: 'ci', label: "Côte d'Ivoire" },
      { value: 'ma', label: 'Morocco' },
    ],
  },
  {
    label: 'America',
    options: [
      { value: 'ca', label: 'Canada' },
      { value: 'us', label: 'United States' },
      { value: 'br', label: 'Brazil' },
    ],
  },
  { separator: true },
  { value: 'other', label: 'Other, not listed' },
]
</script>

<template>
  <div class="column">
    <VCombobox v-model="country" :options="items" label="Country" placeholder="Choose a country" />
  </div>
</template>

<style scoped>
.column {
  max-inline-size: 26rem;
}
</style>
