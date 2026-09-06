<script setup lang="ts">
import { ref } from 'vue'
import { VCombobox } from 'vectis-ui'

const chosen = ref('fr')

const countries = [
  { value: 'be', label: 'Belgium' },
  { value: 'ca', label: 'Canada' },
  { value: 'fr', label: 'France' },
  { value: 'ch', label: 'Switzerland' },
]
</script>

<template>
  <div class="column">
    <VCombobox
      v-model="chosen"
      :options="countries"
      clearable
      label="Clearable"
      hint="The cross empties the selection and the search at once"
    />

    <VCombobox
      :options="countries"
      model-value="fr"
      invalid
      label="Invalid"
      hint="For a rule the browser cannot check by itself"
    />

    <VCombobox :options="countries" model-value="fr" disabled label="Disabled" />

    <VCombobox :options="[]" loading label="Loading" placeholder="Fetching the list" />

    <!-- No option and nothing loading: the panel says so rather than opening empty. -->
    <VCombobox
      :options="[]"
      empty-text="No country matches"
      label="Nothing to show"
      placeholder="Open me"
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
