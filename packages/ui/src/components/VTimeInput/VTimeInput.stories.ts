import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import { tapDial } from '../../stories/dial'
import { storyText } from '../../stories/storyText'
import VTimeInput from './VTimeInput.vue'

const t = storyText({
  en: {
    time: 'Time',
    maskHint: 'Format hh:mm',
    fiveMinuteHint: 'Minutes in steps of 5',
    officeHint: 'Between 09:00 and 17:00',
    typed: 'Typed',
    listed: 'Listed',
    picked: 'Picked',
    slot: 'Appointment slot',
    slotHint: 'Set by the practice.',
    checkingTime: 'Checking availability',
    searchByTime: 'Search by time',
  },
  fr: {
    time: 'Heure',
    maskHint: 'Format hh:mm',
    fiveMinuteHint: 'Minutes par pas de 5',
    officeHint: 'Entre 09:00 et 17:00',
    typed: 'Saisi',
    listed: 'Liste',
    picked: 'Cadran',
    slot: 'Créneau du rendez-vous',
    slotHint: 'Fixé par le cabinet.',
    checkingTime: 'Vérification des disponibilités',
    searchByTime: 'Rechercher par heure',
  },
})

const meta = {
  title: 'Components/TimeInput',
  component: VTimeInput,
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    mode: { control: 'inline-radio', options: ['picker', 'input', 'list'] },
  },
  // No `locale` either; the picker then follows the design system's global locale, so the
  // Locale toolbar drives the hour cycle along with the words.
  args: {
    size: 'md',
  },
} satisfies Meta<typeof VTimeInput>

export default meta
type Story = StoryObj<typeof meta>

/**
 * By default the field is masked: the user types digits only and the colon is placed on
 * its own, with no picker at all.
 */
export const Default: Story = {
  args: { format: '24h' },
  render: (args) => ({
    components: { VTimeInput },
    setup: () => ({ args, t, value: ref(null) }),
    template: `
      <div style="width: 280px; display:grid; gap:8px">
        <VTimeInput v-bind="args" v-model="value" :label="t.time" :hint="t.maskHint" />
        <output data-testid="value">{{ value ?? '—' }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const field = canvas.getByRole('textbox', { name: 'Time' }) as HTMLInputElement

    await expect(field).not.toHaveAttribute('aria-haspopup')
    await userEvent.click(field)
    await expect(canvas.queryByRole('dialog')).toBeNull()

    await userEvent.keyboard('09')
    await expect(field).toHaveValue('09:')
    await expect(field.selectionStart).toBe(3)
    await userEvent.keyboard('30')
    await expect(field).toHaveValue('09:30')
    await waitFor(() => expect(canvas.getByTestId('value')).toHaveTextContent('09:30'))

    // Both minute digits go, and the caret lands before the colon (deleting does not cross it)…
    await userEvent.keyboard('{Backspace}{Backspace}')
    await expect(field).toHaveValue('09:')
    await expect(field.selectionStart).toBe(2)
    await userEvent.keyboard('{Backspace}')
    await expect(field).toHaveValue('0')

    // Leaving the field: the incomplete entry silently reverts to the value
    await userEvent.tab()
    await waitFor(() => expect(field).toHaveValue('09:30'))
  },
}

/**
 * `mode="picker"`: the time can only be chosen on the clock, which then becomes the only route;
 * `showPicker` is beside the point there.
 */
export const PickerOnly: Story = {
  args: { mode: 'picker' },
  render: (args) => ({
    components: { VTimeInput },
    setup: () => ({ args, t, value: ref('09:15') }),
    template: `
      <div style="width: 280px; display:grid; gap:8px">
        <VTimeInput v-bind="args" v-model="value" :label="t.time" />
        <output>{{ value ?? '—' }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const field = canvas.getByRole('combobox', { name: 'Time' })
    // Keyboard opening (the down arrow), with focus moved into the panel
    field.focus()
    await userEvent.keyboard('{ArrowDown}')
    await waitFor(() => expect(canvas.getByRole('dialog')).toBeVisible())
    // Escape cancels, closes and hands focus back to the field
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(field).toHaveFocus())
  },
}

// A complete pointer selection: hour 3 (the outer ring), the automatic move to the
// minutes, minute 30, OK.
export const DialSelection: Story = {
  args: { mode: 'picker', format: '24h' },
  render: (args) => ({
    components: { VTimeInput },
    setup: () => ({ args, t, value: ref('09:15') }),
    template: `
      <div style="width: 280px; display:grid; gap:8px">
        <VTimeInput v-bind="args" v-model="value" :label="t.time" />
        <output data-testid="value">{{ value }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    /*
     * A closed popover has to be `display: none`, or its box stays laid out over the page:
     * invisible at `opacity: 0`, `position: fixed`, and swallowing every click that lands on
     * it. jsdom cannot see this at all, computing no styles, so the browser suite is the only
     * place it can be held.
     */
    const closed = canvasElement.querySelector('.v-time-input-panel') as HTMLElement
    await expect(getComputedStyle(closed).display).toBe('none')

    await userEvent.click(canvas.getByRole('combobox', { name: 'Time' }))
    await waitFor(() => expect(canvas.getByRole('dialog')).toBeVisible())

    /*
     * `.v-popover-panel.v-time-input-panel` against `.v-panel`, which declares a `padding` at
     * equal specificity on this very element (the popover is a `surface`). Only the compound
     * cancels it under an order nothing controls once each sheet ships separately: `0px`
     * against `.v-panel`'s `--vectis-space-1` (4px).
     */
    const panel = canvas.getByRole('dialog')
    await expect(getComputedStyle(panel).padding).toBe('0px')
    const picker = canvasElement.querySelector('.v-time-picker') as HTMLElement
    await expect(getComputedStyle(picker).padding).toBe('12px')
    await expect(getComputedStyle(picker).gap).toBe('16px')

    const face = canvasElement.querySelector('.v-time-picker-face') as HTMLElement

    tapDial(face, 3 / 12)
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: /Select hour$/ })).toHaveTextContent('03'),
    )
    await waitFor(() => expect(canvas.getByRole('slider')).toHaveAccessibleName('Minutes'))

    tapDial(face, 30 / 60)
    await userEvent.click(canvas.getByRole('button', { name: 'OK' }))
    await waitFor(() => expect(canvas.getByTestId('value')).toHaveTextContent('03:30'))
  },
}

export const InnerRing: Story = {
  args: { mode: 'picker', format: '24h' },
  render: (args) => ({
    components: { VTimeInput },
    setup: () => ({ args, t, value: ref('09:15') }),
    template: `
      <div style="width: 280px">
        <VTimeInput v-bind="args" v-model="value" :label="t.time" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('combobox', { name: 'Time' }))
    await waitFor(() => expect(canvas.getByRole('dialog')).toBeVisible())
    const face = canvasElement.querySelector('.v-time-picker-face') as HTMLElement
    const hourCell = () => canvas.getByRole('button', { name: /Select hour$/ })

    tapDial(face, 0, 0.44)
    await waitFor(() => expect(hourCell()).toHaveTextContent('00'))
    await userEvent.click(hourCell())
    tapDial(face, 1 / 12, 0.44)
    await waitFor(() => expect(hourCell()).toHaveTextContent('13'))
  },
}

/**
 * `showPicker` makes the picker reachable from an input field: a clickable icon at the end of
 * the field, and the panel opening on focus; without stealing the caret, so typing carries on
 * in the field.
 */
export const InputWithDial: Story = {
  args: { showPicker: true, format: '24h' },
  render: (args) => ({
    components: { VTimeInput },
    setup: () => ({ args, t, value: ref(null) }),
    template: `
      <div style="width: 280px; display:grid; gap:8px">
        <VTimeInput v-bind="args" v-model="value" :label="t.time" :hint="t.maskHint" />
        <output data-testid="value">{{ value ?? '—' }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const field = canvas.getByRole('combobox', { name: 'Time' })

    // The click opens the panel WITHOUT stealing the caret: typing carries on
    await userEvent.click(field)
    const panel = await waitFor(() => canvas.getByRole('dialog'))
    await expect(field).toHaveFocus()

    // The panel hangs off the FIELD's box and not off the control, which also holds the
    // label and the hint: it opens against the field and covers the hint instead of
    // starting a hint's height lower down. jsdom lays nothing out, so this is the only
    // place it can be asserted; the two bounds hold whatever the gap token is worth.
    const fieldBox = canvasElement.querySelector('.v-input-field')!.getBoundingClientRect()
    const hintBox = canvasElement.querySelector('.v-input-hint')!.getBoundingClientRect()
    const panelTop = panel.getBoundingClientRect().top
    await expect(panelTop).toBeGreaterThanOrEqual(fieldBox.bottom)
    await expect(panelTop).toBeLessThan(hintBox.bottom)

    await userEvent.keyboard('0930')
    await expect(field).toHaveValue('09:30')
    await expect(field).toHaveFocus()

    await userEvent.keyboard('{ArrowDown}')
    await waitFor(() => expect(panel.contains(document.activeElement)).toBe(true))
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(field).toHaveFocus())
    await expect(panel.matches(':popover-open')).toBe(false)
  },
}

/**
 * List mode is a VCombobox: the times at steps of `minuteStep`, narrowed by typing. On
 * opening, the panel is scrolled onto the current value; choosing a time commits at once.
 */
export const TimeList: Story = {
  args: { mode: 'list', minuteStep: 30, format: '24h' },
  render: (args) => ({
    components: { VTimeInput },
    setup: () => ({ args, t, value: ref('14:30') }),
    template: `
      <div style="width: 280px; display:grid; gap:8px">
        <VTimeInput v-bind="args" v-model="value" :label="t.time" />
        <output data-testid="value">{{ value ?? '—' }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const field = canvas.getByRole('combobox', { name: 'Time' })
    await userEvent.click(field)
    const panel = await waitFor(() => canvas.getByRole('listbox'))

    // The panel opens on the current value rather than at midnight, which makes a 48-row list
    // usable with a pointer. jsdom lays nothing out and scrolls nothing.
    await waitFor(() => expect(panel.scrollTop).toBeGreaterThan(0))
    const selected = panel.querySelector('[aria-selected="true"]') as HTMLElement
    await expect(selected).toHaveTextContent('14:30')

    // Clicking a row commits at once and closes. Rows are found by their POSITION, the
    // label being formatted by `Intl`, whose padding differs between the Node and the
    // browser ICU builds.
    await userEvent.click(panel.querySelectorAll('[role="option"]')[18] as HTMLElement)
    await waitFor(() => expect(canvas.getByTestId('value')).toHaveTextContent('09:00'))
    await expect(panel.matches(':popover-open')).toBe(false)
    await expect(field).toHaveFocus()
  },
}

/**
 * The whole point of the combobox: a time is FOUND rather than scrolled to, and the bare digit
 * run finds it; "930" reaches half past nine without the colon being typed.
 */
export const ListSearch: Story = {
  args: { mode: 'list', minuteStep: 30, format: '24h' },
  render: (args) => ({
    components: { VTimeInput },
    setup: () => ({ args, t, value: ref(null) }),
    template: `
      <div style="width: 280px; display:grid; gap:8px">
        <VTimeInput v-bind="args" v-model="value" :label="t.time" />
        <output data-testid="value">{{ value ?? '—' }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const field = canvas.getByRole('combobox', { name: 'Time' })
    await userEvent.click(field)
    await waitFor(() => expect(canvas.getByRole('listbox')).toBeVisible())

    await userEvent.keyboard('930')
    const panel = canvas.getByRole('listbox')
    await waitFor(() => expect(panel.querySelectorAll('[role="option"]')).toHaveLength(1))
    await expect(panel.querySelector('[role="option"]')).toHaveTextContent('30')

    // Enter takes the highlighted row: focus never left the field, this being a combobox.
    await expect(field).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(canvas.getByTestId('value')).toHaveTextContent('09:30'))
    await expect(panel.matches(':popover-open')).toBe(false)

    await userEvent.click(field)
    await userEvent.keyboard('0937')
    await waitFor(() => expect(panel.querySelectorAll('[role="option"]')).toHaveLength(0))
    await expect(within(panel).getByText('No results')).toBeVisible()
    await expect(canvas.getByTestId('value')).toHaveTextContent('09:30')
  },
}

export const TwelveHour: Story = {
  args: { format: '12h', clearable: true, showPicker: true },
  render: (args) => ({
    components: { VTimeInput },
    setup: () => ({ args, t, value: ref('07:00') }),
    template: `
      <div style="width: 320px; display:grid; gap:8px">
        <VTimeInput v-bind="args" v-model="value" :label="t.time" />
        <output data-testid="value">{{ value }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'AM or PM: AM' }))
    await waitFor(() => expect(canvas.getByTestId('value')).toHaveTextContent('19:00'))
    await expect(canvas.getByRole('button', { name: 'AM or PM: PM' })).toBeVisible()

    // The rule sits between what acts on the VALUE and what acts on the FIELD, and the
    // three keep the height of the field's own buttons. jsdom lays none of this out.
    const field = canvasElement.querySelector('.v-input-field') as HTMLElement
    const rule = canvasElement.querySelector('.v-time-input-divider') as HTMLElement
    const meridiem = canvasElement.querySelector('.v-time-input-meridiem') as HTMLElement
    const clear = canvasElement.querySelector('.v-input-clear') as HTMLElement
    await expect(rule.getBoundingClientRect().height).toBeCloseTo(
      clear.getBoundingClientRect().height,
      0,
    )
    // Red without `align-self: center`: the rule would stretch to the whole field.
    await expect(rule.getBoundingClientRect().height).toBeLessThan(
      field.getBoundingClientRect().height,
    )
    await expect(meridiem.getBoundingClientRect().right).toBeLessThanOrEqual(
      rule.getBoundingClientRect().left,
    )
    // Red without the width override: a square action box would clip the word.
    await expect(meridiem.scrollWidth).toBeLessThanOrEqual(meridiem.clientWidth)
  },
}

// Cancel abandons the draft: the value does not move.
export const Cancellation: Story = {
  args: { mode: 'picker', format: '24h' },
  render: (args) => ({
    components: { VTimeInput },
    setup: () => ({ args, t, value: ref('09:15') }),
    template: `
      <div style="width: 280px; display:grid; gap:8px">
        <VTimeInput v-bind="args" v-model="value" :label="t.time" />
        <output data-testid="value">{{ value }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('combobox', { name: 'Time' }))
    await waitFor(() => expect(canvas.getByRole('dialog')).toBeVisible())
    const face = canvasElement.querySelector('.v-time-picker-face') as HTMLElement
    tapDial(face, 10 / 12)
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: /Select hour$/ })).toHaveTextContent('10'),
    )
    await userEvent.click(canvas.getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(canvas.getByTestId('value')).toHaveTextContent('09:15'))
  },
}

export const FiveMinuteStep: Story = {
  args: { mode: 'picker', format: '24h', minuteStep: 5 },
  render: (args) => ({
    components: { VTimeInput },
    setup: () => ({ args, t, value: ref('14:35') }),
    template: `
      <div style="width: 280px">
        <VTimeInput v-bind="args" v-model="value" :label="t.time" :hint="t.fiveMinuteHint" />
      </div>
    `,
  }),
}

/**
 * The same four restrictions; `min`, `max`, `allowedHours`, `allowedMinutes`; reach the three
 * modes as two answers, which follow from what each mode asks the reader for.
 */
export const Restrictions: Story = {
  args: { format: '24h', minuteStep: 30, min: '09:00', max: '17:00' },
  render: (args) => ({
    components: { VTimeInput },
    setup: () => ({
      args,
      t,
      typed: ref<string | null>('09:30'),
      listed: ref<string | null>('09:30'),
      picked: ref<string | null>('09:30'),
    }),
    template: `
      <div style="width: 280px; display: grid; gap: 16px">
        <VTimeInput v-bind="args" v-model="typed" :label="t.typed" :hint="t.officeHint" />
        <VTimeInput v-bind="args" v-model="listed" mode="list" :label="t.listed" />
        <VTimeInput v-bind="args" v-model="picked" mode="picker" :label="t.picked" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const typed = canvas.getByRole('textbox', { name: 'Typed' }) as HTMLInputElement
    await userEvent.clear(typed)
    await userEvent.type(typed, '0800')
    await userEvent.tab()
    await waitFor(() => expect(typed.validity.customError).toBe(true))

    await userEvent.click(canvas.getByRole('combobox', { name: 'Listed' }))
    await waitFor(() => expect(canvas.getAllByRole('option')).toHaveLength(17))
  },
}

export const Sizes: Story = {
  render: (args) => ({
    components: { VTimeInput },
    setup: () => ({ args, value: ref('09:15') }),
    template: `
      <div style="width: 280px; display:grid; gap:12px">
        <VTimeInput v-bind="args" v-model="value" size="sm" label="sm" />
        <VTimeInput v-bind="args" v-model="value" size="md" label="md" />
        <VTimeInput v-bind="args" v-model="value" size="lg" label="lg" />
      </div>
    `,
  }),
}

export const Disabled: Story = {
  render: (args) => ({
    components: { VTimeInput },
    setup: () => ({ args, t, value: ref('09:15') }),
    template: `
      <div style="width: 280px">
        <VTimeInput v-bind="args" v-model="value" :label="t.time" disabled />
      </div>
    `,
  }),
}

/**
 * `readonly` freezes the time whichever way it could have been changed: nothing can be typed,
 * no clock is rendered, the AM/PM button goes since it writes the value, and the clear cross
 * goes with them.
 */
export const ReadOnly: Story = {
  args: { readonly: true, clearable: true, format: '12h' },
  render: (args) => ({
    components: { VTimeInput },
    setup: () => ({ args, t, value: ref('09:15') }),
    template: `
      <div style="width: 280px">
        <VTimeInput v-bind="args" v-model="value" :label="t.slot" :hint="t.slotHint" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const field = canvas.getByLabelText('Appointment slot')

    field.focus()
    await expect(field).toHaveFocus()
    await userEvent.keyboard('{ArrowDown}')
    await expect(canvas.queryByRole('dialog')).toBeNull()
    await expect(canvas.queryAllByRole('button')).toHaveLength(0)
  },
}

/** The two ends of the field. */
export const FieldIcon: Story = {
  args: { format: '24h' },
  render: (args) => ({
    components: { VTimeInput },
    setup: () => ({ args, t, value: ref('09:15') }),
    template: `
      <div style="width: 280px; display:grid; gap:16px">
        <VTimeInput
          v-bind="args"
          v-model="value"
          icon-start="search"
          :label="t.searchByTime"
          show-picker
          clearable
          picker-label="Open the clock"
          clear-label="Empty the time"
        />
        <VTimeInput v-bind="args" v-model="value" loading :label="t.checkingTime" show-picker />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('.v-input-field > .v-icon')).toBeInTheDocument()
    await expect(canvasElement.querySelectorAll('.v-spinner')).toHaveLength(1)
  },
}

/**
 * Clicking an empty area of the panel (its padding, the gutter between the picker and the
 * footer) must close NOTHING; and above all abandon nothing: closing by focus leaving amounts
 * to cancelling the draft here.
 */
export const ClickInTheVoid: Story = {
  args: { mode: 'picker', format: '24h' },
  render: (args) => ({
    components: { VTimeInput },
    setup: () => ({ args, t, value: ref('09:15') }),
    template: `
      <div style="width: 280px; display:grid; gap:8px">
        <VTimeInput v-bind="args" v-model="value" :label="t.time" />
        <output data-testid="value">{{ value }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('combobox', { name: 'Time' }))
    const panel = await waitFor(() => canvas.getByRole('dialog'))
    // Focus is moved into the panel under a rAF
    await waitFor(() => expect(panel.contains(document.activeElement)).toBe(true))

    const face = canvasElement.querySelector('.v-time-picker-face') as HTMLElement
    tapDial(face, 10 / 12)
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: /Select hour$/ })).toHaveTextContent('10'),
    )

    await userEvent.click(panel)
    await expect(panel.matches(':popover-open')).toBe(true)
    await expect(canvas.getByRole('button', { name: /Select hour$/ })).toHaveTextContent('10')

    await userEvent.click(canvas.getByRole('button', { name: 'OK' }))
    await waitFor(() => expect(canvas.getByTestId('value')).toHaveTextContent('10:15'))
  },
}
