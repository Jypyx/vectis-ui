/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VVirtualList',
      props: [
        { name: 'items', type: 'T[]' },
        { name: 'itemKey', type: 'string' },
        { name: 'itemSize', type: 'number', default: '40' },
        { name: 'overscan', type: 'number', default: '5' },
        { name: 'initialCount', type: 'number', default: '10' },
        { name: 'height', type: 'number | string' },
        { name: 'label', type: 'string' },
        { name: 'loading', type: 'boolean', default: 'false' },
        { name: 'loadingText', type: 'string' },
        { name: 'hasMore', type: 'boolean', default: 'false' },
      ],
      events: [
        { name: 'load-more', key: 'loadMore', type: '[]' },
      ],
      slots: [
        { name: 'default', type: 'VirtualListItemSlotProps<T>' },
        { name: 'loading', type: '{}' },
      ],
    },
  ],
  types: [
    {
      name: 'VirtualListItemSlotProps',
      definition: `export interface VirtualListItemSlotProps<T> {
  item: T
  index: number
}`,
    },
  ],
} satisfies PageApi
