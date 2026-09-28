<script setup lang="ts">
import { VButton, VInput, VInputGroup } from 'vectis-ui'
</script>

<template>
  <div class="column">
    <!-- Name the group and each field separately. -->
    <VInputGroup label="Budget">
      <VInput aria-label="Amount" placeholder="0.00" />
      <VInput aria-label="Currency" placeholder="EUR" class="currency" />
    </VInputGroup>

    <!-- aria-label names the group without a visible label. -->
    <VInputGroup aria-label="Search the archive">
      <VInput type="search" aria-label="Search terms" placeholder="Search the archive" />
      <VButton variant="solid" tone="accent">Search</VButton>
    </VInputGroup>
  </div>
</template>

<style scoped>
.column {
  display: flex;
  flex-direction: column;
  gap: var(--vectis-space-5);
  max-inline-size: 24rem;
}

.currency {
  flex: 0 0 6rem;
}
</style>
