<script setup lang="ts">
/**
 * A 1px rule between two blocks. The root is an `<hr>`: the `separator` role is
 * implicit, the element is not focusable and stays outside every roving focus.
 *
 * No content slot and no spacing prop: a labelled divider is a heading with a rule,
 * and the gap around a rule belongs to the parent layout (the VTypography rule).
 */
interface SeparatorProps {
  /** Axis of the rule. Defaults to horizontal. */
  orientation?: 'horizontal' | 'vertical'
}

withDefaults(defineProps<SeparatorProps>(), {
  orientation: 'horizontal',
})
</script>

<template>
  <!-- aria-orientation only when it CONTRADICTS the role's implicit value: a
       `separator` is horizontal by default (the VTabs `tablist` convention). -->
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
    /* A BORDER and not a background: Windows forced-colors forces backgrounds to
       Canvas, where a background-painted rule disappears, while border colours are
       forced to CanvasText — the VIcon registry argument. With box-sizing:
       border-box the box measures 1px in total either way, so the two paints are
       pixel-identical outside forced colours.
       The UA gives <hr> a 0.5em block margin, an `auto` inline one and an inset
       border: the component cancels all three itself rather than leaning on the
       reset, whose weaker layer would make the margin below win only by accident.
       TRAP — `.v-menu-separator` and `.v-combobox-separator` override that margin
       from THEIR OWN sheet, whose order against this one the consumer's bundler
       decides: both are written as the compound `.v-separator.v-x-separator`. Any
       declaration added here falls under the same rule. */
    margin: 0;
    border: 0 solid var(--vectis-color-border);
  }

  .v-separator[data-orientation='horizontal'] {
    border-block-start-width: 1px;
  }

  /* `align-self: stretch` IS the vertical contract: an <hr> has no intrinsic block
     size, so the rule only shows as a flex or grid item, where it takes the line's
     cross size whatever the container's align-items. In normal flow it collapses to
     zero height, silently — there the consumer sets a block-size. */
  .v-separator[data-orientation='vertical'] {
    align-self: stretch;
    border-inline-start-width: 1px;
  }
}
</style>
