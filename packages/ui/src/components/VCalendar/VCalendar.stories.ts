import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { computed, ref } from 'vue'

import { storyText } from '../../stories/storyText'
import VButton from '../VButton/VButton.vue'
import VCalendar from './VCalendar.vue'
import type { DateRange } from './VCalendar.vue'

const t = storyText({
  en: {
    deadline: 'Deadline',
    today: 'Today',
    tomorrow: 'Tomorrow',
    inThreeDays: 'In 3 days',
  },
  fr: {
    deadline: 'Échéance',
    today: "Aujourd'hui",
    tomorrow: 'Demain',
    inThreeDays: 'Dans 3 jours',
  },
})

const meta = {
  title: 'Components/Calendar',
  component: VCalendar,
  // No `locale` arg: the calendar then follows the design system's global locale, so the
  // Locale toolbar drives it. The Localization story pins explicit locales instead.
  args: {
    selection: 'single',
    showAdjacentDays: true,
    selectAdjacentDays: false,
  },
} satisfies Meta<typeof VCalendar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { VCalendar },
    setup: () => ({ args, value: ref('2026-06-10') }),
    template: `
      <div style="display: grid; gap: 12px; justify-items: start">
        <VCalendar v-bind="args" v-model="value" />
        <output>{{ value ?? '—' }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const grid = canvas.getByRole('grid')
    // the 10th is the initially focusable cell (roving tabindex 0)
    const start = within(grid).getByRole('button', { name: '10' })
    start.focus()
    await userEvent.keyboard('{ArrowRight}{Enter}')
    await waitFor(() => expect(canvas.getByText('2026-06-11')).toBeVisible())
  },
}

export const Range: Story = {
  render: (args) => ({
    components: { VCalendar },
    setup: () => ({ args, value: ref<DateRange>({ start: '2026-06-19', end: '2026-06-26' }) }),
    template: `
      <div style="display: grid; gap: 12px; justify-items: start">
        <VCalendar v-bind="args" selection="range" v-model="value" />
        <output>{{ value.start ?? '—' }} → {{ value.end ?? '—' }}</output>
      </div>
    `,
  }),
}

export const Multiple: Story = {
  render: (args) => ({
    components: { VCalendar },
    setup: () => ({ args, value: ref<string[]>(['2026-06-05', '2026-06-12', '2026-06-20']) }),
    template: `
      <div style="display: grid; gap: 12px; justify-items: start">
        <VCalendar v-bind="args" selection="multiple" v-model="value"/>
        <output>{{ value.join(', ') || '—' }}</output>
      </div>
    `,
  }),
}

export const MinMax: Story = {
  render: (args) => ({
    components: { VCalendar },
    setup: () => ({ args, value: ref('2026-06-15') }),
    template: `
      <VCalendar v-bind="args" v-model="value" min="2026-06-05" max="2026-06-24" />
    `,
  }),
}

// Weekends made non-selectable (struck through) through a predicate.
export const DisabledDates: Story = {
  render: (args) => ({
    components: { VCalendar },
    setup: () => {
      const isWeekend = (iso: string) => {
        const d = new Date(iso + 'T00:00:00').getDay()
        return d === 0 || d === 6
      }
      return { args, value: ref('2026-06-10'), isWeekend }
    },
    template: `<VCalendar v-bind="args" v-model="value" :disabled-dates="isWeekend" />`,
  }),
}

// The days of the adjacent months, displayed AND clickable.
export const AdjacentMonths: Story = {
  render: (args) => ({
    components: { VCalendar },
    setup: () => ({ args, value: ref('2026-06-10') }),
    template: `
      <VCalendar v-bind="args" v-model="value" show-adjacent-days select-adjacent-days />
    `,
  }),
}

// Event dots under the dates.
export const Events: Story = {
  render: (args) => ({
    components: { VCalendar },
    setup: () => ({
      args,
      value: ref('2026-06-10'),
      events: computed(() => [
        { date: '2026-06-10', color: 'var(--vectis-color-accent)' },
        { date: '2026-06-10', color: 'var(--vectis-color-success)' },
        { date: '2026-06-18', color: 'var(--vectis-color-danger)', label: t.value.deadline },
        { date: '2026-06-24', color: 'var(--vectis-color-warning)' },
      ]),
    }),
    template: `<VCalendar v-bind="args" v-model="value" :events="events" />`,
  }),
}

// The #day slot: displaying a price under the number (plane tickets, for instance).
export const DaySlot: Story = {
  render: (args) => ({
    components: { VCalendar },
    setup: () => {
      const value = ref('2026-06-10')
      const prices: Record<number, string> = { 10: '€89', 11: '€120', 12: '€75', 15: '€99' }
      return { args, value, prices }
    },
    // --vectis-calendar-day-size enlarges the dots (40×40); the price line is ALWAYS
    // rendered (empty when absent, and on the adjacent days the slot also applies to) so
    // that every number lines up.
    template: `
      <VCalendar v-bind="args" v-model="value" show-adjacent-days style="--vectis-calendar-day-size: 48px">
        <template #day="{ day, inMonth, selected }">
          <span style="line-height:1.2">{{ day }}</span>
          <span :style="{ fontSize: '0.625rem', lineHeight: 1.2, minHeight: '0.75rem', color: selected ? 'inherit' : 'var(--vectis-color-success-text)' }">
            {{ inMonth ? prices[day] ?? '' : '' }}
          </span>
        </template>
      </VCalendar>
    `,
  }),
}

// The footer zone: presets + actions.
export const WithFooter: Story = {
  render: (args) => ({
    components: { VCalendar, VButton },
    setup: () => {
      const value = ref('2026-06-10')
      const fmt = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      const inDays = (n: number) => {
        const d = new Date('2026-06-10T00:00:00')
        d.setDate(d.getDate() + n)
        value.value = fmt(d)
      }
      return { args, t, value, inDays }
    },
    template: `
      <VCalendar v-bind="args" v-model="value">
        <template #footer>
          <VButton variant="ghost" size="sm" @click="inDays(0)">{{ t.today }}</VButton>
          <VButton variant="ghost" size="sm" @click="inDays(1)">{{ t.tomorrow }}</VButton>
          <VButton variant="ghost" size="sm" @click="inDays(3)">{{ t.inThreeDays }}</VButton>
        </template>
      </VCalendar>
    `,
  }),
}

/**
 * The `locale` prop takes precedence over the design system's global locale: these eight
 * calendars stay pinned whatever the Locale toolbar says.
 */
export const Localization: Story = {
  render: (args) => ({
    components: { VCalendar },
    setup: () => ({ args, value: ref('2026-06-10') }),
    template: `
      <div style="display:flex; gap:24px; flex-wrap:wrap">
        <VCalendar v-bind="args" v-model="value" locale="fr-FR" />
        <VCalendar v-bind="args" v-model="value" locale="ar-EG" />
        <VCalendar v-bind="args" v-model="value" locale="en-US" />
        <VCalendar v-bind="args" v-model="value" locale="ru-RU" />
        <VCalendar v-bind="args" v-model="value" locale="el-GR" />
        <VCalendar v-bind="args" v-model="value" locale="ja-JP" />
        <VCalendar v-bind="args" v-model="value" locale="zh-CN" />
        <VCalendar v-bind="args" v-model="value" locale="th-TH" />
      </div>
    `,
  }),
}
