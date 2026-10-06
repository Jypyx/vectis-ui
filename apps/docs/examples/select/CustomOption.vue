<script setup lang="ts">
import { ref } from 'vue'
import { VSelect } from 'vectis-ui'

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
    <VSelect v-model="country" :options="countries" label="Country">
      <template #option="{ option }">
        <span class="row">
          <span>{{ option.label }}</span>
          <small class="capital">{{ capitals[option.value] }}</small>
        </span>
      </template>
    </VSelect>
  </div>
</template>

<style scoped>
.column {
  max-inline-size: 26rem;
}
.row {
  display: grid;
}
.capital {
  color: var(--vectis-color-text-muted);
}
</style>
