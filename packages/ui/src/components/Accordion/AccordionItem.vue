<script setup lang="ts">
import { computed, inject } from 'vue'

import Icon from '../Icon/Icon.vue'
import { iconProps } from '../Icon/iconProps'
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
  /** Ouvert au premier rendu (état ensuite géré nativement). */
  defaultOpen?: boolean
  /** Item inerte : ni cliquable ni atteignable au clavier, gris par tokens. */
  disabled?: boolean
}

const props = withDefaults(defineProps<AccordionItemProps>(), {
  title: undefined,
  defaultOpen: false,
  disabled: false,
})

defineSlots<{
  /** Contenu du panneau */
  default(): unknown
  /** Titre riche (remplace la prop `title`) */
  title?(): unknown
}>()

const accordion = inject(accordionKey, null)

/** Icônes posées par le groupe ; l'item reste utilisable seul. */
const expandIcon = computed(() => accordion?.expandIcon ?? 'expand_more')
const collapseIcon = computed(() => accordion?.collapseIcon)

/*
 * Seul JS de comportement du composant : <summary> n'a pas d'attribut
 * `disabled` natif, le basculement de <details> ne peut être bloqué
 * autrement. `pointer-events: none` est écarté (il supprimerait le
 * `cursor: not-allowed` et la sélection du texte) ; le clavier, lui, est
 * couvert sans handler par `tabindex="-1"`.
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
      <span class="ds-accordion-title"
        ><slot name="title">{{ title }}</slot></span
      >
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
    border-block-start: 1px solid var(--ds-color-border);
  }

  .ds-accordion-summary {
    /* Contexte d'Icon (mapping xs de la table des tailles) */
    --ds-icon-size: var(--ds-icon-size-sm);
    --ds-icon-opsz: 20;

    display: flex;
    align-items: center;
    gap: var(--ds-space-3);
    /* Densité : variables héritées du groupe, fallbacks = taille normale */
    padding: var(--_accordion-pad-block, var(--ds-space-4))
      var(--_accordion-pad-inline, var(--ds-space-5));
    list-style: none;
    cursor: pointer;
    font-size: var(--ds-font-size-sm);
    font-weight: var(--ds-font-weight-medium);
    color: var(--ds-color-text);
  }

  .ds-accordion-summary::-webkit-details-marker {
    display: none;
  }

  .ds-accordion-item:not([data-disabled]) > .ds-accordion-summary:hover {
    background: var(--ds-color-surface-muted);
  }

  .ds-accordion-summary:focus-visible {
    outline: var(--ds-focus-ring-width) solid var(--ds-focus-ring-color);
    outline-offset: calc(var(--ds-focus-ring-offset) * -1);
  }

  .ds-accordion-title {
    flex: 1;
  }

  .ds-accordion-icon {
    flex: none;
    color: var(--ds-color-text-muted);
    transition: rotate var(--ds-duration-base) var(--ds-ease-default);
  }

  /* Sans icône d'ouverture dédiée : le chevron pivote */
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
    color: var(--ds-color-text-subtle);
    cursor: not-allowed;
  }

  /* text-muted est plus foncé que text-subtle : l'icône suivrait le titre */
  .ds-accordion-item[data-disabled] .ds-accordion-icon {
    color: inherit;
  }

  /* Ouverture animée en pur CSS (::details-content, progressive enhancement) */
  .ds-accordion-item::details-content {
    block-size: 0;
    overflow: clip;
    transition:
      block-size var(--ds-duration-base) var(--ds-ease-default),
      content-visibility var(--ds-duration-base) allow-discrete;
  }

  .ds-accordion-item[open]::details-content {
    block-size: auto;
  }

  .ds-accordion-content {
    padding: 0 var(--_accordion-pad-inline, var(--ds-space-5))
      var(--_accordion-pad-block, var(--ds-space-4));
    font-size: var(--ds-font-size-sm);
    line-height: var(--ds-font-leading-normal);
    color: var(--ds-color-text-muted);
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
