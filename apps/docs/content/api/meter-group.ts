/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VMeterGroup',
      props: [
        { name: 'items', type: 'MeterGroupItem[]', default: '[]' },
        { name: 'max', type: 'number', default: '100' },
        { name: 'label', type: 'string' },
        { name: 'hideLabel', type: 'boolean', default: 'false' },
        { name: 'showValue', type: 'boolean', default: 'false' },
        { name: 'valueText', type: 'string' },
        { name: 'formatOptions', type: 'Intl.NumberFormatOptions' },
        { name: 'hideLegend', type: 'boolean', default: 'false' },
        { name: 'size', type: 'MeterGroupSize', values: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'" },
        { name: 'orientation', type: 'MeterGroupOrientation', values: "'horizontal' | 'vertical'", default: "'horizontal'" },
      ],
      slots: [
        { name: 'value', type: 'MeterGroupValueSlotProps' },
        { name: 'item-leading', key: 'itemLeading', type: 'MeterGroupItemSlotProps' },
        { name: 'item-label', key: 'itemLabel', type: 'MeterGroupItemSlotProps' },
        { name: 'item-value', key: 'itemValue', type: 'MeterGroupItemSlotProps' },
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
      name: 'MeterGroupItem',
      definition: `export interface MeterGroupItem {
  label: string
  value: number
  tone?: MeterGroupTone
  color?: string
  icon?: IconSource
}`,
    },
    {
      name: 'MeterGroupItemSlotProps',
      definition: `export interface MeterGroupItemSlotProps {
  item: MeterGroupItem
  index: number
  percent: number
}`,
    },
    {
      name: 'MeterGroupTone',
      definition: `export type MeterGroupTone = 'accent' | 'neutral' | 'success' | 'warning' | 'danger'`,
    },
    {
      name: 'MeterGroupValueSlotProps',
      definition: `export interface MeterGroupValueSlotProps {
  value: number
  max: number
  percent: number
}`,
    },
  ],
  cssVars: [
    { name: '--vectis-control-size-bar-thickness-xs', value: '0.125rem' },
    { name: '--vectis-control-size-bar-thickness-sm', value: '0.25rem' },
    { name: '--vectis-control-size-bar-thickness-md', value: '0.5rem' },
    { name: '--vectis-control-size-bar-thickness-lg', value: '0.75rem' },
    { name: '--vectis-control-size-bar-thickness-xl', value: '1.25rem' },
    { name: '--vectis-control-size-bar-length', value: '10rem' },
    { name: '--vectis-control-size-meter-group-swatch', value: '0.5rem' },
    { name: '--vectis-control-size-meter-segment-gap', value: '0.125rem' },
  ],
} satisfies PageApi
