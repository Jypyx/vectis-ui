<script setup lang="ts">
import { VButton, VButtonGroup } from 'vectis-ui'
</script>

<template>
  <VButtonGroup variant="outline" tone="neutral" aria-label="Sections of this page">
    <VButton href="#usage">Usage</VButton>
    <VButton href="#examples">Examples</VButton>
    <VButton href="#api">API</VButton>
    <VButton href="#usage" disabled>Changelog</VButton>
  </VButtonGroup>
</template>
