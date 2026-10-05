/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VTreeView',
      props: [
        { name: 'items', type: 'TreeItem[]' },
        { name: 'selectionMode', type: 'TreeSelectionMode', values: "'none' | 'single' | 'multiple'", default: "'none'" },
        { name: 'loadChildren', type: '(item: TreeItem) => Promise<TreeItem[]>' },
        { name: 'size', type: 'TreeViewSize', values: "'sm' | 'md'", default: "'md'" },
        { name: 'label', type: 'string' },
        { name: 'v-model', key: 'vModel', type: 'TreeViewModelValue', default: 'null' },
        { name: 'v-model:expanded', key: 'vModelExpanded', type: 'ItemValue[]', default: '[]' },
      ],
      events: [
        { name: 'activate', type: '[item: TreeItem, event: MouseEvent | KeyboardEvent]' },
      ],
      slots: [
        { name: 'icon', type: 'TreeItemSlotProps' },
        { name: 'label', type: 'TreeItemSlotProps' },
        { name: 'end', type: 'TreeItemSlotProps' },
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
      name: 'TreeItem',
      definition: `export interface TreeItem {
  value: ItemValue
  label: string
  icon?: IconSource
  children?: TreeItem[]
  lazy?: boolean
  href?: string
  current?: boolean
  disabled?: boolean
}`,
    },
    {
      name: 'TreeItemSlotProps',
      definition: `export interface TreeItemSlotProps {
  item: TreeItem
  level: number
  expanded: boolean
}`,
    },
    {
      name: 'TreeViewModelValue',
      definition: `export type TreeViewModelValue = ItemValue | ItemValue[] | null`,
    },
  ],
  cssVars: [
    { name: '--vectis-control-size-check', value: '1.25rem' },
    { name: '--vectis-control-size-check-mark', value: '0.875rem' },
  ],
} satisfies PageApi
