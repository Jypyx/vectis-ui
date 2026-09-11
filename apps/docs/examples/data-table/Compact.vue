<script setup lang="ts">
import { VDataTable } from 'vectis-ui'

const columns = [
  { key: 'name', label: 'Project', sortable: true },
  { key: 'owner', label: 'Owner' },
  { key: 'status', label: 'Status' },
  { key: 'commits', label: 'Commits', sortable: true, align: 'end' as const },
]

const rows = [
  { name: 'Vectis', owner: 'Xavier', status: 'Active', commits: 320 },
  { name: 'Atlas', owner: 'Nadia', status: 'Active', commits: 87 },
  { name: 'Brume', owner: 'Louis', status: 'Archived', commits: 1204 },
  { name: 'Granit', owner: 'Emma', status: 'Active', commits: 45 },
  { name: 'Éclair', owner: 'Xavier', status: 'Active', commits: 296 },
  { name: 'Falaise', owner: 'Nadia', status: 'Archived', commits: 133 },
]
</script>

<template>
  <!-- The cells tighten, and so does everything the table renders with them: the search
       field, the page size menu and the pagination all take the shorter step. -->
  <VDataTable
    compact
    variant="outlined"
    :columns="columns"
    :rows="rows"
    row-key="name"
    title="Projects"
    searchable
    :per-page="4"
    show-range
    caption="Organisation projects"
  />
</template>
