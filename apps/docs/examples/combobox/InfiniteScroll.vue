<script setup lang="ts">
import { computed, ref } from 'vue'
import { VCombobox, type ComboboxOption } from 'vectis-ui'

const PAGE_SIZE = 20

const CATALOGUE: ComboboxOption[] = Array.from({ length: 120 }, (_, i) => ({
  value: `ref-${i + 1}`,
  label: `Reference ${String(i + 1).padStart(3, '0')}`,
}))

function fetchPage(query: string, page: number) {
  const found = CATALOGUE.filter((option) =>
    option.label.toLowerCase().includes(query.toLowerCase()),
  )
  return new Promise<{ items: ComboboxOption[]; total: number }>((resolve) =>
    setTimeout(
      () =>
        resolve({
          items: found.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
          total: found.length,
        }),
      400,
    ),
  )
}

const reference = ref('')
const options = ref<ComboboxOption[]>([])
const loading = ref(false)
const total = ref(0)
const page = ref(0)
const query = ref('')

const hasMore = computed(() => options.value.length < total.value)

async function onSearch(term: string) {
  query.value = term
  page.value = 0
  loading.value = true
  const result = await fetchPage(term, 0)
  options.value = result.items
  total.value = result.total
  loading.value = false
}

/* The component asks once per page and waits: the next request only goes out when the
   sentinel comes back into view, which it cannot do until this one has landed. */
async function onLoadMore() {
  loading.value = true
  const result = await fetchPage(query.value, page.value + 1)
  page.value += 1
  options.value = [...options.value, ...result.items]
  loading.value = false
}
</script>

<template>
  <div class="column">
    <VCombobox
      v-model="reference"
      :options="options"
      :loading="loading"
      :has-more="hasMore"
      :filter="false"
      label="Reference"
      hint="Scroll to the foot of the list: the next page is asked for as the end comes into view"
      placeholder="Search for a reference"
      @search="onSearch"
      @load-more="onLoadMore"
    />
    <output class="count" aria-label="Options loaded"
      >{{ options.length }} loaded of {{ total }}</output
    >
  </div>
</template>

<style scoped>
.column {
  display: grid;
  gap: var(--vectis-space-3);
  max-inline-size: 26rem;
}
.count {
  font-family: var(--vectis-text-family-code);
  font-size: var(--vectis-text-body-sm-size);
  color: var(--vectis-color-text-muted);
}
</style>
