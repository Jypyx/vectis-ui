/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VDateInput',
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
        { name: 'mode', type: 'DateInputMode', default: "'input'" },
        { name: 'showPicker', type: 'boolean', default: 'false' },
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
        { name: 'pickerIcon', type: 'IconSource', default: 'calendar_today' },
        { name: 'displayFormat', type: 'Intl.DateTimeFormatOptions', default: "{ day: 'numeric', month: 'short', year: 'numeric' }" },
        { name: 'placement', type: 'Placement', default: "'bottom-start'" },
        { name: 'v-model', key: 'vModel', type: 'DatePickerValue', default: 'null' },
      ],
      events: [
        { name: 'click:icon-start', key: 'clickIconStart', type: '[event: MouseEvent]' },
        { name: 'clear', type: '[]' },
      ],
      slots: [
        { name: 'day', type: '{ iso: string; day: number; inMonth: boolean; disabled: boolean; selected: boolean; today: boolean; inRange: boolean; events: DatePickerEvent[]; }' },
        { name: 'footer', type: '{ close: () => void; }' },
      ],
    },
  ],
} satisfies PageApi
