/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VToggle',
      props: [
        { name: 'multiple', type: 'boolean', default: 'false' },
        { name: 'mandatory', type: 'boolean', default: 'false' },
        { name: 'detached', type: 'boolean', default: 'false' },
        { name: 'seamless', type: 'boolean', default: 'false' },
        { name: 'orientation', type: 'ToggleOrientation', values: "'horizontal' | 'vertical'", default: "'horizontal'" },
        { name: 'itemVariant', type: 'ToggleItemVariant', values: "'ghost' | 'outline'", default: "'ghost'" },
        { name: 'selectedVariant', type: 'ToggleSelectedVariant', values: "'solid' | 'soft' | 'ghost'", default: "'solid'" },
        { name: 'tone', type: 'ToggleTone', values: "'accent' | 'neutral' | 'danger'", default: "'accent'" },
        { name: 'size', type: 'ToggleSize', values: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'" },
        { name: 'compact', type: 'boolean', default: 'false' },
        { name: 'elevated', type: 'boolean', default: 'false' },
        { name: 'disabled', type: 'boolean', default: 'false' },
        { name: 'selectedIconFilled', type: 'boolean', default: 'false' },
        { name: 'label', type: 'string' },
        { name: 'v-model', key: 'vModel', type: 'ToggleModelValue', default: 'null' },
      ],
      slots: [
        { name: 'default', type: '{}' },
      ],
    },
    {
      name: 'VToggleItem',
      props: [
        { name: 'value', type: 'ToggleValue' },
        { name: 'label', type: 'string' },
        { name: 'iconStart', type: 'IconSource' },
        { name: 'iconEnd', type: 'IconSource' },
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
    {
      name: 'ItemValue',
      definition: `export type ItemValue = string | number`,
    },
    {
      name: 'ToggleModelValue',
      definition: `export type ToggleModelValue = ToggleValue | ToggleValue[] | null`,
    },
    {
      name: 'ToggleValue',
      definition: `export type ToggleValue = ItemValue`,
    },
  ],
} satisfies PageApi
