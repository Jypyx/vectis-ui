<script setup lang="ts">
import { VColorInput } from 'vectis-ui'
</script>

<template>
  <div class="column">
    <VColorInput model-value="#7c3aed" label="Read-only" readonly />
    <VColorInput model-value="#7c3aed" label="Disabled" disabled />
  </div>
</template>

<style scoped>
.column {
  display: flex;
  flex-direction: column;
  gap: var(--vectis-space-5);
  max-inline-size: 20rem;
}
</style>
