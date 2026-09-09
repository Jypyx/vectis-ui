import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { nextTick, onMounted, ref } from 'vue'

import VTimePicker from './VTimePicker.vue'

const face = (container: Element) => container.querySelector('[role="slider"]') as HTMLElement

const cell = (container: Element, which: 'hour' | 'minute') =>
  container.querySelector(
    `button[aria-label="${which === 'hour' ? 'Select hour' : 'Select minutes'}"]`,
  ) as HTMLButtonElement

const numerals = (container: Element) =>
  [...container.querySelectorAll('.v-time-picker-number')].map((n) => n.textContent!.trim())

const pm = (container: Element) =>
  [...container.querySelectorAll('.v-time-picker-meridiem button')].find(
    (b) => b.textContent?.trim() === 'PM',
  ) as HTMLElement

describe('VTimePicker', () => {
  it('shows midnight with no value, and never reads the clock', () => {
    // The absence of a clock read is what keeps a page drawn on a server identical to the
    // same page in the browser. Were the current time used here, this assertion would only
    // pass for one minute a day.
    const { container } = render(VTimePicker, { props: { format: '24h' } })
    expect(cell(container, 'hour').textContent!.trim()).toBe('00')
    expect(cell(container, 'minute').textContent!.trim()).toBe('00')
  })

  it('reads and writes the canonical 24-hour string', async () => {
    const { container, emitted } = render(VTimePicker, {
      props: { modelValue: '09:30', format: '24h' },
    })
    expect(cell(container, 'hour').textContent!.trim()).toBe('09')
    expect(cell(container, 'minute').textContent!.trim()).toBe('30')
    await fireEvent.keyDown(face(container), { key: 'ArrowUp' })
    expect(emitted('update:modelValue')?.at(-1)).toEqual(['10:30'])
  })

  it('moves from the hour to the minutes, and back through the two numerals', async () => {
    const { container } = render(VTimePicker, { props: { modelValue: '09:30', format: '24h' } })
    expect(face(container).getAttribute('aria-label')).toBe('Hour')
    await fireEvent.keyDown(face(container), { key: 'Enter' })
    expect(face(container).getAttribute('aria-label')).toBe('Minutes')
    await fireEvent.click(cell(container, 'hour'))
    expect(face(container).getAttribute('aria-label')).toBe('Hour')
  })

  it('confirms only on the minutes, and only from the keyboard', async () => {
    const { container, emitted } = render(VTimePicker, {
      props: { modelValue: '09:30', format: '24h' },
    })
    // On the hour, Enter merely moves the step on.
    await fireEvent.keyDown(face(container), { key: 'Enter' })
    expect(emitted('confirm')).toBeUndefined()
    await fireEvent.keyDown(face(container), { key: 'Enter' })
    expect(emitted('confirm')).toHaveLength(1)
  })

  it('never confirms when the pointer is merely released', async () => {
    // Letting go of the hand is how one stops adjusting it, not how one confirms — which
    // is why a drag across dozens of times cannot commit anything.
    const { container, emitted } = render(VTimePicker, {
      props: { modelValue: '09:30', format: '24h' },
    })
    await fireEvent.pointerDown(face(container), { clientX: 10, clientY: 10 })
    await fireEvent.pointerUp(face(container))
    // The step moved on, but nothing was confirmed.
    expect(face(container).getAttribute('aria-label')).toBe('Minutes')
    expect(emitted('confirm')).toBeUndefined()
  })

  it('exposes a complete ARIA slider, localized', async () => {
    const { container } = render(VTimePicker, { props: { modelValue: '19:35', format: '12h' } })
    const slider = face(container)
    expect(slider.getAttribute('aria-valuenow')).toBe('7')
    expect(slider.getAttribute('aria-valuemin')).toBe('1')
    expect(slider.getAttribute('aria-valuemax')).toBe('12')
    expect(slider.getAttribute('aria-valuetext')).toBe("7 o'clock")
    await fireEvent.click(cell(container, 'minute'))
    expect(slider.getAttribute('aria-valuetext')).toBe('35 minutes')
    expect(slider.getAttribute('aria-valuemax')).toBe('59')
  })

  it('offers the half-day choice on a 12-hour clock only', () => {
    const twelve = render(VTimePicker, { props: { modelValue: '09:30', format: '12h' } })
    expect(twelve.container.querySelector('.v-time-picker-meridiem')).toBeTruthy()
    const twentyFour = render(VTimePicker, { props: { modelValue: '09:30', format: '24h' } })
    expect(twentyFour.container.querySelector('.v-time-picker-meridiem')).toBeNull()
  })

  it('writes the half of the day into the value', async () => {
    const { container, emitted } = render(VTimePicker, {
      props: { modelValue: '07:00', format: '12h' },
    })
    await fireEvent.click(pm(container))
    expect(emitted('update:modelValue')?.at(-1)).toEqual(['19:00'])
  })

  it('remembers the half of the day while there is nothing to convert', async () => {
    const { container, emitted } = render(VTimePicker, {
      props: { modelValue: null, format: '12h' },
    })
    await fireEvent.click(pm(container))
    expect(emitted('update:modelValue')).toBeUndefined()
    // It applies to the first hour actually chosen: 9 in the afternoon, not in the morning.
    await fireEvent.keyDown(face(container), { key: 'ArrowUp' })
    expect(emitted('update:modelValue')?.at(-1)).toEqual(['13:00'])
  })

  it('renders the footer only when one is given', () => {
    const bare = render(VTimePicker, { props: { format: '24h' } })
    expect(bare.container.querySelector('.v-time-picker-footer')).toBeNull()
    const withFooter = render(VTimePicker, {
      props: { format: '24h' },
      slots: { footer: '<button>OK</button>' },
    })
    expect(withFooter.container.querySelector('.v-time-picker-footer')).toBeTruthy()
  })

  it('snaps the minutes to the step, with the arrows as with the Page keys', async () => {
    const { container, emitted } = render(VTimePicker, {
      props: { modelValue: '09:00', format: '24h', minuteStep: 15 },
    })
    await fireEvent.click(cell(container, 'minute'))
    await fireEvent.keyDown(face(container), { key: 'ArrowUp' })
    expect(emitted('update:modelValue')?.at(-1)).toEqual(['09:15'])
  })

  it('prints only the minutes the step can reach', async () => {
    // Every marker on the face has to be a value the hand can come to rest on: pointing at
    // one it cannot reach and watching the hand settle beside it is the whole bug.
    const { container, rerender } = render(VTimePicker, {
      props: { modelValue: '09:00', format: '24h', minuteStep: 15 },
    })
    await fireEvent.click(cell(container, 'minute'))
    expect(numerals(container)).toEqual(['00', '15', '30', '45'])

    // Below a step of five, twelve numerals is already as many as a face can carry, so the
    // five-minute grid stays — and a step of two, which cannot reach five past, loses half
    // of it rather than all of it.
    await rerender({ minuteStep: 2 })
    expect(numerals(container)).toEqual(['00', '10', '20', '30', '40', '50'])

    // The default reaches everything, so the face is the clock's own reading grid.
    await rerender({ minuteStep: 1 })
    expect(numerals(container)).toHaveLength(12)
    expect(numerals(container)[1]).toBe('05')
  })

  it('draws the hand small only on a minute with no marker of its own', async () => {
    // At full size the tip covers a numeral, which is what says "this one". Between two of
    // them it would cover both and point at neither, so it shrinks. Five past is the case
    // the marks decide rather than the clock: it is on the five-minute grid, and a face
    // stepping by a quarter of an hour does not print it.
    const { container, rerender } = render(VTimePicker, {
      props: { modelValue: '09:05', format: '24h', minuteStep: 15 },
    })
    await fireEvent.click(cell(container, 'minute'))
    const hand = () => container.querySelector('.v-time-picker-hand') as HTMLElement
    expect(hand().hasAttribute('data-minor')).toBe(true)

    await rerender({ modelValue: '09:15' })
    expect(hand().hasAttribute('data-minor')).toBe(false)
  })

  it('leaves what the restrictions rule out off the face', async () => {
    // The minute step's own rule, held to for all four restrictions: the face prints what
    // can be chosen and nothing else. Noon and the whole inner ring are past the bound,
    // so 21 of the 24 hours go and three numerals are left.
    const { container } = render(VTimePicker, {
      props: { modelValue: '09:00', format: '24h', min: '09:00', max: '11:00' },
    })
    expect(numerals(container)).toEqual(['9', '10', '11'])

    // Nothing rules the minutes of ten o'clock out, so the whole five-minute grid stands.
    await fireEvent.click(cell(container, 'minute'))
    expect(numerals(container)).toHaveLength(12)
  })

  it('cuts an hour in half rather than closing it', async () => {
    // The case the whole thing turns on: nine o'clock is still reachable under a bound of
    // half past nine, and it is its first thirty minutes that go.
    const { container } = render(VTimePicker, {
      props: { modelValue: '09:45', format: '24h', min: '09:30' },
    })
    expect(numerals(container)).toContain('9')

    await fireEvent.click(cell(container, 'minute'))
    expect(numerals(container)).toEqual(['30', '35', '40', '45', '50', '55'])
  })

  it('does nothing at all where a numeral was left off, the step included', async () => {
    // The pointer catches nothing it was not aimed at: an empty sector holds no value, so
    // no value is written — and no step is moved on either, which is what leaves the
    // reader on the face they aimed at rather than on the next one.
    //
    // jsdom measures the face at zero, which puts its centre on the origin: a point
    // straight below it is six o'clock, and one straight above it is the hour.
    //
    // TRAP — a 24-hour face is unusable here for the same reason: `distanceFraction`
    // answers 0 for a box of no size, so every point reads as the INNER ring and the
    // hours 13 to 23 are all a pointer can ever reach. These two go through a 12-hour
    // face, which has one ring and no such question.
    const { container, emitted, rerender } = render(VTimePicker, {
      props: { modelValue: '11:00', format: '12h', allowedHours: [9, 10, 11] },
    })
    await fireEvent.pointerDown(face(container), { clientX: 0, clientY: 100 })
    await fireEvent.pointerUp(face(container))
    expect(emitted('update:modelValue')).toBeUndefined()
    expect(face(container).getAttribute('aria-label')).toBe('Hour')

    // The same on the minutes, where the step's own snapping stands and what it snaps to
    // still has to be on the face: the hour is not there to be caught under a bound of
    // half past, and neither is anything else.
    await rerender({ modelValue: '09:30', allowedHours: undefined, min: '09:30', minuteStep: 15 })
    await fireEvent.click(cell(container, 'minute'))
    await fireEvent.pointerDown(face(container), { clientX: 0, clientY: -100 })
    expect(emitted('update:modelValue')).toBeUndefined()
  })

  it('moves the step on for a drag that landed, wherever it was released', async () => {
    // The gesture is what chose an hour, not the pixel it was let go of: a drag that
    // wandered off the ring on its way out has still chosen one.
    const { container, emitted } = render(VTimePicker, {
      props: { modelValue: '11:00', format: '12h', allowedHours: [9, 10, 11] },
    })
    // The left of the face is nine o'clock, which the restrictions leave open; straight
    // below it is six, which they do not.
    await fireEvent.pointerDown(face(container), { clientX: -100, clientY: 0 })
    expect(emitted('update:modelValue')?.at(-1)).toEqual(['09:00'])
    await fireEvent.pointerMove(face(container), { clientX: 0, clientY: 100 })
    await fireEvent.pointerUp(face(container))
    expect(emitted('update:modelValue')?.at(-1)).toEqual(['09:00'])
    expect(face(container).getAttribute('aria-label')).toBe('Minutes')
  })

  it('pulls the minutes to what an hour allows, and leaves them alone otherwise', async () => {
    const { container, emitted, rerender } = render(VTimePicker, {
      props: { modelValue: '10:00', format: '24h', min: '09:30' },
    })
    // Stepping back onto nine o'clock cannot leave the clock holding 09:00.
    await fireEvent.keyDown(face(container), { key: 'ArrowDown' })
    expect(emitted('update:modelValue')?.at(-1)).toEqual(['09:30'])

    // With nothing restricted a minute off the step is the consumer's own and is kept.
    await rerender({ modelValue: '10:07', min: undefined, minuteStep: 15 })
    await fireEvent.keyDown(face(container), { key: 'ArrowDown' })
    expect(emitted('update:modelValue')?.at(-1)).toEqual(['09:07'])
  })

  it('refuses an hour that has nothing left in it', async () => {
    const { container, emitted } = render(VTimePicker, {
      props: { modelValue: '09:00', format: '24h', allowedHours: [9, 10, 11] },
    })
    // 8 is closed, so the key finds the next hour that is not — going the long way round.
    await fireEvent.keyDown(face(container), { key: 'ArrowDown' })
    expect(emitted('update:modelValue')?.at(-1)).toEqual(['11:00'])
  })

  it('skips the hours and the minutes it may not land on', async () => {
    const { container, emitted } = render(VTimePicker, {
      props: {
        modelValue: '11:00',
        format: '24h',
        allowedHours: [9, 10, 11, 14],
        allowedMinutes: [0, 30],
      },
    })
    // A key that stopped at the first hole could never reach what lies past it.
    await fireEvent.keyDown(face(container), { key: 'ArrowUp' })
    expect(emitted('update:modelValue')?.at(-1)).toEqual(['14:00'])

    await fireEvent.click(cell(container, 'minute'))
    await fireEvent.keyDown(face(container), { key: 'ArrowUp' })
    expect(emitted('update:modelValue')?.at(-1)).toEqual(['14:30'])
    await fireEvent.keyDown(face(container), { key: 'Home' })
    expect(emitted('update:modelValue')?.at(-1)).toEqual(['14:00'])
    await fireEvent.keyDown(face(container), { key: 'End' })
    expect(emitted('update:modelValue')?.at(-1)).toEqual(['14:30'])
  })

  it('holds still when a bound leaves nowhere to go', async () => {
    // Against a bound the walk comes back empty, which is what a bound means. The key
    // must not wrap round to the other end of the day to find something.
    const { container, emitted } = render(VTimePicker, {
      props: { modelValue: '09:00', format: '24h', min: '09:00', max: '11:00' },
    })
    await fireEvent.keyDown(face(container), { key: 'ArrowUp' })
    expect(emitted('update:modelValue')?.at(-1)).toEqual(['10:00'])
    await fireEvent.keyDown(face(container), { key: 'Home' })
    expect(emitted('update:modelValue')?.at(-1)).toEqual(['09:00'])
    await fireEvent.keyDown(face(container), { key: 'End' })
    expect(emitted('update:modelValue')?.at(-1)).toEqual(['11:00'])
  })

  it('takes the AM or PM button away with the half of the day it stands for', () => {
    const { container } = render(VTimePicker, {
      props: { modelValue: '09:00', format: '12h', allowedHours: [9, 10, 11] },
    })
    const buttons = [...container.querySelectorAll('.v-time-picker-meridiem button')]
    const am = buttons.find((b) => b.textContent?.trim() === 'AM') as HTMLButtonElement
    expect(am.disabled).toBe(false)
    expect(pm(container as Element).hasAttribute('disabled')).toBe(true)
  })

  it('keeps the hour when the half of the day allows it, and moves it when it does not', async () => {
    // What is chosen on that control is the HALF OF THE DAY, so the hour gives way to it
    // rather than the write being refused, which would snap the control back.
    const { container, emitted } = render(VTimePicker, {
      props: { modelValue: '09:00', format: '12h', allowedHours: [9, 14, 15] },
    })
    await fireEvent.click(pm(container))
    expect(emitted('update:modelValue')?.at(-1)).toEqual(['14:00'])
  })

  it('exposes focus and reset, the two things a panel around it needs', async () => {
    // Both are reached the way VTimeInput reaches them — through a template ref — since
    // that is the whole contract being locked here.
    const api: { focus?: () => void; reset?: () => void } = {}
    const Host = {
      components: { VTimePicker },
      setup() {
        const picker = ref<{ focus: () => void; reset: () => void } | null>(null)
        onMounted(() => {
          api.focus = () => picker.value?.focus()
          api.reset = () => picker.value?.reset()
        })
        return { picker }
      },
      template: `<VTimePicker ref="picker" model-value="09:30" format="24h" />`,
    }
    const { container } = render(Host)

    api.focus!()
    expect(document.activeElement).toBe(face(container))

    await fireEvent.keyDown(face(container), { key: 'Enter' })
    expect(face(container).getAttribute('aria-label')).toBe('Minutes')
    const live = () => (container.querySelector('[aria-live="polite"]') as HTMLElement).textContent
    expect(live()!.trim()).toBe('Selecting the minutes')

    // `reset` puts the step back AND clears the announcement, without announcing anything
    // itself: a panel reopening on the hour is not something the reader did.
    api.reset!()
    await nextTick()
    expect(face(container).getAttribute('aria-label')).toBe('Hour')
    expect(live()!.trim()).toBe('')
  })
})

describe('VTimePicker — the live region', () => {
  it('announces a step the reader moved, and stays silent on a reset', async () => {
    const { container } = render(VTimePicker, { props: { modelValue: '09:30', format: '24h' } })
    const live = () => (container.querySelector('[aria-live="polite"]') as HTMLElement).textContent
    // Nothing is announced before anything happens.
    expect(live()!.trim()).toBe('')
    await fireEvent.click(cell(container, 'minute'))
    await nextTick()
    expect(live()!.trim()).toBe('Selecting the minutes')
    await fireEvent.click(cell(container, 'hour'))
    await nextTick()
    expect(live()!.trim()).toBe('Selecting the hour')
  })
})

describe('VTimePicker — disabled and readonly', () => {
  it('readonly refuses every write but keeps the face focusable and the steps readable', async () => {
    const { container, emitted, getByRole } = render(VTimePicker, {
      props: { modelValue: '09:15', readonly: true },
    })
    const slider = face(container)
    expect(slider.getAttribute('aria-readonly')).toBe('true')
    expect(slider.getAttribute('tabindex')).toBe('0')
    await fireEvent.keyDown(slider, { key: 'ArrowUp' })
    expect(emitted('update:modelValue')).toBeUndefined()
    // Switching between the hour and the minutes is reading, not writing.
    await fireEvent.click(getByRole('button', { name: /minute/i }))
    await nextTick()
    expect(container.querySelector('.v-time-picker')?.getAttribute('data-step')).toBe('minute')
  })

  it('disabled refuses the writes and leaves the face out of the tab order', async () => {
    const { container, emitted } = render(VTimePicker, {
      props: { modelValue: '09:15', disabled: true },
    })
    const slider = face(container)
    expect(slider.getAttribute('aria-disabled')).toBe('true')
    expect(slider.getAttribute('tabindex')).toBe('-1')
    await fireEvent.keyDown(slider, { key: 'ArrowUp' })
    expect(emitted('update:modelValue')).toBeUndefined()
  })
})
