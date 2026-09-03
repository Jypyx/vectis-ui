/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VAvatarGroup',
      props: [
        { name: 'max', type: 'number' },
        { name: 'size', type: 'AvatarSize', default: "'md'" },
        { name: 'compact', type: 'boolean', default: 'false' },
        { name: 'ringColor', type: 'string' },
      ],
      slots: [
        { name: 'default', type: '{}' },
        { name: 'overflow', type: '{ count: number; }' },
      ],
    },
  ],
} satisfies PageApi
