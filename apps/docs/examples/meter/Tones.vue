<script setup lang="ts">
import { VMeter } from 'vectis-ui'
</script>

<template>
  <div class="meters">
    <VMeter label="Accent" :value="60" tone="accent" />
    <VMeter label="Neutral" :value="60" tone="neutral" />
    <VMeter label="Danger" :value="60" tone="danger" />
    <VMeter label="Purple" :value="60" color="#7c3aed" />
  </div>
</template>

<style scoped>
.meters {
  display: grid;
  gap: var(--vectis-space-5);
  max-inline-size: 20rem;
}
</style>
