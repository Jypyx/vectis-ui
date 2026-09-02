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
        { name: 'variant', type: 'TypographyVariant', default: "'body-md'" },
        { name: 'as', type: 'string' },
        { name: 'tone', type: 'TypographyTone', default: "'default'" },
        { name: 'truncate', type: 'boolean', default: 'false' },
      ],
      slots: [
        { name: 'default', type: '{}' },
      ],
    },
  ],
} satisfies PageApi
