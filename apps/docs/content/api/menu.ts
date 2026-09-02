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
        { name: 'placement', type: 'MenuPlacement', default: "'bottom-start'" },
        { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'sm'" },
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
        { name: 'danger', type: 'boolean', default: 'false' },
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
  cssVars: [
    { name: '--vectis-control-size-menu-min', value: '11rem' },
    { name: '--vectis-control-size-menu-max', value: '20rem' },
  ],
} satisfies PageApi
