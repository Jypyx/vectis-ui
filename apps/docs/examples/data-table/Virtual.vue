<script setup lang="ts">
import { ref } from 'vue'
import { VDataTable, type DataTableRowId } from 'vectis-ui'

const columns = [
  { key: 'name', label: 'Project', sortable: true },
  { key: 'owner', label: 'Owner' },
  { key: 'commits', label: 'Commits', sortable: true, align: 'end' as const },
]

const OWNERS = ['Xavier', 'Nadia', 'Louis', 'Emma']

const rows = Array.from({ length: 10000 }, (_, index) => ({
  id: index + 1,
  name: `Project ${index + 1}`,
  owner: OWNERS[index % OWNERS.length],
  commits: ((index + 3) * 37) % 500,
}))

const selected = ref<DataTableRowId[]>([])
</script>

<template>
  <VDataTable
    v-model:selected="selected"
    virtual
    sticky-header
    selectable
    variant="outlined"
    :height="400"
    :columns="columns"
    :rows="rows"
    row-key="id"
    caption="Ten thousand projects"
  />
</template>
