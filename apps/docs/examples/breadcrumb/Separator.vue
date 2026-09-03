<script setup lang="ts">
import { VBreadcrumb } from 'vectis-ui'
import { arrow_right_alt as arrowRightAlt } from 'vectis-ui/icons'

import slash from '~/assets/img/breadcrumb-slash.svg'

const items = [
  { label: 'Home', href: '/app' },
  { label: 'Projects', href: '/app/projects' },
  { label: 'Vectis UI', href: '/app/projects/vectis-ui' },
]
</script>

<template>
  <VBreadcrumb
    :items="items"
    current-path="/app/projects/vectis-ui"
    :separator="arrowRightAlt"
    label="Trail with an icon separator"
  />

  <VBreadcrumb
    :items="items"
    current-path="/app/projects/vectis-ui"
    :separator="{ src: slash }"
    label="Trail with an image separator"
  />
</template>
