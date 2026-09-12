/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VChip',
      props: [
        { name: 'variant', type: 'ChipVariant', values: "'soft' | 'solid' | 'outline'", default: "'soft'" },
        { name: 'tone', type: 'ChipTone', values: "'neutral' | 'accent' | 'danger' | 'success' | 'warning'", default: "'neutral'" },
        { name: 'color', type: 'string' },
        { name: 'shape', type: 'ChipShape', values: "'chip' | 'pill'", default: "'chip'" },
        { name: 'size', type: 'ChipSize', values: "'xs' | 'sm'", default: "'xs'" },
        { name: 'compact', type: 'boolean', default: 'false' },
        { name: 'clickable', type: 'boolean', default: 'false' },
        { name: 'href', type: 'string' },
        { name: 'selectable', type: 'boolean', default: 'false' },
        { name: 'check', type: 'boolean', default: 'false' },
        { name: 'iconStart', type: 'IconSource' },
        { name: 'iconEnd', type: 'IconSource' },
        { name: 'dismissible', type: 'boolean', default: 'false' },
        { name: 'dismissIcon', type: 'IconSource', default: 'close' },
        { name: 'dismissLabel', type: 'string' },
        { name: 'disabled', type: 'boolean', default: 'false' },
        { name: 'v-model:selected', key: 'vModelSelected', type: 'boolean', default: 'false' },
      ],
      events: [
        { name: 'dismiss', type: '[]' },
      ],
      slots: [
        { name: 'default', type: '{}' },
        { name: 'start', type: '{}' },
        { name: 'end', type: '{}' },
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
  ],
} satisfies PageApi
