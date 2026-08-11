<script setup lang="ts">
/**
 * The rule drawn between two blocks of commands in a menu. It is a VSeparator, whose
 * `<hr>` already means "separator" to assistive technology — which is allowed inside
 * a menu — and which nothing can focus, so the arrow keys skip it without a single
 * exclusion having to be written for it.
 */
import VSeparator from '../VSeparator/VSeparator.vue'
</script>

<template>
  <VSeparator class="v-menu-separator" />
</template>

<style>
@layer vectis.components {
  /* The rule is bled out to the panel's edges by cancelling its padding. The selector
     compounds both classes because `.v-separator` sets `margin: 0` from a sheet of its
     own: at equal specificity the winner would be whichever of the two the consumer's
     bundler happens to put last. The space above and below comes from the panel's own
     gap, so no margin is added here. */
  .v-separator.v-menu-separator {
    margin-inline: calc(-1 * var(--vectis-space-1));
  }
}
</style>
