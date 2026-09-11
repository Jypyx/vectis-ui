<script setup lang="ts">
import { ref } from 'vue'
import { VDataTable, type DataTableSort } from 'vectis-ui'

/* `sortable` turns a heading into a button and the table does the sorting itself, on the
   values as they are given. The ascending icon points down, the spreadsheet convention. */
const columns = [
  { key: 'name', label: 'Project', sortable: true },
  { key: 'owner', label: 'Owner' },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'commits', label: 'Commits', sortable: true, align: 'end' as const },
]

const rows = [
  { name: 'Vectis', owner: 'Xavier', status: 'Active', commits: 320 },
  { name: 'Atlas', owner: 'Nadia', status: 'Active', commits: 87 },
  { name: 'Brume', owner: 'Louis', status: 'Archived', commits: 1204 },
  { name: 'Granit', owner: 'Emma', status: 'Active', commits: 45 },
]

/* The sort is a model, so the table can open on a column already sorted, and what the
   reader clicks can be read back. */
const sort = ref<DataTableSort | null>({ key: 'commits', direction: 'desc' })

const DIRECTIONS = { asc: 'ascending', desc: 'descending' }
</script>

<template>
  <div class="demo">
    <VDataTable
      v-model:sort="sort"
      :columns="columns"
      :rows="rows"
      row-key="name"
      title="Projects"
      caption="Organisation projects"
    />
    <p class="state">
      Sorted by {{ sort ? `${sort.key}, ${DIRECTIONS[sort.direction]}` : 'nothing' }}
    </p>
  </div>
</template>

<style scoped>
.demo {
  display: grid;
  gap: var(--vectis-space-3);
}
.state {
  margin: 0;
  color: var(--vectis-color-text-muted);
  font-size: var(--vectis-text-body-sm-size);
}
</style>
