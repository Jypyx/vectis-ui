<script setup lang="ts">
import { ref } from 'vue'
import { VAvatar, VChip, VDataTable, type DataTableRowId } from 'vectis-ui'

const columns = [
  { key: 'name', label: 'Project', sortable: true },
  { key: 'owner', label: 'Owner', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
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
const OWNERS = ['Xavier Darmet', 'Nadia Rousseau', 'Louis Fabre', 'Emma Lefort']

const rows = NAMES.map((name, index) => ({
  name,
  owner: OWNERS[index % OWNERS.length],
  status: index % 3 === 0 ? 'Archived' : 'Active',
  commits: ((index + 3) * 37) % 500,
}))

type Project = (typeof rows)[number]

const selected = ref<DataTableRowId[]>([])
const numbers = new Intl.NumberFormat('en-GB')

const selectRowLabel = (row: Project) => `Select ${row.name}`
const selectionLabel = (count: number) => `${count} project${count > 1 ? 's' : ''} selected`
</script>

<template>
  <VDataTable
    v-model:selected="selected"
    variant="outlined"
    :columns="columns"
    :rows="rows"
    row-key="name"
    title="Projects"
    searchable
    search-placeholder="Search projects"
    selectable
    :select-row-label="selectRowLabel"
    :selection-label="selectionLabel"
    sticky-header
    :height="420"
    :per-page="8"
    :per-page-options="[8, 16, 24]"
    show-range
    caption="Every project in the organisation"
  >
    <template #cell-owner="{ row }">
      <span class="owner">
        <VAvatar :name="row.owner" size="xs" />
        {{ row.owner }}
      </span>
    </template>

    <template #cell-status="{ row }">
      <VChip :tone="row.status === 'Active' ? 'success' : 'neutral'" size="xs">
        {{ row.status }}
      </VChip>
    </template>

    <template #cell-commits="{ row }">
      <span class="figure">{{ numbers.format(row.commits) }}</span>
    </template>
  </VDataTable>
</template>

<style scoped>
.owner {
  display: inline-flex;
  align-items: center;
  gap: var(--vectis-space-2);
}
.figure {
  font-variant-numeric: tabular-nums;
}
</style>
