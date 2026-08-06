<script setup lang="ts">
/*
 * The three-state theme switch: a `VToggle` in `mandatory` mode, icon-only.
 *
 * `mandatory` is what forbids deselecting the current segment — without it a click on
 * the active one would leave the group with no value, and the store with no answer.
 *
 * The store lives in `Layout.vue` (one per document) and is passed in as a model, so the
 * `data-theme` mirror is installed once no matter how many switches are rendered.
 */
import { VToggle, VToggleItem } from '@vectis/ui'

import type { Appearance } from '../composables/useDocsTheme'

const appearance = defineModel<Appearance>({ required: true })
</script>

<template>
  <VToggle
    v-model="appearance"
    class="docs-theme-toggle"
    label="Colour theme"
    size="sm"
    mandatory
    selected-icon-filled
  >
    <VToggleItem value="system" icon="computer" aria-label="Follow the system theme" />
    <VToggleItem value="light" icon="light_mode" aria-label="Light theme" />
    <VToggleItem value="dark" icon="dark_mode" aria-label="Dark theme" />
  </VToggle>
</template>
