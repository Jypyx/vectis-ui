<script setup lang="ts">
import { VBadge } from 'vectis-ui'
import { check, close, warning } from 'vectis-ui/icons'
</script>

<template>
  <VBadge :icon="check" tone="success" />
  <VBadge :icon="warning" tone="warning" />
  <VBadge :icon="close" tone="danger" />
</template>
