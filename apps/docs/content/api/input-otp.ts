/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VInputOTP',
      props: [
        { name: 'length', type: 'number', default: '6' },
        { name: 'format', type: "'numeric' | 'alpha' | 'alphanumeric'", default: "'numeric'" },
        { name: 'pattern', type: 'string' },
        { name: 'separatorIcon', type: 'IconSource' },
        { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'" },
        { name: 'compact', type: 'boolean', default: 'false' },
        { name: 'disabled', type: 'boolean', default: 'false' },
        { name: 'invalid', type: 'boolean', default: 'false' },
        { name: 'label', type: 'string' },
        { name: 'v-model', key: 'vModel', type: 'string', default: "''" },
      ],
      events: [
        { name: 'complete', type: '[code: string]' },
      ],
    },
  ],
} satisfies PageApi
