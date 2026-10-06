<script setup lang="ts">
import { computed, ref } from 'vue'
import { VDataTable } from 'vectis-ui'

const columns = [
  { key: 'name', label: 'Event' },
  { key: 'owner', label: 'Author' },
]

const OWNERS = ['Xavier', 'Nadia', 'Louis', 'Emma']
const TOTAL = 150

function page(from: number) {
  return Array.from({ length: 30 }, (_, i) => ({
    id: from + i + 1,
    name: `Event ${from + i + 1}`,
    owner: OWNERS[(from + i) % OWNERS.length],
  }))
}

const rows = ref(page(0))
const loading = ref(false)
const hasMore = computed(() => rows.value.length < TOTAL)

// Stands in for a request to your API.
function loadMore() {
  loading.value = true
  setTimeout(() => {
    rows.value = [...rows.value, ...page(rows.value.length)]
    loading.value = false
  }, 600)
}
</script>

<template>
  <VDataTable
    virtual
    sticky-header
    variant="outlined"
    :height="360"
    :columns="columns"
    :rows="rows"
    row-key="id"
    :loading="loading"
    :has-more="hasMore"
    title="Activity"
    @load-more="loadMore"
  />
</template>
