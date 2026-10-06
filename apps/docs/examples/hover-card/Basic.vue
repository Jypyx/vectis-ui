<script setup lang="ts">
import { VAvatar, VButton, VHoverCard, VLink, VTypography } from 'vectis-ui'
</script>

<template>
  <VHoverCard>
    <template #default="{ triggerProps }">
      <VLink href="#ada" v-bind="triggerProps">@ada</VLink>
    </template>
    <template #content>
      <div class="header">
        <VAvatar name="Ada Lovelace" size="lg" />
        <div>
          <VTypography variant="subtitle">Ada Lovelace</VTypography>
          <VTypography variant="body-sm" tone="muted">@ada</VTypography>
        </div>
      </div>
      <VTypography variant="body-sm">
        Mathematician. Wrote the first published algorithm for the Analytical Engine.
      </VTypography>
      <div class="actions">
        <VButton size="sm">Follow</VButton>
      </div>
    </template>
  </VHoverCard>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  gap: var(--vectis-space-3);
}
.actions {
  display: flex;
  gap: var(--vectis-space-2);
}
</style>
