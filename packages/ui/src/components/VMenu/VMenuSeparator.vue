<script setup lang="ts">
/**
 * The rule between two blocks of a VMenu: a VSeparator, whose `<hr>` root carries
 * the implicit `separator` role — legitimate inside a `role="menu"`, and never
 * focusable, so the roving focus walks past it with no exclusion to write.
 */
import VSeparator from '../VSeparator/VSeparator.vue'
</script>

<template>
  <VSeparator class="v-menu-separator" />
</template>

<style>
@layer vectis.components {
  /* Compound with `.v-separator`, which sets `margin: 0` from its own sheet: at
     equal specificity the winner would be whichever sheet the consumer's bundler
     puts last. Full width up to the panel edges (compensates its padding); the
     vertical spacing comes from the panel's gap. */
  .v-separator.v-menu-separator {
    margin-inline: calc(-1 * var(--vectis-space-1));
  }
}
</style>
