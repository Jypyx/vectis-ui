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
  /** Icône des items fermés : nom Material ou URL. Défaut : chevron pivotant. */
  expandIcon?: string
  /** Icône des items ouverts ; absente = `expandIcon` pivotée de 180°. */
  collapseIcon?: string
  /** Densité réduite d'un cran de padding ; typo et icônes inchangées. */
  compact?: boolean
}

const props = withDefaults(defineProps<AccordionProps>(), {
  exclusive: true,
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
  <div class="ds-accordion" :data-compact="compact ? '' : undefined">
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
     */
    --_accordion-pad-block: var(--ds-space-4);
    --_accordion-pad-inline: var(--ds-space-5);

    border: 1px solid var(--ds-color-border);
    border-radius: var(--ds-radius-surface);
    background: var(--ds-color-surface-raised);
    font-family: var(--ds-font-family-sans);
    overflow: hidden;
  }

  /* Compact : paddings d'un cran (typo, gap et icônes inchangés) */
  .ds-accordion[data-compact] {
    --_accordion-pad-block: var(--ds-space-3);
    --_accordion-pad-inline: var(--ds-space-4);
  }
}
</style>
