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
        { name: 'selection', type: 'DatePickerSelection', values: "'single' | 'range' | 'multiple'", default: "'single'" },
        { name: 'locale', type: 'string' },
        { name: 'firstDayOfWeek', type: 'number' },
        { name: 'min', type: 'string' },
        { name: 'max', type: 'string' },
        { name: 'disabledDates', type: 'DatePickerMatcher' },
        { name: 'showAdjacentDays', type: 'boolean', default: 'false' },
        { name: 'selectAdjacentDays', type: 'boolean', default: 'false' },
        { name: 'events', type: 'DatePickerEvent[]' },
        { name: 'disabled', type: 'boolean', default: 'false' },
        { name: 'readonly', type: 'boolean', default: 'false' },
        { name: 'label', type: 'string' },
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
  types: [
    {
      name: 'DatePickerEvent',
      definition: `export interface DatePickerEvent {
  date: string
  color?: string
  label?: string
}`,
    },
    {
      name: 'DatePickerMatcher',
      definition: `export type DatePickerMatcher = string[] | ((iso: string) => boolean)`,
    },
    {
      name: 'DatePickerRange',
      definition: `export interface DatePickerRange {
  start: string | null
  end: string | null
}`,
    },
    {
      name: 'DatePickerValue',
      definition: `export type DatePickerValue = string | null | DatePickerRange | string[]`,
    },
  ],
  cssVars: [
    { name: '--vectis-control-size-date-picker-cell', value: '2.5rem' },
    { name: '--vectis-control-size-date-picker-dot', value: '0.25rem' },
    { name: '--vectis-control-size-date-picker-nav-min', value: '5.375rem' },
  ],
} satisfies PageApi
