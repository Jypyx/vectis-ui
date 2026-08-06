<script setup lang="ts">
/*
 * The narrow-viewport navigation: the same `<DocsSidebar />` inside a `VDialog`.
 *
 * A `<dialog>` opened with `showModal()` gives the focus trap, the inert background,
 * Escape, the `::backdrop` and the focus return to the trigger — natively, which is
 * philosophy rule 1 applied literally rather than quoted.
 *
 * The drawer shape (full height, flush to the inline start, no centring) comes from an
 * UNLAYERED docs rule on `.docs-drawer`, which beats `@layer vectis.components` by
 * construction. The site therefore demonstrates the DS's documented override mechanism
 * instead of working around it.
 *
 * The only behavioural JS is closing on navigation: the drawer sits outside the routed
 * content, so nothing would otherwise dismiss it after a link is followed.
 */
import { useRoute } from 'vitepress'
import { VDialog } from '@vectis/ui'
import { watch } from 'vue'

import DocsSidebar from './DocsSidebar.vue'

const open = defineModel<boolean>('open', { default: false })

const route = useRoute()
watch(
  () => route.path,
  () => {
    open.value = false
  },
)
</script>

<template>
  <VDialog v-model:open="open" class="docs-drawer" title="Documentation" width="20rem">
    <DocsSidebar />
  </VDialog>
</template>
