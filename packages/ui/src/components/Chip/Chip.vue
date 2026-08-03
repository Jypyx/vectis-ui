<script setup lang="ts">
import { computed, useAttrs, useSlots } from 'vue'
import type { StyleValue } from 'vue'

import Icon from '../Icon/Icon.vue'
import { iconProps } from '../Icon/iconProps'
import type { IconSource } from '../Icon/types'
import { useMessages } from '../../i18n/state'

/**
 * Chip. Les éléments natifs couvrent focus, clavier et désactivation :
 * sélectionnable → <button aria-pressed> (v-model:selected), cliquable →
 * <button> (clic natif en fallthrough), href → <a>. Supprimable → second
 * <button> frère — jamais de bouton imbriqué (HTML invalide). Sans
 * interaction, rendu statique (span, aucun hover). Le seul JS est le pont
 * « lien inerte » (href retiré + aria-disabled + onClick
 * filtré) et la répartition des attrs (class/style sur la racine, le reste
 * sur l'élément d'action).
 */
interface ChipProps {
  /** tonal = fond teinté (défaut), solid = couleur pleine, outline = bordure. */
  variant?: 'tonal' | 'solid' | 'outline'
  tone?: 'neutral' | 'accent' | 'danger' | 'success' | 'warning'
  /**
   * Couleur custom du consommateur (hex, nom CSS ou oklch()) qui REMPLACE le
   * tone : posée en `--custom-color` inline, toutes les nuances (fond doux, texte
   * teinté, hover…) sont dérivées par color-mix avec les tokens de thème —
   * s'adapte light/dark sans rebuild. Le contraste du texte en solid (blanc)
   * reste à la charge du consommateur.
   */
  color?: string
  /** chip = coins arrondis --vectis-radius-interactive (défaut), pill = pilule. */
  shape?: 'chip' | 'pill'
  size?: 'xs' | 'sm'
  /** Hauteur réduite de 4px ; padding, typo et icônes inchangés. */
  compact?: boolean
  /** L'élément d'action devient <button type="button"> ; le clic est natif (fallthrough). */
  clickable?: boolean
  /** Rendu <a>. disabled → lien inerte (href retiré + aria-disabled). */
  href?: string
  /** Toggle : bouton aria-pressed lié à v-model:selected. Prime sur href/clickable. */
  selectable?: boolean
  /** Icône check devant le libellé quand sélectionné — REMPLACE l'emplacement
      start (iconStart / slot #start) pour ne jamais cumuler les deux. */
  check?: boolean
  /** Icône avant le libellé (le slot #start prime). */
  iconStart?: IconSource
  /** Icône après le libellé (le slot #end prime). */
  iconEnd?: IconSource
  /** Bouton de retrait qui émet `dismiss` (la disparition est au consommateur). */
  dismissible?: boolean
  /** Icône du bouton de retrait. */
  dismissIcon?: IconSource
  /** Libellé accessible du bouton de retrait. Défaut : dictionnaire du DS. */
  dismissLabel?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<ChipProps>(), {
  variant: 'tonal',
  tone: 'neutral',
  color: undefined,
  shape: 'chip',
  size: 'xs',
  compact: false,
  clickable: false,
  href: undefined,
  selectable: false,
  check: false,
  iconStart: undefined,
  iconEnd: undefined,
  dismissible: false,
  dismissIcon: 'close',
  dismissLabel: undefined,
  disabled: false,
})

// Cascade prop > dictionnaire : la prop garde la priorité, son défaut suit
// désormais la locale du DS.
const m = useMessages()
const resolvedDismissLabel = computed(() => props.dismissLabel ?? m.value.common.dismiss)

const selected = defineModel<boolean>('selected', { default: false })

defineEmits<{
  /** Émis au clic sur le bouton de retrait. */
  dismiss: []
}>()

defineSlots<{
  /** Libellé (facultatif : chip icône seule) */
  default?(): unknown
  /** Contenu avant le libellé (prime sur iconStart) */
  start?(): unknown
  /** Contenu après le libellé (prime sur iconEnd) */
  end?(): unknown
}>()

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()

/* Priorité d'interactivité : selectable > href > clickable > statique. */
const isLink = computed(() => !props.selectable && props.href !== undefined)
const actionTag = computed(() =>
  props.selectable ? 'button' : isLink.value ? 'a' : props.clickable ? 'button' : 'span',
)
const isInertLink = computed(() => isLink.value && props.disabled)

const rootStyle = computed<StyleValue>(() => [
  props.color !== undefined ? { '--custom-color': props.color } : undefined,
  attrs.style as StyleValue,
])
const actionAttrs = computed(() => {
  const rest = Object.fromEntries(
    Object.entries(attrs).filter(([key]) => key !== 'class' && key !== 'style'),
  )
  if (isInertLink.value) delete rest.onClick
  return rest
})

const showCheck = computed(() => props.check && props.selectable && selected.value)

/* Icône seule (pas de libellé) : le chip devient carré (largeur = hauteur). */
const slots = useSlots()
const iconOnly = computed(
  () => !slots.default && !!(slots.start || slots.end || props.iconStart || props.iconEnd),
)
</script>

<template>
  <span
    class="ds-chip ds-control"
    :class="$attrs.class"
    :style="rootStyle"
    :data-variant="variant"
    :data-tone="tone"
    :data-custom="color !== undefined ? '' : undefined"
    :data-shape="shape"
    :data-size="size"
    :data-compact="compact ? '' : undefined"
    :data-selected="selectable && selected ? '' : undefined"
    :data-disabled="disabled ? '' : undefined"
    :data-icon-only="iconOnly ? '' : undefined"
  >
    <component
      :is="actionTag"
      v-bind="actionAttrs"
      class="ds-chip-action"
      :type="actionTag === 'button' ? 'button' : undefined"
      :href="isLink && !disabled ? href : undefined"
      :disabled="actionTag === 'button' ? disabled : undefined"
      :aria-disabled="isInertLink ? 'true' : undefined"
      :aria-pressed="selectable ? selected : undefined"
      @click="selectable && !disabled && (selected = !selected)"
    >
      <Icon v-if="showCheck" name="check" />
      <slot v-else name="start">
        <Icon v-if="iconStart" v-bind="iconProps(iconStart)" />
      </slot>
      <slot />
      <slot name="end">
        <Icon v-if="iconEnd" v-bind="iconProps(iconEnd)" />
      </slot>
    </component>
    <button
      v-if="dismissible"
      type="button"
      class="ds-chip-remove"
      :aria-label="resolvedDismissLabel"
      :disabled="disabled"
      @click="$emit('dismiss')"
    >
      <Icon v-bind="iconProps(dismissIcon)" />
    </button>
  </span>
</template>

<style>
@layer ds.components {
  /* Tailles/compact : hauteur explicite via la classe partagée ds-control
     (styles/control-size.css), l'union TS restreint à xs/sm */
  .ds-chip {
    display: inline-flex;
    align-items: center;
    height: var(--control-height);
    border: 1px solid transparent;
    border-radius: var(--vectis-radius-interactive);
    font-family: var(--vectis-text-family);
    font-size: var(--control-font-size);
    font-weight: var(--vectis-text-control-weight);
    line-height: var(--vectis-text-control-leading);
    transition:
      background-color var(--vectis-duration-fast) var(--vectis-ease-default),
      border-color var(--vectis-duration-fast) var(--vectis-ease-default),
      color var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  .ds-chip[data-shape='pill'] {
    border-radius: var(--vectis-radius-pill);
  }

  /* --- Tones : ne définissent que des variables locales --- */
  .ds-chip[data-tone='accent'] {
    --tone-bg-solid: var(--vectis-color-accent);
    --tone-bg-solid-hover: var(--vectis-color-accent-hover);
    --tone-bg-solid-active: var(--vectis-color-accent-active);
    --tone-text-solid: var(--vectis-color-text-on-accent);
    --tone-text-tinted: var(--vectis-color-accent-text);
    --tone-bg-soft: var(--vectis-color-accent-surface);
    --tone-border-soft: var(--vectis-color-accent-border);
  }

  .ds-chip[data-tone='danger'] {
    --tone-bg-solid: var(--vectis-color-danger);
    --tone-bg-solid-hover: var(--vectis-color-danger-hover);
    --tone-bg-solid-active: var(--vectis-color-danger-active);
    --tone-text-solid: var(--vectis-color-text-on-accent);
    --tone-text-tinted: var(--vectis-color-danger-text);
    --tone-bg-soft: var(--vectis-color-danger-surface);
    --tone-border-soft: var(--vectis-color-danger-border);
  }

  .ds-chip[data-tone='success'] {
    --tone-bg-solid: var(--vectis-color-success);
    --tone-bg-solid-hover: var(--vectis-color-success-hover);
    --tone-bg-solid-active: var(--vectis-color-success-active);
    --tone-text-solid: var(--vectis-color-text-on-accent);
    --tone-text-tinted: var(--vectis-color-success-text);
    --tone-bg-soft: var(--vectis-color-success-surface);
    --tone-border-soft: var(--vectis-color-success-border);
  }

  .ds-chip[data-tone='warning'] {
    --tone-bg-solid: var(--vectis-color-warning);
    --tone-bg-solid-hover: var(--vectis-color-warning-hover);
    --tone-bg-solid-active: var(--vectis-color-warning-active);
    /* amber trop clair pour du blanc : token dédié (texte sombre) */
    --tone-text-solid: var(--vectis-color-text-on-warning);
    --tone-text-tinted: var(--vectis-color-warning-text);
    --tone-bg-soft: var(--vectis-color-warning-surface);
    --tone-border-soft: var(--vectis-color-warning-border);
  }

  /* Divergence vs Button : le solid neutre de Button (surface-muted) serait
     indistinguable du tonal. Inversion totale text/surface plutôt que
     surface-inverse : en dark, surface-inverse = surface-muted (neutral-800),
     un chip neutre sélectionné serait invisible — text (neutral-50 en dark,
     neutral-900 en light) reste distinct du fond tonal dans les deux thèmes */
  .ds-chip[data-tone='neutral'] {
    --tone-bg-solid: var(--vectis-color-text);
    --tone-bg-solid-hover: color-mix(
      in oklab,
      var(--vectis-color-text),
      var(--vectis-color-surface) 8%
    );
    --tone-bg-solid-active: color-mix(
      in oklab,
      var(--vectis-color-text),
      var(--vectis-color-surface) 14%
    );
    --tone-text-solid: var(--vectis-color-surface);
    --tone-text-tinted: var(--vectis-color-text);
    --tone-bg-soft: var(--vectis-color-surface-muted);
    --tone-border-soft: var(--vectis-color-border-strong);
  }

  /* Couleur custom (--custom-color inline) : remplace le tone, toutes les nuances
     dérivées par color-mix avec les tokens de thème (surface/text s'inversent
     entre light et dark → adaptation automatique). Bloc APRÈS les tones :
     même spécificité, le dernier gagne. */
  .ds-chip[data-custom] {
    --tone-bg-solid: var(--custom-color);
    --tone-bg-solid-hover: color-mix(in oklab, var(--custom-color), var(--vectis-color-text) 8%);
    --tone-bg-solid-active: color-mix(in oklab, var(--custom-color), var(--vectis-color-text) 14%);
    /* blanc fixe : le contraste avec une couleur claire est à la charge du
       consommateur (même limite que warning avant text-on-warning) */
    --tone-text-solid: var(--vectis-color-text-on-accent);
    --tone-text-tinted: color-mix(in oklab, var(--custom-color), var(--vectis-color-text) 30%);
    --tone-bg-soft: color-mix(in oklab, var(--custom-color), var(--vectis-color-surface) 85%);
    --tone-border-soft: color-mix(in oklab, var(--custom-color), var(--vectis-color-surface) 60%);
  }

  /* --- Variantes : consomment les variables du tone --- */
  .ds-chip[data-variant='tonal'] {
    background: var(--tone-bg-soft);
    color: var(--tone-text-tinted);
  }

  .ds-chip[data-variant='solid'] {
    background: var(--tone-bg-solid);
    color: var(--tone-text-solid);
  }

  .ds-chip[data-variant='outline'] {
    background: transparent;
    color: var(--tone-text-tinted);
    border-color: var(--tone-border-soft);
  }

  /* Sélectionné : rendu solid du tone/de la couleur COURANTE, quel que soit
     le variant (bloc après les variants, même spécificité) */
  .ds-chip[data-selected] {
    background: var(--tone-bg-solid);
    color: var(--tone-text-solid);
    border-color: transparent;
  }

  /* --- Hover/active : scopés à l'élément d'action interactif — un chip
     statique n'a aucun hover, et survoler le bouton de retrait ne change pas
     le fond du chip --- */
  .ds-chip[data-variant='tonal']:not([data-disabled], [data-selected]):has(
      :is(button, a).ds-chip-action:hover
    ) {
    background: color-mix(in oklab, var(--tone-bg-soft), var(--tone-text-tinted) 8%);
  }

  .ds-chip[data-variant='tonal']:not([data-disabled], [data-selected]):has(
      :is(button, a).ds-chip-action:active
    ) {
    background: color-mix(in oklab, var(--tone-bg-soft), var(--tone-text-tinted) 14%);
  }

  .ds-chip[data-variant='outline']:not([data-disabled], [data-selected]):has(
      :is(button, a).ds-chip-action:hover
    ) {
    background: var(--tone-bg-soft);
  }

  .ds-chip[data-variant='outline']:not([data-disabled], [data-selected]):has(
      :is(button, a).ds-chip-action:active
    ) {
    background: color-mix(in oklab, var(--tone-bg-soft), var(--tone-text-tinted) 8%);
  }

  .ds-chip[data-variant='solid']:not([data-disabled]):has(:is(button, a).ds-chip-action:hover),
  .ds-chip[data-selected]:not([data-disabled]):has(:is(button, a).ds-chip-action:hover) {
    background: var(--tone-bg-solid-hover);
  }

  .ds-chip[data-variant='solid']:not([data-disabled]):has(:is(button, a).ds-chip-action:active),
  .ds-chip[data-selected]:not([data-disabled]):has(:is(button, a).ds-chip-action:active) {
    background: var(--tone-bg-solid-active);
  }

  .ds-chip-action {
    display: inline-flex;
    align-items: center;
    gap: var(--control-gap);
    height: 100%;
    padding-block: 0;
    padding-inline: var(--control-padding-inline);
    border: none;
    background: transparent;
    color: inherit;
    font: inherit;
    border-radius: inherit;
    text-decoration: none;
    cursor: default;
  }

  /* Icône seule : action carrée — l'aspect-ratio suit la hauteur du chip
     (sans nouvelle dimension) */
  .ds-chip[data-icon-only] .ds-chip-action {
    aspect-ratio: 1;
    justify-content: center;
    padding-inline: 0;
  }

  :is(button, a).ds-chip-action {
    cursor: pointer;
  }

  :is(button, a).ds-chip-action:focus-visible {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: var(--vectis-focus-ring-offset);
  }

  /* Pas de fond, même au survol (pattern .ds-input-action) : seule la couleur
     de l'icône passe de currentcolor atténué à la pleine couleur — text-muted
     serait illisible sur les fonds teintés/solid */
  .ds-chip-remove {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--control-action-size);
    height: var(--control-action-size);
    margin-inline: calc(var(--vectis-space-1) * -1) var(--vectis-space-1);
    padding: 0;
    border: none;
    background: transparent;
    color: color-mix(in oklab, currentcolor, transparent 30%);
    border-radius: var(--vectis-radius-full);
    cursor: pointer;
    flex: none;
    transition: color var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  .ds-chip-remove:hover:not(:disabled) {
    color: inherit;
  }

  .ds-chip-remove:focus-visible {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: calc(var(--vectis-focus-ring-offset) * -1);
  }

  /* --- Désactivé : nuances de gris par tokens (surchargés par le thème dark) --- */
  .ds-chip[data-disabled] {
    background: var(--vectis-color-surface-muted);
    color: var(--vectis-color-text-subtle);
    border-color: transparent;
  }

  .ds-chip[data-disabled][data-variant='outline'] {
    background: transparent;
    border-color: var(--vectis-color-border);
  }

  .ds-chip[data-disabled] :is(:is(button, a).ds-chip-action, .ds-chip-remove) {
    cursor: not-allowed;
  }

  .ds-chip[data-disabled] .ds-chip-remove {
    color: inherit;
  }

  @media (prefers-reduced-motion: reduce) {
    .ds-chip,
    .ds-chip-remove {
      transition: none;
    }
  }
}
</style>
