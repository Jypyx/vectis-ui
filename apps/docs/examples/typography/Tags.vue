<script setup lang="ts">
import { VInput, VTypography } from 'vectis-ui'
</script>

<template>
  <div class="demo">
    <!-- Each variant already renders a sensible tag: h1 to h4 for the headings, p for
         the body roles, span for the small ones, code for code. -->
    <VTypography variant="heading-4">Rendered as an h4, which is its default</VTypography>

    <!-- `as` is for the cases where the meaning and the look part ways: a section that
         is an h2 in the document but should read at the size of an h4. -->
    <VTypography variant="heading-4" as="h2">Reads as an h4, is really an h2</VTypography>

    <!-- With a single root and no attributes of its own, everything falls through. A
         label variant rendered as a real label, pointing at a real field, is a working
         pair rather than a resemblance. -->
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
