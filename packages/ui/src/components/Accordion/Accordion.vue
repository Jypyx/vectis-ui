<script setup lang="ts">
import { provide, useId } from 'vue'

import { accordionKey } from './context'

/**
 * Accordéon 100 % natif : <details>/<summary>. Le mode exclusif repose sur
 * l'attribut `name` partagé entre items (fourni ici par provide/inject) —
 * aucun JS d'état.
 */
interface AccordionProps {
  /** Un seul item ouvert à la fois (attribut natif <details name>). */
  exclusive?: boolean
  /** `outlined` : carte bordée et arrondie. `flush` : ni bordure ni rayon (bord à bord). */
  variant?: 'outlined' | 'flush'
  /** Icône des items fermés : nom Material ou URL. Défaut : chevron pivotant. */
  expandIcon?: string
  /** Icône des items ouverts ; absente = `expandIcon` pivotée de 180°. */
  collapseIcon?: string
  /** Densité réduite : -4px sur tous les paddings (typo et icône inchangées). */
  compact?: boolean
}

const props = withDefaults(defineProps<AccordionProps>(), {
  exclusive: true,
  variant: 'outlined',
  expandIcon: 'expand_more',
  collapseIcon: undefined,
  compact: false,
})

defineSlots<{
  /** Les <AccordionItem> */
  default(): unknown
}>()

const groupName = useId()
// Getters : les props du groupe restent réactives à travers l'injection.
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
  <div class="ds-accordion" :data-variant="variant" :data-compact="compact ? '' : undefined">
    <slot />
  </div>
</template>

<style>
@layer ds.components {
  .ds-accordion {
    /*
     * Densité : variables posées sur la RACINE seulement (seule à rendre
     * data-compact) et héritées par les items — les fallbacks vivent côté
     * AccordionItem, qui reste utilisable hors groupe.
     *
     * Compact = -4px sur TOUS les paddings (idiome `.ds-control`, hors
     * échelle : l'accordéon n'a pas de hauteur imposée). Un seul delta pilote
     * les trois mesures, les valeurs de base ne sont donc écrites qu'ici.
     */
    --_accordion-pad-delta: 0px;
    --_accordion-pad-block: calc(var(--ds-space-4) - var(--_accordion-pad-delta));
    --_accordion-pad-inline: calc(var(--ds-space-5) - var(--_accordion-pad-delta));
    --_accordion-content-pad-start: calc(var(--ds-space-2) - var(--_accordion-pad-delta));

    background: var(--ds-color-surface-raised);
    font-family: var(--ds-text-family);
    overflow: hidden;
  }

  /* Compact : paddings resserrés seuls — typo, gouttière et icône inchangées */
  .ds-accordion[data-compact] {
    --_accordion-pad-delta: var(--ds-space-1);
  }

  /* Carte bordée (défaut) ; `flush` n'a rien à annuler, il n'ajoute simplement rien */
  .ds-accordion[data-variant='outlined'] {
    /*
     * Rayon EMBOÎTÉ (moins la bordure) repris par les summary des items
     * d'extrémité : `overflow: hidden` découpe tout le sous-arbre sur cette
     * courbe, un anneau de focus à angles droits y perdrait ses coins.
     */
    --_accordion-corner-radius: calc(var(--ds-radius-surface) - 1px);

    border: 1px solid var(--ds-color-border);
    border-radius: var(--ds-radius-surface);
  }
}
</style>
