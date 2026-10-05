/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VFieldset',
      props: [
        { name: 'legend', type: 'string' },
        { name: 'hint', type: 'string' },
        { name: 'error', type: 'string' },
        { name: 'required', type: 'boolean', default: 'false' },
        { name: 'hideLegend', type: 'boolean', default: 'false' },
        { name: 'orientation', type: 'FieldsetOrientation', values: "'vertical' | 'horizontal'", default: "'vertical'" },
      ],
      slots: [
        { name: 'default', type: '{ invalid: boolean; required: boolean; }' },
      ],
    },
  ],
} satisfies PageApi
