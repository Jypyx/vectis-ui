<script setup lang="ts">
// @core — the only JS is deriving the default tag from the variant.
/**
 * The design system's text element. Rather than setting a size here and a weight
 * there, the writer names the ROLE the text plays — a heading, a caption, a label —
 * and `variant` applies the complete typographic recipe that goes with it: family,
 * size, weight, line height and letter spacing, all read from the semantic tokens.
 * `tone` does the same for colour.
 *
 * It renders a single element and adds no behaviour, so the attributes it is given
 * (id, for, aria-*…) land straight on that element. This is what lets it serve as a
 * real field label, with `as="label"` and a `for`.
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
  /**
   * The role this text plays, which selects a complete recipe of typographic
   * tokens — size, weight, line height and, where the role calls for it, letter
   * spacing and a monospaced family.
   */
  variant?: TypographyVariant
  /**
   * The HTML tag to render. Each variant already has a sensible default (h1 to h4,
   * p, span, code), so this is for the cases where the meaning and the look differ —
   * a subtitle that is really an `h2`, or a label attached to a field.
   */
  as?: string
  /**
   * The colour of the text. `default` sets none at all, so the text inherits from
   * whatever surrounds it — which is what lets the same component be used on an
   * inverted surface or inside a coloured toast.
   */
  tone?: TypographyTone
  /**
   * Cuts the text to one line and ends it with an ellipsis. The element needs a
   * width to be cut against — being a block, or a flex item — otherwise there is
   * nothing to overflow and the text simply stays whole.
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
  /** Text content. */
  default(): unknown
}>()

/**
 * The tag each variant renders when `as` says nothing — the one whose meaning
 * matches the role.
 */
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
    /* These two defaults are re-declared on every instance because custom properties
       INHERIT: nested inside a variant that sets letter spacing, or inside a `code`,
       a VTypography would otherwise pick up its ancestor's tracking and monospaced
       family. The [data-variant] blocks below, being more specific, still win. */
    --typography-family: var(--vectis-text-family);
    --typography-tracking: normal;

    margin: 0; /* the space around a text block belongs to the layout holding it */
    font-family: var(--typography-family);
    font-size: var(--typography-size);
    font-weight: var(--typography-weight);
    line-height: var(--typography-leading);
    letter-spacing: var(--typography-tracking);
    /* With the `default` tone no colour variable is set, and the fallback makes the
       text inherit — which is what allows the component to be dropped inside an
       already coloured context, an inverted surface or a tinted toast. */
    color: var(--typography-color, inherit);
    overflow-wrap: break-word;
  }

  .v-typography[data-variant='display'] {
    --typography-family: var(--vectis-text-family-heading);
    --typography-size: var(--vectis-text-display-size);
    --typography-weight: var(--vectis-text-display-weight);
    --typography-leading: var(--vectis-text-display-leading);
    --typography-tracking: var(--vectis-text-display-tracking);
  }

  .v-typography[data-variant='heading-1'] {
    --typography-family: var(--vectis-text-family-heading);
    --typography-size: var(--vectis-text-heading-1-size);
    --typography-weight: var(--vectis-text-heading-1-weight);
    --typography-leading: var(--vectis-text-heading-1-leading);
    --typography-tracking: var(--vectis-text-heading-1-tracking);
  }

  .v-typography[data-variant='heading-2'] {
    --typography-family: var(--vectis-text-family-heading);
    --typography-size: var(--vectis-text-heading-2-size);
    --typography-weight: var(--vectis-text-heading-2-weight);
    --typography-leading: var(--vectis-text-heading-2-leading);
    --typography-tracking: var(--vectis-text-heading-2-tracking);
  }

  .v-typography[data-variant='heading-3'] {
    --typography-family: var(--vectis-text-family-heading);
    --typography-size: var(--vectis-text-heading-3-size);
    --typography-weight: var(--vectis-text-heading-3-weight);
    --typography-leading: var(--vectis-text-heading-3-leading);
  }

  .v-typography[data-variant='heading-4'] {
    --typography-family: var(--vectis-text-family-heading);
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

  /* There is deliberately no block for the `default` tone: leaving the colour
     variable unset is precisely what makes the text inherit. */
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
