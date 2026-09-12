/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VTypography',
      props: [
        { name: 'variant', type: 'TypographyVariant', values: "'display' | 'heading-1' | 'heading-2' | 'heading-3' | 'heading-4' | 'subtitle' | 'body-xl' | 'body-lg' | 'body-md' | 'body-sm' | 'label' | 'caption' | 'overline' | 'code'", default: "'body-md'" },
        { name: 'as', type: 'string' },
        { name: 'tone', type: 'TypographyTone', values: "'default' | 'muted' | 'subtle' | 'accent' | 'danger' | 'success' | 'warning' | 'on-inverse'", default: "'default'" },
        { name: 'truncate', type: 'boolean', default: 'false' },
      ],
      slots: [
        { name: 'default', type: '{}' },
      ],
    },
  ],
} satisfies PageApi
