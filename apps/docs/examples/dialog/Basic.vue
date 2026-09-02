<script setup lang="ts">
import { ref } from 'vue'
import { VButton, VDialog, VTypography } from 'vectis-ui'

const open = ref(false)
</script>

<template>
  <VDialog v-model:open="open" title="Share this file" subtitle="Choose who can open it.">
    <template #trigger="{ triggerProps }">
      <VButton v-bind="triggerProps">Share</VButton>
    </template>
    <VTypography>Anyone with the link can open this file.</VTypography>
    <template #footer>
      <VButton variant="ghost" tone="neutral" @click="open = false">Cancel</VButton>
      <VButton @click="open = false">Share</VButton>
    </template>
  </VDialog>
</template>
