import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import { tapDial } from '../../stories/dial'
import { storyText } from '../../stories/storyText'
import VButton from '../VButton/VButton.vue'
import VTimePicker from './VTimePicker.vue'

const t = storyText({
  en: {
    chosen: 'Chosen',
    nothing: 'nothing yet',
    cancel: 'Cancel',
    ok: 'OK',
    readonly: 'Read-only',
    disabled: 'Disabled',
  },
  fr: {
    chosen: 'Choisi',
    nothing: 'rien pour le moment',
    cancel: 'Annuler',
    ok: 'OK',
    readonly: 'Lecture seule',
    disabled: 'Désactivé',
  },
})

const meta = {
  title: 'Components/TimePicker',
  component: VTimePicker,
  argTypes: {
    format: { control: 'inline-radio', options: ['12h', '24h'] },
  },
  // No `locale`: the clock then follows the design system's global locale, so the Locale
  // toolbar drives the hour cycle along with the words. The Localization story pins one.
  args: {
    minuteStep: 1,
  },
} satisfies Meta<typeof VTimePicker>

export default meta
type Story = StoryObj<typeof meta>

const faceOf = (canvasElement: HTMLElement) =>
  canvasElement.querySelector('.v-time-picker-face') as HTMLElement

/**
 * The clock on its own, with nothing around it. The two large numerals say what has been
 * chosen and switch between the hour and the minutes; the half-day sits beside them.
 */
export const Default: Story = {
  args: { format: '12h' },
  render: (args) => ({
    components: { VTimePicker },
    setup: () => ({ args, t, value: ref<string | null>('09:30') }),
    template: `
      <div style="display: grid; gap: 1rem; justify-items: start">
        <VTimePicker v-bind="args" v-model="value" />
        <p style="margin: 0">{{ t.chosen }}: {{ value ?? t.nothing }}</p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const face = faceOf(canvasElement)
    // Nine o'clock is a quarter of the way round.
    await waitFor(() => expect(face.getAttribute('aria-valuenow')).toBe('9'))
    tapDial(face, 3 / 12)
    // Choosing an hour moves the clock on to the minutes by itself.
    await waitFor(() => expect(face.getAttribute('aria-label')).toBe('Minutes'))
  },
}

/**
 * A 24-hour clock carries a SECOND ring inside the first, for the hours from 13 to 00, and
 * has no half-day control at all — the numerals then centre on their own.
 */
export const TwentyFourHour: Story = {
  args: { format: '24h' },
  render: (args) => ({
    components: { VTimePicker },
    setup: () => ({ args, value: ref<string | null>('09:30') }),
    template: `<VTimePicker v-bind="args" v-model="value" />`,
  }),
  play: async ({ canvasElement }) => {
    expect(canvasElement.querySelector('.v-time-picker-meridiem')).toBeNull()
    // Both rings are drawn: twelve outer numerals and twelve inner ones.
    expect(canvasElement.querySelectorAll('.v-time-picker-number[data-ring="inner"]')).toHaveLength(
      12,
    )
    const canvas = within(canvasElement)
    const face = faceOf(canvasElement)
    // Pointing near the centre lands on the inner ring — 21:00 rather than 9. It is the
    // numeral at the top that is read and not the slider's own value: releasing settles
    // the step, so by now the face is already showing the minutes.
    tapDial(face, 9 / 12, 0.44)
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Select hour' })).toHaveTextContent('21'),
    )
  },
}

/**
 * The half-day control writes straight into the value, and sits at the end of the row of
 * numerals — which in a right-to-left page puts it on the other side, the numerals
 * themselves never being reordered.
 */
export const Meridiem: Story = {
  args: { format: '12h' },
  render: (args) => ({
    components: { VTimePicker },
    setup: () => ({ args, t, value: ref<string | null>('07:00') }),
    template: `
      <div style="display: grid; gap: 1rem; justify-items: start">
        <VTimePicker v-bind="args" v-model="value" />
        <p style="margin: 0">{{ t.chosen }}: {{ value }}</p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'PM' }))
    await waitFor(() => expect(canvasElement.textContent).toContain('19:00'))
  },
}

/**
 * The footer is a slot, so the actions belong to whoever puts the clock somewhere. On its
 * own it needs none; inside a panel it is where Cancel and OK go.
 */
export const Footer: Story = {
  args: { format: '24h' },
  render: (args) => ({
    components: { VTimePicker, VButton },
    setup: () => ({ args, t, value: ref<string | null>('14:45') }),
    template: `
      <VTimePicker v-bind="args" v-model="value">
        <template #footer>
          <VButton variant="ghost" tone="neutral">{{ t.cancel }}</VButton>
          <VButton>{{ t.ok }}</VButton>
        </template>
      </VTimePicker>
    `,
  }),
  play: async ({ canvasElement }) => {
    expect(canvasElement.querySelector('.v-time-picker-footer')).toBeTruthy()
  },
}

/**
 * The minutes snap to a chosen interval, both under the pointer and on the arrow keys, and
 * the face prints only what that interval can reach: a quarter of an hour marks four
 * minutes and no more.
 */
export const MinuteStep: Story = {
  args: { format: '24h', minuteStep: 15 },
  render: (args) => ({
    components: { VTimePicker },
    setup: () => ({ args, value: ref<string | null>('10:00') }),
    template: `<VTimePicker v-bind="args" v-model="value" />`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Select minutes' }))
    expect(canvasElement.querySelectorAll('.v-time-picker-number')).toHaveLength(4)
    const face = faceOf(canvasElement)
    // A point between two markers is pulled back to the nearest quarter.
    tapDial(face, 0.13)
    await waitFor(() => expect(Number(face.getAttribute('aria-valuenow')) % 15).toBe(0))
  },
}

/**
 * What may be chosen, restricted four ways: the two bounds, and a rule for the hours and
 * one for the minutes. Unlike the minute step, which prints nothing it cannot reach, these
 * DISABLE what they rule out — a bound is only readable beside the hours it excludes.
 *
 * The two compose: nine o'clock stays open under a bound of half past nine, and it is its
 * first thirty minutes that go.
 */
export const Restrictions: Story = {
  args: {
    format: '24h',
    minuteStep: 15,
    min: '09:30',
    max: '17:00',
    allowedHours: [9, 10, 11, 14, 15, 16, 17],
  },
  render: (args) => ({
    components: { VTimePicker },
    setup: () => ({ args, t, value: ref<string | null>('10:15') }),
    template: `
      <div style="display: grid; gap: 1rem; justify-items: start">
        <VTimePicker v-bind="args" v-model="value" />
        <p style="margin: 0">{{ t.chosen }}: {{ value }}</p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const face = faceOf(canvasElement)
    face.focus()
    // Midday is closed, so the key steps over it rather than dying at it: a face with
    // holes in it would otherwise be unreachable past the first one.
    await userEvent.keyboard('{ArrowUp}{ArrowUp}')
    await waitFor(() => expect(canvasElement.textContent).toContain('14:15'))

    // Nine o'clock is only half open, and the minutes follow the hour into what is left.
    await userEvent.keyboard('{Home}')
    await waitFor(() => expect(canvasElement.textContent).toContain('09:30'))

    await userEvent.click(canvas.getByRole('button', { name: 'Select minutes' }))
    await waitFor(() =>
      expect(canvasElement.querySelectorAll('.v-time-picker-number[data-disabled]')).toHaveLength(
        2,
      ),
    )
  },
}

/**
 * The face is a slider, so it has a slider's keyboard: the arrows step, Home and End go to
 * the ends, and Enter moves from the hour to the minutes and then confirms.
 */
export const Keyboard: Story = {
  args: { format: '24h' },
  render: (args) => ({
    components: { VTimePicker },
    setup: () => ({ args, t, value: ref<string | null>('09:30') }),
    template: `
      <div style="display: grid; gap: 1rem; justify-items: start">
        <VTimePicker v-bind="args" v-model="value" />
        <p style="margin: 0">{{ t.chosen }}: {{ value }}</p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const face = faceOf(canvasElement)
    face.focus()
    await userEvent.keyboard('{ArrowUp}')
    await waitFor(() => expect(canvasElement.textContent).toContain('10:30'))
    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(face.getAttribute('aria-label')).toBe('Minutes'))
    await userEvent.keyboard('{ArrowDown}')
    await waitFor(() => expect(canvasElement.textContent).toContain('10:29'))
  },
}

/** The clock and its words follow an explicit language, whatever the toolbar says. */
export const Localization: Story = {
  globals: { locale: 'fr-FR' },
  args: {},
  render: (args) => ({
    components: { VTimePicker },
    setup: () => ({ args, value: ref<string | null>('15:20') }),
    template: `
      <div style="display: flex; gap: 2rem; flex-wrap: wrap">
        <VTimePicker v-bind="args" locale="fr-FR" v-model="value" />
        <VTimePicker v-bind="args" locale="en-US" v-model="value" />
      </div>
    `,
  }),
}

/**
 * `readonly` shows the time without letting it be changed, the face keeping its focus and
 * the two numerals still switching between hours and minutes. `disabled` takes the clock
 * out of use altogether and out of the tab order.
 */
export const States: Story = {
  render: (args) => ({
    components: { VTimePicker },
    setup: () => ({ args, t, readonlyValue: ref('09:15'), disabledValue: ref('09:15') }),
    template: `
      <div style="display: flex; gap: 2rem; flex-wrap: wrap">
        <div>
          <p style="margin: 0 0 0.5rem">{{ t.readonly }}</p>
          <VTimePicker v-bind="args" v-model="readonlyValue" readonly />
        </div>
        <div>
          <p style="margin: 0 0 0.5rem">{{ t.disabled }}</p>
          <VTimePicker v-bind="args" v-model="disabledValue" disabled />
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const [readonlyFace, disabledFace] = [...canvasElement.querySelectorAll('[role="slider"]')]
    await expect(readonlyFace).toHaveAttribute('aria-readonly', 'true')
    await expect(readonlyFace).toHaveAttribute('tabindex', '0')
    await expect(disabledFace).toHaveAttribute('aria-disabled', 'true')
    await expect(disabledFace).toHaveAttribute('tabindex', '-1')
  },
}
