/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VFilePicker',
      props: [
        { name: 'title', type: 'string' },
        { name: 'subtitle', type: 'string' },
        { name: 'icon', type: 'IconSource', default: 'cloud_upload' },
        { name: 'hideBrowse', type: 'boolean', default: 'false' },
        { name: 'browseLabel', type: 'string' },
        { name: 'preview', type: 'FilePickerPreview', default: 'false' },
        { name: 'hideThumbnails', type: 'boolean', default: 'false' },
        { name: 'typeIcons', type: 'Partial<Record<FileKind, IconSource>>' },
        { name: 'removeIcon', type: 'IconSource', default: 'close' },
        { name: 'multiple', type: 'boolean', default: 'false' },
        { name: 'accept', type: 'string' },
        { name: 'maxSize', type: 'number' },
        { name: 'maxTotalSize', type: 'number' },
        { name: 'maxFiles', type: 'number' },
        { name: 'disabled', type: 'boolean', default: 'false' },
        { name: 'readonly', type: 'boolean', default: 'false' },
        { name: 'v-model', key: 'vModel', type: 'File[]', default: '[]' },
      ],
      events: [
        { name: 'change', type: '[files: File[]]' },
        { name: 'reject', type: '[rejection: FilePickerRejection]' },
        { name: 'remove', type: '[file: File, index: number]' },
      ],
      slots: [
        { name: 'icon', type: '{}' },
        { name: 'title', type: '{}' },
        { name: 'subtitle', type: '{}' },
        { name: 'browse', type: '{ open: () => void; disabled: boolean; }' },
        { name: 'item', type: 'FilePickerRow' },
        { name: 'thumbnail', type: 'FilePickerRow' },
        { name: 'remove', type: '{ file: File; index: number; remove: () => void; label: string; }' },
      ],
    },
  ],
  cssVars: [
    { name: '--vectis-control-size-file-picker-min-block', value: '10rem' },
    { name: '--vectis-control-size-file-picker-icon', value: '2.5rem' },
    { name: '--vectis-control-size-file-picker-thumb', value: '2.5rem' },
  ],
} satisfies PageApi
