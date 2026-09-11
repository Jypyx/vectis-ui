<script setup lang="ts">
import { VDataTable } from 'vectis-ui'

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
]
</script>

<template>
  <!-- The threshold is the COMPONENT's own width, not the window's, so the box below is
       resizable: drag its corner past 640px and the cards become a table again. -->
  <div class="box">
    <VDataTable
      responsive="stack"
      variant="outlined"
      :columns="columns"
      :rows="rows"
      row-key="name"
      title="Projects"
      selectable
      caption="Organisation projects"
    />
  </div>
</template>

<style scoped>
.box {
  overflow: auto;
  inline-size: 24rem;
  min-inline-size: 15rem;
  max-inline-size: 100%;
  padding: var(--vectis-space-1);
  resize: horizontal;
}
</style>
