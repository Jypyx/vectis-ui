<template>
  <!-- <hr> : role="separator" implicite, non focusable, hors roving focus -->
  <hr class="ds-menu-separator" />
</template>

<style>
@layer ds.components {
  .ds-menu-separator {
    flex: none;
    margin-block: 0;
    /* pleine largeur jusqu'aux bords du panneau (compense son padding) ;
       l'espacement vertical vient du gap du panneau */
    margin-inline: calc(-1 * var(--ds-space-1));
    border: none;
    block-size: 1px;
    background: var(--ds-color-border);
  }
}
</style>
