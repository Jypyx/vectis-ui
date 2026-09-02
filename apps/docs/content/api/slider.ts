/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VSlider',
      props: [
        { name: 'min', type: 'number', default: '0' },
        { name: 'max', type: 'number', default: '100' },
        { name: 'step', type: 'number', default: '1' },
        { name: 'range', type: 'boolean', default: 'false' },
        { name: 'disabled', type: 'boolean', default: 'false' },
        { name: 'label', type: 'string' },
        { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'" },
        { name: 'inputs', type: 'boolean', default: 'false' },
        { name: 'ticks', type: 'boolean', default: 'false' },
        { name: 'labels', type: 'SliderLabel[]' },
        { name: 'tooltip', type: 'boolean', default: 'false' },
        { name: 'v-model', key: 'vModel', type: 'number | [number, number]', default: '0' },
      ],
    },
  ],
  cssVars: [
    { name: '--vectis-control-size-slider-track', value: '0.375rem' },
    { name: '--vectis-control-size-slider-thumb', value: '1.25rem' },
    { name: '--vectis-control-size-slider-length', value: '10rem' },
    { name: '--vectis-control-size-slider-field', value: '5rem' },
  ],
} satisfies PageApi
