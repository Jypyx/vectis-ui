<script setup lang="ts">
import { ref } from 'vue'
import { VCombobox } from 'vectis-ui'

const country = ref('fr')

const countries = [
  { value: 'be', label: 'Belgium' },
  { value: 'ca', label: 'Canada' },
  { value: 'fr', label: 'France' },
  { value: 'lu', label: 'Luxembourg' },
  { value: 'ch', label: 'Switzerland' },
]

const capitals: Record<string, string> = {
  be: 'Brussels',
  ca: 'Ottawa',
  fr: 'Paris',
  lu: 'Luxembourg',
  ch: 'Bern',
}
</script>

<template>
  <div class="column">
    <VCombobox v-model="country" :options="countries" label="Country">
      <template #option="{ option, selected }">
        <span class="row">
          <span>{{ option.label }}</span>
          <small class="capital"
            >{{ capitals[option.value] }}{{ selected ? ' · chosen' : '' }}</small
          >
        </span>
      </template>
    </VCombobox>
  </div>
</template>

<style scoped>
.column {
  max-inline-size: 26rem;
}
/* The slot replaces the label, so its content is laid out inside the row the panel
   already spaces and aligns. */
.row {
  display: grid;
}
.capital {
  color: var(--vectis-color-text-muted);
}
</style>
