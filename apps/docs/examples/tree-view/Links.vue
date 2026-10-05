<script setup lang="ts">
import { ref } from 'vue'
import { VTreeView } from 'vectis-ui'
import type { TreeItem } from 'vectis-ui'

const items: TreeItem[] = [
  {
    value: 'guides',
    label: 'Guides',
    children: [
      { value: 'installation', label: 'Installation', href: '#links' },
      { value: 'theming', label: 'Theming', href: '#links' },
    ],
  },
  {
    value: 'components',
    label: 'Components',
    children: [
      { value: 'button', label: 'Button', href: '#links' },
      { value: 'tree-view', label: 'Tree view', href: '#links', current: true },
    ],
  },
  { value: 'changelog', label: 'Changelog', href: '#links' },
]

const expanded = ref(['components'])
</script>

<template>
  <VTreeView v-model:expanded="expanded" :items="items" label="Site" size="sm" class="tree" />
</template>

<style scoped>
.tree {
  max-inline-size: 16rem;
}
</style>
