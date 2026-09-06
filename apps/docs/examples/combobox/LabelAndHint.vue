<script setup lang="ts">
import { ref } from 'vue'
import { VCombobox } from 'vectis-ui'

const country = ref('fr')

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
      v-model="country"
      :options="countries"
      label="Country"
      hint="Type to narrow the list down. Accents are ignored, so reunion finds Réunion."
      placeholder="Choose a country"
      clearable
    />
  </div>
</template>

<style scoped>
.column {
  max-inline-size: 26rem;
}
</style>
