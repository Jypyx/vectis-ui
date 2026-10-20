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
        { name: 'label', type: 'string' },
        { name: 'hideLabel', type: 'boolean', default: 'false' },
        { name: 'max', type: 'number', default: '100' },
        { name: 'indeterminate', type: 'boolean', default: 'false' },
        { name: 'tone', type: 'ProgressLinearTone', values: "'neutral' | 'accent' | 'danger' | 'success' | 'warning'", default: "'accent'" },
        { name: 'color', type: 'string' },
        { name: 'size', type: 'ProgressLinearSize', values: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'sm'" },
        { name: 'shape', type: 'ProgressLinearShape', values: "'rounded' | 'square'", default: "'rounded'" },
        { name: 'showValue', type: 'boolean', default: 'false' },
        { name: 'valuePosition', type: 'ProgressLinearValuePosition', values: "'header' | 'start' | 'center' | 'end'", default: "'header'" },
        { name: 'orientation', type: 'ProgressLinearOrientation', values: "'horizontal' | 'vertical'", default: "'horizontal'" },
      ],
      slots: [
        { name: 'default', type: 'ProgressLinearSlotProps' },
      ],
    },
  ],
  types: [
    {
      name: 'ProgressLinearSlotProps',
      definition: `export interface ProgressLinearSlotProps {
  value: number
  max: number
  percent: number
}`,
    },
  ],
  cssVars: [
    { name: '--vectis-control-size-bar-thickness-xs', value: '0.125rem' },
    { name: '--vectis-control-size-bar-thickness-sm', value: '0.25rem' },
    { name: '--vectis-control-size-bar-thickness-md', value: '0.5rem' },
    { name: '--vectis-control-size-bar-thickness-lg', value: '0.75rem' },
    { name: '--vectis-control-size-bar-thickness-xl', value: '1.25rem' },
    { name: '--vectis-control-size-progress-linear-length', value: '10rem' },
  ],
} satisfies PageApi
