<script setup lang="ts">
import { VDataTable, type DataTableVariant } from 'vectis-ui'

const variants: DataTableVariant[] = ['flat', 'outline', 'elevated', 'filled']

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
    <VDataTable
      v-for="variant in variants"
      :key="variant"
      :variant="variant"
      :columns="columns"
      :rows="rows"
      row-key="name"
      :title="variant"
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
