<script setup lang="ts">
import { VDataTable, VIcon } from 'vectis-ui'
import { code, schedule } from 'vectis-ui/icons'

const columns = [
  { key: 'name', label: 'Project', sortable: true },
  { key: 'owner', label: 'Owner' },
  { key: 'updated', label: 'Last update' },
  { key: 'commits', label: 'Commits', sortable: true, align: 'end' as const },
]

const rows = [
  { name: 'Vectis', owner: 'Xavier', updated: '2 days ago', commits: 320 },
  { name: 'Atlas', owner: 'Nadia', updated: '3 weeks ago', commits: 87 },
  { name: 'Brume', owner: 'Louis', updated: 'Yesterday', commits: 1204 },
  { name: 'Granit', owner: 'Emma', updated: 'An hour ago', commits: 45 },
]
</script>

<template>
  <VDataTable
    :columns="columns"
    :rows="rows"
    row-key="name"
    title="Projects"
    caption="Organisation projects"
  >
    <template #head-updated="{ column }">
      <span class="heading"><VIcon :name="schedule" :size="16" />{{ column.label }}</span>
    </template>

    <!-- On a sortable column the slot renders inside the sort button, so keep it to text
         and decoration: a control there would be a control inside a control. -->
    <template #head-commits="{ column }">
      <span class="heading"><VIcon :name="code" :size="16" />{{ column.label }}</span>
    </template>
  </VDataTable>
</template>

<style scoped>
.heading {
  display: inline-flex;
  align-items: center;
  gap: var(--vectis-space-1);
}
</style>
