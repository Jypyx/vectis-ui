<script setup lang="ts">
import { VCombobox, VInput, VInputGroup } from 'vectis-ui'

const sizes = ['sm', 'md', 'lg'] as const

const currencies = [
  { value: 'eur', label: 'EUR' },
  { value: 'usd', label: 'USD' },
]
</script>

<template>
  <div class="column">
    <VInputGroup v-for="size in sizes" :key="size" :size="size" :label="size">
      <VCombobox :options="currencies" model-value="eur" aria-label="Currency" class="currency" />
      <VInput aria-label="Amount" />
    </VInputGroup>

    <VInputGroup size="md" compact label="md, compact">
      <VCombobox :options="currencies" model-value="eur" aria-label="Currency" class="currency" />
      <VInput aria-label="Amount" />
    </VInputGroup>
  </div>
</template>

<style scoped>
.column {
  display: flex;
  flex-direction: column;
  gap: var(--vectis-space-5);
  max-inline-size: 26rem;
}

.currency {
  flex: 0 0 7rem;
}
</style>
