<script setup lang="ts">
import { ref } from 'vue'
import { VSelect } from 'vectis-ui'

const chosen = ref('fr')

const countries = [
  { value: 'be', label: 'Belgium' },
  { value: 'ca', label: 'Canada' },
  { value: 'fr', label: 'France' },
  { value: 'mc', label: 'Monaco', disabled: true },
  { value: 'ch', label: 'Switzerland' },
]
</script>

<template>
  <div class="column">
    <VSelect
      v-model="chosen"
      :options="countries"
      clearable
      label="Clearable"
      hint="The cross empties the selection"
      placeholder="Choose a country"
    />

    <VSelect
      :options="countries"
      model-value="fr"
      invalid
      label="Invalid"
      hint="For a rule the browser cannot check by itself"
    />

    <VSelect :options="countries" model-value="fr" disabled label="Disabled" />

    <VSelect
      :options="countries"
      model-value="fr"
      readonly
      label="Read-only"
      hint="Set by your subscription"
    />
  </div>
</template>

<style scoped>
.column {
  display: flex;
  flex-direction: column;
  gap: var(--vectis-space-5);
  max-inline-size: 26rem;
}
</style>
