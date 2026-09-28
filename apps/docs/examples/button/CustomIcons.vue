<script setup lang="ts">
import { h } from 'vue'
import { VButton } from 'vectis-ui'
import { ICON_VIEW_BOX, cloud_upload as cloudUpload, code, search } from 'vectis-ui/icons'

import firefoxLogo from '~/assets/img/firefox-browser-svg.svg'

// Component icon sources require a single SVG root.
const CodeIcon = () =>
  h('svg', { viewBox: ICON_VIEW_BOX, fill: 'currentColor' }, [h('path', { d: code.paths[0] })])
</script>

<template>
  <VButton :icon-start="search">A library icon</VButton>
  <VButton icon-start="translate" variant="outline" tone="neutral">A name</VButton>
  <VButton :icon-start="{ path: cloudUpload.paths[0] }" variant="outline" tone="neutral">
    SVG path data
  </VButton>
  <VButton :icon-start="{ component: CodeIcon }" variant="outline" tone="neutral">
    A component
  </VButton>
  <VButton :icon-start="{ src: firefoxLogo }" variant="outline" tone="neutral">An image</VButton>
</template>
