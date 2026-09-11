<script setup lang="ts">
import { computed, ref } from 'vue'
import { VButton, VDataTable, VMenu, VMenuItem } from 'vectis-ui'
import { expand_more as expandMore } from 'vectis-ui/icons'

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
  { name: 'Éclair', owner: 'Xavier', status: 'Archived', commits: 296 },
]

/* The filtering is yours: the table shows the rows it is given, and the search field it
   provides narrows them further. */
const status = ref('All')
const filtered = computed(() =>
  status.value === 'All' ? rows : rows.filter((row) => row.status === status.value),
)
</script>

<template>
  <VDataTable
    :columns="columns"
    :rows="filtered"
    row-key="name"
    searchable
    caption="Organisation projects"
  >
    <template #header>
      <div class="toolbar">
        <span>Projects</span>
        <VMenu match-trigger>
          <template #trigger="{ triggerProps }">
            <VButton
              v-bind="triggerProps"
              variant="outline"
              tone="neutral"
              size="sm"
              :icon-end="expandMore"
            >
              Status: {{ status }}
            </VButton>
          </template>
          <VMenuItem
            v-for="option in ['All', 'Active', 'Archived']"
            :key="option"
            :label="option"
            @select="status = option"
          />
        </VMenu>
        <VButton size="sm">New project</VButton>
      </div>
    </template>
  </VDataTable>
</template>

<style scoped>
.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--vectis-space-3);
}
</style>
