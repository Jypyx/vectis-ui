/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VTimePicker',
      props: [
        { name: 'format', type: 'TimePickerFormat' },
        { name: 'locale', type: 'string' },
        { name: 'minuteStep', type: 'number', default: '1' },
        { name: 'v-model', key: 'vModel', type: 'string | null', default: 'null' },
      ],
      events: [
        { name: 'confirm', type: '[]' },
      ],
      slots: [
        { name: 'footer', type: '{}' },
      ],
    },
  ],
  cssVars: [
    { name: '--vectis-control-size-time-picker-dial', value: '16rem' },
    { name: '--vectis-control-size-time-picker-number', value: '3rem' },
    { name: '--vectis-control-size-time-picker-center', value: '0.5rem' },
    { name: '--vectis-control-size-time-picker-hand', value: '2px' },
    { name: '--vectis-control-size-time-picker-hand-minor', value: '1rem' },
  ],
} satisfies PageApi
