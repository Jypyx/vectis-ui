/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VRadio',
      props: [
        { name: 'value', type: 'string' },
        { name: 'labelPosition', type: "'start' | 'end'", default: "'end'" },
        { name: 'spread', type: 'boolean', default: 'false' },
        { name: 'invalid', type: 'boolean', default: 'false' },
        { name: 'disabled', type: 'boolean', default: 'false' },
        { name: 'v-model', key: 'vModel', type: 'string', default: "''" },
      ],
      slots: [
        { name: 'default', type: '{}' },
      ],
    },
  ],
  cssVars: [
    { name: '--vectis-control-size-check', value: '1.25rem' },
    { name: '--vectis-control-size-check-dot', value: '0.5rem' },
  ],
} satisfies PageApi
