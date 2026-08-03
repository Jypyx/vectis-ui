<template>
  <!-- <hr> : role="separator" implicite, non focusable, hors tabulation.
       Enfant direct d'une <ul>, ce que le HTML autorise explicitement entre
       deux groupes d'items de liste. -->
  <hr class="v-side-nav-separator" />
</template>

<style>
@layer vectis.components {
  .v-side-nav-separator {
    flex: none;
    /* Le retrait n'a pas cours ici : un filet sépare des sections, il ne
       s'aligne pas sur la hiérarchie des rangées qu'il encadre. */
    margin-block: var(--vectis-space-2);
    margin-inline: var(--control-padding-inline);
    border: none;
    block-size: 1px;
    background: var(--vectis-color-border);
  }
}
</style>
