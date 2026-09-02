/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VSkeletonLoader',
      props: [
        { name: 'shape', type: 'SkeletonShape', default: "'text'" },
        { name: 'size', type: 'SkeletonSize', default: "'md'" },
        { name: 'compact', type: 'boolean', default: 'false' },
        { name: 'width', type: 'number | string' },
        { name: 'height', type: 'number | string' },
        { name: 'lines', type: 'number', default: '1' },
        { name: 'animation', type: 'SkeletonAnimation', default: "'wave'" },
        { name: 'color', type: 'string' },
        { name: 'announce', type: 'boolean', default: 'false' },
        { name: 'label', type: 'string' },
      ],
    },
  ],
  cssVars: [
    { name: '--vectis-control-size-skeleton-surface', value: '6rem' },
  ],
} satisfies PageApi
