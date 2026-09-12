/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VBreadcrumb',
      props: [
        { name: 'items', type: 'BreadcrumbItem[]' },
        { name: 'label', type: 'string' },
        { name: 'currentPath', type: 'string' },
        { name: 'separator', type: 'IconSource', default: 'chevron_right' },
        { name: 'maxItems', type: 'number' },
        { name: 'ellipsisLabel', type: 'string' },
      ],
    },
  ],
  types: [
    {
      name: 'BreadcrumbItem',
      definition: `export interface BreadcrumbItem {
  label: string
  href: string
  iconStart?: IconSource
}`,
    },
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
