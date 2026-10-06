/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VColorInput',
      props: [
        { name: 'format', type: 'ColorFormat', values: "'hex' | 'rgb' | 'hsl' | 'oklch'", default: "'hex'" },
        { name: 'alpha', type: 'boolean', default: 'false' },
        { name: 'swatches', type: 'ColorSwatch[]' },
        { name: 'hideEyeDropper', type: 'boolean', default: 'false' },
        { name: 'label', type: 'string' },
        { name: 'hint', type: 'string' },
        { name: 'error', type: 'string' },
        { name: 'placeholder', type: 'string' },
        { name: 'size', type: 'ColorInputSize', values: "'sm' | 'md' | 'lg'", default: "'md'" },
        { name: 'compact', type: 'boolean', default: 'false' },
        { name: 'disabled', type: 'boolean', default: 'false' },
        { name: 'readonly', type: 'boolean', default: 'false' },
        { name: 'invalid', type: 'boolean', default: 'false' },
        { name: 'clearable', type: 'boolean', default: 'false' },
        { name: 'clearLabel', type: 'string' },
        { name: 'pickerButtonLabel', type: 'string' },
        { name: 'placement', type: 'ColorInputPlacement', values: "'bottom' | 'bottom-start' | 'bottom-end' | 'top' | 'top-start' | 'top-end'", default: "'bottom-start'" },
        { name: 'v-model', key: 'vModel', type: 'string | null', default: 'null' },
      ],
      events: [
        { name: 'clear', type: '[]' },
      ],
      slots: [
        { name: 'value-end', key: 'valueEnd', type: '{}' },
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
    { name: '--vectis-control-size-color-picker-checker', value: '0.5rem' },
  ],
} satisfies PageApi
