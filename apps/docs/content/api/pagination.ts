/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VPagination',
      props: [
        { name: 'length', type: 'number', default: '1' },
        { name: 'totalVisible', type: 'number' },
        { name: 'detached', type: 'boolean', default: 'false' },
        { name: 'itemVariant', type: 'PaginationItemVariant', values: "'ghost' | 'outline'", default: "'ghost'" },
        { name: 'tone', type: 'PaginationTone', values: "'accent' | 'neutral' | 'danger'", default: "'accent'" },
        { name: 'size', type: 'PaginationSize', values: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'" },
        { name: 'compact', type: 'boolean', default: 'false' },
        { name: 'elevated', type: 'boolean', default: 'false' },
        { name: 'align', type: 'PaginationAlign', values: "'start' | 'center' | 'end'", default: "'start'" },
        { name: 'controls', type: 'PaginationControls', values: "false | 'icon' | 'text' | 'both'", default: "'icon'" },
        { name: 'prevIcon', type: 'IconSource', default: 'chevron_left' },
        { name: 'nextIcon', type: 'IconSource', default: 'chevron_right' },
        { name: 'prevLabel', type: 'string' },
        { name: 'nextLabel', type: 'string' },
        { name: 'disabled', type: 'boolean', default: 'false' },
        { name: 'disabledPages', type: 'number[] | ((page: number) => boolean)' },
        { name: 'responsive', type: 'boolean', default: 'false' },
        { name: 'label', type: 'string' },
        { name: 'pageLabel', type: '(page: number) => string' },
        { name: 'v-model', key: 'vModel', type: 'number', default: '1' },
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
