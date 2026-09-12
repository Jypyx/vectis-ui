/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VIcon',
      props: [
        { name: 'name', type: 'string | BuiltinIcon' },
        { name: 'render', type: 'IconRender' },
        { name: 'src', type: 'string' },
        { name: 'size', type: 'number' },
        { name: 'label', type: 'string' },
        { name: 'filled', type: 'boolean', default: 'false' },
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
  ],
} satisfies PageApi
