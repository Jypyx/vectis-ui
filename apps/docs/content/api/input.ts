/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VInput',
      props: [
        { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'" },
        { name: 'compact', type: 'boolean', default: 'false' },
        { name: 'type', type: "'text' | 'email' | 'number' | 'password' | 'search' | 'tel' | 'url'", default: "'text'" },
        { name: 'invalid', type: 'boolean', default: 'false' },
        { name: 'disabled', type: 'boolean', default: 'false' },
        { name: 'readonly', type: 'boolean', default: 'false' },
        { name: 'label', type: 'string' },
        { name: 'hint', type: 'string' },
        { name: 'iconStart', type: 'IconSource' },
        { name: 'iconEnd', type: 'IconSource' },
        { name: 'iconStartLabel', type: 'string' },
        { name: 'iconEndLabel', type: 'string' },
        { name: 'loading', type: 'boolean', default: 'false' },
        { name: 'loadingLabel', type: 'string' },
        { name: 'clearable', type: 'boolean', default: 'false' },
        { name: 'clearVisible', type: 'boolean' },
        { name: 'clearLabel', type: 'string' },
        { name: 'maxlength', type: 'number' },
        { name: 'softLimit', type: 'boolean', default: 'false' },
        { name: 'counter', type: 'boolean', default: 'false' },
        { name: 'v-model', key: 'vModel', type: 'string | number', default: "''" },
      ],
      events: [
        { name: 'clear', type: '[]' },
        { name: 'click:icon-start', key: 'clickIconStart', type: '[event: MouseEvent]' },
        { name: 'click:icon-end', key: 'clickIconEnd', type: '[event: MouseEvent]' },
      ],
      slots: [
        { name: 'start', type: '{}' },
        { name: 'end', type: '{}' },
      ],
    },
  ],
} satisfies PageApi
