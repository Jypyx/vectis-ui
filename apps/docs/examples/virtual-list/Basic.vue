<script setup lang="ts">
import { VVirtualList } from 'vectis-ui'

const invoices = Array.from({ length: 10000 }, (_, i) => ({
  id: i + 1,
  amount: ((i * 7919) % 100000) / 100,
}))
</script>

<template>
  <VVirtualList :items="invoices" item-key="id" :height="320" label="Invoices" class="list">
    <template #default="{ item }">
      <div class="row">
        <span>Invoice {{ item.id }}</span>
        <span>{{ item.amount.toFixed(2) }} €</span>
      </div>
    </template>
  </VVirtualList>
</template>

<style scoped>
.list {
  max-inline-size: 420px;
  border: 1px solid var(--vectis-color-border);
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-block-size: 40px;
  padding-inline: var(--vectis-space-3);
  border-block-end: 1px solid var(--vectis-color-border);
}
</style>
