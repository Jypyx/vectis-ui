<script setup lang="ts">
import { ref } from 'vue'
import { VButton, VVirtualList, type VirtualListAlign } from 'vectis-ui'

const invoices = Array.from({ length: 10000 }, (_, i) => ({ id: i + 1 }))
const list = ref<{ scrollToIndex: (index: number, align?: VirtualListAlign) => void } | null>(null)
</script>

<template>
  <div class="stack">
    <div class="actions">
      <VButton @click="list?.scrollToIndex(4999, 'center')">Go to invoice 5,000</VButton>
      <VButton variant="outline" @click="list?.scrollToIndex(0, 'start')">Back to the top</VButton>
    </div>
    <VVirtualList
      ref="list"
      :items="invoices"
      item-key="id"
      :height="320"
      label="Invoices"
      class="list"
    >
      <template #default="{ item }">
        <div class="row">Invoice {{ item.id }}</div>
      </template>
    </VVirtualList>
  </div>
</template>

<style scoped>
.stack {
  display: grid;
  gap: var(--vectis-space-3);
  max-inline-size: 420px;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--vectis-space-2);
}

.list {
  border: 1px solid var(--vectis-color-border);
}

.row {
  display: flex;
  align-items: center;
  min-block-size: 40px;
  padding-inline: var(--vectis-space-3);
  border-block-end: 1px solid var(--vectis-color-border);
}
</style>
