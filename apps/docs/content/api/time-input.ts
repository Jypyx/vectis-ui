/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VTimeInput',
      props: [
        { name: 'format', type: 'TimePickerFormat' },
        { name: 'mode', type: 'TimeInputMode' },
        { name: 'showPicker', type: 'boolean' },
        { name: 'minuteStep', type: 'number', default: '1' },
        { name: 'locale', type: 'string' },
        { name: 'label', type: 'string' },
        { name: 'hint', type: 'string' },
        { name: 'placeholder', type: 'string' },
        { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'" },
        { name: 'compact', type: 'boolean', default: 'false' },
        { name: 'disabled', type: 'boolean', default: 'false' },
        { name: 'invalid', type: 'boolean', default: 'false' },
        { name: 'clearable', type: 'boolean', default: 'true' },
        { name: 'pickerIcon', type: 'IconSource', default: 'schedule' },
        { name: 'placement', type: 'Placement', default: "'bottom-start'" },
        { name: 'v-model', key: 'vModel', type: 'string | null', default: 'null' },
      ],
    },
  ],
  cssVars: [
    { name: '--vectis-control-size-time-input-list-max-block', value: '18rem' },
  ],
} satisfies PageApi
