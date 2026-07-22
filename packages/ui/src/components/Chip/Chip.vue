<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import type { StyleValue } from 'vue'

import Icon from '../Icon/Icon.vue'
import { iconProps } from '../Icon/iconProps'

/**
 * Chip. Les éléments natifs couvrent focus, clavier et désactivation :
 * sélectionnable → <button aria-pressed> (v-model:selected), cliquable →
 * <button> (clic natif en fallthrough), href → <a>. Supprimable → second
 * <button> frère — jamais de bouton imbriqué (HTML invalide). Sans
 * interaction, rendu statique (span, aucun hover). Le seul JS est le pont
 * « lien inerte » (pattern Button : href retiré + aria-disabled + onClick
 * filtré) et la répartition des attrs (class/style sur la racine, le reste
 * sur l'élément d'action).
 */
interface ChipProps {
  /** tonal = fond teinté (défaut), solid = couleur pleine, outline = bordure. */
  variant?: 'tonal' | 'solid' | 'outline'
  tone?: 'neutral' | 'accent' | 'danger' | 'success' | 'warning'
  /**
   * Couleur custom du consommateur (hex, nom CSS ou oklch()) qui REMPLACE le
   * tone : posée en `--_custom` inline, toutes les nuances (fond doux, texte
   * teinté, hover…) sont dérivées par color-mix avec les tokens de thème —
   * s'adapte light/dark sans rebuild. Le contraste du texte en solid (blanc)
   * reste à la charge du consommateur.
   */
  color?: string
  /** chip = coins arrondis --ds-radius-interactive (défaut), pill = pilule. */
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
  /** Nom Material Symbols ou URL, avant le libellé (le slot #start prime). */
  iconStart?: string
  /** Nom Material Symbols ou URL, après le libellé (le slot #end prime). */
  iconEnd?: string
  /** Bouton de retrait qui émet `dismiss` (la disparition est au consommateur). */
  dismissible?: boolean
  /** Icône du bouton de retrait : nom Material Symbols ou URL. */
  dismissIcon?: string
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
  disabled: false,
})

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
  props.color !== undefined ? { '--_custom': props.color } : undefined,
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
      aria-label="Retirer"
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
    height: var(--_control-height);
    /* bordure toujours posée : hauteur stable entre variants */
    border: 1px solid transparent;
    border-radius: var(--ds-radius-interactive);
    font-family: var(--ds-font-family-sans);
    font-size: var(--_control-font-size);
    font-weight: var(--ds-font-weight-medium);
    line-height: var(--ds-font-leading-none);
    transition:
      background-color var(--ds-duration-fast) var(--ds-ease-default),
      border-color var(--ds-duration-fast) var(--ds-ease-default),
      color var(--ds-duration-fast) var(--ds-ease-default);
  }

  .ds-chip[data-shape='pill'] {
    border-radius: var(--ds-radius-pill);
  }

  /* --- Tones : ne définissent que des variables locales (modèle Button) --- */
  .ds-chip[data-tone='accent'] {
    --_bg-solid: var(--ds-color-accent);
    --_bg-solid-hover: var(--ds-color-accent-hover);
    --_bg-solid-active: var(--ds-color-accent-active);
    --_text-solid: var(--ds-color-text-on-accent);
    --_text-tinted: var(--ds-color-accent-text);
    --_bg-soft: var(--ds-color-accent-surface);
    --_border-soft: var(--ds-color-accent-border);
  }

  .ds-chip[data-tone='danger'] {
    --_bg-solid: var(--ds-color-danger);
    --_bg-solid-hover: var(--ds-color-danger-hover);
    --_bg-solid-active: var(--ds-color-danger-active);
    --_text-solid: var(--ds-color-text-on-accent);
    --_text-tinted: var(--ds-color-danger-text);
    --_bg-soft: var(--ds-color-danger-surface);
    --_border-soft: var(--ds-color-danger-border);
  }

  .ds-chip[data-tone='success'] {
    --_bg-solid: var(--ds-color-success);
    --_bg-solid-hover: var(--ds-color-success-hover);
    --_bg-solid-active: var(--ds-color-success-active);
    --_text-solid: var(--ds-color-text-on-accent);
    --_text-tinted: var(--ds-color-success-text);
    --_bg-soft: var(--ds-color-success-surface);
    --_border-soft: var(--ds-color-success-border);
  }

  .ds-chip[data-tone='warning'] {
    --_bg-solid: var(--ds-color-warning);
    --_bg-solid-hover: var(--ds-color-warning-hover);
    --_bg-solid-active: var(--ds-color-warning-active);
    /* amber trop clair pour du blanc : token dédié (texte sombre) */
    --_text-solid: var(--ds-color-text-on-warning);
    --_text-tinted: var(--ds-color-warning-text);
    --_bg-soft: var(--ds-color-warning-surface);
    --_border-soft: var(--ds-color-warning-border);
  }

  /* Divergence vs Button : le solid neutre de Button (surface-muted) serait
     indistinguable du tonal — contraste inversé façon Toast neutral solid,
     lisible dans les deux thèmes (un chip neutre sélectionné reste visible) */
  .ds-chip[data-tone='neutral'] {
    --_bg-solid: var(--ds-color-surface-inverse);
    --_bg-solid-hover: color-mix(
      in oklab,
      var(--ds-color-surface-inverse),
      var(--ds-color-text-on-inverse) 8%
    );
    --_bg-solid-active: color-mix(
      in oklab,
      var(--ds-color-surface-inverse),
      var(--ds-color-text-on-inverse) 14%
    );
    --_text-solid: var(--ds-color-text-on-inverse);
    --_text-tinted: var(--ds-color-text);
    --_bg-soft: var(--ds-color-surface-muted);
    --_border-soft: var(--ds-color-border-strong);
  }

  /* Couleur custom (--_custom inline) : remplace le tone, toutes les nuances
     dérivées par color-mix avec les tokens de thème (surface/text s'inversent
     entre light et dark → adaptation automatique). Bloc APRÈS les tones :
     même spécificité, le dernier gagne. */
  .ds-chip[data-custom] {
    --_bg-solid: var(--_custom);
    --_bg-solid-hover: color-mix(in oklab, var(--_custom), var(--ds-color-text) 8%);
    --_bg-solid-active: color-mix(in oklab, var(--_custom), var(--ds-color-text) 14%);
    /* blanc fixe : le contraste avec une couleur claire est à la charge du
       consommateur (même limite que warning avant text-on-warning) */
    --_text-solid: var(--ds-color-text-on-accent);
    --_text-tinted: color-mix(in oklab, var(--_custom), var(--ds-color-text) 30%);
    --_bg-soft: color-mix(in oklab, var(--_custom), var(--ds-color-surface) 85%);
    --_border-soft: color-mix(in oklab, var(--_custom), var(--ds-color-surface) 60%);
  }

  /* --- Variantes : consomment les variables du tone --- */
  .ds-chip[data-variant='tonal'] {
    background: var(--_bg-soft);
    color: var(--_text-tinted);
  }

  .ds-chip[data-variant='solid'] {
    background: var(--_bg-solid);
    color: var(--_text-solid);
  }

  .ds-chip[data-variant='outline'] {
    background: transparent;
    color: var(--_text-tinted);
    border-color: var(--_border-soft);
  }

  /* Sélectionné : rendu solid du tone/de la couleur COURANTE, quel que soit
     le variant (bloc après les variants, même spécificité) */
  .ds-chip[data-selected] {
    background: var(--_bg-solid);
    color: var(--_text-solid);
    border-color: transparent;
  }

  /* --- Hover/active : scopés à l'élément d'action interactif — un chip
     statique n'a aucun hover, et survoler le bouton de retrait ne change pas
     le fond du chip --- */
  .ds-chip[data-variant='tonal']:not([data-disabled], [data-selected]):has(
      :is(button, a).ds-chip-action:hover
    ) {
    background: color-mix(in oklab, var(--_bg-soft), var(--_text-tinted) 8%);
  }

  .ds-chip[data-variant='tonal']:not([data-disabled], [data-selected]):has(
      :is(button, a).ds-chip-action:active
    ) {
    background: color-mix(in oklab, var(--_bg-soft), var(--_text-tinted) 14%);
  }

  .ds-chip[data-variant='outline']:not([data-disabled], [data-selected]):has(
      :is(button, a).ds-chip-action:hover
    ) {
    background: var(--_bg-soft);
  }

  .ds-chip[data-variant='outline']:not([data-disabled], [data-selected]):has(
      :is(button, a).ds-chip-action:active
    ) {
    background: color-mix(in oklab, var(--_bg-soft), var(--_text-tinted) 8%);
  }

  .ds-chip[data-variant='solid']:not([data-disabled]):has(:is(button, a).ds-chip-action:hover),
  .ds-chip[data-selected]:not([data-disabled]):has(:is(button, a).ds-chip-action:hover) {
    background: var(--_bg-solid-hover);
  }

  .ds-chip[data-variant='solid']:not([data-disabled]):has(:is(button, a).ds-chip-action:active),
  .ds-chip[data-selected]:not([data-disabled]):has(:is(button, a).ds-chip-action:active) {
    background: var(--_bg-solid-active);
  }

  .ds-chip-action {
    display: inline-flex;
    align-items: center;
    gap: var(--_control-gap);
    height: 100%;
    padding-block: 0;
    padding-inline: var(--_control-padding-inline);
    border: none;
    background: transparent;
    color: inherit;
    font: inherit;
    border-radius: inherit;
    text-decoration: none;
    cursor: default;
  }

  :is(button, a).ds-chip-action {
    cursor: pointer;
  }

  :is(button, a).ds-chip-action:focus-visible {
    outline: var(--ds-focus-ring-width) solid var(--ds-focus-ring-color);
    outline-offset: var(--ds-focus-ring-offset);
  }

  /* Pas de fond, même au survol (pattern .ds-input-action) : seule la couleur
     de l'icône passe de currentcolor atténué à la pleine couleur — text-muted
     serait illisible sur les fonds teintés/solid */
  .ds-chip-remove {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--_control-action-size);
    height: var(--_control-action-size);
    margin-inline: calc(var(--ds-space-1) * -1) var(--ds-space-1);
    padding: 0;
    border: none;
    background: transparent;
    color: color-mix(in oklab, currentcolor, transparent 30%);
    border-radius: var(--ds-radius-full);
    cursor: pointer;
    flex: none;
    transition: color var(--ds-duration-fast) var(--ds-ease-default);
  }

  .ds-chip-remove:hover:not(:disabled) {
    color: inherit;
  }

  .ds-chip-remove:focus-visible {
    outline: var(--ds-focus-ring-width) solid var(--ds-focus-ring-color);
    outline-offset: calc(var(--ds-focus-ring-offset) * -1);
  }

  /* --- Désactivé : nuances de gris par tokens (surchargés par le thème dark) --- */
  .ds-chip[data-disabled] {
    background: var(--ds-color-surface-muted);
    color: var(--ds-color-text-subtle);
    border-color: transparent;
  }

  .ds-chip[data-disabled][data-variant='outline'] {
    background: transparent;
    border-color: var(--ds-color-border);
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
