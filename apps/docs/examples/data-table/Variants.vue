<script setup lang="ts">
import { VDataTable } from 'vectis-ui'

const columns = [
  { key: 'name', label: 'Project', sortable: true },
  { key: 'owner', label: 'Owner' },
  { key: 'commits', label: 'Commits', sortable: true, align: 'end' as const },
]

const rows = [
  { name: 'Vectis', owner: 'Xavier', commits: 320 },
  { name: 'Atlas', owner: 'Nadia', commits: 87 },
  { name: 'Brume', owner: 'Louis', commits: 1204 },
]
</script>

<template>
  <div class="stack">
    <VDataTable :columns="columns" :rows="rows" row-key="name" title="Flat" searchable />

    <VDataTable
      variant="outlined"
      :columns="columns"
      :rows="rows"
      row-key="name"
      title="Outlined"
      searchable
    />
  </div>
</template>

<style scoped>
.stack {
  display: grid;
  gap: var(--vectis-space-6);
}
</style>
