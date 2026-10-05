<script setup lang="ts">
import { VButton, VEmptyState } from 'vectis-ui'
import { description } from 'vectis-ui/icons'
</script>

<template>
  <VEmptyState
    :icon="description"
    title="No invoices yet"
    description="Invoices you create or import appear here."
  >
    <template #actions>
      <VButton>Create an invoice</VButton>
      <VButton variant="outline" tone="neutral">Import</VButton>
    </template>
  </VEmptyState>
</template>
