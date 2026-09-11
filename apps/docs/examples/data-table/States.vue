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
    <!-- Loading is answered before emptiness, so a table waiting for its rows never
         claims there are none. -->
    <VDataTable
      loading
      variant="outlined"
      :columns="columns"
      :rows="[]"
      title="Loading"
      caption="Projects being loaded"
    />

    <VDataTable
      variant="outlined"
      :columns="columns"
      :rows="[]"
      empty-text="No project yet"
      title="Nothing to show"
      caption="Projects, none of them"
    />
  </div>
</template>

<style scoped>
.stack {
  display: grid;
  gap: var(--vectis-space-6);
}
</style>
