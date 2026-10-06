<script setup lang="ts">
import { ref } from 'vue'
import { VSelect } from 'vectis-ui'

const country = ref('')

const options = [
  { value: 'be', label: 'Belgium' },
  { value: 'ca', label: 'Canada' },
  { value: 'fr', label: 'France' },
  { value: 'ch', label: 'Switzerland' },
]
</script>

<template>
  <VSelect
    v-model="country"
    :options="options"
    aria-label="Country"
    placeholder="Choose a country"
  />
</template>
