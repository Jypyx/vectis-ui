<script setup lang="ts">
import { computed, ref } from 'vue'
import { VTreeView, VTypography } from 'vectis-ui'
import type { TreeItem, TreeViewModelValue } from 'vectis-ui'

const items: TreeItem[] = [
  {
    value: 'content',
    label: 'Content',
    children: [
      { value: 'read', label: 'Read' },
      { value: 'write', label: 'Write' },
      { value: 'publish', label: 'Publish' },
    ],
  },
  {
    value: 'billing',
    label: 'Billing',
    children: [
      { value: 'invoices', label: 'Invoices' },
      { value: 'refunds', label: 'Refunds', disabled: true },
    ],
  },
  { value: 'audit', label: 'Audit log' },
]

const selected = ref<TreeViewModelValue>(['read', 'write'])
const expanded = ref(['content', 'billing'])
const summary = computed(() => [selected.value ?? []].flat().join(', ') || 'none')
</script>

<template>
  <div class="demo">
    <VTreeView
      v-model="selected"
      v-model:expanded="expanded"
      :items="items"
      selection-mode="multiple"
      label="Permissions"
    />
    <VTypography variant="body-sm" tone="muted">Selected: {{ summary }}</VTypography>
  </div>
</template>

<style scoped>
.demo {
  display: grid;
  gap: var(--vectis-space-3);
  max-inline-size: 22rem;
}
</style>
