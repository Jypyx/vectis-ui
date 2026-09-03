/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VButtonGroup',
      props: [
        { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'" },
        { name: 'variant', type: 'ButtonVariant' },
        { name: 'tone', type: 'ButtonTone' },
        { name: 'size', type: 'ButtonSize' },
        { name: 'compact', type: 'boolean' },
        { name: 'elevated', type: 'boolean' },
      ],
      slots: [
        { name: 'default', type: '{}' },
      ],
    },
  ],
} satisfies PageApi
