/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VDatePicker',
      props: [
        { name: 'selection', type: 'DatePickerSelection', default: "'single'" },
        { name: 'locale', type: 'string' },
        { name: 'firstDayOfWeek', type: 'number' },
        { name: 'min', type: 'string' },
        { name: 'max', type: 'string' },
        { name: 'disabledDates', type: 'DateMatcher' },
        { name: 'showAdjacentDays', type: 'boolean', default: 'false' },
        { name: 'selectAdjacentDays', type: 'boolean', default: 'false' },
        { name: 'events', type: 'DatePickerEvent[]' },
        { name: 'v-model', key: 'vModel', type: 'DatePickerValue', default: 'null' },
      ],
      events: [
        { name: 'select', type: '[value: DatePickerValue]' },
      ],
      slots: [
        { name: 'day', type: '{ iso: string; day: number; inMonth: boolean; disabled: boolean; selected: boolean; today: boolean; inRange: boolean; events: DatePickerEvent[]; }' },
        { name: 'footer', type: '{}' },
      ],
    },
  ],
  cssVars: [
    { name: '--vectis-control-size-date-picker-cell', value: '2.5rem' },
    { name: '--vectis-control-size-date-picker-dot', value: '0.25rem' },
    { name: '--vectis-control-size-date-picker-nav-min', value: '5.375rem' },
  ],
} satisfies PageApi
