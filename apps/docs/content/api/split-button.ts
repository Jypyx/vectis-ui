/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VSplitButton',
      props: [
        { name: 'label', type: 'string' },
        { name: 'variant', type: 'ButtonVariant', values: "'solid' | 'outline' | 'ghost' | 'soft'", default: "'solid'" },
        { name: 'tone', type: 'ButtonTone', values: "'accent' | 'neutral' | 'danger'", default: "'accent'" },
        { name: 'size', type: 'ButtonSize', values: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'" },
        { name: 'compact', type: 'boolean', default: 'false' },
        { name: 'elevated', type: 'boolean', default: 'false' },
        { name: 'fullWidth', type: 'boolean', default: 'false' },
        { name: 'href', type: 'string' },
        { name: 'type', type: "ButtonHTMLAttributes['type']", default: "'button'" },
        { name: 'disabled', type: 'boolean', default: 'false' },
        { name: 'loading', type: 'boolean', default: 'false' },
        { name: 'iconStart', type: 'IconSource' },
        { name: 'iconEnd', type: 'IconSource' },
        { name: 'iconFilled', type: 'boolean', default: 'false' },
        { name: 'menuLabel', type: 'string' },
        { name: 'menuIcon', type: 'IconSource', default: 'expand_more' },
        { name: 'placement', type: 'MenuPlacement', values: "'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end'", default: "'bottom-end'" },
        { name: 'menuSize', type: 'MenuSize', values: "'sm' | 'md' | 'lg'", default: "'sm'" },
        { name: 'menuWidth', type: 'number | string' },
        { name: 'matchWidth', type: 'boolean', default: 'false' },
        { name: 'v-model:open', key: 'vModelOpen', type: 'boolean', default: 'false' },
      ],
      events: [
        { name: 'click', type: '[event: MouseEvent]' },
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
