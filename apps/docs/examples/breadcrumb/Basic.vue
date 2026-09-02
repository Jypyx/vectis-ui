<script setup lang="ts">
import { VBreadcrumb } from 'vectis-ui'

const items = [
  { label: 'Home', href: '/app' },
  { label: 'Projects', href: '/app/projects' },
  { label: 'Vectis UI', href: '/app/projects/vectis-ui' },
]
</script>

<template>
  <VBreadcrumb :items="items" current-path="/app/projects/vectis-ui" />
</template>
