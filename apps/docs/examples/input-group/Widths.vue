<script setup lang="ts">
import { VCombobox, VInput, VInputGroup } from 'vectis-ui'

const currencies = [
  { value: 'eur', label: 'EUR' },
  { value: 'usd', label: 'USD' },
  { value: 'gbp', label: 'GBP' },
]
</script>

<template>
  <div class="column">
    <!-- Left alone, the two fields share the row equally. -->
    <VInputGroup label="Equal shares">
      <VCombobox :options="currencies" model-value="eur" aria-label="Currency" />
      <VInput aria-label="Amount" />
    </VInputGroup>

    <!-- An inline flex on the segment fixes its width; the other one takes the rest. -->
    <VInputGroup label="A fixed currency field">
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
