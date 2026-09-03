/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VFileInput',
      props: [
        { name: 'multiple', type: 'boolean', default: 'false' },
        { name: 'accept', type: 'string' },
        { name: 'display', type: 'FileInputDisplay', default: "'text'" },
        { name: 'maxSize', type: 'number' },
        { name: 'maxTotalSize', type: 'number' },
        { name: 'maxFiles', type: 'number' },
        { name: 'counter', type: 'boolean', default: 'false' },
        { name: 'attachIcon', type: 'IconSource', default: 'attach_file' },
        { name: 'noDrop', type: 'boolean', default: 'false' },
        { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'" },
        { name: 'compact', type: 'boolean', default: 'false' },
        { name: 'disabled', type: 'boolean', default: 'false' },
        { name: 'readonly', type: 'boolean', default: 'false' },
        { name: 'invalid', type: 'boolean', default: 'false' },
        { name: 'label', type: 'string' },
        { name: 'hint', type: 'string' },
        { name: 'placeholder', type: 'string' },
        { name: 'clearable', type: 'boolean', default: 'false' },
        { name: 'v-model', key: 'vModel', type: 'File[]', default: '[]' },
      ],
      events: [
        { name: 'change', type: '[files: File[]]' },
        { name: 'reject', type: '[rejection: FileInputRejection]' },
        { name: 'clear', type: '[]' },
      ],
      slots: [
        { name: 'chip', type: "{ file: File; index: number; label: string; remove: () => void; size: 'xs' | 'sm'; compact: boolean; }" },
        { name: 'counter', type: '{ count: number; size: number; text: string; }' },
      ],
    },
  ],
} satisfies PageApi
