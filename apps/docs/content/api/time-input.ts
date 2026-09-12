/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VTimeInput',
      props: [
        { name: 'format', type: 'TimePickerFormat', values: "'12h' | '24h'" },
        { name: 'mode', type: 'TimeInputMode', values: "'picker' | 'input' | 'list'", default: "'input'" },
        { name: 'showPicker', type: 'boolean', default: 'false' },
        { name: 'minuteStep', type: 'number', default: '1' },
        { name: 'min', type: 'string' },
        { name: 'max', type: 'string' },
        { name: 'allowedHours', type: 'TimeMatcher' },
        { name: 'allowedMinutes', type: 'TimeMatcher' },
        { name: 'locale', type: 'string' },
        { name: 'label', type: 'string' },
        { name: 'hint', type: 'string' },
        { name: 'placeholder', type: 'string' },
        { name: 'size', type: 'TimeInputSize', values: "'sm' | 'md' | 'lg'", default: "'md'" },
        { name: 'compact', type: 'boolean', default: 'false' },
        { name: 'disabled', type: 'boolean', default: 'false' },
        { name: 'readonly', type: 'boolean', default: 'false' },
        { name: 'invalid', type: 'boolean', default: 'false' },
        { name: 'iconStart', type: 'IconSource' },
        { name: 'iconStartLabel', type: 'string' },
        { name: 'pickerIconLabel', type: 'string' },
        { name: 'loading', type: 'boolean', default: 'false' },
        { name: 'loadingLabel', type: 'string' },
        { name: 'clearable', type: 'boolean', default: 'false' },
        { name: 'clearLabel', type: 'string' },
        { name: 'pickerIcon', type: 'IconSource', default: 'schedule' },
        { name: 'placement', type: 'TimeInputPlacement', values: "'bottom' | 'bottom-start' | 'bottom-end' | 'top' | 'top-start' | 'top-end'", default: "'bottom-start'" },
        { name: 'v-model', key: 'vModel', type: 'string | null', default: 'null' },
      ],
      events: [
        { name: 'click:icon-start', key: 'clickIconStart', type: '[event: MouseEvent]' },
        { name: 'clear', type: '[]' },
      ],
      slots: [
        { name: 'start', type: '{}' },
        { name: 'value-end', key: 'valueEnd', type: '{}' },
        { name: 'footer', type: '{ confirm: () => void; cancel: () => void; }' },
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
    {
      name: 'TimeMatcher',
      definition: `export type TimeMatcher = number[] | ((value: number) => boolean)`,
    },
  ],
} satisfies PageApi
