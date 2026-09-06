<script setup lang="ts">
import { ref } from 'vue'
import { VInput } from 'vectis-ui'
import { search, swap_vert as swapVert } from 'vectis-ui/icons'

const query = ref('wool socks')
const searched = ref('')

const amount = ref('120.00')
const currency = ref<'EUR' | 'USD'>('EUR')

function switchCurrency() {
  currency.value = currency.value === 'EUR' ? 'USD' : 'EUR'
}
</script>

<template>
  <div class="fields">
    <VInput
      v-model="query"
      label="Search"
      :icon-end="search"
      icon-end-label="Run the search"
      :hint="searched ? `Searched for ${searched}.` : 'Press the magnifier to search.'"
      @click:icon-end="searched = query"
    />

    <VInput
      v-model="amount"
      :label="`Amount in ${currency}`"
      :icon-start="swapVert"
      icon-start-label="Switch currency"
      @click:icon-start="switchCurrency"
    />
  </div>
</template>

<style scoped>
.fields {
  display: grid;
  gap: var(--vectis-space-4);
}
</style>
