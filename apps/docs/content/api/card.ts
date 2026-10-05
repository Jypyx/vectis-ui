/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VCard',
      props: [
        { name: 'variant', type: 'CardVariant', values: "'outline' | 'elevated' | 'filled'", default: "'outline'" },
        { name: 'orientation', type: 'CardOrientation', values: "'vertical' | 'horizontal'", default: "'vertical'" },
        { name: 'size', type: 'CardSize', values: "'sm' | 'md' | 'lg'", default: "'md'" },
        { name: 'title', type: 'string' },
        { name: 'subtitle', type: 'string' },
        { name: 'headingLevel', type: 'CardHeadingLevel', values: '1 | 2 | 3 | 4 | 5 | 6' },
        { name: 'href', type: 'string' },
        { name: 'disabled', type: 'boolean', default: 'false' },
        { name: 'loading', type: 'boolean', default: 'false' },
        { name: 'loadingText', type: 'string' },
        { name: 'as', type: 'string', default: "'div'" },
      ],
      slots: [
        { name: 'default', type: '{}' },
        { name: 'media', type: '{}' },
        { name: 'header', type: '{}' },
        { name: 'footer', type: '{}' },
      ],
    },
  ],
  cssVars: [
    { name: '--vectis-control-size-skeleton-surface', value: '6rem' },
    { name: '--vectis-control-size-card-media', value: '12rem' },
    { name: '--vectis-control-size-card-body-min', value: '16rem' },
  ],
} satisfies PageApi
