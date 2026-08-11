<script setup lang="ts">
// @a11y — no behavioural JS at all. Choosing an `<hr>` as the root IS the
// accessibility decision: the `separator` role comes with it, and
// `aria-orientation` is emitted for the vertical case alone.
/**
 * A one-pixel rule drawn between two blocks. It renders an `<hr>`, so assistive
 * technology already knows it is a separator, and the element takes no focus and
 * appears in no keyboard navigation.
 *
 * It carries no content slot and no spacing prop, on purpose. A divider with a label
 * in the middle is really a heading that happens to have a rule, and the space
 * around a rule belongs to the layout placing it — the same rule VTypography
 * follows.
 */
interface SeparatorProps {
  /**
   * The direction the rule runs in: across by default, or down the page under
   * `vertical`. A vertical rule needs a height to show: as a flex or grid item it
   * takes the one of its line, but in ordinary flow the consumer has to set one.
   */
  orientation?: 'horizontal' | 'vertical'
}

withDefaults(defineProps<SeparatorProps>(), {
  orientation: 'horizontal',
})
</script>

<template>
  <!-- aria-orientation is emitted only when it CONTRADICTS what the role already
       implies: a separator is horizontal by default, so stating it would merely
       restate the role. This is the same convention the VTabs tablist follows. -->
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
    /* The rule is painted with a BORDER and not a background. Under Windows forced
       colours a background is forced to Canvas, where a rule drawn that way simply
       vanishes, while a border colour is forced to CanvasText and survives — the
       same argument that made the icon registry ship SVG paths. Everywhere else the
       two paints are pixel-identical, `box-sizing: border-box` keeping the box at
       one pixel in total either way.

       The user agent gives an <hr> a 0.5em block margin, an automatic inline one and
       an inset border. All three are cancelled here rather than in the reset: the
       reset sits in a weaker layer, so the margin below would win only by accident.

       TRAP — `.v-menu-separator` and `.v-combobox-separator` override that margin
       from THEIR OWN sheet, and which of the two sheets the consumer's bundler puts
       last is not ours to decide. Both are therefore written as the compound
       `.v-separator.v-x-separator`, and every declaration added here falls under the
       same obligation. */
    margin: 0;
    border: 0 solid var(--vectis-color-border);
  }

  .v-separator[data-orientation='horizontal'] {
    border-block-start-width: 1px;
  }

  /* `align-self: stretch` IS the contract of a vertical rule. An <hr> has no height
     of its own, so the rule only appears when it is a flex or grid item, where this
     makes it take the full cross size of its line whatever the container's
     align-items says. In ordinary flow it collapses to nothing, silently and with no
     error — there it is up to the consumer to give it a block-size. */
  .v-separator[data-orientation='vertical'] {
    align-self: stretch;
    border-inline-start-width: 1px;
  }
}
</style>
