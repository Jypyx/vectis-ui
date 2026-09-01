<script setup lang="ts">
/**
 * The rule drawn between two blocks of options in a VCombobox's list.
 *
 * TRAP — it carries `role="presentation"`, stripped of the meaning an `<hr>` normally has. A
 * separator is legitimate inside a menu, which VMenuSeparator relies on, but a `listbox` owns
 * nothing but `option` and `group`. Nothing is lost: what the rule suggests visually is
 * already said properly by the named groups around it.
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
