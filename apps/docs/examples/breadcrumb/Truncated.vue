<script setup lang="ts">
import { VBreadcrumb } from 'vectis-ui'

const items = [
  { label: 'Home', href: '/app' },
  { label: 'Projects', href: '/app/projects' },
  { label: 'Vectis UI', href: '/app/projects/vectis-ui' },
  { label: 'Components', href: '/app/projects/vectis-ui/components' },
  { label: 'Breadcrumb', href: '/app/projects/vectis-ui/components/breadcrumb' },
  { label: 'Accessibility', href: '/app/projects/vectis-ui/components/breadcrumb/a11y' },
]
</script>

<template>
  <VBreadcrumb
    :items="items"
    current-path="/app/projects/vectis-ui/components/breadcrumb/a11y"
    :max-items="4"
  />
</template>
