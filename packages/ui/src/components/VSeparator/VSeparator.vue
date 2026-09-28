<script setup lang="ts">
/** Use a native hr for separator semantics and borders for visibility in forced colours. */
/** Which way the rule runs. */
export type SeparatorOrientation = 'horizontal' | 'vertical'

interface SeparatorProps {
  /** The direction the rule runs in: across by default, or down the page under `vertical`. */
  orientation?: SeparatorOrientation
}

withDefaults(defineProps<SeparatorProps>(), {
  orientation: 'horizontal',
})
</script>

<template>
  <!--
    Aria-orientation is emitted only when it CONTRADICTS what the role already implies: a
    separator is horizontal by default, so stating it would merely restate the role. This is the
    same convention the VTabs tablist follows.
  -->
  <hr
    class="v-separator"
    :data-orientation="orientation"
    :aria-orientation="orientation === 'vertical' ? 'vertical' : undefined"
  />
</template>

<style>
@layer vectis.components {
  .v-separator {
    flex: none;
    /*
     * `.v-menu-separator` and `.v-combobox-separator` override that margin from THEIR own
     * sheet, and which of the two sheets the consumer's bundler puts last is not ours to
     * decide. Both are therefore written as the compound `.v-separator.v-x-separator`, and
     * every declaration added here falls under the same obligation.
     */
    margin: 0;
    border: 0 solid var(--vectis-color-border);
  }

  .v-separator[data-orientation='horizontal'] {
    border-block-start-width: 1px;
  }

  /*
   * In ordinary flow it collapses to nothing, silently and with no error; there it is up to the
   * consumer to give it a block-size.
   */
  .v-separator[data-orientation='vertical'] {
    align-self: stretch;
    border-inline-start-width: 1px;
  }
}
</style>
