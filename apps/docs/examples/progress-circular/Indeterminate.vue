<script setup lang="ts">
import { VProgressCircular, VTypography } from 'vectis-ui'
</script>

<template>
  <div class="column">
    <div class="row">
      <!-- The ring turns and its arc grows and shrinks on a period of its own, the two
           offset so the movement never settles into a rhythm. The value is ignored:
           there is nothing to report. -->
      <VProgressCircular indeterminate aria-label="Waiting for the server" />
      <VProgressCircular indeterminate :size="64" tone="neutral" aria-label="Loading" />
      <VProgressCircular indeterminate :size="64" :thickness="10" aria-label="Working" />
    </div>

    <VTypography variant="body-sm" tone="muted">
      For a server that reports no percentage. Where a spinner would stand in for an icon, VSpinner
      is the smaller thing to reach for.
    </VTypography>
  </div>
</template>

<style scoped>
.column {
  display: grid;
  gap: var(--vectis-space-5);
}
.row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--vectis-space-6);
}
</style>
