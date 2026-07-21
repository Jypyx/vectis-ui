<script setup lang="ts">
import type { ButtonHTMLAttributes } from 'vue'

/**
 * Aucun JS de comportement : le <button> natif couvre focus, clavier et
 * désactivation. Le composant ne fait que typer l'API et poser des data-*
 * que le CSS consomme.
 */
interface ButtonProps {
  variant?: 'solid' | 'outline' | 'ghost'
  tone?: 'accent' | 'neutral' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  type?: ButtonHTMLAttributes['type']
  disabled?: boolean
  /** Affiche un spinner, désactive le bouton et pose aria-busy. */
  loading?: boolean
}

withDefaults(defineProps<ButtonProps>(), {
  variant: 'solid',
  tone: 'accent',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false,
})

defineSlots<{
  /** Libellé du bouton */
  default(): unknown
  /** Contenu avant le libellé (icône, aria-hidden conseillé) */
  start?(): unknown
  /** Contenu après le libellé */
  end?(): unknown
}>()
</script>

<template>
  <button
    class="ds-button"
    :type="type"
    :disabled="disabled || loading"
    :data-variant="variant"
    :data-tone="tone"
    :data-size="size"
    :data-loading="loading ? '' : undefined"
    :aria-busy="loading || undefined"
  >
    <span v-if="loading" class="ds-button-spinner" aria-hidden="true" />
    <slot name="start" />
    <slot />
    <slot name="end" />
  </button>
</template>

<style>
@layer ds.components {
  .ds-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--ds-space-2);
    height: var(--ds-control-height-md);
    padding-inline: var(--ds-space-4);
    border: 1px solid transparent;
    border-radius: var(--ds-radius-interactive);
    font-family: var(--ds-font-family-sans);
    font-size: var(--ds-font-size-sm);
    font-weight: var(--ds-font-weight-medium);
    line-height: var(--ds-font-leading-none);
    cursor: pointer;
    transition:
      background-color var(--ds-duration-fast) var(--ds-ease-default),
      border-color var(--ds-duration-fast) var(--ds-ease-default),
      color var(--ds-duration-fast) var(--ds-ease-default);
  }

  .ds-button:focus-visible {
    outline: var(--ds-focus-ring-width) solid var(--ds-focus-ring-color);
    outline-offset: var(--ds-focus-ring-offset);
  }

  /* --- Tones : ne définissent que des variables locales --- */
  .ds-button[data-tone='accent'] {
    --_bg-solid: var(--ds-color-accent);
    --_bg-solid-hover: var(--ds-color-accent-hover);
    --_bg-solid-active: var(--ds-color-accent-active);
    --_text-solid: var(--ds-color-text-on-accent);
    --_text-tinted: var(--ds-color-accent-text);
    --_bg-soft: var(--ds-color-accent-surface);
    --_border-soft: var(--ds-color-accent-border);
  }

  .ds-button[data-tone='danger'] {
    --_bg-solid: var(--ds-color-danger);
    --_bg-solid-hover: var(--ds-color-danger-hover);
    --_bg-solid-active: var(--ds-color-danger-active);
    --_text-solid: var(--ds-color-text-on-accent);
    --_text-tinted: var(--ds-color-danger-text);
    --_bg-soft: var(--ds-color-danger-surface);
    --_border-soft: var(--ds-color-danger-border);
  }

  .ds-button[data-tone='neutral'] {
    --_bg-solid: var(--ds-color-surface-muted);
    --_bg-solid-hover: color-mix(in oklab, var(--ds-color-surface-muted), var(--ds-color-text) 8%);
    --_bg-solid-active: color-mix(
      in oklab,
      var(--ds-color-surface-muted),
      var(--ds-color-text) 14%
    );
    --_text-solid: var(--ds-color-text);
    --_text-tinted: var(--ds-color-text);
    --_bg-soft: var(--ds-color-surface-muted);
    --_border-soft: var(--ds-color-border-strong);
  }

  /* --- Variantes : consomment les variables du tone --- */
  .ds-button[data-variant='solid'] {
    background: var(--_bg-solid);
    color: var(--_text-solid);
  }

  .ds-button[data-variant='solid']:hover:not(:disabled) {
    background: var(--_bg-solid-hover);
  }

  .ds-button[data-variant='solid']:active:not(:disabled) {
    background: var(--_bg-solid-active);
  }

  .ds-button[data-variant='outline'] {
    background: transparent;
    color: var(--_text-tinted);
    border-color: var(--_border-soft);
  }

  .ds-button[data-variant='ghost'] {
    background: transparent;
    color: var(--_text-tinted);
  }

  .ds-button[data-variant='outline']:hover:not(:disabled),
  .ds-button[data-variant='ghost']:hover:not(:disabled) {
    background: var(--_bg-soft);
  }

  .ds-button[data-variant='outline']:active:not(:disabled),
  .ds-button[data-variant='ghost']:active:not(:disabled) {
    background: color-mix(in oklab, var(--_bg-soft), var(--_text-tinted) 8%);
  }

  /* --- Tailles --- */
  .ds-button[data-size='sm'] {
    height: var(--ds-control-height-sm);
    padding-inline: var(--ds-space-3);
    font-size: var(--ds-font-size-xs);
  }

  .ds-button[data-size='lg'] {
    height: var(--ds-control-height-lg);
    padding-inline: var(--ds-space-5);
    font-size: var(--ds-font-size-md);
  }

  /* --- États --- */
  .ds-button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .ds-button-spinner {
    width: 1em;
    height: 1em;
    flex: none;
    border: 2px solid currentcolor;
    border-inline-start-color: transparent;
    border-radius: var(--ds-radius-full);
    /* durée dérivée d'un token (~450ms) plutôt qu'une valeur brute */
    animation: ds-spin calc(var(--ds-duration-slow) * 1.5) linear infinite;
  }

  @keyframes ds-spin {
    to {
      transform: rotate(1turn);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ds-button {
      transition: none;
    }

    .ds-button-spinner {
      animation-duration: calc(var(--ds-duration-slow) * 5);
    }
  }
}
</style>
