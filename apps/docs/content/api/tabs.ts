/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VTabs',
      props: [
        { name: 'variant', type: 'TabsVariant', default: "'flat'" },
        { name: 'tone', type: 'TabsTone', default: "'accent'" },
        { name: 'size', type: 'TabsSize', default: "'md'" },
        { name: 'compact', type: 'boolean', default: 'false' },
        { name: 'orientation', type: 'TabsOrientation', default: "'horizontal'" },
        { name: 'align', type: 'TabsAlign', default: "'start'" },
        { name: 'grow', type: 'boolean', default: 'false' },
        { name: 'scrollButtons', type: 'boolean', default: 'false' },
        { name: 'prevIcon', type: 'IconSource' },
        { name: 'nextIcon', type: 'IconSource' },
        { name: 'prevLabel', type: 'string' },
        { name: 'nextLabel', type: 'string' },
        { name: 'activation', type: 'TabsActivation', default: "'manual'" },
        { name: 'label', type: 'string' },
        { name: 'v-model', key: 'vModel', type: 'string | number' },
      ],
      slots: [
        { name: 'default', type: '{}' },
        { name: 'panels', type: '{}' },
      ],
    },
    {
      name: 'VTab',
      props: [
        { name: 'value', type: 'string | number' },
        { name: 'label', type: 'string' },
        { name: 'icon', type: 'IconSource' },
        { name: 'disabled', type: 'boolean', default: 'false' },
      ],
      slots: [
        { name: 'default', type: '{}' },
      ],
    },
    {
      name: 'VTabPanel',
      props: [
        { name: 'value', type: 'string | number' },
        { name: 'lazy', type: 'boolean', default: 'false' },
      ],
      slots: [
        { name: 'default', type: '{}' },
      ],
    },
  ],
  cssVars: [
    { name: '--vectis-control-size-tab-indicator', value: '2px' },
  ],
} satisfies PageApi
