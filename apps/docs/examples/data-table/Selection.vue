<script setup lang="ts">
import { ref } from 'vue'
import { VDataTable, type DataTableRowId } from 'vectis-ui'

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
]

type Project = (typeof rows)[number]

/* What comes back are the identities `rowKey` names, never the row objects. */
const selected = ref<DataTableRowId[]>(['Atlas'])

/* "Select row" says nothing about which one, so the row itself names its checkbox. */
const selectRowLabel = (row: Project) => `Select ${row.name}`
</script>

<template>
  <div class="demo">
    <VDataTable
      v-model:selected="selected"
      :columns="columns"
      :rows="rows"
      row-key="name"
      title="Projects"
      selectable
      :select-row-label="selectRowLabel"
      select-all-label="Select every project on this page"
      caption="Organisation projects"
    />
    <p class="state">Selected: {{ selected.length ? selected.join(', ') : 'nothing' }}</p>
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
