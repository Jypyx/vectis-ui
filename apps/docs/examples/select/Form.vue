<script setup lang="ts">
import { ref } from 'vue'
import { VButton, VSelect } from 'vectis-ui'

const country = ref('')
const submitted = ref('')

const countries = [
  { value: 'be', label: 'Belgium' },
  { value: 'ca', label: 'Canada' },
  { value: 'fr', label: 'France' },
  { value: 'ch', label: 'Switzerland' },
]

function onSubmit(event: Event) {
  const data = new FormData(event.target as HTMLFormElement)
  submitted.value = `country=${data.get('country')}`
}

function onReset() {
  submitted.value = ''
}
</script>

<template>
  <form class="column" @submit.prevent="onSubmit" @reset="onReset">
    <VSelect
      v-model="country"
      :options="countries"
      name="country"
      required
      label="Country"
      placeholder="Choose a country"
    />
    <div class="actions">
      <VButton type="submit">Submit</VButton>
      <VButton type="reset" variant="outline">Reset</VButton>
    </div>
    <output class="value" aria-label="Submitted data">{{ submitted || 'nothing yet' }}</output>
  </form>
</template>

<style scoped>
.column {
  display: grid;
  gap: var(--vectis-space-3);
  max-inline-size: 26rem;
}
.actions {
  display: flex;
  gap: var(--vectis-space-2);
}
.value {
  font-family: var(--vectis-text-family-code);
  font-size: var(--vectis-text-body-sm-size);
  color: var(--vectis-color-text-muted);
}
</style>
