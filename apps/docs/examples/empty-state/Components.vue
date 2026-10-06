<script setup lang="ts">
import { ref } from 'vue'
import { VButton, VCombobox, VDataTable, VEmptyState } from 'vectis-ui'
import { inbox } from 'vectis-ui/icons'

const COLUMNS = [
  { key: 'name', label: 'Name' },
  { key: 'status', label: 'Status' },
]

const OPTIONS = [
  { value: 'fr', label: 'France' },
  { value: 'de', label: 'Germany' },
]

const country = ref('')
</script>

<template>
  <div class="stack">
    <VDataTable :columns="COLUMNS" :rows="[]" title="Orders" empty-text="No orders" />

    <VDataTable :columns="COLUMNS" :rows="[]" title="Orders">
      <template #empty>
        <VEmptyState
          size="sm"
          :icon="inbox"
          title="No orders yet"
          description="Orders placed by your customers appear here."
        >
          <template #actions>
            <VButton size="sm">Create an order</VButton>
          </template>
        </VEmptyState>
      </template>
    </VDataTable>

    <VCombobox
      v-model="country"
      class="combobox"
      :options="OPTIONS"
      label="Country"
      empty-text="No country found"
    />
  </div>
</template>

<style scoped>
.stack {
  display: grid;
  gap: var(--vectis-space-6);
}

.combobox {
  max-inline-size: 18rem;
}
</style>
