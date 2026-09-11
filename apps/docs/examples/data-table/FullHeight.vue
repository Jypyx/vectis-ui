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
  <!-- The panel has a height, so the table takes it: the toolbar and the footer keep their
       places and only the rows scroll, whatever the page holds. Change the page size and
       the footer stays where it is. -->
  <div class="panel">
    <VDataTable
      variant="outlined"
      sticky-header
      :columns="columns"
      :rows="rows"
      row-key="name"
      title="Projects"
      searchable
      :per-page="5"
      :per-page-options="[5, 10]"
      show-range
      caption="Organisation projects"
    />
  </div>
</template>

<style scoped>
.panel {
  block-size: 26rem;
}
</style>
