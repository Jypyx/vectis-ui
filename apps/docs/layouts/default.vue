<script setup lang="ts">
/**
 * The site's frame: the accent-repointed shell, the header, and the two things that must
 * exist exactly once on the page.
 *
 * VToaster is mounted here rather than per page because `toast()` is module-level state with
 * a single renderer — the copy buttons scattered through the documentation all raise their
 * notification into this one. The search dialog is a sibling of the header for the same
 * reason: one panel, opened from several places.
 */
import { VToaster } from '@vectis/ui'
</script>

<template>
  <div class="vd-shell">
    <DocsHeader />
    <slot />
    <DocsSearch />
    <VToaster />
  </div>
</template>
