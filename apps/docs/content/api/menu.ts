/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VMenu',
      props: [
        { name: 'placement', type: 'MenuPlacement', values: "'bottom-start' | 'bottom-end' | 'bottom' | 'top-start' | 'top-end' | 'top'", default: "'bottom-start'" },
        { name: 'size', type: 'MenuSize', values: "'sm' | 'md' | 'lg'", default: "'sm'" },
        { name: 'compact', type: 'boolean', default: 'false' },
        { name: 'width', type: 'string' },
        { name: 'matchTrigger', type: 'boolean', default: 'false' },
        { name: 'v-model:open', key: 'vModelOpen', type: 'boolean', default: 'false' },
      ],
      slots: [
        { name: 'trigger', type: '{ triggerProps: MenuTriggerProps; }' },
        { name: 'default', type: '{}' },
      ],
    },
    {
      name: 'VMenuItem',
      props: [
        { name: 'label', type: 'string' },
        { name: 'sublabel', type: 'string' },
        { name: 'iconStart', type: 'IconSource' },
        { name: 'iconEnd', type: 'IconSource' },
        { name: 'selected', type: 'boolean', default: 'false' },
        { name: 'tone', type: 'MenuItemTone', values: "'neutral' | 'danger'", default: "'neutral'" },
        { name: 'disabled', type: 'boolean', default: 'false' },
        { name: 'href', type: 'string' },
      ],
      events: [
        { name: 'select', type: '[]' },
      ],
      slots: [
        { name: 'default', type: '{}' },
        { name: 'sublabel', type: '{}' },
        { name: 'start', type: '{}' },
        { name: 'end', type: '{}' },
        { name: 'submenu', type: '{}' },
      ],
    },
    {
      name: 'VMenuGroup',
      props: [
        { name: 'label', type: 'string' },
      ],
      slots: [
        { name: 'default', type: '{}' },
      ],
    },
    {
      name: 'VMenuSeparator',
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
      name: 'MenuTriggerProps',
      definition: `type MenuTriggerProps = {
  popovertarget: string
  'aria-haspopup': 'menu'
  'aria-expanded': boolean
  'aria-controls': string
}`,
    },
  ],
  cssVars: [
    { name: '--vectis-control-size-menu-min', value: '11rem' },
    { name: '--vectis-control-size-menu-max', value: '20rem' },
  ],
} satisfies PageApi
