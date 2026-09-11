<script setup lang="ts">
import { VAvatar, VChip, VDataTable } from 'vectis-ui'

const columns = [
  { key: 'name', label: 'Project', sortable: true },
  { key: 'owner', label: 'Owner' },
  { key: 'status', label: 'Status' },
  { key: 'commits', label: 'Commits', sortable: true, align: 'end' as const },
]

const rows = [
  { name: 'Vectis', owner: 'Xavier Darmet', status: 'Active', commits: 320 },
  { name: 'Atlas', owner: 'Nadia Rousseau', status: 'Active', commits: 87 },
  { name: 'Brume', owner: 'Louis Fabre', status: 'Archived', commits: 1204 },
  { name: 'Granit', owner: 'Emma Lefort', status: 'Active', commits: 45 },
]

const numbers = new Intl.NumberFormat('en-GB')
</script>

<template>
  <VDataTable
    :columns="columns"
    :rows="rows"
    row-key="name"
    title="Projects"
    caption="Organisation projects"
  >
    <!-- A cell slot is named after its column key, and receives the whole row. -->
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

    <!-- Sorting reads the underlying value, so a formatted number still sorts as a number. -->
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
