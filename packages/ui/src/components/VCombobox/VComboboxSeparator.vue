<script setup lang="ts">
/**
 * Use presentation semantics for separators: a listbox owns only options and groups, unlike a
 * menu.
 */
import VSeparator from '../VSeparator/VSeparator.vue'
</script>

<template>
  <VSeparator role="presentation" class="v-combobox-separator" />
</template>

<style>
@layer vectis.components {
  /*
   * The selector compounds both classes because `.v-separator` sets `margin: 0` from a sheet of
   * its own: at equal specificity the winner would be whichever of the two the consumer's
   * bundler happens to put last. The space above and below comes from the panel's own gap, so
   * no margin is added here.
   */
  .v-separator.v-combobox-separator {
    margin-inline: calc(-1 * var(--vectis-space-1));
  }
}
</style>
