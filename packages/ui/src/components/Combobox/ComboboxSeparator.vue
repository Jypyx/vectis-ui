<template>
  <!-- role="presentation" : le rôle implicite `separator` du <hr> est légitime
       dans un role="menu" (cf. MenuSeparator) mais pas parmi les enfants d'un
       role="listbox", qui n'admet que `option` et `group`. Ici le filet est
       purement visuel — le regroupement est déjà porté par les `role="group"`
       et leurs libellés. -->
  <hr role="presentation" class="ds-combobox-separator" />
</template>

<style>
@layer ds.components {
  .ds-combobox-separator {
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
