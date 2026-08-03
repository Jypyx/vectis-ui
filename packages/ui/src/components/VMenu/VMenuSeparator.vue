<template>
  <!-- <hr> : role="separator" implicite, non focusable, hors roving focus -->
  <hr class="v-menu-separator" />
</template>

<style>
@layer vectis.components {
  .v-menu-separator {
    flex: none;
    margin-block: 0;
    /* pleine largeur jusqu'aux bords du panneau (compense son padding) ;
       l'espacement vertical vient du gap du panneau */
    margin-inline: calc(-1 * var(--vectis-space-1));
    border: none;
    block-size: 1px;
    background: var(--vectis-color-border);
  }
}
</style>
