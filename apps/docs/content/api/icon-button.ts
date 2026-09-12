/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VIconButton',
      props: [
        { name: 'label', type: 'string' },
        { name: 'variant', type: 'ButtonVariant', values: "'solid' | 'outline' | 'ghost' | 'soft'", default: "'ghost'" },
        { name: 'tone', type: 'ButtonTone', values: "'accent' | 'neutral' | 'danger'", default: "'neutral'" },
        { name: 'elevated', type: 'boolean', default: 'false' },
        { name: 'size', type: 'ButtonSize', values: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'" },
        { name: 'compact', type: 'boolean', default: 'false' },
        { name: 'shape', type: 'IconButtonShape', values: "'square' | 'circular'", default: "'square'" },
        { name: 'type', type: "ButtonHTMLAttributes['type']", default: "'button'" },
        { name: 'disabled', type: 'boolean', default: 'false' },
        { name: 'loading', type: 'boolean', default: 'false' },
        { name: 'icon', type: 'IconSource' },
        { name: 'iconFilled', type: 'boolean', default: 'false' },
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
