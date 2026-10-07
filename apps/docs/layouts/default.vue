<script setup lang="ts">
/** Mount one VSnackbar for confirmations across the site. */
import { VSnackbar } from 'vectis-ui'

withDefaults(defineProps<{ showFooter?: boolean }>(), { showFooter: true })
</script>

<template>
  <div class="vd-shell">
    <DocsHeader />
    <slot />
    <DocsFooter v-if="showFooter" />
    <VSnackbar />
  </div>
</template>
