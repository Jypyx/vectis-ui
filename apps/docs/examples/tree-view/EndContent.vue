<script setup lang="ts">
import { ref } from 'vue'
import { VBadge, VTreeView } from 'vectis-ui'
import type { TreeItem } from 'vectis-ui'

const items: TreeItem[] = [
  {
    value: 'inbox',
    label: 'Inbox',
    children: [
      { value: 'work', label: 'Work' },
      { value: 'family', label: 'Family' },
    ],
  },
  { value: 'drafts', label: 'Drafts' },
  { value: 'spam', label: 'Spam' },
]

const unread: Record<string, number> = { inbox: 12, work: 9, family: 3, spam: 41 }
const expanded = ref(['inbox'])
</script>

<template>
  <VTreeView v-model:expanded="expanded" :items="items" label="Mail" class="tree">
    <template #end="{ item }">
      <VBadge v-if="unread[item.value]" :count="unread[item.value]" variant="soft" tone="neutral" />
    </template>
  </VTreeView>
</template>

<style scoped>
.tree {
  max-inline-size: 22rem;
}
</style>
