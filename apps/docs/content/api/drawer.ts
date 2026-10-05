/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VDrawer',
      props: [
        { name: 'title', type: 'string' },
        { name: 'subtitle', type: 'string' },
        { name: 'side', type: 'DrawerSide', values: "'start' | 'end' | 'top' | 'bottom'", default: "'end'" },
        { name: 'size', type: 'DrawerSize', values: "'sm' | 'md' | 'lg'", default: "'md'" },
        { name: 'extent', type: 'number | string' },
        { name: 'hideClose', type: 'boolean', default: 'false' },
        { name: 'persistentBackdrop', type: 'boolean', default: 'false' },
        { name: 'persistentEscape', type: 'boolean', default: 'false' },
        { name: 'closeLabel', type: 'string' },
        { name: 'v-model:open', key: 'vModelOpen', type: 'boolean', default: 'false' },
      ],
      slots: [
        { name: 'default', type: '{}' },
        { name: 'header', type: '{}' },
        { name: 'header-actions', key: 'headerActions', type: '{}' },
        { name: 'footer', type: '{}' },
        { name: 'trigger', type: '{ triggerProps: DialogTriggerProps; }' },
      ],
    },
  ],
  types: [
    {
      name: 'DialogTriggerProps',
      definition: `export type DialogTriggerProps = {
  onClick: () => void
  'aria-haspopup': 'dialog'
}`,
    },
  ],
  cssVars: [
    { name: '--vectis-control-size-drawer-sm', value: '20rem' },
    { name: '--vectis-control-size-drawer-md', value: '25rem' },
    { name: '--vectis-control-size-drawer-lg', value: '35rem' },
  ],
} satisfies PageApi
