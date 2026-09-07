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
  },
  fr: {
    time: 'Heure',
    maskHint: 'Format hh:mm',
    fiveMinuteHint: 'Minutes par pas de 5',
    officeHint: 'Entre 09:00 et 17:00',
    typed: 'Saisi',
    listed: 'Liste',
    picked: 'Cadran',
  },
})

const meta = {
  title: 'Components/TimeInput',
  component: VTimeInput,
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    mode: { control: 'inline-radio', options: ['readonly', 'input', 'list'] },
  },
  // No `mode`: pinning it would make the Controls panel lie, as it would show a current
  // value different from the component's default. No `locale` either — the picker then
  // follows the design system's global locale, so the Locale toolbar drives the hour
  // cycle along with the words.
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
    // `textbox` and not `combobox`: with no panel the field takes no role at all.
    const field = canvas.getByRole('textbox', { name: 'Time' }) as HTMLInputElement

    // with no picker, the field announces no popup and opens none
    await expect(field).not.toHaveAttribute('aria-haspopup')
    await userEvent.click(field)
    await expect(canvas.queryByRole('dialog')).toBeNull()

    await userEvent.keyboard('09')
    await expect(field).toHaveValue('09:')
    // the caret has crossed the colon, and typing carries on into the minutes
    await expect(field.selectionStart).toBe(3)
    await userEvent.keyboard('30')
    await expect(field).toHaveValue('09:30')
    await waitFor(() => expect(canvas.getByTestId('value')).toHaveTextContent('09:30'))

    // both minute digits go, and the caret lands BEFORE the colon (deleting does not
    // cross it)…
    await userEvent.keyboard('{Backspace}{Backspace}')
    await expect(field).toHaveValue('09:')
    await expect(field.selectionStart).toBe(2)
    // …and the next Backspace erases the digit, not the separator
    await userEvent.keyboard('{Backspace}')
    await expect(field).toHaveValue('0')

    // leaving the field: the incomplete entry silently reverts to the value
    await userEvent.tab()
    await waitFor(() => expect(field).toHaveValue('09:30'))
  },
}

/**
 * `mode="readonly"`: the time can only be chosen on the clock, which then becomes the only
 * route — `showPicker` is beside the point there.
 */
export const ReadOnly: Story = {
  args: { mode: 'readonly' },
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
    // keyboard opening (the down arrow), with focus moved into the panel
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
  args: { mode: 'readonly', format: '24h' },
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
     * The panel BEFORE anything opens it. A closed popover has to be `display: none`, or its
     * box stays laid out over the page: invisible at `opacity: 0`, `position: fixed`, and
     * swallowing every click that lands on it. jsdom cannot see this at all, computing no
     * styles, so the browser suite is the only place it can be held.
     */
    const closed = canvasElement.querySelector('.v-time-input-panel') as HTMLElement
    await expect(getComputedStyle(closed).display).toBe('none')

    await userEvent.click(canvas.getByRole('combobox', { name: 'Time' }))
    await waitFor(() => expect(canvas.getByRole('dialog')).toBeVisible())

    /*
     * `.v-popover-panel.v-time-input-panel` against `.v-panel`, which declares the same
     * `padding` at equal specificity on this very element (the popover is a `surface`).
     * Only the compound keeps the panel's own rhythm under an order nothing controls once
     * each sheet ships separately: `--vectis-space-3` (12px) against `.v-panel`'s
     * `--vectis-space-1` (4px).
     *
     * The gap between the clock's own parts is asserted on the CLOCK, which is where it
     * now lives — the panel no longer declares one, having a single child.
     */
    const panel = canvas.getByRole('dialog')
    await expect(getComputedStyle(panel).padding).toBe('12px')
    const picker = canvasElement.querySelector('.v-time-picker') as HTMLElement
    await expect(getComputedStyle(picker).gap).toBe('16px')

    const face = canvasElement.querySelector('.v-time-picker-face') as HTMLElement

    // hour 3 = a quarter turn; releasing moves on to the minutes step
    tapDial(face, 3 / 12)
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Select hour' })).toHaveTextContent('03'),
    )
    await waitFor(() => expect(canvas.getByRole('slider')).toHaveAccessibleName('Minutes'))

    // minute 30 = half a turn, then OK commits
    tapDial(face, 30 / 60)
    await userEvent.click(canvas.getByRole('button', { name: 'OK' }))
    await waitFor(() => expect(canvas.getByTestId('value')).toHaveTextContent('03:30'))
  },
}

// A 24 h clock: the inner ring carries 00 and 13–23.
export const InnerRing: Story = {
  args: { mode: 'readonly', format: '24h' },
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
    const hourCell = () => canvas.getByRole('button', { name: 'Select hour' })

    // midnight: the twelve o'clock position, inner ring (half the radius)
    tapDial(face, 0, 0.44)
    await waitFor(() => expect(hourCell()).toHaveTextContent('00'))
    // back to the hour step (releasing moved on to the minutes)
    await userEvent.click(hourCell())
    // 13:00: the one o'clock position, inner ring
    tapDial(face, 1 / 12, 0.44)
    await waitFor(() => expect(hourCell()).toHaveTextContent('13'))
  },
}

/**
 * `showPicker` makes the picker reachable from an input field: a clickable icon at the end of
 * the field, and the panel opening on focus — without stealing the caret, so typing
 * carries on in the field.
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

    // the click opens the panel WITHOUT stealing the caret: typing carries on
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

    // the down arrow is the explicit route to the picker, and Escape comes back
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

    // The panel opens ON the current value rather than at midnight, which is what makes a
    // 48-row list usable with a pointer. jsdom lays nothing out and scrolls nothing.
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
 * The whole point of the combobox: a time is FOUND rather than scrolled to, and the bare
 * digit run finds it — "930" reaches half past nine without the colon being typed.
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
    // Red if the rule reads a 24 hour label as a 12 hour one: 21:30 would answer too.
    await expect(panel.querySelector('[role="option"]')).toHaveTextContent('30')

    // Enter takes the highlighted row: focus never left the field, this being a combobox.
    await expect(field).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(canvas.getByTestId('value')).toHaveTextContent('09:30'))
    await expect(panel.matches(':popover-open')).toBe(false)

    // A search matching nothing leaves the value alone: the list is the contract.
    // Scoped to the panel — the wording is also in the live region, outside it.
    await userEvent.click(field)
    await userEvent.keyboard('0937')
    await waitFor(() => expect(panel.querySelectorAll('[role="option"]')).toHaveLength(0))
    await expect(within(panel).getByText('No results')).toBeVisible()
    await expect(canvas.getByTestId('value')).toHaveTextContent('09:30')
  },
}

// The v-model stays canonical 24 h: 7 o'clock + PM → '19:00'. The button sits inside the
// field, beside the value it qualifies: no opening and no confirmation needed.
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
    // The name is the label and the current half of the day, so it changes with the state.
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
  args: { mode: 'readonly', format: '24h' },
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
      expect(canvas.getByRole('button', { name: 'Select hour' })).toHaveTextContent('10'),
    )
    await userEvent.click(canvas.getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(canvas.getByTestId('value')).toHaveTextContent('09:15'))
  },
}

export const FiveMinuteStep: Story = {
  args: { mode: 'readonly', format: '24h', minuteStep: 5 },
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
 * The same four restrictions — `min`, `max`, `allowedHours`, `allowedMinutes` — reach the
 * three modes as three different answers, because a mode is a different way of asking.
 *
 * The typed field COMMITS what was typed and turns invalid: the reader is writing, and a
 * field that swallowed the entry would leave them nothing to correct. The list LEAVES OUT
 * what cannot be chosen, a list being read before it is chosen from. The picker DISABLES
 * it, a bound being readable only beside the hours it excludes.
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
        <VTimeInput v-bind="args" v-model="picked" mode="readonly" :label="t.picked" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Typed: the value stands, and the browser is what refuses it — which is also what
    // stops a form leaving with it.
    // A typed field with no picker carries no combobox role: it points at no panel.
    const typed = canvas.getByRole('textbox', { name: 'Typed' }) as HTMLInputElement
    await userEvent.clear(typed)
    await userEvent.type(typed, '0800')
    await userEvent.tab()
    await waitFor(() => expect(typed.validity.customError).toBe(true))

    // Listed: the rows outside the bounds are not there to be chosen at all.
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
 * Clicking an empty area of the panel (its padding, the gutter between the picker and the
 * footer) must close NOTHING — and above all abandon nothing: closing by focus leaving
 * amounts to cancelling the draft here.
 *
 * Without `useFieldPanel`'s neutralized `mousedown`, the browser would hand focus back to
 * `<body>` and the root's `focusout` would close the panel. Invisible in jsdom, which does
 * not simulate focus on click.
 */
export const ClickInTheVoid: Story = {
  args: { mode: 'readonly', format: '24h' },
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
    // focus is moved into the panel under a rAF
    await waitFor(() => expect(panel.contains(document.activeElement)).toBe(true))

    // a draft under way: 10 o'clock chosen on the clock, not committed yet
    const face = canvasElement.querySelector('.v-time-picker-face') as HTMLElement
    tapDial(face, 10 / 12)
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Select hour' })).toHaveTextContent('10'),
    )

    // a click on the panel ITSELF and not on one of its controls: userEvent dispatches on
    // the element it is given, with no hit-testing — which faithfully reproduces the click
    // landing in its padding, where nothing is focusable
    await userEvent.click(panel)
    await expect(panel.matches(':popover-open')).toBe(true)
    // the draft survived: closing here would have abandoned it
    await expect(canvas.getByRole('button', { name: 'Select hour' })).toHaveTextContent('10')

    // OK commits as usual
    await userEvent.click(canvas.getByRole('button', { name: 'OK' }))
    await waitFor(() => expect(canvas.getByTestId('value')).toHaveTextContent('10:15'))
  },
}
