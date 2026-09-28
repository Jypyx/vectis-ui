<script setup lang="ts">
/**
 * The site's frame: the accent-repointed shell, the header, the footer, and the two things that
 * must exist exactly once on the page. VSnackbar is mounted here rather than per page because
 * `snackbar()` is module-level state with a single renderer; the copy buttons scattered through
 * the documentation all raise their confirmation into this one.
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
