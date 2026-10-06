/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VMeter',
      props: [
        { name: 'value', type: 'number', default: '0' },
        { name: 'min', type: 'number', default: '0' },
        { name: 'max', type: 'number', default: '100' },
        { name: 'low', type: 'number' },
        { name: 'high', type: 'number' },
        { name: 'optimum', type: 'number' },
        { name: 'label', type: 'string' },
        { name: 'hideLabel', type: 'boolean', default: 'false' },
        { name: 'valueText', type: 'string' },
        { name: 'formatOptions', type: 'Intl.NumberFormatOptions' },
        { name: 'hideValue', type: 'boolean', default: 'false' },
        { name: 'tone', type: 'MeterTone', values: "'accent' | 'neutral' | 'success' | 'warning' | 'danger'" },
        { name: 'color', type: 'string' },
        { name: 'segments', type: 'number', default: '1' },
        { name: 'size', type: 'MeterSize', values: "'sm' | 'md' | 'lg'", default: "'md'" },
      ],
    },
  ],
  cssVars: [
    { name: '--vectis-control-size-meter-thickness-sm', value: '0.25rem' },
    { name: '--vectis-control-size-meter-thickness-md', value: '0.5rem' },
    { name: '--vectis-control-size-meter-thickness-lg', value: '0.75rem' },
    { name: '--vectis-control-size-meter-segment-gap', value: '0.125rem' },
  ],
} satisfies PageApi
