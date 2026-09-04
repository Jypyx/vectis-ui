/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VToggle',
      props: [
        { name: 'multiple', type: 'boolean', default: 'false' },
        { name: 'mandatory', type: 'boolean', default: 'false' },
        { name: 'detached', type: 'boolean', default: 'false' },
        { name: 'seamless', type: 'boolean', default: 'false' },
        { name: 'orientation', type: 'ToggleOrientation', default: "'horizontal'" },
        { name: 'variant', type: 'ToggleVariant', default: "'ghost'" },
        { name: 'selectedVariant', type: 'ToggleSelectedVariant', default: "'solid'" },
        { name: 'tone', type: 'ToggleTone', default: "'accent'" },
        { name: 'size', type: 'ToggleSize', default: "'md'" },
        { name: 'compact', type: 'boolean', default: 'false' },
        { name: 'elevated', type: 'boolean', default: 'false' },
        { name: 'disabled', type: 'boolean', default: 'false' },
        { name: 'selectedIconFilled', type: 'boolean', default: 'false' },
        { name: 'label', type: 'string' },
        { name: 'v-model', key: 'vModel', type: 'ToggleModelValue', default: 'null' },
      ],
      slots: [
        { name: 'default', type: '{}' },
      ],
    },
    {
      name: 'VToggleItem',
      props: [
        { name: 'value', type: 'ToggleValue' },
        { name: 'label', type: 'string' },
        { name: 'icon', type: 'IconSource' },
        { name: 'disabled', type: 'boolean', default: 'false' },
      ],
      slots: [
        { name: 'default', type: '{}' },
      ],
    },
  ],
} satisfies PageApi
