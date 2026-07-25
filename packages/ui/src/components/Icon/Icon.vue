<script setup lang="ts">
/**
 * Icône à trois sources : ligature Material Symbols Rounded (`name`, police
 * chargée par le CONSOMMATEUR — voir README), image (`src`), ou SVG inline
 * (slot par défaut). Décorative par défaut (aria-hidden) ; `label` la rend
 * informative (role="img" + aria-label). Aucun JS de comportement.
 */
interface IconProps {
  /** Nom Material Symbols Rounded (ligature), ex. 'favorite'. */
  name?: string
  /** Source image (URL). Prioritaire sur `name`. */
  src?: string
  /**
   * Taille explicite en pixels (ex. :size="32"). Sans elle : taille du
   * contexte (`--ds-icon-size` posée par un parent, ex. Button), sinon 1em —
   * l'icône suit le texte environnant.
   */
  size?: number
  /** Libellé accessible ; absent = icône décorative (aria-hidden). */
  label?: string
  /**
   * Remplit la ligature Material Symbols (axe `FILL` 1 au lieu de 0). Sans
   * effet sur les sources `src` (image) et SVG inline (axe propre à la police).
   */
  filled?: boolean
}

withDefaults(defineProps<IconProps>(), {
  name: undefined,
  src: undefined,
  size: undefined,
  label: undefined,
  filled: false,
})

defineSlots<{
  /** SVG inline (utilisé si ni `src` ni `name`). */
  default?(): unknown
}>()
</script>

<template>
  <span
    class="ds-icon"
    :style="size !== undefined ? { '--ds-icon-size': `${size}px` } : undefined"
    :data-filled="filled || undefined"
    :role="label ? 'img' : undefined"
    :aria-label="label"
    :aria-hidden="label ? undefined : 'true'"
  >
    <img v-if="src" class="ds-icon-img" :src="src" alt="" />
    <span v-else-if="name" class="ds-icon-symbol">{{ name }}</span>
    <slot v-else />
  </span>
</template>

<style>
@layer ds.components {
  .ds-icon {
    /*
     * Résolution de la taille, par priorité :
     * 1. prop `size` (px) — posée en --ds-icon-size inline sur l'élément :
     *    une déclaration propre prime sur l'héritage et sur la layer ;
     * 2. --ds-icon-size / --ds-icon-opsz héritées d'un parent (API de
     *    contexte : Button les pose selon sa propre taille) ;
     * 3. 1em — l'icône suit la taille de texte du parent.
     */
    --_size: var(--ds-icon-size, 1em);
    --_opsz: var(--ds-icon-opsz, 24);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: none;
    inline-size: var(--_size);
    block-size: var(--_size);
    /* la ligature Material Symbols se dimensionne par font-size */
    font-size: var(--_size);
    /* dégradé si la police n'est pas chargée : le nom textuel reste contenu
       dans le carré au lieu de casser la mise en page */
    overflow: hidden;
  }

  .ds-icon-symbol {
    font-family: var(--ds-font-family-icon);
    font-weight: var(--ds-font-weight-regular);
    font-style: normal;
    line-height: var(--ds-font-leading-none);
    letter-spacing: normal;
    text-transform: none;
    white-space: nowrap;
    direction: ltr;
    /* axes de la police Material Symbols (FILL/wght/GRAD/opsz) : contrat
       technique de la police, pas des tokens de design — valeurs littérales
       tolérées, comme les opacités */
    font-variation-settings:
      'FILL' var(--_fill, 0),
      'wght' 400,
      'GRAD' 0,
      'opsz' var(--_opsz);
  }

  .ds-icon[data-filled] .ds-icon-symbol {
    --_fill: 1;
  }

  .ds-icon-img,
  .ds-icon > svg {
    inline-size: 100%;
    block-size: 100%;
    object-fit: contain;
  }
}
</style>
