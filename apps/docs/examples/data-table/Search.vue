<script setup lang="ts">
import { VDataTable } from 'vectis-ui'

const columns = [
  { key: 'name', label: 'Project', sortable: true },
  { key: 'owner', label: 'Owner' },
  { key: 'status', label: 'Status' },
  { key: 'commits', label: 'Commits', align: 'end' as const },
]

/* `Éclair` keeps its accent: the search ignores diacritics, so eclair finds it. */
const rows = [
  { name: 'Vectis', owner: 'Xavier', status: 'Active', commits: 320 },
  { name: 'Atlas', owner: 'Nadia', status: 'Active', commits: 87 },
  { name: 'Brume', owner: 'Louis', status: 'Archived', commits: 1204 },
  { name: 'Granit', owner: 'Emma', status: 'Active', commits: 45 },
  { name: 'Éclair', owner: 'Xavier', status: 'Active', commits: 296 },
  { name: 'Falaise', owner: 'Nadia', status: 'Archived', commits: 133 },
  { name: 'Givre', owner: 'Louis', status: 'Active', commits: 58 },
  { name: 'Houle', owner: 'Emma', status: 'Active', commits: 411 },
]
</script>

<template>
  <VDataTable
    :columns="columns"
    :rows="rows"
    row-key="name"
    title="Projects"
    searchable
    search-placeholder="Search projects"
    search-label="Search the projects"
    caption="Organisation projects"
  />
</template>
