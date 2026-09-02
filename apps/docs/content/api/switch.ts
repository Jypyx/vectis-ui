/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VSwitch',
      props: [
        { name: 'labelPosition', type: "'start' | 'end'", default: "'end'" },
        { name: 'spread', type: 'boolean', default: 'false' },
        { name: 'disabled', type: 'boolean', default: 'false' },
        { name: 'v-model', key: 'vModel', type: 'boolean', default: 'false' },
      ],
      slots: [
        { name: 'default', type: '{}' },
      ],
    },
  ],
  cssVars: [
    { name: '--vectis-control-size-switch-w', value: '2.5rem' },
    { name: '--vectis-control-size-switch-h', value: '1.25rem' },
  ],
} satisfies PageApi
