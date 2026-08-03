<script setup lang="ts">
/**
 * Élément de texte du design system : `variant` sélectionne une recette
 * typographique complète (famille, taille, graisse, interlignage, tracking)
 * issue des tokens sémantiques `--vectis-text-*`, `tone` une couleur sémantique.
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
  /** Rôle typographique — une recette complète de tokens `--vectis-text-*`. */
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
    class="v-typography"
    :data-variant="variant"
    :data-tone="tone === 'default' ? undefined : tone"
    :data-truncate="truncate ? '' : undefined"
  >
    <slot />
  </component>
</template>

<style>
@layer vectis.components {
  .v-typography {
    /* Défauts re-posés sur chaque instance : les custom properties héritent,
       sans quoi un Typography imbriqué sous une variante à tracking (display,
       headings) ou sous `code` hériterait de --typography-tracking / --typography-family. Les
       blocs [data-variant] (spécificité supérieure) les surchargent. */
    --typography-family: var(--vectis-text-family);
    --typography-tracking: normal;

    margin: 0; /* aucune marge : l'espacement appartient au layout parent */
    font-family: var(--typography-family);
    font-size: var(--typography-size);
    font-weight: var(--typography-weight);
    line-height: var(--typography-leading);
    letter-spacing: var(--typography-tracking);
    /* Tone `default` = héritage : composable dans les contextes déjà colorés
       (surface inversée, tones de Toast…). */
    color: var(--typography-color, inherit);
    overflow-wrap: break-word;
  }

  .v-typography[data-variant='display'] {
    --typography-size: var(--vectis-text-display-size);
    --typography-weight: var(--vectis-text-display-weight);
    --typography-leading: var(--vectis-text-display-leading);
    --typography-tracking: var(--vectis-text-display-tracking);
  }

  .v-typography[data-variant='heading-1'] {
    --typography-size: var(--vectis-text-heading-1-size);
    --typography-weight: var(--vectis-text-heading-1-weight);
    --typography-leading: var(--vectis-text-heading-1-leading);
    --typography-tracking: var(--vectis-text-heading-1-tracking);
  }

  .v-typography[data-variant='heading-2'] {
    --typography-size: var(--vectis-text-heading-2-size);
    --typography-weight: var(--vectis-text-heading-2-weight);
    --typography-leading: var(--vectis-text-heading-2-leading);
    --typography-tracking: var(--vectis-text-heading-2-tracking);
  }

  .v-typography[data-variant='heading-3'] {
    --typography-size: var(--vectis-text-heading-3-size);
    --typography-weight: var(--vectis-text-heading-3-weight);
    --typography-leading: var(--vectis-text-heading-3-leading);
  }

  .v-typography[data-variant='heading-4'] {
    --typography-size: var(--vectis-text-heading-4-size);
    --typography-weight: var(--vectis-text-heading-4-weight);
    --typography-leading: var(--vectis-text-heading-4-leading);
  }

  .v-typography[data-variant='subtitle'] {
    --typography-size: var(--vectis-text-subtitle-size);
    --typography-weight: var(--vectis-text-subtitle-weight);
    --typography-leading: var(--vectis-text-subtitle-leading);
  }

  .v-typography[data-variant='body-lg'] {
    --typography-size: var(--vectis-text-body-lg-size);
    --typography-weight: var(--vectis-text-body-lg-weight);
    --typography-leading: var(--vectis-text-body-lg-leading);
  }

  .v-typography[data-variant='body-md'] {
    --typography-size: var(--vectis-text-body-md-size);
    --typography-weight: var(--vectis-text-body-md-weight);
    --typography-leading: var(--vectis-text-body-md-leading);
  }

  .v-typography[data-variant='body-sm'] {
    --typography-size: var(--vectis-text-body-sm-size);
    --typography-weight: var(--vectis-text-body-sm-weight);
    --typography-leading: var(--vectis-text-body-sm-leading);
  }

  .v-typography[data-variant='label'] {
    --typography-size: var(--vectis-text-label-size);
    --typography-weight: var(--vectis-text-label-weight);
    --typography-leading: var(--vectis-text-label-leading);
  }

  .v-typography[data-variant='caption'] {
    --typography-size: var(--vectis-text-caption-size);
    --typography-weight: var(--vectis-text-caption-weight);
    --typography-leading: var(--vectis-text-caption-leading);
  }

  .v-typography[data-variant='overline'] {
    --typography-size: var(--vectis-text-overline-size);
    --typography-weight: var(--vectis-text-overline-weight);
    --typography-leading: var(--vectis-text-overline-leading);
    --typography-tracking: var(--vectis-text-overline-tracking);

    text-transform: uppercase;
  }

  .v-typography[data-variant='code'] {
    --typography-family: var(--vectis-text-family-code);
    --typography-size: var(--vectis-text-code-size);
    --typography-weight: var(--vectis-text-code-weight);
    --typography-leading: var(--vectis-text-code-leading);
  }

  /* `default` n'a pas de bloc : sans --typography-color, le texte hérite du contexte —
     ce qui le rend composable dans une surface inversée ou un Toast teinté. */
  .v-typography[data-tone='muted'] {
    --typography-color: var(--vectis-color-text-muted);
  }

  .v-typography[data-tone='subtle'] {
    --typography-color: var(--vectis-color-text-subtle);
  }

  .v-typography[data-tone='accent'] {
    --typography-color: var(--vectis-color-accent-text);
  }

  .v-typography[data-tone='danger'] {
    --typography-color: var(--vectis-color-danger-text);
  }

  .v-typography[data-tone='success'] {
    --typography-color: var(--vectis-color-success-text);
  }

  .v-typography[data-tone='warning'] {
    --typography-color: var(--vectis-color-warning-text);
  }

  .v-typography[data-tone='on-inverse'] {
    --typography-color: var(--vectis-color-text-on-inverse);
  }

  .v-typography[data-truncate] {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
