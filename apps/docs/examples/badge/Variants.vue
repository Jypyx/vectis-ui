<script setup lang="ts">
import { VBadge } from 'vectis-ui'
</script>

<template>
  <VBadge :count="8" variant="solid" />
  <VBadge :count="8" variant="soft" />
  <VBadge :count="8" variant="solid" tone="danger" />
  <VBadge :count="8" variant="soft" tone="danger" />
</template>
