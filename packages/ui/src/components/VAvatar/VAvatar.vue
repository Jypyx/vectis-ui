<script setup lang="ts">
import { computed, inject, ref, useAttrs, watch } from 'vue'
import type { StyleValue } from 'vue'

import Icon from '../Icon/Icon.vue'
import { iconProps } from '../Icon/iconProps'
import type { IconSource } from '../Icon/types'
import { avatarGroupKey } from './context'

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/**
 * Avatar rond. Cascade de contenu : image → icône → initiales (dérivées du
 * nom) → slot par défaut (échappatoire, ex. l'agrégat « +X » d'AvatarGroup).
 *
 * JS justifié : la détection d'échec de chargement d'image (`error`) n'existe
 * qu'en événement DOM ; les initiales et la teinte auto sont dérivées du nom ;
 * le pont « lien inerte » (href retiré + aria-disabled + onClick filtré) ; la
 * répartition des attrs (style hors fallthrough pour y injecter
 * --avatar-hue/--custom-color).
 */
interface AvatarProps {
  /** URL de l'image (priorité 1). */
  src?: string
  /** Icône affichée à défaut d'image (priorité 2) : nom, ou rendu explicite. */
  icon?: IconSource
  /** Nom complet — alt par défaut, source des initiales et graine de la teinte auto. */
  name?: string
  /** Alt/libellé explicite (prioritaire sur `name`). */
  alt?: string
  /**
   * Couleur custom (hex, nom CSS ou oklch()) qui REMPLACE la teinte auto :
   * posée en `--custom-color` inline. Sinon, à défaut d'image, une teinte OKLCH
   * déterministe est dérivée du `name`.
   */
  color?: string
  /** Défaut `md`. `undefined` = hérité d'un AvatarGroup englobant. */
  size?: AvatarSize
  /** Hauteur réduite de 4px (comme les autres contrôles). */
  compact?: boolean
  /** Rendu `<a>`. disabled → lien inerte (href retiré + aria-disabled). */
  href?: string
  /** Rendu `<button type="button">` (le slot #trigger d'un Tooltip s'y branche par fallthrough). */
  clickable?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<AvatarProps>(), {
  src: undefined,
  icon: undefined,
  name: undefined,
  alt: undefined,
  color: undefined,
  size: undefined,
  compact: false,
  href: undefined,
  clickable: false,
  disabled: false,
})

defineSlots<{
  /** Contenu de repli (remplace les initiales), ex. « +X » d'AvatarGroup. */
  default?(): unknown
}>()

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()
const group = inject(avatarGroupKey, null)

// Taille/compact : prop explicite, sinon héritage du groupe, sinon défaut.
const resolvedSize = computed<AvatarSize>(() => props.size ?? group?.size ?? 'md')
const resolvedCompact = computed(() => props.compact || (group?.compact ?? false))

/* Priorité d'interactivité : href > clickable > statique. */
const isLink = computed(() => props.href !== undefined)
const isInteractive = computed(() => isLink.value || props.clickable)
const tag = computed(() => (isLink.value ? 'a' : props.clickable ? 'button' : 'span'))
const isInertLink = computed(() => isLink.value && props.disabled)

const failed = ref(false)
watch(
  () => props.src,
  () => {
    failed.value = false
  },
)
const showImage = computed(() => Boolean(props.src) && !failed.value)

const accessibleName = computed(() => props.alt ?? props.name)

const initials = computed(() => {
  if (!props.name) return ''
  return props.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase() ?? '')
    .join('')
})

/*
 * Teinte auto : hash pur JS du nom → teinte OKLCH (0–359). Seule la teinte est
 * inline (scalaire unitless) ; le CSS compose fond/texte avec des L/C fixés par
 * thème (adaptation light/dark sans dépendre de contrast-color). Couleur
 * calculée hors tokens, exception assumée. SSR-safe : aucune API navigateur.
 */
const hue = computed(() => {
  if (!props.name) return null
  let hash = 0
  for (let i = 0; i < props.name.length; i++) {
    hash = (hash * 31 + props.name.charCodeAt(i)) | 0
  }
  return Math.abs(hash) % 360
})
const isAuto = computed(() => props.color === undefined && hue.value !== null)

const rootStyle = computed<StyleValue>(() => [
  props.color !== undefined
    ? { '--custom-color': props.color }
    : isAuto.value
      ? { '--avatar-hue': String(hue.value) }
      : undefined,
  attrs.style as StyleValue,
])

// Fallthrough sans `style` (géré par rootStyle) ; onClick retiré si lien inerte.
const passedAttrs = computed(() => {
  const rest = { ...(attrs as Record<string, unknown>) }
  delete rest.style
  if (isInertLink.value) delete rest.onClick
  return rest
})
</script>

<template>
  <component
    :is="tag"
    v-bind="passedAttrs"
    class="v-avatar v-control"
    :style="rootStyle"
    :data-size="resolvedSize"
    :data-compact="resolvedCompact ? '' : undefined"
    :data-custom="color !== undefined ? '' : undefined"
    :data-auto="isAuto ? '' : undefined"
    :href="isLink && !disabled ? href : undefined"
    :type="tag === 'button' ? 'button' : undefined"
    :disabled="tag === 'button' ? disabled : undefined"
    :aria-disabled="isInertLink ? 'true' : undefined"
    :role="!isInteractive && !showImage && accessibleName ? 'img' : undefined"
    :aria-label="!showImage ? accessibleName : undefined"
  >
    <img
      v-if="showImage"
      class="v-avatar-image"
      :src="src"
      :alt="alt ?? name ?? ''"
      @error="failed = true"
    />
    <Icon v-else-if="icon" v-bind="iconProps(icon)" class="v-avatar-icon" />
    <slot v-else>
      <span class="v-avatar-initials" aria-hidden="true">{{ initials }}</span>
    </slot>
  </component>
</template>

<style>
@layer vectis.components {
  .v-avatar {
    /* Tailles/compact : hauteur explicite via la classe partagée v-control
       (styles/control-size.css) ; le carré rond réutilise --control-height. */
    --avatar-bg: var(--vectis-color-surface-muted);
    --avatar-text: var(--vectis-color-text-muted);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: var(--control-height);
    block-size: var(--control-height);
    flex: none;
    overflow: hidden;
    /* reset des styles UA du <button> en mode cliquable (bordure/padding) */
    padding: 0;
    border: none;
    background: var(--avatar-bg);
    color: var(--avatar-text);
    border-radius: var(--vectis-radius-full);
    font-family: var(--vectis-text-family);
    /* initiales : typo du contrôle (token de l'échelle de tailles), jamais un
       ratio brut sur la hauteur — la typo passe par des tokens (philosophie #3) */
    font-size: var(--control-font-size);
    /* semibold : emphase d'état, pas un rôle typo (initiales plus lisibles à
       petite taille) */
    font-weight: var(--vectis-font-weight-semibold);
    line-height: var(--vectis-text-control-leading);
    text-decoration: none;
    user-select: none;
    /* Anneau de séparation en pile (transparent hors AvatarGroup, qui pose
       --avatar-ring-color) — ne rogne pas la boîte (box-shadow, pas de border). */
    box-shadow: 0 0 0 var(--vectis-control-size-avatar-ring) var(--avatar-ring-color, transparent);
    transition:
      background-color var(--vectis-duration-fast) var(--vectis-ease-default),
      box-shadow var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  /* Teinte auto (name, pas de color custom) : L/C fixes, teinte inline. */
  .v-avatar[data-auto] {
    --avatar-bg: oklch(0.9 0.06 var(--avatar-hue));
    --avatar-text: oklch(0.42 0.13 var(--avatar-hue));
  }

  /* Couleur custom (--custom-color inline) : prime, texte blanc fixe (contraste à la
     charge du consommateur). Bloc après data-auto. */
  .v-avatar[data-custom] {
    --avatar-bg: var(--custom-color);
    --avatar-text: var(--vectis-color-text-on-accent);
  }

  /* Dark : fond sombre teinté + texte clair (le système de thème est opt-in par
     [data-theme='dark'], jamais par media query — cf. tokens.css). */
  [data-theme='dark'] .v-avatar[data-auto] {
    --avatar-bg: oklch(0.42 0.09 var(--avatar-hue));
    --avatar-text: oklch(0.92 0.05 var(--avatar-hue));
  }

  .v-avatar-image {
    inline-size: 100%;
    block-size: 100%;
    object-fit: cover;
  }

  /* L'icône occupe ~55% du disque (ratio unitless, comme la font-size). */
  .v-avatar-icon {
    --vectis-icon-size: calc(var(--control-height) * 0.55);
  }

  :is(a, button).v-avatar {
    cursor: pointer;
  }

  :is(a, button).v-avatar:hover:not([aria-disabled='true'], :disabled) {
    background: color-mix(in oklab, var(--avatar-bg), var(--vectis-color-text) 10%);
  }

  :is(a, button).v-avatar:focus-visible {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: var(--vectis-focus-ring-offset);
  }

  .v-avatar:is(:disabled, [aria-disabled='true']) {
    cursor: not-allowed;
    background: var(--vectis-color-surface-muted);
    color: var(--vectis-color-text-subtle);
  }

  @media (prefers-reduced-motion: reduce) {
    .v-avatar {
      transition: none;
    }
  }
}
</style>
