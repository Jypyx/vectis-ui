/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VDataTable',
      props: [
        { name: 'columns', type: 'DataTableColumn[]' },
        { name: 'rows', type: 'Row[]' },
        { name: 'rowKey', type: 'string' },
        { name: 'caption', type: 'string' },
        { name: 'variant', type: "'flat' | 'outlined'", default: "'flat'" },
        { name: 'responsive', type: "'scroll' | 'stack'", default: "'scroll'" },
        { name: 'loading', type: 'boolean', default: 'false' },
        { name: 'emptyText', type: 'string' },
        { name: 'title', type: 'string' },
        { name: 'searchable', type: 'boolean', default: 'false' },
        { name: 'searchPlaceholder', type: 'string' },
        { name: 'searchLabel', type: 'string' },
        { name: 'searchDebounce', type: 'number', default: '250' },
        { name: 'striped', type: 'boolean', default: 'false' },
        { name: 'stickyHeader', type: 'boolean', default: 'false' },
        { name: 'compact', type: 'boolean', default: 'false' },
        { name: 'height', type: 'number | string' },
        { name: 'sortIcon', type: 'IconSource', default: 'swap_vert' },
        { name: 'sortAscIcon', type: 'IconSource', default: 'arrow_downward' },
        { name: 'sortDescIcon', type: 'IconSource', default: 'arrow_upward' },
        { name: 'perPageOptions', type: 'number[]' },
        { name: 'perPageLabel', type: 'string' },
        { name: 'total', type: 'number' },
        { name: 'showRange', type: 'boolean', default: 'false' },
        { name: 'rangeLabel', type: '(range: { start: number; end: number; total: number }) => string' },
        { name: 'selectable', type: 'boolean', default: 'false' },
        { name: 'selectAllLabel', type: 'string' },
        { name: 'selectionLabel', type: '(count: number) => string' },
        { name: 'selectRowLabel', type: '(row: Row, index: number) => string' },
        { name: 'serverSide', type: 'boolean', default: 'false' },
        { name: 'v-model:sort', key: 'vModelSort', type: 'DataTableSort | null', default: 'null' },
        { name: 'v-model:page', key: 'vModelPage', type: 'number', default: '1' },
        { name: 'v-model:perPage', key: 'vModelPerPage', type: 'number' },
        { name: 'v-model:selected', key: 'vModelSelected', type: 'DataTableRowId[]', default: '[]' },
        { name: 'v-model:search', key: 'vModelSearch', type: 'string', default: "''" },
      ],
      events: [
        { name: 'update:params', key: 'updateParams', type: '[params: DataTableParams]' },
      ],
      slots: [
        { name: 'header', type: '{}' },
      ],
    },
  ],
  cssVars: [
    { name: '--vectis-control-size-table-search', value: '16rem' },
  ],
} satisfies PageApi
