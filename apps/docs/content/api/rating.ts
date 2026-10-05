/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VRating',
      props: [
        { name: 'max', type: 'number', default: '5' },
        { name: 'label', type: 'string' },
        { name: 'hideLabel', type: 'boolean', default: 'false' },
        { name: 'hint', type: 'string' },
        { name: 'error', type: 'string' },
        { name: 'required', type: 'boolean', default: 'false' },
        { name: 'name', type: 'string' },
        { name: 'clearable', type: 'boolean', default: 'false' },
        { name: 'readonly', type: 'boolean', default: 'false' },
        { name: 'disabled', type: 'boolean', default: 'false' },
        { name: 'size', type: 'RatingSize', values: "'sm' | 'md' | 'lg'", default: "'md'" },
        { name: 'tone', type: 'RatingTone', values: "'accent' | 'warning' | 'danger' | 'success' | 'neutral'", default: "'accent'" },
        { name: 'color', type: 'string' },
        { name: 'icon', type: 'IconSource', default: 'star' },
        { name: 'v-model', key: 'vModel', type: 'number | null', default: 'null' },
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
    { name: '--vectis-control-size-rating-sm', value: '1.25rem' },
    { name: '--vectis-control-size-rating-md', value: '1.5rem' },
    { name: '--vectis-control-size-rating-lg', value: '2rem' },
  ],
} satisfies PageApi
