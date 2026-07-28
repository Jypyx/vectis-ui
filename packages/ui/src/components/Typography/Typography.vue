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

  /* --- Variantes : une recette --ds-text-* chacune --- */
  .ds-typography[data-variant='display'] {
    --_size: var(--ds-text-display-size);
    --_weight: var(--ds-text-display-weight);
    --_leading: var(--ds-text-display-leading);
    --_tracking: var(--ds-text-display-tracking);
  }

  .ds-typography[data-variant='heading-1'] {
    --_size: var(--ds-text-heading-1-size);
    --_weight: var(--ds-text-heading-1-weight);
    --_leading: var(--ds-text-heading-1-leading);
    --_tracking: var(--ds-text-heading-1-tracking);
  }

  .ds-typography[data-variant='heading-2'] {
    --_size: var(--ds-text-heading-2-size);
    --_weight: var(--ds-text-heading-2-weight);
    --_leading: var(--ds-text-heading-2-leading);
    --_tracking: var(--ds-text-heading-2-tracking);
  }

  .ds-typography[data-variant='heading-3'] {
    --_size: var(--ds-text-heading-3-size);
    --_weight: var(--ds-text-heading-3-weight);
    --_leading: var(--ds-text-heading-3-leading);
  }

  .ds-typography[data-variant='heading-4'] {
    --_size: var(--ds-text-heading-4-size);
    --_weight: var(--ds-text-heading-4-weight);
    --_leading: var(--ds-text-heading-4-leading);
  }

  .ds-typography[data-variant='subtitle'] {
    --_size: var(--ds-text-subtitle-size);
    --_weight: var(--ds-text-subtitle-weight);
    --_leading: var(--ds-text-subtitle-leading);
  }

  .ds-typography[data-variant='body-lg'] {
    --_size: var(--ds-text-body-lg-size);
    --_weight: var(--ds-text-body-lg-weight);
    --_leading: var(--ds-text-body-lg-leading);
  }

  .ds-typography[data-variant='body-md'] {
    --_size: var(--ds-text-body-md-size);
    --_weight: var(--ds-text-body-md-weight);
    --_leading: var(--ds-text-body-md-leading);
  }

  .ds-typography[data-variant='body-sm'] {
    --_size: var(--ds-text-body-sm-size);
    --_weight: var(--ds-text-body-sm-weight);
    --_leading: var(--ds-text-body-sm-leading);
  }

  .ds-typography[data-variant='label'] {
    --_size: var(--ds-text-label-size);
    --_weight: var(--ds-text-label-weight);
    --_leading: var(--ds-text-label-leading);
  }

  .ds-typography[data-variant='caption'] {
    --_size: var(--ds-text-caption-size);
    --_weight: var(--ds-text-caption-weight);
    --_leading: var(--ds-text-caption-leading);
  }

  .ds-typography[data-variant='overline'] {
    --_size: var(--ds-text-overline-size);
    --_weight: var(--ds-text-overline-weight);
    --_leading: var(--ds-text-overline-leading);
    --_tracking: var(--ds-text-overline-tracking);

    text-transform: uppercase;
  }

  .ds-typography[data-variant='code'] {
    --_family: var(--ds-text-family-code);
    --_size: var(--ds-text-code-size);
    --_weight: var(--ds-text-code-weight);
    --_leading: var(--ds-text-code-leading);
  }

  /* --- Tones : couleur du texte. `default` n'a pas de bloc : sans --_color,
     le texte hérite du contexte (composable dans les surfaces inversées,
     les tones de Toast, etc.). --- */
  .ds-typography[data-tone='muted'] {
    --_color: var(--ds-color-text-muted);
  }

  .ds-typography[data-tone='subtle'] {
    --_color: var(--ds-color-text-subtle);
  }

  .ds-typography[data-tone='accent'] {
    --_color: var(--ds-color-accent-text);
  }

  .ds-typography[data-tone='danger'] {
    --_color: var(--ds-color-danger-text);
  }

  .ds-typography[data-tone='success'] {
    --_color: var(--ds-color-success-text);
  }

  .ds-typography[data-tone='warning'] {
    --_color: var(--ds-color-warning-text);
  }

  .ds-typography[data-tone='on-inverse'] {
    --_color: var(--ds-color-text-on-inverse);
  }

  .ds-typography[data-truncate] {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
