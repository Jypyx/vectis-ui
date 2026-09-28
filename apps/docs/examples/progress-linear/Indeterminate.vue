<script setup lang="ts">
import { VProgressLinear, VTypography } from 'vectis-ui'
</script>

<template>
  <div class="column">
    <VProgressLinear indeterminate label="Waiting for the server" />

    <VProgressLinear indeterminate tone="neutral" thickness="8" label="Loading" />

    <VTypography variant="body-sm" tone="muted">
      For a server that reports no percentage. Under reduced motion the bar is slowed rather than
      stopped: a motionless loader no longer says that anything is happening, which is the one thing
      it exists to say.
    </VTypography>
  </div>
</template>

<style scoped>
.column {
  display: grid;
  gap: var(--vectis-space-5);
  max-inline-size: 28rem;
}
</style>
