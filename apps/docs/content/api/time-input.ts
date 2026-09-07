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
        { name: 'mode', type: 'TimeInputMode', default: "'input'" },
        { name: 'showPicker', type: 'boolean', default: 'false' },
        { name: 'minuteStep', type: 'number', default: '1' },
        { name: 'min', type: 'string' },
        { name: 'max', type: 'string' },
        { name: 'allowedHours', type: 'TimeMatcher' },
        { name: 'allowedMinutes', type: 'TimeMatcher' },
        { name: 'locale', type: 'string' },
        { name: 'label', type: 'string' },
        { name: 'hint', type: 'string' },
        { name: 'placeholder', type: 'string' },
        { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'" },
        { name: 'compact', type: 'boolean', default: 'false' },
        { name: 'disabled', type: 'boolean', default: 'false' },
        { name: 'readonly', type: 'boolean', default: 'false' },
        { name: 'invalid', type: 'boolean', default: 'false' },
        { name: 'iconStart', type: 'IconSource' },
        { name: 'iconStartLabel', type: 'string' },
        { name: 'iconEndLabel', type: 'string' },
        { name: 'loading', type: 'boolean', default: 'false' },
        { name: 'loadingLabel', type: 'string' },
        { name: 'clearable', type: 'boolean', default: 'false' },
        { name: 'clearLabel', type: 'string' },
        { name: 'pickerIcon', type: 'IconSource', default: 'schedule' },
        { name: 'placement', type: 'Placement', default: "'bottom-start'" },
        { name: 'v-model', key: 'vModel', type: 'string | null', default: 'null' },
      ],
    },
  ],
} satisfies PageApi
