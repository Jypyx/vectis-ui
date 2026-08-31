<script setup lang="ts">
/**
 * The site's frame: the accent-repointed shell, the header, the footer, and the two things that
 * must exist exactly once on the page.
 *
 * VSnackbar is mounted here rather than per page because `snackbar()` is module-level state
 * with a single renderer — the copy buttons scattered through the documentation all raise their
 * confirmation into this one. The search dialog is a sibling of the header for the same
 * reason: one panel, opened from several places.
 *
 * A snackbar and not a toast, and the difference is the message: copying a sample is something
 * the reader just DID, which is what a snackbar is for. Only one can be showing, so a reader
 * running down a page copying three samples gets one bar that keeps saying so rather than a
 * stack of three.
 *
 * `showFooter` exists for ONE caller: `layouts/docs.vue` nests inside this layout and needs the
 * footer beside its navigation rail rather than full width below it, so it turns this off and
 * mounts its own copy inside the grid. Every other page in this layout gets one without asking.
 */
import { VSnackbar } from 'vectis-ui'

withDefaults(defineProps<{ showFooter?: boolean }>(), { showFooter: true })
</script>

<template>
  <div class="vd-shell">
    <DocsHeader />
    <slot />
    <DocsFooter v-if="showFooter" />
    <DocsSearch />
    <VSnackbar />
  </div>
</template>
