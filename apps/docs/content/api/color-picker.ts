/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VColorPicker',
      props: [
        { name: 'format', type: 'ColorFormat', values: "'hex' | 'rgb' | 'hsl' | 'oklch'", default: "'hex'" },
        { name: 'alpha', type: 'boolean', default: 'false' },
        { name: 'swatches', type: 'ColorSwatch[]' },
        { name: 'hideInput', type: 'boolean', default: 'false' },
        { name: 'hideEyeDropper', type: 'boolean', default: 'false' },
        { name: 'disabled', type: 'boolean', default: 'false' },
        { name: 'label', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'v-model', key: 'vModel', type: 'string | null', default: 'null' },
      ],
    },
  ],
  types: [
    {
      name: 'ColorSwatch',
      definition: `export type ColorSwatch = string | { color: string; label: string }`,
    },
  ],
  cssVars: [
    { name: '--vectis-control-size-color-picker-width', value: '16rem' },
    { name: '--vectis-control-size-color-picker-area', value: '10rem' },
    { name: '--vectis-control-size-color-picker-track', value: '0.75rem' },
    { name: '--vectis-control-size-color-picker-thumb', value: '1rem' },
    { name: '--vectis-control-size-color-picker-preview', value: '2rem' },
    { name: '--vectis-control-size-color-picker-swatch', value: '1.5rem' },
    { name: '--vectis-control-size-color-picker-checker', value: '0.5rem' },
  ],
} satisfies PageApi
