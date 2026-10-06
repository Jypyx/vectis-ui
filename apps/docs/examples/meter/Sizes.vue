<script setup lang="ts">
import { VMeter } from 'vectis-ui'
</script>

<template>
  <div class="meters">
    <VMeter size="sm" label="Small" :value="40" />
    <VMeter size="md" label="Medium" :value="40" />
    <VMeter size="lg" label="Large" :value="40" />
  </div>
</template>

<style scoped>
.meters {
  display: grid;
  gap: var(--vectis-space-5);
  max-inline-size: 20rem;
}
</style>
