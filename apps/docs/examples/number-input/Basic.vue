<script setup lang="ts">
import { ref } from 'vue'
import { VNumberInput } from 'vectis-ui'

const quantity = ref<number | null>(1)
</script>

<template>
  <VNumberInput
    v-model="quantity"
    class="field"
    label="Quantity"
    hint="Between 1 and 10."
    :min="1"
    :max="10"
  />
</template>

<style scoped>
.field {
  max-inline-size: 15rem;
}
</style>
