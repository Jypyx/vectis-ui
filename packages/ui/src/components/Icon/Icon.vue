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
   * Taille explicite. Sans elle : taille du contexte (`--ds-icon-size` posée
   * par un parent, ex. Button) ou md par défaut.
   */
  size?: 'sm' | 'md' | 'lg'
  /** Libellé accessible ; absent = icône décorative (aria-hidden). */
  label?: string
}

withDefaults(defineProps<IconProps>(), {
  name: undefined,
  src: undefined,
  size: undefined,
  label: undefined,
})

defineSlots<{
  /** SVG inline (utilisé si ni `src` ni `name`). */
  default?(): unknown
}>()
</script>

<template>
  <span
    class="ds-icon"
    :data-size="size"
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
     * 1. prop `size` — les règles [data-size] redéclarent --_size localement,
     *    ce qui prime sur l'héritage ;
     * 2. --ds-icon-size / --ds-icon-opsz héritées d'un parent (API de
     *    contexte : Button les pose selon sa propre taille) ;
     * 3. défaut md.
     */
    --_size: var(--ds-icon-size, var(--ds-icon-size-md));
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

  .ds-icon[data-size='sm'] {
    --_size: var(--ds-icon-size-sm);
    --_opsz: 20;
  }

  .ds-icon[data-size='md'] {
    --_size: var(--ds-icon-size-md);
    --_opsz: 24;
  }

  .ds-icon[data-size='lg'] {
    --_size: var(--ds-icon-size-lg);
    --_opsz: 24;
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
      'FILL' 0,
      'wght' 400,
      'GRAD' 0,
      'opsz' var(--_opsz);
  }

  .ds-icon-img,
  .ds-icon > svg {
    inline-size: 100%;
    block-size: 100%;
    object-fit: contain;
  }
}
</style>
