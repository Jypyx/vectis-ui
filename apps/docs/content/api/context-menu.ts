/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VContextMenu',
      props: [
        { name: 'as', type: 'string', default: "'div'" },
        { name: 'size', type: 'MenuSize', values: "'sm' | 'md' | 'lg'", default: "'sm'" },
        { name: 'compact', type: 'boolean', default: 'false' },
        { name: 'width', type: 'number | string' },
        { name: 'disabled', type: 'boolean', default: 'false' },
        { name: 'v-model:open', key: 'vModelOpen', type: 'boolean', default: 'false' },
      ],
      slots: [
        { name: 'default', type: '{}' },
        { name: 'menu', type: '{ target: Element | null; }' },
      ],
    },
  ],
} satisfies PageApi
