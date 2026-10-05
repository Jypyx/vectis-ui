/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VLink',
      props: [
        { name: 'href', type: 'string' },
        { name: 'tone', type: 'LinkTone', values: "'accent' | 'neutral' | 'danger' | 'success' | 'warning' | 'inherit'", default: "'accent'" },
        { name: 'underline', type: 'LinkUnderline', values: "'always' | 'hover' | 'none'", default: "'always'" },
        { name: 'external', type: 'boolean', default: 'false' },
        { name: 'externalIcon', type: 'IconSource', default: 'open_in_new' },
        { name: 'hideExternalIcon', type: 'boolean', default: 'false' },
        { name: 'disabled', type: 'boolean', default: 'false' },
      ],
      slots: [
        { name: 'default', type: '{}' },
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
