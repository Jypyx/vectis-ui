<script setup lang="ts">
import { h } from 'vue'
import { VIcon } from 'vectis-ui'
import { ICON_VIEW_BOX, cloud_upload as cloudUpload, code, search } from 'vectis-ui/icons'

import firefoxLogo from '~/assets/img/firefox-browser-svg.svg'

/* A component icon, the shape an icon set such as Lucide ships: the contract is a
   single <svg> root. The drawing is borrowed from the library's own registry rather
   than redrawn here. */
const CodeIcon = () =>
  h('svg', { viewBox: ICON_VIEW_BOX, fill: 'currentColor' }, [h('path', { d: code.paths[0] })])
</script>

<template>
  <div class="grid">
    <!-- `render` wins over everything, and short-circuits the resolver with it. -->
    <figure>
      <VIcon :render="{ path: cloudUpload.paths[0] }" :size="28" />
      <figcaption>render, as SVG path data</figcaption>
    </figure>

    <figure>
      <VIcon :render="{ component: CodeIcon }" :size="28" />
      <figcaption>render, as a component</figcaption>
    </figure>

    <figure>
      <VIcon :src="firefoxLogo" :size="28" />
      <figcaption>src, an image file</figcaption>
    </figure>

    <!-- One of the library's own icons: a name travelling with its drawing. The
         resolver is still asked for that name first, and the drawing answers when
         nothing else does. -->
    <figure>
      <VIcon :name="search" :size="28" />
      <figcaption>name, from the library</figcaption>
    </figure>

    <!-- A plain string is only ever a name. Nothing in the registry answers to this
         one, so it is left to a ligature font, which this site does not load: what
         you see is the fallback, the name drawn as its own text. -->
    <figure>
      <VIcon name="translate" :size="28" />
      <figcaption>name, unresolved</figcaption>
    </figure>

    <!-- Last resort: the slot, reached when neither `name` nor `src` was given. -->
    <figure>
      <VIcon :size="28">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 4v16M4 12h16" stroke-linecap="round" />
        </svg>
      </VIcon>
      <figcaption>an inline SVG, through the slot</figcaption>
    </figure>
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));
  gap: var(--vectis-space-5);
}
figure {
  display: grid;
  justify-items: center;
  gap: var(--vectis-space-2);
  margin: 0;
}
figcaption {
  color: var(--vectis-color-text-muted);
  font-size: var(--vectis-text-caption-size);
  text-align: center;
}
</style>
