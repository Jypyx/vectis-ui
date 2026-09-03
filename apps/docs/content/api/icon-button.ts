/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VIconButton',
      props: [
        { name: 'label', type: 'string' },
        { name: 'variant', type: "'solid' | 'outline' | 'ghost' | 'soft'", default: "'ghost'" },
        { name: 'tone', type: "'accent' | 'neutral' | 'danger'" },
        { name: 'elevated', type: 'boolean', default: 'false' },
        { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'" },
        { name: 'compact', type: 'boolean', default: 'false' },
        { name: 'shape', type: "'square' | 'circular'", default: "'square'" },
        { name: 'type', type: "ButtonHTMLAttributes['type']", default: "'button'" },
        { name: 'disabled', type: 'boolean', default: 'false' },
        { name: 'loading', type: 'boolean', default: 'false' },
        { name: 'icon', type: 'IconSource' },
        { name: 'iconFilled', type: 'boolean', default: 'false' },
      ],
      slots: [
        { name: 'default', type: '{}' },
      ],
    },
  ],
} satisfies PageApi
