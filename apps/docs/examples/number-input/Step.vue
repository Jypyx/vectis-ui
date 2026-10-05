<script setup lang="ts">
import { ref } from 'vue'
import { VNumberInput } from 'vectis-ui'

const weight = ref<number | null>(0.5)
</script>

<template>
  <VNumberInput
    v-model="weight"
    class="field"
    label="Weight"
    hint="Page Up and Page Down move ten steps."
    :min="0"
    :max="20"
    :step="0.5"
    :format-options="{ style: 'unit', unit: 'kilogram' }"
  />
</template>

<style scoped>
.field {
  max-inline-size: 15rem;
}
</style>
