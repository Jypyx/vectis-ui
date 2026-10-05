<script setup lang="ts">
import { ref } from 'vue'
import { VTreeView, VTypography } from 'vectis-ui'
import type { TreeItem, TreeViewModelValue } from 'vectis-ui'

const items: TreeItem[] = [
  {
    value: 'europe',
    label: 'Europe',
    children: [
      { value: 'paris', label: 'Paris' },
      { value: 'berlin', label: 'Berlin' },
      { value: 'madrid', label: 'Madrid', disabled: true },
    ],
  },
  {
    value: 'asia',
    label: 'Asia',
    children: [
      { value: 'tokyo', label: 'Tokyo' },
      { value: 'seoul', label: 'Seoul' },
    ],
  },
]

const selected = ref<TreeViewModelValue>('berlin')
const expanded = ref(['europe'])
</script>

<template>
  <div class="demo">
    <VTreeView
      v-model="selected"
      v-model:expanded="expanded"
      :items="items"
      selection-mode="single"
      label="Offices"
    />
    <VTypography variant="body-sm" tone="muted">Selected: {{ selected ?? 'none' }}</VTypography>
  </div>
</template>

<style scoped>
.demo {
  display: grid;
  gap: var(--vectis-space-3);
  max-inline-size: 22rem;
}
</style>
