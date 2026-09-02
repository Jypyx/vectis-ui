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
        { name: 'exclusive', type: 'boolean', default: 'true' },
        { name: 'variant', type: "'flat' | 'outlined'", default: "'flat'" },
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
        { name: 'iconStart', type: 'IconSource' },
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
} satisfies PageApi
