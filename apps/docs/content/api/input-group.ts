/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VInputGroup',
      props: [
        { name: 'label', type: 'string' },
        { name: 'hint', type: 'string' },
        { name: 'error', type: 'string' },
        { name: 'required', type: 'boolean', default: 'false' },
        { name: 'hideLabel', type: 'boolean', default: 'false' },
        { name: 'labelPosition', type: 'FieldLabelPosition', values: "'top' | 'start'", default: "'top'" },
        { name: 'size', type: 'InputGroupSize', values: "'sm' | 'md' | 'lg'" },
        { name: 'compact', type: 'boolean' },
        { name: 'disabled', type: 'boolean' },
      ],
      slots: [
        { name: 'default', type: '{}' },
      ],
    },
  ],
} satisfies PageApi
