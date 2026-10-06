<script setup lang="ts">
import { VHoverCard, VLink, VTypography } from 'vectis-ui'
</script>

<template>
  <VHoverCard placement="bottom-start">
    <template #default="{ triggerProps }">
      <VLink href="#repository" v-bind="triggerProps">vectis-ui/vectis-ui</VLink>
    </template>
    <template #content>
      <VTypography variant="subtitle">vectis-ui/vectis-ui</VTypography>
      <VTypography variant="body-sm" tone="muted">
        A Vue 3 component library built for modern browsers.
      </VTypography>
      <nav aria-label="Repository" class="links">
        <VLink href="#issues" underline="hover">Issues</VLink>
        <VLink href="#pulls" underline="hover">Pull requests</VLink>
        <VLink href="#releases" underline="hover">Releases</VLink>
      </nav>
    </template>
  </VHoverCard>
</template>

<style scoped>
.links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--vectis-space-4);
}
</style>
