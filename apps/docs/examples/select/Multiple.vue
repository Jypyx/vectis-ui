<script setup lang="ts">
import { ref } from 'vue'
import { VSelect } from 'vectis-ui'

const served = ref(['fr', 'be', 'ca'])

const countries = [
  { value: 'be', label: 'Belgium' },
  { value: 'ca', label: 'Canada' },
  { value: 'fr', label: 'France' },
  { value: 'lu', label: 'Luxembourg' },
  { value: 'mc', label: 'Monaco', disabled: true },
  { value: 'ch', label: 'Switzerland' },
]
</script>

<template>
  <div class="column">
    <VSelect
      v-model="served"
      :options="countries"
      multiple
      clearable
      :max="2"
      label="Served countries"
      hint="Two values are shown while the field is not focused"
      placeholder="Choose countries"
    />
    <output class="value" aria-label="Chosen values">{{ served.join(', ') || 'none' }}</output>
  </div>
</template>

<style scoped>
.column {
  display: grid;
  gap: var(--vectis-space-3);
  max-inline-size: 26rem;
}
.value {
  font-family: var(--vectis-text-family-code);
  font-size: var(--vectis-text-body-sm-size);
  color: var(--vectis-color-text-muted);
}
</style>
