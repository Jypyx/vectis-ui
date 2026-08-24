<script setup lang="ts">
/**
 * The surface a live example sits on: real components, on a raised card, inside the prose.
 *
 * It is a component rather than a bare `<div class="vd-demo">` for one reason worth stating —
 * `.vd-prose`'s selectors are all DIRECT-CHILD chains, so anything rendered inside a demo is
 * deliberately out of the prose's reach. Putting every example behind the same element is
 * what keeps that boundary from being crossed by accident.
 */
defineProps<{
  /** Stacks the children in a column and stretches them, for fields and full-width demos. */
  stack?: boolean
}>()
</script>

<template>
  <div class="vd-demo" :data-stack="stack ? '' : undefined">
    <slot />
  </div>
</template>
