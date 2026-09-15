<script setup lang="ts">
import { ref } from 'vue'
import { VCombobox } from 'vectis-ui'

const served = ref(['fr', 'be', 'ch', 'lu'])

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
      display="text"
      clearable
      label="Served countries"
      hint="One line of labels, cut short when it runs out of room"
      placeholder="Add a country"
    />
  </div>
</template>

<style scoped>
.column {
  max-inline-size: 20rem;
}
</style>
