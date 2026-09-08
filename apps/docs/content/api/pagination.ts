/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VPagination',
      props: [
        { name: 'length', type: 'number', default: '1' },
        { name: 'totalVisible', type: 'number' },
        { name: 'detached', type: 'boolean', default: 'false' },
        { name: 'itemVariant', type: 'PaginationItemVariant', default: "'ghost'" },
        { name: 'tone', type: 'PaginationTone', default: "'accent'" },
        { name: 'size', type: 'PaginationSize', default: "'md'" },
        { name: 'compact', type: 'boolean', default: 'false' },
        { name: 'align', type: 'PaginationAlign', default: "'start'" },
        { name: 'controls', type: 'PaginationControls', default: "'icon'" },
        { name: 'prevIcon', type: 'IconSource', default: 'chevron_left' },
        { name: 'nextIcon', type: 'IconSource', default: 'chevron_right' },
        { name: 'prevLabel', type: 'string' },
        { name: 'nextLabel', type: 'string' },
        { name: 'disabled', type: 'boolean', default: 'false' },
        { name: 'disabledPages', type: 'number[] | ((page: number) => boolean)' },
        { name: 'responsive', type: 'boolean', default: 'false' },
        { name: 'label', type: 'string' },
        { name: 'pageLabel', type: '(page: number) => string' },
        { name: 'v-model', key: 'vModel', type: 'number', default: '1' },
      ],
    },
  ],
} satisfies PageApi
