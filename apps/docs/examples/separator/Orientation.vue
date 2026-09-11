<script setup lang="ts">
import { VSeparator, VTypography } from 'vectis-ui'
</script>

<template>
  <div class="stack">
    <!-- Across the page, the default. The rule ships no margin of its own, so the space
         around it is the `gap` of the column that holds it. -->
    <div class="card">
      <VTypography variant="heading-4">Project settings</VTypography>
      <VSeparator />
      <VTypography variant="body-sm" tone="muted">
        Who can open this project, and what they may change.
      </VTypography>
    </div>

    <!-- Upright, as a flex item: it takes the height of its line on its own, whatever
         the container aligns its items to. Nothing to set. -->
    <div class="meta">
      <VTypography as="span" variant="body-sm">Draft</VTypography>
      <VSeparator orientation="vertical" />
      <VTypography as="span" variant="body-sm">Edited 2 days ago</VTypography>
      <VSeparator orientation="vertical" />
      <VTypography as="span" variant="body-sm">3 comments</VTypography>
    </div>

    <!-- TRAP: an <hr> has no height of its own. Outside a flex or grid line the rule
         collapses to nothing, silently and with no error, so in ordinary flow it needs
         a height of yours. -->
    <div class="flow">
      <VSeparator orientation="vertical" class="standing" />
      <VTypography variant="body-sm" tone="muted">
        In ordinary flow, a height has to be given: here 3rem.
      </VTypography>
    </div>
  </div>
</template>

<style scoped>
.stack {
  display: grid;
  gap: var(--vectis-space-6);
  max-inline-size: 30rem;
}
.card {
  display: grid;
  gap: var(--vectis-space-3);
  padding: var(--vectis-space-4);
  border: 1px solid var(--vectis-color-border);
  border-radius: var(--vectis-radius-surface);
}
.meta {
  display: flex;
  align-items: center;
  gap: var(--vectis-space-3);
}
.flow {
  display: flex;
  align-items: center;
  gap: var(--vectis-space-3);
}
.standing {
  block-size: 3rem;
}
</style>
