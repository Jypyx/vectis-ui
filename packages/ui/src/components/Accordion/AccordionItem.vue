<script setup lang="ts">
import { computed, inject } from 'vue'

import Icon from '../Icon/Icon.vue'
import { iconProps } from '../Icon/iconProps'
import type { IconSource } from '../Icon/types'
import Typography from '../Typography/Typography.vue'
import { accordionKey } from './context'

/**
 * Item d'accordéon : <details>/<summary> natifs — état, clavier et
 * accessibilité gratuits. L'animation d'ouverture utilise
 * `::details-content` + `interpolate-size` (progressive enhancement : sans
 * support, ouverture instantanée).
 */
interface AccordionItemProps {
  /** Titre du résumé ; remplaçable par le slot #title. */
  title?: string
  /** Sous-titre sous le titre ; remplaçable par le slot #subtitle. */
  subtitle?: string
  /** Icône devant le titre : nom, ou rendu explicite (`{ src }`, `{ component }`…). */
  iconStart?: IconSource
  /** Ouvert au premier rendu (état ensuite géré nativement). */
  defaultOpen?: boolean
  /** Item inerte : ni cliquable ni atteignable au clavier, gris par tokens. */
  disabled?: boolean
}

const props = withDefaults(defineProps<AccordionItemProps>(), {
  title: undefined,
  subtitle: undefined,
  iconStart: undefined,
  defaultOpen: false,
  disabled: false,
})

defineSlots<{
  /** Contenu du panneau */
  default(): unknown
  /** Titre riche (remplace la prop `title`) */
  title?(): unknown
  /** Sous-titre riche (remplace la prop `subtitle`) */
  subtitle?(): unknown
  /** Contenu libre devant le titre (prime sur `iconStart`) */
  start?(): unknown
}>()

const accordion = inject(accordionKey, null)

/** Icônes posées par le groupe ; l'item reste utilisable seul. */
const expandIcon = computed(() => accordion?.expandIcon ?? 'expand_more')
const collapseIcon = computed(() => accordion?.collapseIcon)

/*
 * Seul JS de comportement du composant : <summary> n'a pas d'attribut
 * `disabled` natif, le basculement de <details> ne peut être bloqué
 * autrement — le clavier, lui, est couvert sans handler par `tabindex="-1"`.
 */
function onSummaryClick(event: MouseEvent) {
  if (props.disabled) event.preventDefault()
}
</script>

<template>
  <details
    class="ds-accordion-item"
    :name="accordion?.name"
    :open="defaultOpen || undefined"
    :data-swap="collapseIcon ? '' : undefined"
    :data-disabled="disabled ? '' : undefined"
  >
    <summary
      class="ds-accordion-summary"
      :aria-disabled="disabled || undefined"
      :tabindex="disabled ? -1 : undefined"
      @click="onSummaryClick"
    >
      <slot name="start">
        <Icon v-if="iconStart" class="ds-accordion-icon-start" v-bind="iconProps(iconStart)" />
      </slot>
      <span class="ds-accordion-heading">
        <span class="ds-accordion-title"
          ><slot name="title">{{ title }}</slot></span
        >
        <Typography
          v-if="subtitle || $slots.subtitle"
          as="span"
          variant="caption"
          tone="muted"
          class="ds-accordion-subtitle"
          ><slot name="subtitle">{{ subtitle }}</slot></Typography
        >
      </span>
      <Icon class="ds-accordion-icon" v-bind="iconProps(expandIcon)" />
      <!-- Deux icônes rendues, permutation 100 % CSS sur [open] -->
      <Icon
        v-if="collapseIcon"
        class="ds-accordion-icon ds-accordion-icon-open"
        v-bind="iconProps(collapseIcon)"
      />
    </summary>
    <div class="ds-accordion-content">
      <slot />
    </div>
  </details>
</template>

<style>
@layer ds.components {
  .ds-accordion-item {
    interpolate-size: allow-keywords;
  }

  .ds-accordion-item + .ds-accordion-item {
    border-block-start: 1px solid var(--vectis-color-border);
  }

  .ds-accordion-summary {
    /* Contexte d'Icon : 20px quelle que soit la densité (seuls les paddings
       varient en compact), opsz 20 comme le mapping md de la table des tailles */
    --vectis-icon-size: var(--vectis-icon-size-md);
    --vectis-icon-opsz: 20;

    display: flex;
    align-items: center;
    gap: var(--vectis-space-3);
    /* Densité : variables héritées du groupe, fallbacks = taille normale */
    padding: var(--accordion-pad-block, var(--vectis-space-4))
      var(--accordion-pad-inline, var(--vectis-space-5));
    list-style: none;
    cursor: pointer;
    font-size: var(--vectis-text-label-size);
    font-weight: var(--vectis-text-label-weight);
    color: var(--vectis-color-text);
  }

  .ds-accordion-summary::-webkit-details-marker {
    display: none;
  }

  .ds-accordion-item:not([data-disabled]) > .ds-accordion-summary:hover {
    background: var(--vectis-color-surface-muted);
  }

  .ds-accordion-summary:focus-visible {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: calc(var(--vectis-focus-ring-offset) * -1);
  }

  /*
   * Coins des summary d'extrémité alignés sur le rayon intérieur du groupe
   * (0 hors groupe encadré) : l'outline suit le border-radius, l'anneau devient
   * donc parallèle à la découpe `overflow: hidden` au lieu d'y être rogné.
   * Le dernier summary n'est au bord bas que panneau fermé.
   */
  .ds-accordion-item:first-child > .ds-accordion-summary {
    border-start-start-radius: var(--accordion-corner-radius, 0);
    border-start-end-radius: var(--accordion-corner-radius, 0);
  }

  .ds-accordion-item:last-child:not([open]) > .ds-accordion-summary {
    border-end-start-radius: var(--accordion-corner-radius, 0);
    border-end-end-radius: var(--accordion-corner-radius, 0);
  }

  /* Bloc textuel : titre seul, ou titre + sous-titre empilés */
  .ds-accordion-heading {
    flex: 1;
    display: flex;
    flex-direction: column;
    line-height: var(--vectis-text-label-leading);
  }

  /* Sous-titre : rendu par Typography (caption muted) — la classe
     .ds-accordion-subtitle reste posée comme point d'accroche (état
     disabled ci-dessous). */

  /* Classe dédiée (pas .ds-accordion-icon : rotation/permutation réservées au chevron) */
  .ds-accordion-icon-start {
    flex: none;
    color: var(--vectis-color-text-muted);
  }

  .ds-accordion-icon {
    flex: none;
    color: var(--vectis-color-text-muted);
    transition: rotate var(--vectis-duration-base) var(--vectis-ease-default);
  }

  .ds-accordion-item[open]:not([data-swap]) > .ds-accordion-summary .ds-accordion-icon {
    rotate: 180deg;
  }

  /* Permutation des deux icônes (data-swap = collapseIcon fournie) */
  .ds-accordion-item[data-swap][open]
    > .ds-accordion-summary
    .ds-accordion-icon:not(.ds-accordion-icon-open),
  .ds-accordion-item[data-swap]:not([open]) > .ds-accordion-summary .ds-accordion-icon-open {
    display: none;
  }

  /* Désactivé : nuances de gris par tokens (jamais d'opacité) */
  .ds-accordion-item[data-disabled] > .ds-accordion-summary {
    color: var(--vectis-color-text-subtle);
    cursor: not-allowed;
  }

  /* text-muted est plus foncé que text-subtle : icônes et sous-titre suivent le titre */
  .ds-accordion-item[data-disabled] .ds-accordion-icon,
  .ds-accordion-item[data-disabled] .ds-accordion-icon-start,
  .ds-accordion-item[data-disabled] .ds-accordion-subtitle {
    color: inherit;
  }

  /* Ouverture animée en pur CSS (::details-content, progressive enhancement) */
  .ds-accordion-item::details-content {
    block-size: 0;
    overflow: clip;
    transition:
      block-size var(--vectis-duration-base) var(--vectis-ease-default),
      content-visibility var(--vectis-duration-base) allow-discrete;
  }

  .ds-accordion-item[open]::details-content {
    block-size: auto;
  }

  .ds-accordion-content {
    /* Respiration sous le summary, réduite en compact (variables du groupe) */
    padding: var(--accordion-content-pad-start, var(--vectis-space-2))
      var(--accordion-pad-inline, var(--vectis-space-5))
      var(--accordion-pad-block, var(--vectis-space-4));
    font-size: var(--vectis-text-body-md-size);
    line-height: var(--vectis-text-body-md-leading);
    color: var(--vectis-color-text-muted);
  }

  @media (prefers-reduced-motion: reduce) {
    .ds-accordion-icon {
      transition: none;
    }

    .ds-accordion-item::details-content {
      transition: none;
    }
  }
}
</style>
