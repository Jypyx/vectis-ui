/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VProgressCircular',
      props: [
        { name: 'value', type: 'number', default: '0' },
        { name: 'max', type: 'number', default: '100' },
        { name: 'indeterminate', type: 'boolean', default: 'false' },
        { name: 'tone', type: "'accent' | 'success' | 'warning' | 'danger' | 'neutral'", default: "'accent'" },
        { name: 'color', type: 'string' },
        { name: 'size', type: 'number | string' },
        { name: 'thickness', type: 'number | string' },
        { name: 'shape', type: "'rounded' | 'square'", default: "'rounded'" },
        { name: 'showValue', type: 'boolean', default: 'false' },
      ],
      slots: [
        { name: 'default', type: '{ value: number; max: number; percent: number; }' },
      ],
    },
  ],
  cssVars: [
    { name: '--vectis-control-size-progress-circular-diameter', value: '3rem' },
    { name: '--vectis-control-size-progress-circular-thickness', value: '0.25rem' },
  ],
} satisfies PageApi
