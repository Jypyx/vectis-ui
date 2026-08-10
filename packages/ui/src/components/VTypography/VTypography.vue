<script setup lang="ts">
// @core — the only JS is deriving the default tag from the variant.
/**
 * The design system's text element: `variant` selects a complete typographic
 * recipe (family, size, weight, leading, tracking) taken from the semantic
 * `--vectis-text-*` tokens, and `tone` a semantic colour. 100% HTML/CSS — the
 * only JS is deriving the default tag.
 *
 * The root is a single element: native attributes (id, for, aria-*…) land on it
 * by fallthrough — indispensable when the component serves as a field label
 * (`as="label"` + `for`).
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
  /** Typographic role — a complete recipe of `--vectis-text-*` tokens. */
  variant?: TypographyVariant
  /** The tag rendered; by default derived from the variant (h1…h4, p, span, code). */
  as?: string
  /** Semantic text colour; `default` inherits from the context. */
  tone?: TypographyTone
  /**
   * Single-line truncation (ellipsis). The element must have a constrained width
   * (a block or a flex item) for the cut to apply.
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

/** Default semantic tag of each variant, overridable through `as`. */
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
    /* Defaults re-set on every instance: custom properties inherit, so without
       this a VTypography nested under a tracked variant (display, headings) or
       under `code` would inherit --typography-tracking / --typography-family. The
       [data-variant] blocks (higher specificity) override them. */
    --typography-family: var(--vectis-text-family);
    --typography-tracking: normal;

    margin: 0; /* no margin: spacing belongs to the parent layout */
    font-family: var(--typography-family);
    font-size: var(--typography-size);
    font-weight: var(--typography-weight);
    line-height: var(--typography-leading);
    letter-spacing: var(--typography-tracking);
    /* Tone `default` = inheritance: composable inside already-coloured contexts
       (an inverted surface, the VToast tones…). */
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

  /* `default` has no block: without --typography-color the text inherits from the
     context, which is what makes it composable inside an inverted surface or a
     tinted VToast. */
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
