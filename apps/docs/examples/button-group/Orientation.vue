<script setup lang="ts">
import { VButton, VButtonGroup } from 'vectis-ui'
</script>

<template>
  <VButtonGroup variant="outline" tone="neutral" aria-label="Range, as a row">
    <VButton>Day</VButton>
    <VButton>Week</VButton>
    <VButton>Month</VButton>
  </VButtonGroup>

  <VButtonGroup
    orientation="vertical"
    variant="outline"
    tone="neutral"
    aria-label="Range, as a column"
  >
    <VButton>Day</VButton>
    <VButton>Week</VButton>
    <VButton>Month</VButton>
  </VButtonGroup>
</template>
