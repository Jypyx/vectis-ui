/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VCombobox',
      props: [
        { name: 'options', type: 'ComboboxItem[]' },
        { name: 'multiple', type: 'boolean', default: 'false' },
        { name: 'label', type: 'string' },
        { name: 'hint', type: 'string' },
        { name: 'size', type: 'ComboboxSize', default: "'md'" },
        { name: 'compact', type: 'boolean', default: 'false' },
        { name: 'placeholder', type: 'string' },
        { name: 'disabled', type: 'boolean', default: 'false' },
        { name: 'readonly', type: 'boolean', default: 'false' },
        { name: 'invalid', type: 'boolean', default: 'false' },
        { name: 'iconStart', type: 'IconSource' },
        { name: 'iconStartLabel', type: 'string' },
        { name: 'expandIcon', type: 'IconSource', default: 'expand_more' },
        { name: 'clearable', type: 'boolean', default: 'false' },
        { name: 'clearLabel', type: 'string' },
        { name: 'emptyText', type: 'string' },
        { name: 'filter', type: 'ComboboxFilter', default: 'true' },
        { name: 'searchDebounce', type: 'number', default: '250' },
        { name: 'loading', type: 'boolean', default: 'false' },
        { name: 'loadingText', type: 'string' },
        { name: 'hasMore', type: 'boolean', default: 'false' },
        { name: 'placement', type: 'ComboboxPlacement', default: "'bottom-start'" },
        { name: 'v-model', key: 'vModel', type: 'ItemValue | ItemValue[]', default: "''" },
      ],
      events: [
        { name: 'search', type: '[query: string]' },
        { name: 'click:icon-start', key: 'clickIconStart', type: '[event: MouseEvent]' },
        { name: 'clear', type: '[]' },
        { name: 'load-more', key: 'loadMore', type: '[]' },
      ],
      slots: [
        { name: 'start', type: '{}' },
        { name: 'value-end', key: 'valueEnd', type: '{}' },
        { name: 'option', type: '{ option: ComboboxOption; index: number; active: boolean; selected: boolean; }' },
        { name: 'chip', type: "{ value: ItemValue; option: ComboboxOption | undefined; label: string; remove: () => void; size: 'xs' | 'sm'; compact: boolean; }" },
        { name: 'empty', type: '{ query: string; }' },
        { name: 'loading', type: '{}' },
      ],
    },
  ],
  cssVars: [
    { name: '--vectis-control-size-combobox-list-max-block', value: '18rem' },
  ],
} satisfies PageApi
