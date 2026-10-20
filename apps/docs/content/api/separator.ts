/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VSeparator',
      props: [
        { name: 'orientation', type: 'SeparatorOrientation', values: "'horizontal' | 'vertical'", default: "'horizontal'" },
        { name: 'variant', type: 'SeparatorVariant', values: "'solid' | 'dashed' | 'dotted'", default: "'solid'" },
        { name: 'size', type: 'SeparatorSize', values: "'sm' | 'md' | 'lg'", default: "'sm'" },
        { name: 'color', type: 'string' },
        { name: 'label', type: 'string' },
        { name: 'icon', type: 'IconSource' },
        { name: 'contentPosition', type: 'SeparatorContentPosition', values: "'start' | 'center' | 'end'", default: "'center'" },
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
    { name: '--vectis-control-size-separator-sm', value: '1px' },
    { name: '--vectis-control-size-separator-md', value: '2px' },
    { name: '--vectis-control-size-separator-lg', value: '4px' },
  ],
} satisfies PageApi
