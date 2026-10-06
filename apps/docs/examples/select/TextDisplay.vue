<script setup lang="ts">
import { ref } from 'vue'
import { VSelect } from 'vectis-ui'

const served = ref(['be', 'ca', 'fr', 'lu', 'ch'])

const countries = [
  { value: 'be', label: 'Belgium' },
  { value: 'ca', label: 'Canada' },
  { value: 'fr', label: 'France' },
  { value: 'lu', label: 'Luxembourg' },
  { value: 'ch', label: 'Switzerland' },
]
</script>

<template>
  <div class="column">
    <VSelect
      v-model="served"
      :options="countries"
      multiple
      display="text"
      label="Served countries"
      placeholder="Choose countries"
    />
  </div>
</template>

<style scoped>
.column {
  max-inline-size: 20rem;
}
</style>
