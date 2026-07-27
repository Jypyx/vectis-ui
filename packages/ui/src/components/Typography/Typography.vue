<script setup lang="ts">
/**
 * Élément de texte du design system : `variant` sélectionne une recette
 * typographique complète (famille, taille, graisse, interlignage, tracking)
 * issue des tokens sémantiques `--ds-text-*`, `tone` une couleur sémantique.
 * 100 % HTML/CSS — le seul JS est la dérivation de la balise par défaut.
 *
 * La racine est unique : les attributs natifs (id, for, aria-*…) tombent
 * dessus par fallthrough — indispensable quand le composant sert de label
 * de champ (`as="label"` + `for`).
 */
import { computed } from 'vue'

export type TypographyVariant =
  | 'display'
  | 'heading-1'
  | 'heading-2'
  | 'heading-3'
  | 'heading-4'
  | 'subtitle'
  | 'body-lg'
  | 'body-md'
  | 'body-sm'
  | 'label'
  | 'caption'
  | 'overline'
  | 'code'

export type TypographyTone =
  'default' | 'muted' | 'subtle' | 'accent' | 'danger' | 'success' | 'warning' | 'on-inverse'

interface TypographyProps {
  /** Rôle typographique — une recette complète de tokens `--ds-text-*`. */
  variant?: TypographyVariant
  /** Balise rendue ; par défaut dérivée de la variante (h1…h4, p, span, code). */
  as?: string
  /** Couleur sémantique du texte ; `default` hérite du contexte. */
  tone?: TypographyTone
  /**
   * Troncature sur une ligne (ellipsis). L'élément doit disposer d'une
   * largeur contrainte (bloc ou flex item) pour que la coupe s'applique.
   */
  truncate?: boolean
}

const props = withDefaults(defineProps<TypographyProps>(), {
  variant: 'body-md',
  as: undefined,
  tone: 'default',
  truncate: false,
})

defineSlots<{
  /** Contenu textuel. */
  default(): unknown
}>()

/** Balise sémantique par défaut de chaque variante, surchargeable par `as`. */
const DEFAULT_TAGS: Record<TypographyVariant, string> = {
  display: 'p',
  'heading-1': 'h1',
  'heading-2': 'h2',
  'heading-3': 'h3',
  'heading-4': 'h4',
  subtitle: 'p',
  'body-lg': 'p',
  'body-md': 'p',
  'body-sm': 'p',
  label: 'span',
  caption: 'p',
  overline: 'span',
  code: 'code',
}

const tag = computed(() => props.as ?? DEFAULT_TAGS[props.variant])
</script>

<template>
  <component
    :is="tag"
    class="ds-typography"
    :data-variant="variant"
    :data-tone="tone === 'default' ? undefined : tone"
    :data-truncate="truncate ? '' : undefined"
  >
    <slot />
  </component>
</template>

<style src="./Typography.tokens.css"></style>
<style>
@layer ds.components {
  .ds-typography {
    /* Défauts re-posés sur chaque instance : les custom properties héritent,
       sans quoi un Typography imbriqué sous une variante à tracking (display,
       headings) ou sous `code` hériterait de --_tracking / --_family. Les
       blocs [data-variant] (spécificité supérieure) les surchargent. */
    --_family: var(--ds-text-family);
    --_tracking: normal;

    margin: 0; /* aucune marge : l'espacement appartient au layout parent */
    font-family: var(--_family);
    font-size: var(--_size);
    font-weight: var(--_weight);
    line-height: var(--_leading);
    letter-spacing: var(--_tracking);
    /* Tone `default` = héritage : composable dans les contextes déjà colorés
       (surface inversée, tones de Toast…). */
    color: var(--_color, inherit);
    overflow-wrap: break-word;
  }

  .ds-typography[data-variant='overline'] {
    text-transform: uppercase;
  }

  .ds-typography[data-truncate] {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
