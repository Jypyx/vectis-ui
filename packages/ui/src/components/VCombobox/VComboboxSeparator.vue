<template>
  <!-- role="presentation": the <hr>'s implicit `separator` role is legitimate inside
       a role="menu" (see VMenuSeparator) but not among the children of a
       role="listbox", which admits only `option` and `group`. Here the rule is purely
       visual — the grouping is already carried by the `role="group"`s and their
       labels. -->
  <hr role="presentation" class="v-combobox-separator" />
</template>

<style>
@layer vectis.components {
  .v-combobox-separator {
    flex: none;
    margin-block: 0;
    /* Full width up to the panel edges (compensates its padding); the vertical
       spacing comes from the panel's gap */
    margin-inline: calc(-1 * var(--vectis-space-1));
    border: none;
    block-size: 1px;
    background: var(--vectis-color-border);
  }
}
</style>
