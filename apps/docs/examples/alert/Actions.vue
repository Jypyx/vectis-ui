<script setup lang="ts">
import { VAlert, VButton } from 'vectis-ui'
</script>

<template>
  <VAlert tone="danger" title="Payment failed">
    Check the card details and try again.
    <template #actions>
      <VButton size="sm" tone="danger">Retry</VButton>
      <VButton size="sm" variant="ghost" tone="neutral">View details</VButton>
    </template>
  </VAlert>
</template>
