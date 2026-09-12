/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VAccordion',
      props: [
        { name: 'multiple', type: 'boolean', default: 'false' },
        { name: 'variant', type: 'AccordionVariant', values: "'flat' | 'outlined'", default: "'flat'" },
        { name: 'expandIcon', type: 'IconSource', default: 'expand_more' },
        { name: 'collapseIcon', type: 'IconSource' },
        { name: 'compact', type: 'boolean', default: 'false' },
      ],
      slots: [
        { name: 'default', type: '{}' },
      ],
    },
    {
      name: 'VAccordionItem',
      props: [
        { name: 'title', type: 'string' },
        { name: 'subtitle', type: 'string' },
        { name: 'icon', type: 'IconSource' },
        { name: 'defaultOpen', type: 'boolean', default: 'false' },
        { name: 'disabled', type: 'boolean', default: 'false' },
      ],
      slots: [
        { name: 'default', type: '{}' },
        { name: 'title', type: '{}' },
        { name: 'subtitle', type: '{}' },
        { name: 'start', type: '{}' },
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
