<script setup lang="ts">
import { VMenuItem, VSplitButton } from 'vectis-ui'
</script>

<template>
  <div class="column">
    <VSplitButton full-width match-trigger placement="bottom-start" label="Export">
      <VMenuItem label="Export as CSV" />
      <VMenuItem label="Export as PDF" />
      <VMenuItem label="Export as JSON" />
    </VSplitButton>
  </div>
</template>

<style scoped>
.column {
  max-inline-size: 22rem;
}
</style>
