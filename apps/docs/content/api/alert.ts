/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VAlert',
      props: [
        { name: 'variant', type: 'AlertVariant', values: "'soft' | 'outline'", default: "'soft'" },
        { name: 'tone', type: 'AlertTone', values: "'neutral' | 'accent' | 'danger' | 'success' | 'warning'", default: "'accent'" },
        { name: 'title', type: 'string' },
        { name: 'icon', type: 'IconSource' },
        { name: 'hideIcon', type: 'boolean', default: 'false' },
        { name: 'closable', type: 'boolean', default: 'false' },
        { name: 'closeLabel', type: 'string' },
        { name: 'live', type: 'boolean', default: 'false' },
        { name: 'v-model:open', key: 'vModelOpen', type: 'boolean', default: 'true' },
      ],
      events: [
        { name: 'close', type: '[]' },
      ],
      slots: [
        { name: 'default', type: '{}' },
        { name: 'title', type: '{}' },
        { name: 'actions', type: '{}' },
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
