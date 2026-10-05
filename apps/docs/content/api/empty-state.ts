/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VEmptyState',
      props: [
        { name: 'title', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'icon', type: 'IconSource' },
        { name: 'size', type: 'EmptyStateSize', values: "'sm' | 'md' | 'lg'", default: "'md'" },
        { name: 'headingLevel', type: 'EmptyStateHeadingLevel', values: '1 | 2 | 3 | 4 | 5 | 6' },
      ],
      slots: [
        { name: 'default', type: '{}' },
        { name: 'media', type: '{}' },
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
  cssVars: [
    { name: '--vectis-control-size-empty-state-media-sm', value: '2.5rem' },
    { name: '--vectis-control-size-empty-state-media-md', value: '3rem' },
    { name: '--vectis-control-size-empty-state-media-lg', value: '4rem' },
    { name: '--vectis-control-size-empty-state-text-max', value: '28rem' },
  ],
} satisfies PageApi
