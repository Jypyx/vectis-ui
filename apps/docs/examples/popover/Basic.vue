<script setup lang="ts">
import { VButton, VPopover, VTypography } from 'vectis-ui'
</script>

<template>
  <VPopover>
    <template #trigger="{ triggerProps }">
      <VButton variant="outline" tone="neutral" v-bind="triggerProps">Details</VButton>
    </template>
    <VTypography>Anyone with the link can open this file.</VTypography>
  </VPopover>
</template>
