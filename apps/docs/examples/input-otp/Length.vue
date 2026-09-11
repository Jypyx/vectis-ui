<script setup lang="ts">
import { VInputOTP, VTypography } from 'vectis-ui'
</script>

<template>
  <div class="column">
    <div class="row">
      <VInputOTP :length="4" label="Four digit code" />
      <VTypography variant="caption" tone="muted">4, a PIN</VTypography>
    </div>

    <div class="row">
      <VInputOTP :length="6" label="Six digit code" />
      <VTypography variant="caption" tone="muted">6, the default</VTypography>
    </div>

    <div class="row">
      <VInputOTP :length="8" label="Eight digit code" />
      <VTypography variant="caption" tone="muted">8, a backup code</VTypography>
    </div>
  </div>
</template>

<style scoped>
.column {
  display: grid;
  gap: var(--vectis-space-4);
}
.row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--vectis-space-4);
}
</style>
