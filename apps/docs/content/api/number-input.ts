/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VNumberInput',
      props: [
        { name: 'min', type: 'number' },
        { name: 'max', type: 'number' },
        { name: 'step', type: 'number', default: '1' },
        { name: 'formatOptions', type: 'Intl.NumberFormatOptions' },
        { name: 'locale', type: 'string' },
        { name: 'controls', type: 'NumberInputControls', values: "'split' | 'stacked' | 'none'", default: "'split'" },
        { name: 'incrementLabel', type: 'string' },
        { name: 'decrementLabel', type: 'string' },
        { name: 'size', type: 'InputSize', values: "'sm' | 'md' | 'lg'", default: "'md'" },
        { name: 'compact', type: 'boolean', default: 'false' },
        { name: 'label', type: 'string' },
        { name: 'hint', type: 'string' },
        { name: 'error', type: 'string' },
        { name: 'required', type: 'boolean', default: 'false' },
        { name: 'hideLabel', type: 'boolean', default: 'false' },
        { name: 'labelPosition', type: 'FieldLabelPosition', values: "'top' | 'start'", default: "'top'" },
        { name: 'invalid', type: 'boolean', default: 'false' },
        { name: 'disabled', type: 'boolean', default: 'false' },
        { name: 'readonly', type: 'boolean', default: 'false' },
        { name: 'clearable', type: 'boolean', default: 'false' },
        { name: 'clearLabel', type: 'string' },
        { name: 'loading', type: 'boolean', default: 'false' },
        { name: 'loadingText', type: 'string' },
        { name: 'v-model', key: 'vModel', type: 'number | null', default: 'null' },
      ],
      events: [
        { name: 'clear', type: '[]' },
      ],
    },
  ],
} satisfies PageApi
