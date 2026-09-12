/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VBadge',
      props: [
        { name: 'tone', type: 'BadgeTone', values: "'neutral' | 'accent' | 'danger' | 'success' | 'warning'", default: "'accent'" },
        { name: 'color', type: 'string' },
        { name: 'count', type: 'number' },
        { name: 'icon', type: 'IconSource' },
        { name: 'dot', type: 'boolean', default: 'false' },
        { name: 'overlay', type: 'boolean', default: 'false' },
        { name: 'overlayPosition', type: 'BadgeOverlayPosition', values: "'top' | 'bottom'", default: "'top'" },
        { name: 'bordered', type: 'boolean', default: 'false' },
        { name: 'ringColor', type: 'string' },
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
  cssVars: [
    { name: '--vectis-control-size-badge-h', value: '1.25rem' },
    { name: '--vectis-control-size-badge-dot', value: '0.625rem' },
    { name: '--vectis-control-size-badge-ring', value: '2px' },
  ],
} satisfies PageApi
