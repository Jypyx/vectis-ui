<script setup lang="ts">
import { VDataTable } from 'vectis-ui'

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

const rows = NAMES.map((name, index) => ({
  name,
  owner: OWNERS[index % OWNERS.length],
  status: index % 3 === 0 ? 'Archived' : 'Active',
  commits: ((index + 3) * 37) % 500,
}))
</script>

<template>
  <!-- A page size is all it takes: passing one down, bound or not, turns the pagination on. -->
  <VDataTable
    :columns="columns"
    :rows="rows"
    row-key="name"
    title="Projects"
    searchable
    :per-page="6"
    show-range
    caption="Organisation projects"
  />
</template>
