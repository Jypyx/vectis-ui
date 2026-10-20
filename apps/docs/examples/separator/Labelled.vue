<script setup lang="ts">
import { VSeparator } from 'vectis-ui'
import { star } from 'vectis-ui/icons'
</script>

<template>
  <div class="stack">
    <VSeparator label="or" />
    <VSeparator :icon="star" content-position="start" />
    <VSeparator :icon="star" label="Featured" content-position="end" />
  </div>
</template>

<style scoped>
.stack {
  display: grid;
  gap: var(--vectis-space-6);
  max-inline-size: 22rem;
}
</style>
