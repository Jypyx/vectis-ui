/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VBadge',
      props: [
        { name: 'tone', type: 'BadgeTone', default: "'accent'" },
        { name: 'color', type: 'string' },
        { name: 'count', type: 'number' },
        { name: 'icon', type: 'IconSource' },
        { name: 'dot', type: 'boolean' },
        { name: 'overlay', type: 'boolean' },
        { name: 'overlayPosition', type: 'BadgeOverlayPosition', default: "'top'" },
        { name: 'bordered', type: 'boolean' },
      ],
      slots: [
        { name: 'default', type: '{}' },
      ],
    },
  ],
  cssVars: [
    { name: '--vectis-control-size-badge-h', value: '1.25rem' },
    { name: '--vectis-control-size-badge-dot', value: '0.625rem' },
  ],
} satisfies PageApi
