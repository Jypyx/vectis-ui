<script setup lang="ts">
/**
 * The rule drawn between two blocks of options in a VCombobox's list.
 *
 * TRAP — it is stripped of the meaning an `<hr>` normally carries. A separator is
 * perfectly legitimate inside a menu, as VMenuSeparator relies on, but a LIST may
 * contain nothing but options and blocks of options — so here the rule has to be
 * declared as pure presentation.
 *
 * Nothing is lost by that: what the rule suggests visually is already said properly by
 * the named blocks around it.
 */
import VSeparator from '../VSeparator/VSeparator.vue'
</script>

<template>
  <VSeparator role="presentation" class="v-combobox-separator" />
</template>

<style>
@layer vectis.components {
  /* The rule is bled out to the panel's edges by cancelling its padding. The selector
     compounds both classes because `.v-separator` sets `margin: 0` from a sheet of its
     own: at equal specificity the winner would be whichever of the two the consumer's
     bundler happens to put last. The space above and below comes from the panel's own
     gap, so no margin is added here. */
  .v-separator.v-combobox-separator {
    margin-inline: calc(-1 * var(--vectis-space-1));
  }
}
</style>
