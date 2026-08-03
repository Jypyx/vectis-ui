<template>
  <!-- <hr>: implicit role="separator", not focusable, out of the tab order. A direct
       child of a <ul>, which HTML explicitly allows between two groups of list
       items. -->
  <hr class="v-side-nav-separator" />
</template>

<style>
@layer vectis.components {
  .v-side-nav-separator {
    flex: none;
    /* The indent does not apply here: a rule separates sections, it does not align on
       the hierarchy of the rows it frames. */
    margin-block: var(--vectis-space-2);
    margin-inline: var(--control-padding-inline);
    border: none;
    block-size: 1px;
    background: var(--vectis-color-border);
  }
}
</style>
