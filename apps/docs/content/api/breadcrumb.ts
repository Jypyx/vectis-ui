/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VBreadcrumb',
      props: [
        { name: 'items', type: 'BreadcrumbItem[]' },
        { name: 'label', type: 'string' },
        { name: 'currentPath', type: 'string' },
        { name: 'separator', type: 'IconSource', default: 'chevron_right' },
        { name: 'maxItems', type: 'number' },
        { name: 'ellipsisLabel', type: 'string' },
      ],
    },
  ],
} satisfies PageApi
