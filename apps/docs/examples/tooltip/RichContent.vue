<script setup lang="ts">
import { VButton, VHotkeys, VTooltip, VTypography } from 'vectis-ui'
</script>

<template>
  <VTooltip placement="bottom-start">
    <template #default="{ triggerProps }">
      <VButton variant="outline" tone="neutral" v-bind="triggerProps">Search</VButton>
    </template>

    <template #content>
      <div class="content">
        <VTypography variant="label" as="strong">Global search</VTypography>
        <span>Looks through projects, files and people.</span>
        <span class="shortcut">
          Shortcut
          <VHotkeys keys="mod+k" variant="outline" />
        </span>
      </div>
    </template>
  </VTooltip>
</template>

<style scoped>
.content {
  display: grid;
  gap: var(--vectis-space-1);
  padding-block: var(--vectis-space-1);
}
.shortcut {
  display: flex;
  align-items: center;
  gap: var(--vectis-space-2);
}
</style>
