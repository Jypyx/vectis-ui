<script setup lang="ts">
import { VMenuItem, VSplitButton } from 'vectis-ui'
import { description } from 'vectis-ui/icons'
</script>

<template>
  <VSplitButton
    href="#link-and-icons"
    variant="outline"
    tone="neutral"
    :icon-start="description"
    menu-label="Other formats"
    label="Open report"
  >
    <VMenuItem label="Download as CSV" />
    <VMenuItem label="Download as PDF" />
  </VSplitButton>
</template>
