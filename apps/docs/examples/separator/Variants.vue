<script setup lang="ts">
import { VSeparator } from 'vectis-ui'
</script>

<template>
  <div class="stack">
    <VSeparator />
    <VSeparator variant="dashed" />
    <VSeparator variant="dotted" size="md" />
    <VSeparator size="lg" color="oklch(0.6 0.2 260)" />
    <VSeparator variant="dashed" size="md" color="oklch(0.6 0.2 260)" label="End of list" />
  </div>
</template>

<style scoped>
.stack {
  display: grid;
  gap: var(--vectis-space-6);
  max-inline-size: 22rem;
}
</style>
