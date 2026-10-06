<script setup lang="ts">
import { ref } from 'vue'
import { VCombobox } from 'vectis-ui'

const product = ref<string | number>('')

const options = Array.from({ length: 10000 }, (_, i) => ({
  value: i + 1,
  label: `Product ${String(i + 1).padStart(5, '0')}`,
}))
</script>

<template>
  <VCombobox
    v-model="product"
    :options="options"
    virtual
    aria-label="Product"
    placeholder="Choose a product"
  />
</template>
