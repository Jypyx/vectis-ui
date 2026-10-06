<script setup lang="ts">
import { VDataTable } from 'vectis-ui'

const columns = [
  { key: 'name', label: 'Project' },
  { key: 'owner', label: 'Owner' },
  { key: 'commits', label: 'Commits', align: 'end' as const },
]
</script>

<template>
  <div class="stack">
    <VDataTable loading variant="outline" :columns="columns" :rows="[]" title="Loading" />

    <VDataTable
      variant="outline"
      :columns="columns"
      :rows="[]"
      empty-text="No project yet"
      title="Nothing to show"
    />
  </div>
</template>

<style scoped>
.stack {
  display: grid;
  gap: var(--vectis-space-6);
}
</style>
