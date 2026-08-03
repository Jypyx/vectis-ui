<template>
  <!-- <hr>: implicit role="separator", not focusable, outside the roving focus -->
  <hr class="v-menu-separator" />
</template>

<style>
@layer vectis.components {
  .v-menu-separator {
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
