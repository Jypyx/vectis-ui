<script setup lang="ts">
import { inject } from 'vue'

import { accordionKey } from './context'

/**
 * Item d'accordéon : <details>/<summary> natifs — état, clavier et
 * accessibilité gratuits. Zéro JS. L'animation d'ouverture utilise
 * `::details-content` + `interpolate-size` (progressive enhancement : sans
 * support, ouverture instantanée).
 */
interface AccordionItemProps {
  /** Titre du résumé ; remplaçable par le slot #title. */
  title?: string
  /** Ouvert au premier rendu (état ensuite géré nativement). */
  defaultOpen?: boolean
}

withDefaults(defineProps<AccordionItemProps>(), {
  title: undefined,
  defaultOpen: false,
})

defineSlots<{
  /** Contenu du panneau */
  default(): unknown
  /** Titre riche (remplace la prop `title`) */
  title?(): unknown
}>()

const accordion = inject(accordionKey, null)
</script>

<template>
  <details class="ds-accordion-item" :name="accordion?.name" :open="defaultOpen || undefined">
    <summary class="ds-accordion-summary">
      <span class="ds-accordion-title"
        ><slot name="title">{{ title }}</slot></span
      >
      <svg
        class="ds-accordion-chevron"
        viewBox="0 0 16 16"
        width="16"
        height="16"
        aria-hidden="true"
      >
        <path
          d="M4 6l4 4 4-4"
          fill="none"
          stroke="currentcolor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
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
    display: flex;
    align-items: center;
    gap: var(--ds-space-3);
    padding: var(--ds-space-4) var(--ds-space-5);
    list-style: none;
    cursor: pointer;
    font-size: var(--ds-font-size-sm);
    font-weight: var(--ds-font-weight-medium);
    color: var(--ds-color-text);
  }

  .ds-accordion-summary::-webkit-details-marker {
    display: none;
  }

  .ds-accordion-summary:hover {
    background: var(--ds-color-surface-muted);
  }

  .ds-accordion-summary:focus-visible {
    outline: var(--ds-focus-ring-width) solid var(--ds-focus-ring-color);
    outline-offset: calc(var(--ds-focus-ring-offset) * -1);
  }

  .ds-accordion-title {
    flex: 1;
  }

  .ds-accordion-chevron {
    flex: none;
    color: var(--ds-color-text-muted);
    transition: rotate var(--ds-duration-base) var(--ds-ease-default);
  }

  .ds-accordion-item[open] > .ds-accordion-summary .ds-accordion-chevron {
    rotate: 180deg;
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
    padding: 0 var(--ds-space-5) var(--ds-space-4);
    font-size: var(--ds-font-size-sm);
    line-height: var(--ds-font-leading-normal);
    color: var(--ds-color-text-muted);
  }

  @media (prefers-reduced-motion: reduce) {
    .ds-accordion-chevron {
      transition: none;
    }

    .ds-accordion-item::details-content {
      transition: none;
    }
  }
}
</style>
