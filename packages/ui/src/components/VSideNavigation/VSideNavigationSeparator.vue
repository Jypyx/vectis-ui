<template>
  <!-- A list item and not a horizontal rule, because a list may own nothing but list
       items — and ARIA is stricter still, admitting only list items, so even giving
       this one a separator role would be rejected.

       So it is a plain list item, and a DECORATIVE one: the line is a visual break
       between sections, where real grouping is what VSideNavigationGroup provides.
       Hiding it from assistive technology is what keeps it OUT of the item count,
       instead of announcing an empty entry in the middle of the navigation. -->
  <li class="v-side-nav-separator" aria-hidden="true" />
</template>

<style>
@layer vectis.components {
  .v-side-nav-separator {
    flex: none;
    /* The depth indent deliberately does not apply here: a rule separates sections,
       and has no reason to line up with the hierarchy of the rows around it. */
    margin-block: var(--vectis-space-2);
    margin-inline: var(--control-padding-inline);
    /* Painted with a border and not a background, exactly as VSeparator is: under
       Windows forced colours a background is forced to Canvas, where the line
       vanishes, while a border colour is forced to CanvasText and survives. */
    border-block-start: 1px solid var(--vectis-color-border);
  }
}
</style>
