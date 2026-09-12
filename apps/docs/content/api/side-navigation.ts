/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VSideNavigation',
      props: [
        { name: 'label', type: 'string' },
        { name: 'size', type: 'SideNavigationSize', values: "'sm' | 'md'", default: "'md'" },
        { name: 'compact', type: 'boolean', default: 'false' },
        { name: 'exclusive', type: 'boolean', default: 'false' },
        { name: 'expandIcon', type: 'IconSource', default: 'expand_more' },
        { name: 'collapseIcon', type: 'IconSource' },
      ],
      slots: [
        { name: 'default', type: '{}' },
      ],
    },
    {
      name: 'VSideNavigationItem',
      props: [
        { name: 'label', type: 'string' },
        { name: 'sublabel', type: 'string' },
        { name: 'icon', type: 'IconSource' },
        { name: 'href', type: 'string' },
        { name: 'active', type: 'boolean', default: 'false' },
        { name: 'disabled', type: 'boolean', default: 'false' },
        { name: 'defaultOpen', type: 'boolean', default: 'false' },
        { name: 'v-model:open', key: 'vModelOpen', type: 'boolean | null', default: 'null' },
      ],
      events: [
        { name: 'select', type: '[]' },
      ],
      slots: [
        { name: 'default', type: '{}' },
        { name: 'sublabel', type: '{}' },
        { name: 'start', type: '{}' },
        { name: 'end', type: '{}' },
        { name: 'items', type: '{}' },
      ],
    },
    {
      name: 'VSideNavigationGroup',
      props: [
        { name: 'label', type: 'string' },
      ],
      slots: [
        { name: 'default', type: '{}' },
        { name: 'label', type: '{}' },
      ],
    },
    {
      name: 'VSideNavigationSeparator',
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
