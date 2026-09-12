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
        { name: 'preview', type: 'FilePickerPreview', values: "false | 'bottom' | 'end'", default: 'false' },
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
        { name: 'invalid', type: 'boolean', default: 'false' },
        { name: 'loading', type: 'boolean', default: 'false' },
        { name: 'loadingLabel', type: 'string' },
        { name: 'v-model', key: 'vModel', type: 'File[]', default: '[]' },
      ],
      events: [
        { name: 'change', type: '[files: File[]]' },
        { name: 'reject', type: '[rejection: FileRejection]' },
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
  types: [
    {
      name: 'BuiltinIcon',
      definition: `export interface BuiltinIcon {
  name: string
  paths: readonly [string] | readonly [string, string]
}`,
    },
    {
      name: 'FileKind',
      definition: `export type FileKind =
  'image' | 'pdf' | 'audio' | 'video' | 'archive' | 'spreadsheet' | 'code' | 'file'`,
    },
    {
      name: 'FilePickerRow',
      definition: `export interface FilePickerRow {
  file: File
  index: number
  kind: FileKind
  thumbnail: string | undefined
  icon: IconSource
  sizeText: string
  remove: () => void
}`,
    },
    {
      name: 'FileRejectReason',
      definition: `export type FileRejectReason = 'type' | 'size' | 'count' | 'total-size'`,
    },
    {
      name: 'FileRejection',
      definition: `export interface FileRejection {
  file: File
  reason: FileRejectReason
}`,
    },
    {
      name: 'IconRender',
      definition: `export type IconRender =
  | { path: string; viewBox?: string }
  | { component: Component; props?: Record<string, unknown> }
  | { src: string }
  | { text: string; class?: string }
  | { class: string }`,
    },
    {
      name: 'IconSource',
      definition: `export type IconSource = string | BuiltinIcon | IconRender`,
    },
  ],
  cssVars: [
    { name: '--vectis-control-size-file-picker-min-block', value: '10rem' },
    { name: '--vectis-control-size-file-picker-icon', value: '2.5rem' },
    { name: '--vectis-control-size-file-picker-thumb', value: '2.5rem' },
  ],
} satisfies PageApi
