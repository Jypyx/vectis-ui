<script setup lang="ts">
import { VIcon, VIconButton } from 'vectis-ui'
import { ICON_VIEW_BOX, code, notifications, search } from 'vectis-ui/icons'

import firefoxLogo from '~/assets/img/firefox-browser-svg.svg'
</script>

<template>
  <!-- `icon` takes everything an icon prop in the library takes: one of its own icons,
       a bare name for your resolver, or an explicit render. -->
  <VIconButton :icon="search" variant="outline" label="Search" />
  <VIconButton icon="translate" variant="outline" label="Translate" />
  <VIconButton :icon="{ path: code.paths[0] }" variant="outline" label="View the source" />
  <VIconButton :icon="{ src: firefoxLogo }" variant="outline" label="Open in Firefox" />

  <!-- Filled marks a state, here a notification that has arrived. -->
  <VIconButton :icon="notifications" icon-filled variant="outline" label="3 new notifications" />

  <!-- The slot is the way to an icon the prop cannot express: a VIcon you configure
       yourself, or an inline SVG. The button is already named by its label, so whatever
       goes in here stays decorative. -->
  <VIconButton variant="outline" label="Notifications, larger glyph">
    <VIcon :name="notifications" :size="28" />
  </VIconButton>
  <VIconButton variant="outline" label="Add">
    <svg :viewBox="ICON_VIEW_BOX" fill="none" stroke="currentColor" stroke-width="80">
      <path d="M480-800v640M160-480h640" stroke-linecap="round" />
    </svg>
  </VIconButton>
</template>
