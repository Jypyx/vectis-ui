<script setup lang="ts">
import { VButton, VTooltip } from 'vectis-ui'
</script>

<template>
  <VTooltip text="Copy to the clipboard">
    <template #default="{ triggerProps }">
      <VButton variant="outline" tone="neutral" v-bind="triggerProps">Copy</VButton>
    </template>
  </VTooltip>
</template>
