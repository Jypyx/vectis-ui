<script setup lang="ts">
import { ref } from 'vue'
import { VSelect } from 'vectis-ui'

const country = ref('')

const countries = [
  { value: 'be', label: 'Belgium' },
  { value: 'ca', label: 'Canada' },
  { value: 'fr', label: 'France' },
  { value: 'ch', label: 'Switzerland' },
]
</script>

<template>
  <div class="column">
    <VSelect
      v-model="country"
      :options="countries"
      label="Billing country"
      hint="The country shown on your invoices"
      placeholder="Choose a country"
    />
  </div>
</template>

<style scoped>
.column {
  max-inline-size: 26rem;
}
</style>
