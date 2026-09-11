<script setup lang="ts">
import { VProgressLinear, VTypography } from 'vectis-ui'
</script>

<template>
  <div class="column">
    <!-- One bar crosses the track, flush with each edge at the extremes, so the loop is
         invisible and the track is never empty. The value is ignored: there is nothing
         to report. -->
    <VProgressLinear indeterminate aria-label="Waiting for the server" />

    <VProgressLinear indeterminate tone="neutral" thickness="8" aria-label="Loading" />

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
