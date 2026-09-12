/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VButton',
      props: [
        { name: 'variant', type: 'ButtonVariant', values: "'solid' | 'outline' | 'ghost' | 'soft'", default: "'solid'" },
        { name: 'tone', type: 'ButtonTone', values: "'accent' | 'neutral' | 'danger'", default: "'accent'" },
        { name: 'elevated', type: 'boolean', default: 'false' },
        { name: 'size', type: 'ButtonSize', values: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'" },
        { name: 'compact', type: 'boolean', default: 'false' },
        { name: 'fullWidth', type: 'boolean', default: 'false' },
        { name: 'href', type: 'string' },
        { name: 'type', type: "ButtonHTMLAttributes['type']", default: "'button'" },
        { name: 'disabled', type: 'boolean', default: 'false' },
        { name: 'loading', type: 'boolean', default: 'false' },
        { name: 'iconStart', type: 'IconSource' },
        { name: 'iconEnd', type: 'IconSource' },
        { name: 'iconFilled', type: 'boolean', default: 'false' },
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
