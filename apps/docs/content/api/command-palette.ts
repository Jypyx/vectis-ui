/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VCommandPalette',
      props: [
        { name: 'items', type: 'CommandPaletteItem[]' },
        { name: 'shortcut', type: 'string' },
        { name: 'filter', type: 'CommandPaletteFilter', default: 'true' },
        { name: 'searchDebounce', type: 'number', default: '250' },
        { name: 'loading', type: 'boolean', default: 'false' },
        { name: 'loadingText', type: 'string' },
        { name: 'emptyText', type: 'string' },
        { name: 'placeholder', type: 'string' },
        { name: 'label', type: 'string' },
        { name: 'searchLabel', type: 'string' },
        { name: 'hideFooter', type: 'boolean', default: 'false' },
        { name: 'width', type: 'number | string' },
        { name: 'v-model:open', key: 'vModelOpen', type: 'boolean', default: 'false' },
        { name: 'v-model:query', key: 'vModelQuery', type: 'string', default: "''" },
      ],
      events: [
        { name: 'search', type: '[query: string]' },
        { name: 'select', type: '[command: CommandPaletteCommand, event: MouseEvent]' },
      ],
      slots: [
        { name: 'trigger', type: '{ triggerProps: CommandPaletteTriggerProps; }' },
        { name: 'item', type: 'CommandPaletteItemSlotProps' },
        { name: 'empty', type: 'CommandPaletteEmptySlotProps' },
        { name: 'loading', type: '{}' },
        { name: 'footer', type: '{}' },
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
      name: 'CommandPaletteCommand',
      definition: `export interface CommandPaletteCommand {
  label: string
  description?: string
  keywords?: string[]
  icon?: IconSource
  shortcut?: string
  href?: string
  disabled?: boolean
  keepOpen?: boolean
  id?: string | number
}`,
    },
    {
      name: 'CommandPaletteEmptySlotProps',
      definition: `export interface CommandPaletteEmptySlotProps {
  query: string
}`,
    },
    {
      name: 'CommandPaletteFilter',
      definition: `export type CommandPaletteFilter =
  boolean | ((command: CommandPaletteCommand, query: string) => boolean)`,
    },
    {
      name: 'CommandPaletteGroup',
      definition: `export interface CommandPaletteGroup {
  label: string
  commands: CommandPaletteCommand[]
}`,
    },
    {
      name: 'CommandPaletteItem',
      definition: `export type CommandPaletteItem =
  CommandPaletteCommand | CommandPaletteGroup | CommandPaletteSeparator`,
    },
    {
      name: 'CommandPaletteItemSlotProps',
      definition: `export interface CommandPaletteItemSlotProps {
  command: CommandPaletteCommand
  active: boolean
}`,
    },
    {
      name: 'CommandPaletteSeparator',
      definition: `export interface CommandPaletteSeparator {
  separator: true
}`,
    },
    {
      name: 'CommandPaletteTriggerProps',
      definition: `export type CommandPaletteTriggerProps = {
  onClick: () => void
  'aria-haspopup': 'dialog'
  'aria-keyshortcuts'?: string
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
  cssVars: [
    { name: '--vectis-control-size-command-palette-width', value: '40rem' },
    { name: '--vectis-control-size-command-palette-list-max-block', value: '20rem' },
    { name: '--vectis-control-size-command-palette-offset', value: '6rem' },
  ],
} satisfies PageApi
