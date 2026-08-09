<template>
  <!-- An <li>, not an <hr>: a <ul> may only own list items, and ARIA is stricter still —
       `list` owns `listitem` alone, so even an <li role="separator"> is rejected. Hence a
       plain list item, DECORATIVE: the rule is a visual break between sections, and real
       grouping is what VSideNavigationGroup is for (a labelled sublist). aria-hidden is
       what keeps it out of the item count instead of adding an empty one. -->
  <li class="v-side-nav-separator" aria-hidden="true" />
</template>

<style>
@layer vectis.components {
  .v-side-nav-separator {
    flex: none;
    /* The indent does not apply here: a rule separates sections, it does not align on
       the hierarchy of the rows it frames. */
    margin-block: var(--vectis-space-2);
    margin-inline: var(--control-padding-inline);
    /* A border, not a background — the VSeparator paint: Windows forced-colors
       forces backgrounds to Canvas, where the rule would vanish, and border colours
       to CanvasText, where it survives. */
    border-block-start: 1px solid var(--vectis-color-border);
  }
}
</style>
