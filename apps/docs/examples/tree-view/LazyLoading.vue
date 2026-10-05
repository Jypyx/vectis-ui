<script setup lang="ts">
import { VTreeView } from 'vectis-ui'
import type { TreeItem } from 'vectis-ui'

const items: TreeItem[] = [
  { value: 'eu-west', label: 'eu-west', lazy: true },
  { value: 'us-east', label: 'us-east', lazy: true },
]

// Stands in for a request to your server.
function loadChildren(item: TreeItem): Promise<TreeItem[]> {
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve(
          [1, 2, 3].map((n) => ({
            value: `${item.value}-${n}`,
            label: `${item.label}-node-${n}`,
            lazy: n === 1,
          })),
        ),
      800,
    ),
  )
}
</script>

<template>
  <VTreeView :items="items" :load-children="loadChildren" label="Servers" class="tree" />
</template>

<style scoped>
.tree {
  max-inline-size: 22rem;
}
</style>
