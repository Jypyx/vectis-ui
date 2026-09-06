<script setup lang="ts">
import { ref } from 'vue'
import { VCombobox, type ComboboxOption } from 'vectis-ui'

const CATALOGUE: ComboboxOption[] = Array.from({ length: 120 }, (_, i) => ({
  value: `ref-${i + 1}`,
  label: `Reference ${String(i + 1).padStart(3, '0')}`,
}))

/* Stands in for a server: latency, and the filtering done on its side. */
function fetchReferences(query: string): Promise<ComboboxOption[]> {
  const found = CATALOGUE.filter((option) =>
    option.label.toLowerCase().includes(query.toLowerCase()),
  )
  return new Promise((resolve) => setTimeout(() => resolve(found.slice(0, 20)), 400))
}

const reference = ref('')
const options = ref<ComboboxOption[]>([])
const loading = ref(false)

/* A token, so a slow answer to an old keystroke cannot overwrite a fresh one. */
let latest = 0

async function onSearch(query: string) {
  const current = ++latest
  loading.value = true
  const found = await fetchReferences(query)
  if (current !== latest) return
  options.value = found
  loading.value = false
}
</script>

<template>
  <div class="column">
    <VCombobox
      v-model="reference"
      :options="options"
      :loading="loading"
      :filter="false"
      label="Reference"
      hint="The list is narrowed by the source, so local filtering is turned off"
      placeholder="Search for a reference"
      empty-text="No reference matches"
      clearable
      @search="onSearch"
    />
  </div>
</template>

<style scoped>
.column {
  max-inline-size: 26rem;
}
</style>
