import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import { storyText } from '../../stories/storyText'
import VTimePicker from './VTimePicker.vue'

const t = storyText({
  en: {
    time: 'Time',
    maskHint: 'Format hh:mm',
    fiveMinuteHint: 'Minutes in steps of 5',
    meetingTime: 'Meeting time',
    noLabel: 'No label',
  },
  fr: {
    time: 'Heure',
    maskHint: 'Format hh:mm',
    fiveMinuteHint: 'Minutes par pas de 5',
    meetingTime: 'Heure de rendez-vous',
    noLabel: 'Sans étiquette',
  },
})

const meta = {
  title: 'Components/TimePicker',
  component: VTimePicker,
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
    clearable: true,
  },
} satisfies Meta<typeof VTimePicker>

export default meta
type Story = StoryObj<typeof meta>

/** A point on the dial at a given turn fraction (0 = twelve o'clock, clockwise) and radius. */
function pointOnDial(face: HTMLElement, turn: number, radiusFraction: number) {
  const rect = face.getBoundingClientRect()
  const r = (rect.width / 2) * radiusFraction
  const angle = turn * 2 * Math.PI
  return {
    clientX: rect.left + rect.width / 2 + r * Math.sin(angle),
    clientY: rect.top + rect.height / 2 - r * Math.cos(angle),
  }
}

/** A pointer click on the dial (userEvent's coordinate hit-testing is too brittle, so the
    PointerEvents are dispatched directly). */
function tapDial(face: HTMLElement, turn: number, radiusFraction = 0.8) {
  const { clientX, clientY } = pointOnDial(face, turn, radiusFraction)
  face.dispatchEvent(new PointerEvent('pointerdown', { clientX, clientY, bubbles: true }))
  face.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))
}

/**
 * By default the field is masked: the user types digits only and the colon is placed on
 * its own, with no dial at all.
 */
export const Default: Story = {
  args: { format: '24h' },
  render: (args) => ({
    components: { VTimePicker },
    setup: () => ({ args, t, value: ref(null) }),
    template: `
      <div style="width: 280px; display:grid; gap:8px">
        <VTimePicker v-bind="args" v-model="value" :label="t.time" :hint="t.maskHint" />
        <output data-testid="value">{{ value ?? '—' }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const field = canvas.getByRole('textbox', { name: 'Time' }) as HTMLInputElement

    // with no dial, the field announces no popup and opens none
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
 * `mode="readonly"`: the time can only be picked on the dial, which then becomes the only
 * route — `showDial` is beside the point there.
 */
export const ReadOnly: Story = {
  args: { mode: 'readonly' },
  render: (args) => ({
    components: { VTimePicker },
    setup: () => ({ args, t, value: ref('09:15') }),
    template: `
      <div style="width: 280px; display:grid; gap:8px">
        <VTimePicker v-bind="args" v-model="value" :label="t.time" />
        <output>{{ value ?? '—' }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const field = canvas.getByRole('textbox', { name: 'Time' })
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
    components: { VTimePicker },
    setup: () => ({ args, t, value: ref('09:15') }),
    template: `
      <div style="width: 280px; display:grid; gap:8px">
        <VTimePicker v-bind="args" v-model="value" :label="t.time" />
        <output data-testid="value">{{ value }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('textbox', { name: 'Time' }))
    await waitFor(() => expect(canvas.getByRole('dialog')).toBeVisible())
    const face = canvasElement.querySelector('.v-timepicker-dial-face') as HTMLElement

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

// A 24 h dial: the inner ring carries 00 and 13–23.
export const InnerRing: Story = {
  args: { mode: 'readonly', format: '24h' },
  render: (args) => ({
    components: { VTimePicker },
    setup: () => ({ args, t, value: ref('09:15') }),
    template: `
      <div style="width: 280px">
        <VTimePicker v-bind="args" v-model="value" :label="t.time" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('textbox', { name: 'Time' }))
    await waitFor(() => expect(canvas.getByRole('dialog')).toBeVisible())
    const face = canvasElement.querySelector('.v-timepicker-dial-face') as HTMLElement
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
 * `showDial` makes the dial reachable from an input field: a clickable icon at the end of
 * the field, and the panel opening on focus — without stealing the caret, so typing
 * carries on in the field.
 */
export const InputWithDial: Story = {
  args: { showDial: true, format: '24h' },
  render: (args) => ({
    components: { VTimePicker },
    setup: () => ({ args, t, value: ref(null) }),
    template: `
      <div style="width: 280px; display:grid; gap:8px">
        <VTimePicker v-bind="args" v-model="value" :label="t.time" />
        <output data-testid="value">{{ value ?? '—' }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const field = canvas.getByRole('textbox', { name: 'Time' })

    // the click opens the panel WITHOUT stealing the caret: typing carries on
    await userEvent.click(field)
    const panel = await waitFor(() => canvas.getByRole('dialog'))
    await expect(field).toHaveFocus()
    await userEvent.keyboard('0930')
    await expect(field).toHaveValue('09:30')
    await expect(field).toHaveFocus()

    // the down arrow is the explicit route to the dial, and Escape comes back
    await userEvent.keyboard('{ArrowDown}')
    await waitFor(() => expect(panel.contains(document.activeElement)).toBe(true))
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(field).toHaveFocus())
    await expect(panel.matches(':popover-open')).toBe(false)
  },
}

/**
 * List mode: the available times in steps of `minuteStep`. On opening, the current value
 * has focus and the list is scrolled onto it; choosing a time commits immediately (no
 * draft, no OK button).
 */
export const TimeList: Story = {
  args: { mode: 'list', minuteStep: 30, format: '24h' },
  render: (args) => ({
    components: { VTimePicker },
    setup: () => ({ args, t, value: ref('14:30') }),
    template: `
      <div style="width: 280px; display:grid; gap:8px">
        <VTimePicker v-bind="args" v-model="value" :label="t.time" />
        <output data-testid="value">{{ value ?? '—' }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const field = canvas.getByRole('textbox', { name: 'Time' })
    await userEvent.click(field)
    const panel = await waitFor(() => canvas.getByRole('listbox'))

    // the selected row has focus AND the list has scrolled onto it
    await waitFor(() => expect(document.activeElement).toHaveAttribute('data-value', '14:30'))
    await expect(panel.scrollTop).toBeGreaterThan(0)

    // clicking a row: an immediate commit, closing, focus handed back to the field.
    // Queried by `data-value`: the row's label is formatted by `Intl`, whose zero
    // padding differs between the Node and the browser ICU builds.
    await userEvent.click(panel.querySelector('[data-value="09:00"]') as HTMLElement)
    await waitFor(() => expect(canvas.getByTestId('value')).toHaveTextContent('09:00'))
    await expect(panel.matches(':popover-open')).toBe(false)
    await expect(field).toHaveFocus()
  },
}

/** The keyboard in the list: arrows, Home/End, and Enter to commit. */
export const ListKeyboard: Story = {
  args: { mode: 'list', minuteStep: 30, format: '24h' },
  render: (args) => ({
    components: { VTimePicker },
    setup: () => ({ args, t, value: ref('00:00') }),
    template: `
      <div style="width: 280px; display:grid; gap:8px">
        <VTimePicker v-bind="args" v-model="value" :label="t.time" />
        <output data-testid="value">{{ value }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const field = canvas.getByRole('textbox', { name: 'Time' })
    field.focus()
    await userEvent.keyboard('{ArrowDown}')
    const panel = await waitFor(() => canvas.getByRole('listbox'))
    await waitFor(() => expect(panel.contains(document.activeElement)).toBe(true))

    // opening put focus on the current value (00:00): two notches down at a 30-minute
    // step lands on 01:00
    await userEvent.keyboard('{ArrowDown}{ArrowDown}')
    await expect(document.activeElement).toHaveAttribute('data-value', '01:00')
    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(canvas.getByTestId('value')).toHaveTextContent('01:00'))
    // Enter does not reopen the panel it has just closed
    await expect(panel.matches(':popover-open')).toBe(false)
  },
}

// The v-model stays canonical 24 h: 7 o'clock + PM → '19:00'. The VToggle lives next to
// the field, outside the panel: no opening and no confirmation needed.
export const TwelveHour: Story = {
  args: { format: '12h' },
  render: (args) => ({
    components: { VTimePicker },
    setup: () => ({ args, t, value: ref('07:00') }),
    template: `
      <div style="width: 320px; display:grid; gap:8px">
        <VTimePicker v-bind="args" v-model="value" :label="t.time" />
        <output data-testid="value">{{ value }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'PM' }))
    await waitFor(() => expect(canvas.getByTestId('value')).toHaveTextContent('19:00'))
  },
}

// Cancel abandons the draft: the value does not move.
export const Cancellation: Story = {
  args: { mode: 'readonly', format: '24h' },
  render: (args) => ({
    components: { VTimePicker },
    setup: () => ({ args, t, value: ref('09:15') }),
    template: `
      <div style="width: 280px; display:grid; gap:8px">
        <VTimePicker v-bind="args" v-model="value" :label="t.time" />
        <output data-testid="value">{{ value }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('textbox', { name: 'Time' }))
    await waitFor(() => expect(canvas.getByRole('dialog')).toBeVisible())
    const face = canvasElement.querySelector('.v-timepicker-dial-face') as HTMLElement
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
    components: { VTimePicker },
    setup: () => ({ args, t, value: ref('14:35') }),
    template: `
      <div style="width: 280px">
        <VTimePicker v-bind="args" v-model="value" :label="t.time" :hint="t.fiveMinuteHint" />
      </div>
    `,
  }),
}

export const Sizes: Story = {
  render: (args) => ({
    components: { VTimePicker },
    setup: () => ({ args, value: ref('09:15') }),
    template: `
      <div style="width: 280px; display:grid; gap:12px">
        <VTimePicker v-bind="args" v-model="value" size="sm" label="sm" />
        <VTimePicker v-bind="args" v-model="value" size="md" label="md" />
        <VTimePicker v-bind="args" v-model="value" size="lg" label="lg" />
      </div>
    `,
  }),
}

/** In 12 h, the AM/PM VToggle aligns on the FIELD, not on the block: its position is
    compensated by the height of the label and the hint. */
export const AlignedMeridiem: Story = {
  args: { format: '12h' },
  render: (args) => ({
    components: { VTimePicker },
    setup: () => ({ args, t, value: ref('07:00') }),
    template: `
      <div style="width: 320px; display:grid; gap:12px">
        <VTimePicker v-bind="args" v-model="value" />
        <VTimePicker v-bind="args" v-model="value" :label="t.time" />
        <VTimePicker v-bind="args" v-model="value" :label="t.time" :hint="t.meetingTime" />
        <VTimePicker v-bind="args" v-model="value" :hint="t.noLabel" />
      </div>
    `,
  }),
}

export const Disabled: Story = {
  render: (args) => ({
    components: { VTimePicker },
    setup: () => ({ args, t, value: ref('09:15') }),
    template: `
      <div style="width: 280px">
        <VTimePicker v-bind="args" v-model="value" :label="t.time" disabled />
      </div>
    `,
  }),
}

/**
 * Clicking an empty area of the panel (its padding, the gutter between the dial and the
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
    components: { VTimePicker },
    setup: () => ({ args, t, value: ref('09:15') }),
    template: `
      <div style="width: 280px; display:grid; gap:8px">
        <VTimePicker v-bind="args" v-model="value" :label="t.time" />
        <output data-testid="value">{{ value }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('textbox', { name: 'Time' }))
    const panel = await waitFor(() => canvas.getByRole('dialog'))
    // focus is moved into the panel under a rAF
    await waitFor(() => expect(panel.contains(document.activeElement)).toBe(true))

    // a draft under way: 10 o'clock picked on the dial, not committed yet
    const face = canvasElement.querySelector('.v-timepicker-dial-face') as HTMLElement
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
