<script setup lang="ts">
/** Wrap demos so direct-child prose selectors cannot style their internals. */
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
