<script setup lang="ts">
import { VButton, VInput, VInputGroup } from 'vectis-ui'
</script>

<template>
  <div class="column">
    <VInputGroup disabled label="The whole row switched off" hint="Nothing here can be reached">
      <VInput aria-label="Amount" model-value="1200" />
      <VButton variant="solid" tone="accent">Convert</VButton>
    </VInputGroup>

    <VInputGroup label="One segment disabled on its own">
      <VInput aria-label="Amount" model-value="1200" />
      <VInput disabled aria-label="Converted amount" model-value="1284.50" />
    </VInputGroup>

    <VInputGroup label="A segment in error">
      <VInput invalid aria-label="Email" model-value="not-an-address" />
      <VButton variant="outline" tone="neutral">Check</VButton>
    </VInputGroup>
  </div>
</template>

<style scoped>
.column {
  display: flex;
  flex-direction: column;
  gap: var(--vectis-space-5);
  max-inline-size: 26rem;
}
</style>
