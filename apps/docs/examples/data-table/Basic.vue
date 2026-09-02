<script setup lang="ts">
import { VDataTable } from 'vectis-ui'

const columns = [
  { key: 'name', label: 'Project' },
  { key: 'owner', label: 'Owner' },
  { key: 'commits', label: 'Commits' },
]

const rows = [
  { name: 'Vectis UI', owner: 'Ada Lovelace', commits: 320 },
  { name: 'Atlas', owner: 'Grace Hopper', commits: 87 },
  { name: 'Meridian', owner: 'Alan Turing', commits: 44 },
]
</script>

<template>
  <VDataTable :columns="columns" :rows="rows" row-key="name" caption="Projects" />
</template>
