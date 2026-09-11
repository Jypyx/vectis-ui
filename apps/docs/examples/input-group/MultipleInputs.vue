<script setup lang="ts">
import { ref } from 'vue'
import { VCombobox, VInput, VInputGroup } from 'vectis-ui'

const amount = ref('1200')
const currency = ref('eur')
const currencies = [
  { value: 'eur', label: 'EUR' },
  { value: 'usd', label: 'USD' },
  { value: 'gbp', label: 'GBP' },
]

const scheme = ref('https')
const domain = ref('vectis-ui')
const tld = ref('com')
const schemes = [
  { value: 'https', label: 'https://' },
  { value: 'http', label: 'http://' },
]
const tlds = [
  { value: 'com', label: '.com' },
  { value: 'dev', label: '.dev' },
  { value: 'fr', label: '.fr' },
]
</script>

<template>
  <div class="column">
    <VInputGroup label="Amount">
      <VInput v-model="amount" aria-label="Amount" inputmode="decimal" />
      <VCombobox v-model="currency" :options="currencies" aria-label="Currency" class="currency" />
    </VInputGroup>

    <!-- A row is not limited to two: each segment holding a field takes an equal share,
         and the ones given a width of their own keep it. -->
    <VInputGroup label="Address" hint="The scheme, the name and the extension">
      <VCombobox v-model="scheme" :options="schemes" aria-label="Scheme" class="scheme" />
      <VInput v-model="domain" aria-label="Domain name" />
      <VCombobox v-model="tld" :options="tlds" aria-label="Extension" class="tld" />
    </VInputGroup>
  </div>
</template>

<style scoped>
.column {
  display: flex;
  flex-direction: column;
  gap: var(--vectis-space-5);
  max-inline-size: 30rem;
}
.currency {
  flex: 0 0 7rem;
}
.scheme {
  flex: 0 0 8rem;
}
.tld {
  flex: 0 0 6rem;
}
</style>
