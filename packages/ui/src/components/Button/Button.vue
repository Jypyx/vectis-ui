<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import type { ButtonHTMLAttributes } from 'vue'

import Icon from '../Icon/Icon.vue'

/**
 * Le <button> natif (ou <a> en mode lien) couvre focus, clavier et
 * désactivation. Le seul JS de comportement est le pont « lien inerte » :
 * un <a> n'a pas de `disabled` natif, donc disabled/loading sur un lien
 * retire le href (non focusable, pas de navigation), pose aria-disabled
 * pour les technologies d'assistance, et filtre les handlers click du
 * fallthrough pour reproduire l'inertie totale d'un <button disabled>.
 */
interface ButtonProps {
  variant?: 'solid' | 'outline' | 'ghost' | 'elevated' | 'tonal'
  tone?: 'accent' | 'neutral' | 'danger' | 'success' | 'warning'
  size?: 'sm' | 'md' | 'lg'
  /** Hauteur réduite de 4px ; padding, typo et icônes inchangés. */
  compact?: boolean
  /** Rendu <a> au lieu de <button>. disabled/loading → lien inerte (sans href). */
  href?: string
  /** Ignoré en rendu lien. */
  type?: ButtonHTMLAttributes['type']
  disabled?: boolean
  /** Affiche un spinner, désactive le bouton et pose aria-busy. */
  loading?: boolean
  /** Nom Material Symbols rendu avant le libellé (le slot #start prime). */
  iconStart?: string
  /** Nom Material Symbols rendu après le libellé (le slot #end prime). */
  iconEnd?: string
}

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: 'solid',
  tone: 'accent',
  size: 'md',
  compact: false,
  href: undefined,
  type: 'button',
  disabled: false,
  loading: false,
  iconStart: undefined,
  iconEnd: undefined,
})

defineSlots<{
  /** Libellé du bouton */
  default(): unknown
  /** Contenu avant le libellé (icône, aria-hidden conseillé) */
  start?(): unknown
  /** Contenu après le libellé */
  end?(): unknown
}>()

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()
const isLink = computed(() => props.href !== undefined)
const isInert = computed(() => props.disabled || props.loading)
const isInertLink = computed(() => isLink.value && isInert.value)
const passedAttrs = computed(() => {
  if (!isInertLink.value) return attrs
  const rest = { ...(attrs as Record<string, unknown>) }
  delete rest.onClick
  return rest
})
</script>

<template>
  <component
    :is="isLink ? 'a' : 'button'"
    v-bind="passedAttrs"
    class="ds-button"
    :href="isLink && !isInert ? href : undefined"
    :type="isLink ? undefined : type"
    :disabled="isLink ? undefined : disabled || loading"
    :aria-disabled="isInertLink ? 'true' : undefined"
    :data-variant="variant"
    :data-tone="tone"
    :data-size="size"
    :data-compact="compact ? '' : undefined"
    :data-loading="loading ? '' : undefined"
    :aria-busy="loading || undefined"
  >
    <span v-if="loading" class="ds-button-spinner" aria-hidden="true" />
    <slot name="start">
      <Icon v-if="iconStart" :name="iconStart" />
    </slot>
    <slot />
    <slot name="end">
      <Icon v-if="iconEnd" :name="iconEnd" />
    </slot>
  </component>
</template>

<style>
@layer ds.components {
  .ds-button {
    /*
     * Hauteur en deux temps : les tailles posent --_height-base, compact
     * dérive --_height par calc(). IconButton lit aussi --_height pour sa
     * largeur carrée (même élément rendu).
     */
    --_height-base: var(--ds-control-height-md);
    --_height: var(--_height-base);

    /* API de contexte d'Icon : taille et axe opsz selon la taille du bouton */
    --ds-icon-size: var(--ds-icon-size-md);
    --ds-icon-opsz: 20;

    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--ds-space-2);
    height: var(--_height);
    padding-inline: var(--ds-space-4);
    border: 1px solid transparent;
    border-radius: var(--ds-radius-interactive);
    font-family: var(--ds-font-family-sans);
    font-size: var(--ds-font-size-sm);
    font-weight: var(--ds-font-weight-medium);
    line-height: var(--ds-font-leading-none);
    text-decoration: none;
    cursor: pointer;
    transition:
      background-color var(--ds-duration-fast) var(--ds-ease-default),
      border-color var(--ds-duration-fast) var(--ds-ease-default),
      color var(--ds-duration-fast) var(--ds-ease-default),
      box-shadow var(--ds-duration-fast) var(--ds-ease-default);
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

  .ds-button[data-tone='success'] {
    --_bg-solid: var(--ds-color-success);
    --_bg-solid-hover: var(--ds-color-success-hover);
    --_bg-solid-active: var(--ds-color-success-active);
    --_text-solid: var(--ds-color-text-on-accent);
    --_text-tinted: var(--ds-color-success-text);
    --_bg-soft: var(--ds-color-success-surface);
    --_border-soft: var(--ds-color-success-border);
  }

  .ds-button[data-tone='warning'] {
    --_bg-solid: var(--ds-color-warning);
    --_bg-solid-hover: var(--ds-color-warning-hover);
    --_bg-solid-active: var(--ds-color-warning-active);
    /* amber trop clair pour du blanc : token dédié (texte sombre) */
    --_text-solid: var(--ds-color-text-on-warning);
    --_text-tinted: var(--ds-color-warning-text);
    --_bg-soft: var(--ds-color-warning-surface);
    --_border-soft: var(--ds-color-warning-border);
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

  .ds-button[data-variant='solid']:hover:not(:disabled, [aria-disabled='true']) {
    background: var(--_bg-solid-hover);
  }

  .ds-button[data-variant='solid']:active:not(:disabled, [aria-disabled='true']) {
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

  .ds-button[data-variant='outline']:hover:not(:disabled, [aria-disabled='true']),
  .ds-button[data-variant='ghost']:hover:not(:disabled, [aria-disabled='true']) {
    background: var(--_bg-soft);
  }

  .ds-button[data-variant='outline']:active:not(:disabled, [aria-disabled='true']),
  .ds-button[data-variant='ghost']:active:not(:disabled, [aria-disabled='true']) {
    background: color-mix(in oklab, var(--_bg-soft), var(--_text-tinted) 8%);
  }

  /* Elevated (Material 3) : surface surélevée + state layer teinté */
  .ds-button[data-variant='elevated'] {
    background: var(--ds-color-surface-raised);
    color: var(--_text-tinted);
    box-shadow: var(--ds-shadow-2);
  }

  .ds-button[data-variant='elevated']:hover:not(:disabled, [aria-disabled='true']) {
    background: color-mix(in oklab, var(--ds-color-surface-raised), var(--_text-tinted) 8%);
    box-shadow: var(--ds-shadow-3);
  }

  .ds-button[data-variant='elevated']:active:not(:disabled, [aria-disabled='true']) {
    background: color-mix(in oklab, var(--ds-color-surface-raised), var(--_text-tinted) 12%);
    /* l'élévation retombe au press (M3) */
    box-shadow: var(--ds-shadow-2);
  }

  /* Tonal (Material 3 filled tonal) : fond teinté + texte teinté */
  .ds-button[data-variant='tonal'] {
    background: var(--_bg-soft);
    color: var(--_text-tinted);
  }

  .ds-button[data-variant='tonal']:hover:not(:disabled, [aria-disabled='true']) {
    background: color-mix(in oklab, var(--_bg-soft), var(--_text-tinted) 8%);
  }

  .ds-button[data-variant='tonal']:active:not(:disabled, [aria-disabled='true']) {
    background: color-mix(in oklab, var(--_bg-soft), var(--_text-tinted) 14%);
  }

  /* --- Tailles : ne posent que --_height-base (compact dérive --_height) --- */
  .ds-button[data-size='sm'] {
    --_height-base: var(--ds-control-height-sm);
    --ds-icon-size: var(--ds-icon-size-sm);
    padding-inline: var(--ds-space-3);
    font-size: var(--ds-font-size-xs);
  }

  .ds-button[data-size='lg'] {
    --_height-base: var(--ds-control-height-lg);
    --ds-icon-size: var(--ds-icon-size-lg);
    --ds-icon-opsz: 24;
    padding-inline: var(--ds-space-5);
    font-size: var(--ds-font-size-md);
  }

  /* Hauteur -4px (space-1), padding/typo/icônes inchangés */
  .ds-button[data-compact] {
    --_height: calc(var(--_height-base) - var(--ds-space-1));
  }

  /* --- États --- */
  .ds-button:is(:disabled, [aria-disabled='true']) {
    cursor: not-allowed;
  }

  /* Loading : le bouton garde ses couleurs, simplement atténuées */
  .ds-button[data-loading] {
    opacity: 0.5;
  }

  /* Désactivé (hors loading) : nuances de gris (tokens surchargés par le thème dark) */
  .ds-button:is(:disabled, [aria-disabled='true']):not([data-loading]):is(
      [data-variant='solid'],
      [data-variant='elevated'],
      [data-variant='tonal']
    ) {
    background: var(--ds-color-surface-muted);
    color: var(--ds-color-text-subtle);
    box-shadow: none;
  }

  .ds-button:is(:disabled, [aria-disabled='true']):not([data-loading])[data-variant='outline'] {
    background: transparent;
    color: var(--ds-color-text-subtle);
    border-color: var(--ds-color-border);
  }

  .ds-button:is(:disabled, [aria-disabled='true']):not([data-loading])[data-variant='ghost'] {
    background: transparent;
    color: var(--ds-color-text-subtle);
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
