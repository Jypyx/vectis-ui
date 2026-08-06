<script setup lang="ts">
/*
 * The surface a component page frames its live examples in.
 *
 * Registered globally so a markdown page can use it without importing it; the components
 * being demonstrated are imported by the page's own `<script setup>` block, which is what
 * keeps a page from pulling in the whole library to show one button.
 */
withDefaults(defineProps<{ align?: 'start' | 'center' }>(), { align: 'start' })
</script>

<template>
  <div class="docs-demo" :data-align="align">
    <slot />
  </div>
</template>
