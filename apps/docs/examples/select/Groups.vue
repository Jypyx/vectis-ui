<script setup lang="ts">
import { ref } from 'vue'
import { VSelect, type SelectItem } from 'vectis-ui'

const country = ref('fr')

const items: SelectItem[] = [
  {
    label: 'Europe',
    options: [
      { value: 'fr', label: 'France' },
      { value: 'be', label: 'Belgium' },
      { value: 'ch', label: 'Switzerland' },
    ],
  },
  {
    label: 'America',
    options: [
      { value: 'ca', label: 'Canada' },
      { value: 'us', label: 'United States' },
      { value: 'br', label: 'Brazil' },
    ],
  },
  { separator: true },
  { value: 'other', label: 'Other' },
]
</script>

<template>
  <div class="column">
    <VSelect v-model="country" :options="items" label="Country" />
  </div>
</template>

<style scoped>
.column {
  max-inline-size: 26rem;
}
</style>
