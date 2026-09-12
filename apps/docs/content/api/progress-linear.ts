/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VProgressLinear',
      props: [
        { name: 'value', type: 'number', default: '0' },
        { name: 'max', type: 'number', default: '100' },
        { name: 'indeterminate', type: 'boolean', default: 'false' },
        { name: 'tone', type: 'ProgressLinearTone', values: "'accent' | 'success' | 'warning' | 'danger' | 'neutral'", default: "'accent'" },
        { name: 'color', type: 'string' },
        { name: 'thickness', type: 'number | string' },
        { name: 'shape', type: 'ProgressLinearShape', values: "'rounded' | 'square'", default: "'rounded'" },
        { name: 'showValue', type: 'boolean', default: 'false' },
        { name: 'valuePosition', type: 'ProgressLinearValuePosition', values: "'start' | 'center' | 'end'", default: "'center'" },
        { name: 'orientation', type: 'ProgressLinearOrientation', values: "'horizontal' | 'vertical'", default: "'horizontal'" },
      ],
      slots: [
        { name: 'default', type: '{ value: number; max: number; percent: number; }' },
      ],
    },
  ],
  cssVars: [
    { name: '--vectis-control-size-progress-linear-thickness', value: '0.25rem' },
    { name: '--vectis-control-size-progress-linear-length', value: '10rem' },
  ],
} satisfies PageApi
