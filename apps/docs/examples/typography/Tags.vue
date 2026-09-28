<script setup lang="ts">
import { VInput, VTypography } from 'vectis-ui'
</script>

<template>
  <div class="demo">
    <VTypography variant="heading-4">Rendered as an h4, which is its default</VTypography>

    <VTypography variant="heading-4" as="h2">Reads as an h4, is really an h2</VTypography>

    <VTypography variant="label" as="label" for="reference">Reference</VTypography>
    <VInput id="reference" model-value="INV-2481" />
  </div>
</template>

<style scoped>
.demo {
  display: grid;
  justify-items: start;
  gap: var(--vectis-space-3);
  max-inline-size: 22rem;
}
</style>
