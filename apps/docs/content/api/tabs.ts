/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VTabs',
      props: [
        { name: 'variant', type: 'TabsVariant', values: "'flat' | 'outlined' | 'inset'", default: "'flat'" },
        { name: 'tone', type: 'TabsTone', values: "'accent' | 'neutral' | 'danger'", default: "'accent'" },
        { name: 'size', type: 'TabsSize', values: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'" },
        { name: 'compact', type: 'boolean', default: 'false' },
        { name: 'orientation', type: 'TabsOrientation', values: "'horizontal' | 'vertical'", default: "'horizontal'" },
        { name: 'align', type: 'TabsAlign', values: "'start' | 'center' | 'end'", default: "'start'" },
        { name: 'grow', type: 'boolean', default: 'false' },
        { name: 'scrollButtons', type: 'boolean', default: 'false' },
        { name: 'prevIcon', type: 'IconSource' },
        { name: 'nextIcon', type: 'IconSource' },
        { name: 'prevLabel', type: 'string' },
        { name: 'nextLabel', type: 'string' },
        { name: 'activation', type: 'TabsActivation', values: "'manual' | 'automatic'", default: "'manual'" },
        { name: 'label', type: 'string' },
        { name: 'v-model', key: 'vModel', type: 'string | number' },
      ],
      slots: [
        { name: 'default', type: '{}' },
        { name: 'panels', type: '{}' },
      ],
    },
    {
      name: 'VTab',
      props: [
        { name: 'value', type: 'ItemValue' },
        { name: 'label', type: 'string' },
        { name: 'iconStart', type: 'IconSource' },
        { name: 'iconEnd', type: 'IconSource' },
        { name: 'disabled', type: 'boolean', default: 'false' },
      ],
      slots: [
        { name: 'default', type: '{}' },
      ],
    },
    {
      name: 'VTabPanel',
      props: [
        { name: 'value', type: 'string | number' },
        { name: 'lazy', type: 'boolean', default: 'false' },
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
  ],
  cssVars: [
    { name: '--vectis-control-size-tab-indicator', value: '2px' },
  ],
} satisfies PageApi
