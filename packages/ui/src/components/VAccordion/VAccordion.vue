<script setup lang="ts">
import { provide, useId } from 'vue'

import type { IconSource } from '../VIcon/types'

import { accordionKey } from './context'

/**
 * Accordéon 100 % natif : <details>/<summary>. Le mode exclusif repose sur
 * l'attribut `name` partagé entre items (fourni ici par provide/inject) —
 * aucun JS d'état.
 */
interface AccordionProps {
  /** Un seul item ouvert à la fois (attribut natif <details name>). */
  exclusive?: boolean
  /** `flat` : aucun habillage. `outlined` : fond surélevé, bordure et rayon. */
  variant?: 'flat' | 'outlined'
  /** Icône des items fermés : nom, ou `{ src }` / `{ component }`. Défaut : chevron pivotant. */
  expandIcon?: IconSource
  /** Icône des items ouverts ; absente = `expandIcon` pivotée de 180°. */
  collapseIcon?: IconSource
  /** Densité réduite : -4px sur tous les paddings (typo et icône inchangées). */
  compact?: boolean
}

const props = withDefaults(defineProps<AccordionProps>(), {
  exclusive: true,
  variant: 'flat',
  expandIcon: 'expand_more',
  collapseIcon: undefined,
  compact: false,
})

defineSlots<{
  /** Les <AccordionItem> */
  default(): unknown
}>()

const groupName = useId()
provide(accordionKey, {
  get name() {
    return props.exclusive ? groupName : undefined
  },
  get expandIcon() {
    return props.expandIcon
  },
  get collapseIcon() {
    return props.collapseIcon
  },
})
</script>

<template>
  <div class="v-accordion" :data-variant="variant" :data-compact="compact ? '' : undefined">
    <slot />
  </div>
</template>

<style>
@layer vectis.components {
  .v-accordion {
    /*
     * Densité : variables posées sur la RACINE seulement (seule à rendre
     * data-compact) et héritées par les items — les fallbacks vivent côté
     * AccordionItem, qui reste utilisable hors groupe.
     *
     * Compact = -4px sur TOUS les paddings (hors
     * échelle : l'accordéon n'a pas de hauteur imposée). Un seul delta pilote
     * les trois mesures, les valeurs de base ne sont donc écrites qu'ici.
     */
    --accordion-pad-delta: 0px;
    --accordion-pad-block: calc(var(--vectis-space-4) - var(--accordion-pad-delta));
    --accordion-pad-inline: calc(var(--vectis-space-5) - var(--accordion-pad-delta));
    --accordion-content-pad-start: calc(var(--vectis-space-2) - var(--accordion-pad-delta));

    font-family: var(--vectis-text-family);
    overflow: hidden;
  }

  /* Compact : paddings resserrés seuls — typo, gouttière et icône inchangées */
  .v-accordion[data-compact] {
    --accordion-pad-delta: var(--vectis-space-1);
  }

  /* Carte bordée ; `flat` (défaut) n'a rien à annuler — y compris le fond, qui
     appartient au cadre : à plat, l'accordéon hérite de la surface d'accueil. */
  .v-accordion[data-variant='outlined'] {
    /*
     * Rayon EMBOÎTÉ (moins la bordure) repris par les summary des items
     * d'extrémité : `overflow: hidden` découpe tout le sous-arbre sur cette
     * courbe, un anneau de focus à angles droits y perdrait ses coins.
     */
    --accordion-corner-radius: calc(var(--vectis-radius-surface) - 1px);

    background: var(--vectis-color-surface-raised);
    border: 1px solid var(--vectis-color-border);
    border-radius: var(--vectis-radius-surface);
  }
}
</style>
