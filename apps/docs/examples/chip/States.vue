<script setup lang="ts">
import { VChip } from 'vectis-ui'

const variants = ['soft', 'solid', 'outline'] as const
</script>

<template>
  <div class="row">
    <VChip v-for="variant in variants" :key="variant" :variant="variant" tone="accent" disabled>
      {{ variant }}
    </VChip>
  </div>

  <div class="row">
    <VChip clickable disabled>Clickable</VChip>
    <VChip href="https://vuejs.org" disabled>Inert link</VChip>
    <VChip selectable check :selected="true" tone="accent" disabled>Selected</VChip>
    <VChip dismissible disabled>Dismissible</VChip>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--vectis-space-2);
}
</style>
