<script setup lang="ts">
/**
 * The rule between two blocks of the VCombobox listbox, in `role="presentation"`:
 * the `<hr>`'s implicit `separator` role is legitimate inside a `role="menu"` (see
 * VMenuSeparator) but not among the children of a `role="listbox"`, which admits
 * only `option` and `group`. Here the rule is purely visual — the grouping is
 * already carried by the `role="group"`s and their labels.
 */
import VSeparator from '../VSeparator/VSeparator.vue'
</script>

<template>
  <VSeparator role="presentation" class="v-combobox-separator" />
</template>

<style>
@layer vectis.components {
  /* Compound with `.v-separator`, which sets `margin: 0` from its own sheet: at
     equal specificity the winner would be whichever sheet the consumer's bundler
     puts last. Full width up to the panel edges (compensates its padding); the
     vertical spacing comes from the panel's gap. */
  .v-separator.v-combobox-separator {
    margin-inline: calc(-1 * var(--vectis-space-1));
  }
}
</style>
