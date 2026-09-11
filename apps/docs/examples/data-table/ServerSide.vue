<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { VDataTable, type DataTableParams } from 'vectis-ui'

const columns = [
  { key: 'name', label: 'Project', sortable: true },
  { key: 'owner', label: 'Owner' },
  { key: 'status', label: 'Status' },
  { key: 'commits', label: 'Commits', sortable: true, align: 'end' as const },
]

const NAMES = [
  'Vectis',
  'Atlas',
  'Brume',
  'Granit',
  'Éclair',
  'Falaise',
  'Givre',
  'Houle',
  'Islet',
  'Jade',
  'Karst',
  'Lande',
  'Mistral',
  'Nacre',
  'Ombre',
  'Pollen',
  'Quartz',
  'Rivage',
  'Sillage',
  'Tuile',
  'Vigie',
  'Zenith',
]
const OWNERS = ['Xavier', 'Nadia', 'Louis', 'Emma']

/* What a database would hold. Nothing here is ever handed to the table whole. */
const DATA = NAMES.map((name, index) => ({
  name,
  owner: OWNERS[index % OWNERS.length],
  status: index % 3 === 0 ? 'Archived' : 'Active',
  commits: ((index + 3) * 37) % 500,
}))

type Project = (typeof DATA)[number]

const rows = ref<Project[]>([])
const total = ref(0)
const loading = ref(true)

/* A stand-in for the request. In server mode the table filters, sorts and slices nothing,
   so everything below is the answering end's work. */
function load(params: DataTableParams) {
  loading.value = true

  window.setTimeout(() => {
    const term = params.search.trim().toLowerCase()
    const matching = term
      ? DATA.filter((row) => `${row.name} ${row.owner} ${row.status}`.toLowerCase().includes(term))
      : DATA

    const key = params.sortKey as keyof Project | null
    const sorted = key
      ? [...matching].sort(
          (a, b) =>
            String(a[key]).localeCompare(String(b[key]), 'en', { numeric: true }) *
            (params.sortDirection === 'desc' ? -1 : 1),
        )
      : matching

    const size = params.perPage ?? sorted.length
    const start = (params.page - 1) * size

    rows.value = sorted.slice(start, start + size)
    total.value = sorted.length
    loading.value = false
  }, 600)
}

/* Nothing is emitted when the table appears, so the first page is asked for here. */
onMounted(() => load({ page: 1, perPage: 5, sortKey: null, sortDirection: null, search: '' }))
</script>

<template>
  <VDataTable
    server-side
    variant="outlined"
    :columns="columns"
    :rows="rows"
    :total="total"
    :loading="loading"
    row-key="name"
    title="Projects"
    searchable
    :per-page="5"
    :per-page-options="[5, 10]"
    show-range
    caption="Organisation projects, a page at a time"
    @update:params="load"
  />
</template>
