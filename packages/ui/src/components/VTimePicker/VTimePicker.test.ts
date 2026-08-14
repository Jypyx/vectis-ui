import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { nextTick, onMounted, ref } from 'vue'

import VTimePicker from './VTimePicker.vue'

const face = (container: Element) => container.querySelector('[role="slider"]') as HTMLElement

const cell = (container: Element, which: 'hour' | 'minute') =>
  container.querySelector(
    `button[aria-label="${which === 'hour' ? 'Select hour' : 'Select minutes'}"]`,
  ) as HTMLButtonElement

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
