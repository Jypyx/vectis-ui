<script setup lang="ts">
import { VTypography } from 'vectis-ui'
</script>

<template>
  <article class="article">
    <VTypography variant="overline" tone="muted">Release notes</VTypography>
    <VTypography variant="heading-3" as="h2">What changed in this version</VTypography>
    <VTypography variant="body-lg" tone="muted">
      A short standfirst, set one step above the body so the eye knows where to start.
    </VTypography>
    <VTypography variant="body-md">
      The body role carries the line height a paragraph needs at its size, and long words break
      rather than push a column out of shape. An inline role sits inside it without disturbing the
      line: a value such as
      <VTypography variant="code" as="span">--vectis-text-body-md-size</VTypography>
      keeps its own family and size while the leading stays the paragraph's.
    </VTypography>
    <VTypography variant="caption" tone="subtle">Published on 12 September 2026</VTypography>
  </article>
</template>

<style scoped>
.article {
  display: grid;
  justify-items: start;
  gap: var(--vectis-space-3);
  max-inline-size: 34rem;
}
</style>
