<script setup lang="ts">
import { VVirtualList } from 'vectis-ui'

const notes = Array.from({ length: 2000 }, (_, i) => ({
  id: i + 1,
  text:
    i % 3 === 0
      ? 'Paid in three instalments after a dispute about the delivery date, settled with a discount on the next order.'
      : 'Paid on delivery.',
}))
</script>

<template>
  <VVirtualList
    :items="notes"
    item-key="id"
    :item-size="64"
    :height="320"
    label="Notes"
    class="list"
  >
    <template #default="{ item }">
      <article class="note">
        <strong>Note {{ item.id }}</strong>
        <p>{{ item.text }}</p>
      </article>
    </template>
  </VVirtualList>
</template>

<style scoped>
.list {
  max-inline-size: 360px;
  border: 1px solid var(--vectis-color-border);
}

.note {
  padding: var(--vectis-space-2) var(--vectis-space-3);
  border-block-end: 1px solid var(--vectis-color-border);
}

.note p {
  margin: var(--vectis-space-1) 0 0;
  color: var(--vectis-color-text-muted);
}
</style>
