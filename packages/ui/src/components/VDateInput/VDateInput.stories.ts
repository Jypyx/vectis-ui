import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { computed, ref } from 'vue'

import { storyText } from '../../stories/storyText'
import VButton from '../VButton/VButton.vue'
import type { DateRange } from '../VDatePicker/VDatePicker.vue'
import VDateInput from './VDateInput.vue'

const t = storyText({
  en: {
    date: 'Date',
    period: 'Period',
    dates: 'Dates',
    // The mask derives from the locale, and so does this hint: switching the Locale
    // toolbar changes both together.
    maskHint: 'Format mm/dd/yyyy',
    today: 'Today',
    tomorrow: 'Tomorrow',
    inThreeDays: 'In 3 days',
    juneOnly: 'From 5 to 24 June only',
    juneWeekdays: 'June 2026, weekdays only',
  },
  fr: {
    date: 'Date',
    period: 'Période',
    dates: 'Dates',
    maskHint: 'Format jj/mm/aaaa',
    today: "Aujourd'hui",
    tomorrow: 'Demain',
    inThreeDays: 'Dans 3 jours',
    juneOnly: 'Du 5 au 24 juin uniquement',
    juneWeekdays: 'Juin 2026, jours ouvrés',
  },
})

const meta = {
  title: 'Components/DateInput',
  component: VDateInput,
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    selection: { control: 'inline-radio', options: ['single', 'range', 'multiple'] },
    mode: { control: 'inline-radio', options: ['readonly', 'input'] },
    showPicker: { control: 'boolean' },
  },
  // Neither `mode` nor `selection`: pinning them would make the Controls panel lie, as it
  // would show a current value different from the component's default. No `locale`
  // either — the picker then follows the design system's global locale, so the Locale
  // toolbar drives both the mask and the month names.
  args: {
    size: 'md',
    clearable: true,
  },
} satisfies Meta<typeof VDateInput>

export default meta
type Story = StoryObj<typeof meta>

/**
 * By default the field is typed on the keyboard and places the separators on its own,
 * with no calendar: the field stays bare until a date is entered, then displays the clear
 * cross.
 */
export const Default: Story = {
  render: (args) => ({
    components: { VDateInput },
    setup: () => ({ args, t, value: ref<string | null>(null) }),
    template: `
      <div style="width: 280px; display:grid; gap:8px">
        <VDateInput v-bind="args" v-model="value" :label="t.date" :hint="t.maskHint" />
        <output>{{ value ?? '—' }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // `textbox` and not `combobox`: with no panel the field takes no role at all — that
    // pairing is the contract. Going through the role rather than getByLabelText also
    // avoids matching the panel, which carries the same aria-label as the field.
    const field = canvas.getByRole('textbox', { name: 'Date' })

    // with no calendar, the field announces no popup and opens none
    await expect(field).not.toHaveAttribute('aria-haspopup')
    await userEvent.click(field)
    await expect(canvas.queryByRole('dialog')).toBeNull()

    // only digits are typed, the mask places the "/" (en-US mask: mm/dd/yyyy)
    await userEvent.keyboard('06')
    await expect(field).toHaveValue('06/')
    await userEvent.keyboard('102026')
    await expect(field).toHaveValue('06/10/2026')
    await expect(field).toHaveFocus()
    await waitFor(() => expect(canvas.getByText('2026-06-10')).toBeVisible())

    // the clear cross, meanwhile, stays available (clearable)
    await expect(canvas.getByRole('button', { name: 'Clear date' })).toBeVisible()

    // Backspace on the separator erases the digit preceding it
    await userEvent.keyboard('{Backspace}{Backspace}{Backspace}{Backspace}{Backspace}')
    await expect(field).toHaveValue('06/1')

    // leaving the field: the incomplete entry silently returns to the value
    await userEvent.tab()
    await waitFor(() => expect(field).toHaveValue('06/10/2026'))
  },
}

/**
 * `mode="readonly"`: the date can only be chosen from the calendar, which then becomes
 * the only route — `showPicker` is pointless there.
 */
export const ReadOnly: Story = {
  args: { mode: 'readonly' },
  render: (args) => ({
    components: { VDateInput },
    setup: () => ({ args, t, value: ref('2026-06-10') }),
    template: `
      <div style="width: 280px; display:grid; gap:8px">
        <VDateInput v-bind="args" v-model="value" :label="t.date" />
        <output>{{ value ?? '—' }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const field = canvas.getByRole('combobox', { name: 'Date' })
    // opening with the keyboard (down arrow), the focus moved into the grid
    field.focus()
    await userEvent.keyboard('{ArrowDown}')
    await waitFor(() => expect(canvas.getByRole('dialog')).toBeVisible())

    /*
     * `.v-popover-panel.v-date-input-panel` against `.v-panel`, which declares
     * `padding` at equal specificity on this very element (the popover is a `surface`).
     * The cancellation only holds through the compound once each sheet ships
     * separately: without it, `.v-panel`'s `--vectis-space-1` (4px) may win and inset
     * the calendar inside a gutter it already handles itself.
     */
    await expect(getComputedStyle(canvas.getByRole('dialog')).padding).toBe('0px')

    // Escape closes and hands the focus back to the field
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(field).toHaveFocus())
  },
}

export const Range: Story = {
  args: { selection: 'range' },
  render: (args) => ({
    components: { VDateInput },
    setup: () => ({ args, t, value: ref<DateRange>({ start: '2026-06-19', end: '2026-06-26' }) }),
    template: `
      <div style="width: 300px">
        <VDateInput v-bind="args" :label="t.period" v-model="value" />
      </div>
    `,
  }),
}

export const Multiple: Story = {
  args: { selection: 'multiple' },
  render: (args) => ({
    components: { VDateInput },
    setup: () => ({ args, t, value: ref<string[]>(['2026-06-05', '2026-06-12']) }),
    template: `
      <div style="width: 300px">
        <VDateInput v-bind="args" :label="t.dates" v-model="value" />
      </div>
    `,
  }),
}

// A footer with presets that set the value and close the panel.
export const WithPresets: Story = {
  args: { mode: 'readonly' },
  render: (args) => ({
    components: { VDateInput, VButton },
    setup: () => {
      const value = ref('2026-06-10')
      const fmt = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      const setIn = (n: number, close: () => void) => {
        const d = new Date('2026-06-10T00:00:00')
        d.setDate(d.getDate() + n)
        value.value = fmt(d)
        close()
      }
      return { args, t, value, setIn }
    },
    template: `
      <div style="width: 280px">
        <VDateInput v-bind="args" v-model="value" :label="t.date">
          <template #footer="{ close }">
            <VButton variant="ghost" size="sm" @click="setIn(0, close)">{{ t.today }}</VButton>
            <VButton variant="ghost" size="sm" @click="setIn(1, close)">{{ t.tomorrow }}</VButton>
            <VButton variant="ghost" size="sm" @click="setIn(3, close)">{{ t.inThreeDays }}</VButton>
          </template>
        </VDateInput>
      </div>
    `,
  }),
}

export const MinMax: Story = {
  args: { mode: 'readonly' },
  render: (args) => ({
    components: { VDateInput },
    setup: () => ({ args, t, value: ref('2026-06-15') }),
    template: `
      <div style="width: 280px">
        <VDateInput v-bind="args" v-model="value" :label="t.date" min="2026-06-05" max="2026-06-24"
          :hint="t.juneOnly" />
      </div>
    `,
  }),
}

export const Events: Story = {
  args: { mode: 'readonly' },
  render: (args) => ({
    components: { VDateInput },
    setup: () => ({
      args,
      t,
      value: ref('2026-06-10'),
      events: [
        { date: '2026-06-10', color: 'var(--vectis-color-accent)' },
        { date: '2026-06-18', color: 'var(--vectis-color-danger)' },
      ],
    }),
    template: `
      <div style="width: 280px">
        <VDateInput v-bind="args" v-model="value" :label="t.date" :events="events" />
      </div>
    `,
  }),
}

export const Sizes: Story = {
  render: (args) => ({
    components: { VDateInput },
    setup: () => ({ args, value: ref('2026-06-10') }),
    template: `
      <div style="width: 280px; display:grid; gap:12px">
        <VDateInput v-bind="args" v-model="value" size="sm" label="sm" />
        <VDateInput v-bind="args" v-model="value" size="md" label="md" />
        <VDateInput v-bind="args" v-model="value" size="lg" label="lg" />
      </div>
    `,
  }),
}

export const Disabled: Story = {
  render: (args) => ({
    components: { VDateInput },
    setup: () => ({ args, t, value: ref('2026-06-10') }),
    template: `
      <div style="width: 280px">
        <VDateInput v-bind="args" v-model="value" :label="t.date" disabled />
      </div>
    `,
  }),
}

/**
 * Clicking an empty area of the panel (its padding, the gutter between cells) must close
 * NOTHING: without `useFieldPanel`'s neutralized `mousedown`, the browser would hand the
 * focus back to `<body>` and the root's `focusout` would close a panel that was just
 * clicked.
 *
 * Invisible in jsdom, which does not simulate focus on click — hence this play function.
 */
export const ClickInTheVoid: Story = {
  args: { mode: 'readonly' },
  render: (args) => ({
    components: { VDateInput },
    setup: () => ({ args, t, value: ref('2026-06-10') }),
    template: `
      <div style="width: 280px">
        <VDateInput v-bind="args" v-model="value" :label="t.date" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const field = canvas.getByRole('combobox', { name: 'Date' })
    field.focus()
    await userEvent.keyboard('{ArrowDown}')
    const panel = await waitFor(() => canvas.getByRole('dialog'))
    // the focus is moved into the grid (a `manual` panel does not do it on its own) —
    // under a rAF, hence the waitFor
    await waitFor(() => expect(panel.contains(document.activeElement)).toBe(true))

    // a click on the grid ITSELF rather than on a cell: userEvent dispatches on the
    // element passed, with no hit-testing — faithfully the click that lands in the
    // padding or a gutter, where nothing is focusable
    await userEvent.click(canvas.getByRole('grid'))
    await expect(panel.matches(':popover-open')).toBe(true)
    // and the focus has not been handed back to the body
    await expect(document.body).not.toHaveFocus()

    // a click on a real day, meanwhile, keeps the native behaviour (focus + choice)
    await userEvent.click(canvas.getByRole('button', { name: '15' }))
    await waitFor(() => expect(panel.matches(':popover-open')).toBe(false))
    await expect(field).toHaveValue('Jun 15, 2026')
  },
}

/**
 * `showPicker` makes the calendar reachable from an input field: a clickable icon at
 * the end of the field, and a panel opened on focus — without grabbing the caret, so
 * typing continues in the field.
 */
export const InputWithCalendar: Story = {
  args: { showPicker: true },
  render: (args) => ({
    components: { VDateInput },
    setup: () => ({ args, t, value: ref<string | null>(null) }),
    template: `
      <div style="width: 280px; display:grid; gap:8px">
        <VDateInput v-bind="args" v-model="value" :label="t.date" :hint="t.maskHint" />
        <output>{{ value ?? '—' }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const field = canvas.getByRole('combobox', { name: 'Date' })

    // the click opens the panel WITHOUT grabbing the caret: typing continues
    await userEvent.click(field)
    await waitFor(() => expect(canvas.getByRole('dialog')).toBeVisible())
    await expect(field).toHaveFocus()
    await userEvent.keyboard('06102026')
    await expect(field).toHaveValue('06/10/2026')
    await expect(field).toHaveFocus()

    // the down arrow is the explicit route to the grid, Escape comes back
    await userEvent.keyboard('{ArrowDown}')
    const panel = canvas.getByRole('dialog')
    await waitFor(() => expect(panel.contains(document.activeElement)).toBe(true))
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(field).toHaveFocus())
    // Escape has not reopened the panel through the focus handed back to the field
    await expect(panel.matches(':popover-open')).toBe(false)
  },
}

/**
 * Pasting an already-written date (ISO, or masked in another locale) is recognized:
 * without that, pasting "2026-06-10" into a dd/mm/yyyy mask would give "20/26/0610".
 */
export const InputPaste: Story = {
  render: (args) => ({
    components: { VDateInput },
    setup: () => ({ args, t, value: ref<string | null>(null) }),
    template: `
      <div style="width: 280px; display:grid; gap:8px">
        <VDateInput v-bind="args" v-model="value" :label="t.date" />
        <output>{{ value ?? '—' }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const field = canvas.getByRole('textbox', { name: 'Date' })
    await userEvent.click(field)
    await userEvent.paste('2026-06-10')
    await expect(field).toHaveValue('06/10/2026')
    await waitFor(() => expect(canvas.getByText('2026-06-10')).toBeVisible())
  },
}

/**
 * The field order and the separator are derived from the locale: nothing is hardcoded,
 * and the placeholder template follows the localized field names.
 */
export const InputLocales: Story = {
  render: (args) => ({
    components: { VDateInput },
    setup: () => ({ args, value: ref('2026-06-10') }),
    template: `
      <div style="width: 280px; display:grid; gap:12px">
        <VDateInput v-bind="args" v-model="value" locale="fr-FR" label="fr-FR" />
        <VDateInput v-bind="args" v-model="value" locale="en-US" label="en-US" />
        <VDateInput v-bind="args" v-model="value" locale="de-DE" label="de-DE" />
        <VDateInput v-bind="args" v-model="value" locale="ja-JP" label="ja-JP" />
      </div>
    `,
  }),
}

/**
 * The bounds and the disabled dates hold for typing too: a rejected date silently returns
 * to the current value on leaving the field.
 */
export const BoundedInput: Story = {
  render: (args) => ({
    components: { VDateInput },
    setup: () => ({
      args,
      t,
      value: ref('2026-06-10'),
      weekends: (iso: string) => [0, 6].includes(new Date(`${iso}T00:00:00`).getDay()),
      hint: computed(() => t.value.juneWeekdays),
    }),
    template: `
      <div style="width: 280px; display:grid; gap:8px">
        <VDateInput v-bind="args" v-model="value" :label="t.date" min="2026-06-01" max="2026-06-30"
          :disabled-dates="weekends" :hint="hint" />
        <output>{{ value ?? '—' }}</output>
      </div>
    `,
  }),
}
