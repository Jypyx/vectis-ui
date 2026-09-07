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
        { name: 'variant', type: 'ButtonVariant', default: "'ghost'" },
        { name: 'tone', type: 'ButtonTone', default: "'neutral'" },
        { name: 'elevated', type: 'boolean', default: 'false' },
        { name: 'size', type: 'ButtonSize', default: "'md'" },
        { name: 'compact', type: 'boolean', default: 'false' },
        { name: 'shape', type: 'IconButtonShape', default: "'square'" },
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
