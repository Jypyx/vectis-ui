import { fireEvent, render } from '@testing-library/vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import VTimeInput from './VTimeInput.vue'

/** Opens the panel by clicking the control. */
async function openPanel(container: Element) {
  await fireEvent.click(container.querySelector('.v-time-input-control') as HTMLElement)
  await nextTick()
}

const panelOpen = (container: Element) =>
  container.querySelector('.v-time-input-panel')?.hasAttribute('data-popover-open') === true

const hourCell = (container: Element) =>
  container.querySelector('button[aria-label="Select hour"]') as HTMLButtonElement

describe('VTimeInput — default', () => {
  it('is a masked input field, with no picker and no popup ARIA', async () => {
    const { container } = render(VTimeInput, { props: { modelValue: '09:30', format: '24h' } })
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.readOnly).toBe(false)
    expect(input.value).toBe('09:30')
    expect(input.getAttribute('inputmode')).toBe('numeric')
    expect(container.querySelector('button[aria-label="Open time picker"]')).toBeNull()
    expect(input.getAttribute('aria-haspopup')).toBeNull()
    expect(input.getAttribute('aria-controls')).toBeNull()

    await fireEvent.focus(input)
    await fireEvent.keyDown(input, { key: 'ArrowDown', bubbles: true })
    await nextTick()
    expect(container.querySelector('.v-time-input-panel')).toBeNull()
  })

  it('does not warn in its default configuration', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(VTimeInput, { props: { modelValue: '09:15' } })
    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
  })

  it('pickerIcon: it overrides the PICKER icon, with no effect in list mode', () => {
    const iconsOf = (props: Record<string, unknown>) =>
      [
        ...render(VTimeInput, { props }).container.querySelectorAll<HTMLElement>(
          '.v-input-field .v-icon',
        ),
      ].map((el) => el.dataset.icon)

    expect(iconsOf({ modelValue: null, showPicker: true, pickerIcon: 'alarm' })).toEqual(['alarm'])

    // In list mode the chevron is VCombobox's, so the prop reaches nothing at all.
    expect(iconsOf({ modelValue: null, mode: 'list', pickerIcon: 'alarm' })).toEqual([
      'expand_more',
    ])

    // The clear cross does not replace the end icon: both coexist, the cross first.
    expect(
      iconsOf({ modelValue: '09:30', showPicker: true, clearable: true, pickerIcon: 'alarm' }),
    ).toEqual(['close', 'alarm'])
  })

  it('renders the clear cross to the LEFT of the end icon', () => {
    const { container } = render(VTimeInput, {
      // 24 hour, so the AM/PM button is not in the row: what is under test is the order of
      // the FIELD's own two controls.
      props: { modelValue: '09:30', format: '24h', showPicker: true, clearable: true },
    })
    // The cross first, then the icon that opens the panel.
    const actions = [...container.querySelectorAll('.v-input-field .v-input-action')]
    expect(actions.map((el) => el.getAttribute('aria-label'))).toEqual([
      'Clear time',
      'Open time picker',
    ])
    expect(actions.at(0)?.classList.contains('v-input-clear')).toBe(true)
  })

  /*
   * The list form hands its whole field to VCombobox, wording included: the cross there is
   * the one that empties a SELECTION, not the one that empties a typed time.
   */
  it('the list form takes VCombobox’s own cross and chevron', () => {
    const { container } = render(VTimeInput, {
      props: { modelValue: '09:30', mode: 'list', clearable: true },
    })
    expect(container.querySelector('.v-input-clear')?.getAttribute('aria-label')).toBe(
      'Clear selection',
    )
  })
})

describe('VTimeInput — read-only', () => {
  it('displays the formatted value in a read-only field', () => {
    const { container } = render(VTimeInput, {
      props: { mode: 'readonly', modelValue: '19:05', locale: 'fr-FR', label: 'Time' },
    })
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.readOnly).toBe(true)
    expect(input.value).toBe('19:05')
    expect(input.getAttribute('aria-haspopup')).toBe('dialog')
    expect(input.getAttribute('aria-expanded')).toBe('false')
  })

  it('opens the panel on click and renders the picker (a slider)', async () => {
    const { container, getByRole } = render(VTimeInput, {
      props: { mode: 'readonly', modelValue: '09:15', label: 'Time' },
    })
    await openPanel(container)
    expect(getByRole('dialog')).toBeTruthy()
    const slider = getByRole('slider')
    expect(slider.getAttribute('aria-label')).toBe('Hour')
    expect(slider.getAttribute('aria-valuenow')).toBe('9')
    expect(container.querySelector('input')?.getAttribute('aria-expanded')).toBe('true')
    // TRAP — VTimePicker paints no background, border or shadow of its own: the panel
    // takes all of it from `.v-panel`, which VPopover sets on any panel it is not told
    // is `bare`. Nothing else guards it — jsdom evaluates no styles, and the play
    // function asserts the padding, which comes from the `.v-popover-panel
    // .v-time-input-panel` compound and survives the loss of the class. Without this
    // assertion, a `bare` slipping in leaves the dial floating transparent over the
    // page, and every check in the repo stays green.
    const panel = container.querySelector('.v-time-input-panel') as HTMLElement
    expect(panel.classList.contains('v-panel')).toBe(true)
  })

  it('works on a draft: nothing is emitted before OK', async () => {
    const { container, emitted, getByRole, getByText } = render(VTimeInput, {
      props: { mode: 'readonly', modelValue: '09:15', format: '24h' },
    })
    await openPanel(container)
    // the up arrow on the picker: the draft advances, the v-model does not
    await fireEvent.keyDown(getByRole('slider'), { key: 'ArrowUp' })
    await nextTick()
    expect(hourCell(container).textContent?.trim()).toBe('10')
    expect(emitted('update:modelValue')).toBeUndefined()
    await fireEvent.click(getByText('OK'))
    expect(emitted('update:modelValue')?.at(-1)).toEqual(['10:15'])
    expect(panelOpen(container)).toBe(false)
  })

  it('cancels without emitting (the button, Escape, focus leaving)', async () => {
    const { container, emitted, getByRole, getByText } = render(VTimeInput, {
      props: { mode: 'readonly', modelValue: '09:15', format: '24h' },
    })
    await openPanel(container)
    await fireEvent.keyDown(getByRole('slider'), { key: 'ArrowUp' })
    await fireEvent.click(getByText('Cancel'))
    expect(emitted('update:modelValue')).toBeUndefined()
    expect(panelOpen(container)).toBe(false)

    await openPanel(container)
    await fireEvent.keyDown(getByRole('slider'), { key: 'Escape' })
    await nextTick()
    expect(emitted('update:modelValue')).toBeUndefined()
    expect(panelOpen(container)).toBe(false)

    await openPanel(container)
    const root = container.querySelector('.v-time-input') as HTMLElement
    root.dispatchEvent(new FocusEvent('focusout', { relatedTarget: null, bubbles: true }))
    await nextTick()
    expect(emitted('update:modelValue')).toBeUndefined()
    expect(panelOpen(container)).toBe(false)
  })

  it('moves from hours to minutes (Enter on the picker, the header cells)', async () => {
    const { container, getByRole } = render(VTimeInput, {
      props: { mode: 'readonly', modelValue: '09:15', format: '24h' },
    })
    await openPanel(container)
    await fireEvent.keyDown(getByRole('slider'), { key: 'Enter' })
    await nextTick()
    expect(getByRole('slider').getAttribute('aria-label')).toBe('Minutes')
    expect(getByRole('slider').getAttribute('aria-valuemax')).toBe('59')
    // back to the hour step through the header cell
    await fireEvent.click(hourCell(container))
    await nextTick()
    expect(getByRole('slider').getAttribute('aria-label')).toBe('Hour')
  })

  it('Enter on the minutes step commits and closes', async () => {
    const { container, emitted, getByRole } = render(VTimeInput, {
      props: { mode: 'readonly', modelValue: '09:15', format: '24h' },
    })
    await openPanel(container)
    const slider = getByRole('slider')
    await fireEvent.keyDown(slider, { key: 'Enter' }) // hour → minutes
    await fireEvent.keyDown(getByRole('slider'), { key: 'ArrowUp' })
    await fireEvent.keyDown(getByRole('slider'), { key: 'Enter' })
    expect(emitted('update:modelValue')?.at(-1)).toEqual(['09:16'])
    expect(panelOpen(container)).toBe(false)
  })

  it('ignores showPicker in read-only mode (and says so)', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { container, getByRole } = render(VTimeInput, {
      props: { mode: 'readonly', modelValue: '09:15', format: '24h', showPicker: false },
    })
    await openPanel(container)
    expect(getByRole('slider')).toBeTruthy()
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('showPicker'))
    warn.mockRestore()
  })

  it('has no mode toggle in the panel footer', () => {
    const { container } = render(VTimeInput, { props: { mode: 'readonly', modelValue: '09:15' } })
    expect(container.querySelector('.v-time-input-mode')).toBeNull()
  })

  it('derives the format from the locale (en-US → 12h)', async () => {
    const { container, getByRole } = render(VTimeInput, {
      props: { mode: 'readonly', modelValue: '19:00', locale: 'en-US' },
    })
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.value).toMatch(/PM/)
    // In the read-only form the picker is the only way in, so it is the picker that
    // carries the AM/PM choice — nothing sits beside the field any more.
    expect(container.querySelector('.v-time-input-meridiem')).toBeNull()
    expect(container.querySelector('.v-time-picker-meridiem')).toBeTruthy()
    await openPanel(container)
    // a 12h picker: the displayed value is 7, the max 12
    expect(getByRole('slider').getAttribute('aria-valuenow')).toBe('7')
    expect(getByRole('slider').getAttribute('aria-valuemax')).toBe('12')
  })

  describe('heure courante', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2026, 6, 27, 14, 42))
    })
    afterEach(() => {
      vi.useRealTimers()
    })

    it('initializes the draft at the current time when there is no value', async () => {
      const { container } = render(VTimeInput, {
        props: { mode: 'readonly', modelValue: null, format: '24h' },
      })
      await openPanel(container)
      expect(hourCell(container).textContent?.trim()).toBe('14')
    })
  })

  it('clears the value through the cross, without losing the picker icon', async () => {
    const { container, emitted } = render(VTimeInput, {
      props: { mode: 'readonly', modelValue: '09:15', clearable: true },
    })
    const clearBtn = container.querySelector('button[aria-label="Clear time"]') as HTMLElement
    expect(clearBtn).toBeTruthy()
    // The field is readonly in this mode: the cross only survives there because
    // `clearVisible` is authoritative on the VInput side.
    expect((container.querySelector('input') as HTMLInputElement).readOnly).toBe(true)
    expect(container.querySelector('button[aria-label="Open time picker"]')).toBeTruthy()

    await fireEvent.click(clearBtn)
    expect(emitted('update:modelValue')?.at(-1)).toEqual([null])
    // The panel does not open on the refocus handed back to the field.
    expect(container.querySelector('.v-time-input-panel')?.hasAttribute('data-popover-open')).toBe(
      false,
    )
  })

  it('exposes a complete ARIA slider (a localized valuetext)', async () => {
    const { container, getByRole } = render(VTimeInput, {
      props: { mode: 'readonly', modelValue: '07:35', format: '24h' },
    })
    await openPanel(container)
    const slider = getByRole('slider')
    expect(slider.getAttribute('aria-valuemin')).toBe('0')
    expect(slider.getAttribute('aria-valuemax')).toBe('23')
    expect(slider.getAttribute('aria-valuetext')).toBe("7 o'clock")
    await fireEvent.keyDown(slider, { key: 'Enter' })
    await nextTick()
    expect(getByRole('slider').getAttribute('aria-valuetext')).toBe('35 minutes')
  })
})

/**
 * Simulated typing: jsdom places no caret, so it is set explicitly at the end of the
 * text, as sequential typing would.
 */
async function type(input: HTMLInputElement, value: string) {
  input.value = value
  input.setSelectionRange(value.length, value.length)
  await fireEvent.input(input)
}

describe('VTimeInput — input mode', () => {
  const mount = (props: Record<string, unknown> = {}) =>
    render(VTimeInput, {
      props: { mode: 'input', format: '24h', locale: 'fr-FR', label: 'Heure', ...props },
    })

  it('renders an editable field in the HH:MM mask', () => {
    const { container } = mount({ modelValue: '09:30' })
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.readOnly).toBe(false)
    expect(input.value).toBe('09:30')
    expect(input.getAttribute('inputmode')).toBe('numeric')
    expect(input.getAttribute('autocomplete')).toBe('off')
    expect(input.getAttribute('placeholder')).toBe('hh:mm')
  })

  it('places the colon as you type and only commits a complete time', async () => {
    const { container, emitted } = mount()
    const input = container.querySelector('input') as HTMLInputElement
    await type(input, '0')
    expect(input.value).toBe('0')
    await type(input, '09')
    expect(input.value).toBe('09:')
    expect(emitted('update:modelValue')).toBeUndefined()
    await type(input, '09:30')
    expect(input.value).toBe('09:30')
    expect(emitted('update:modelValue')?.at(-1)).toEqual(['09:30'])
  })

  it('ignores rejected characters without the raw text reappearing', async () => {
    // The mask does not change → Vue re-patches nothing. Without the `v-model` on the
    // VInput (whose internal state would copy the raw text), the 5th digit would reappear
    // in the DOM on the next patch.
    const { container } = mount({ modelValue: '09:30' })
    const input = container.querySelector('input') as HTMLInputElement
    await type(input, '09:301')
    await nextTick()
    expect(input.value).toBe('09:30')
  })

  it('Backspace on the colon erases the digit preceding it', async () => {
    const { container } = mount()
    const input = container.querySelector('input') as HTMLInputElement
    await type(input, '09')
    expect(input.value).toBe('09:')
    input.setSelectionRange(3, 3)
    await fireEvent.keyDown(input, { key: 'Backspace' })
    expect(input.value).toBe('0')
  })

  it('a typed colon completes the hour with a leading zero', async () => {
    const { container } = mount()
    const input = container.querySelector('input') as HTMLInputElement
    await type(input, '9')
    await fireEvent.keyDown(input, { key: ':' })
    expect(input.value).toBe('09:')
  })

  it('silently reverts an impossible time on leaving the field', async () => {
    const { container, emitted } = mount({ modelValue: '09:30' })
    const input = container.querySelector('input') as HTMLInputElement
    await type(input, '25:00')
    await fireEvent.change(input)
    expect(emitted('update:modelValue')).toBeUndefined()
    expect(input.value).toBe('09:30')
  })

  it('empties the value when the field is emptied', async () => {
    const { container, emitted } = mount({ modelValue: '09:30' })
    const input = container.querySelector('input') as HTMLInputElement
    await type(input, '')
    await fireEvent.change(input)
    expect(emitted('update:modelValue')?.at(-1)).toEqual([null])
  })

  // "no picker without showPicker" is the component's DEFAULT behaviour: that test lives in
  // the "default" describe.

  it('showPicker restores the icon and the opening on focus, without stealing the caret', async () => {
    // with no value: the end icon is indeed the picker, not the clear cross
    const { container, getByRole } = mount({ modelValue: null, showPicker: true })
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.getAttribute('aria-haspopup')).toBe('dialog')
    expect(container.querySelector('button[aria-label="Open time picker"]')).toBeTruthy()
    await fireEvent.focus(input)
    await nextTick()
    expect(panelOpen(container)).toBe(true)
    // the down arrow is the explicit route from the field to the picker
    await fireEvent.keyDown(input, { key: 'ArrowDown', bubbles: true })
    await nextTick()
    expect(document.activeElement).toBe(getByRole('slider'))
  })
})

describe('VTimeInput — restrictions', () => {
  it('says no to a typed time through the control own validity', async () => {
    // The value is committed all the same: the field shows what was typed and so does a
    // consumer bound to it. What refuses it is the browser, which is also what stops a
    // form leaving with it.
    const { container } = render(VTimeInput, {
      props: { modelValue: null, format: '24h', min: '09:00', max: '17:00' },
    })
    const input = container.querySelector('input') as HTMLInputElement

    await fireEvent.update(input, '08:30')
    await fireEvent.blur(input)
    await nextTick()
    expect(input.validity.customError).toBe(true)
    expect(input.validationMessage).toBe('This time is not available.')

    await fireEvent.update(input, '09:30')
    await fireEvent.blur(input)
    await nextTick()
    expect(input.validity.customError).toBe(false)
  })

  it('says nothing of an empty field', async () => {
    const { container } = render(VTimeInput, {
      props: { modelValue: null, format: '24h', allowedMinutes: [0, 30] },
    })
    const input = container.querySelector('input') as HTMLInputElement
    await nextTick()
    expect(input.validity.customError).toBe(false)
  })

  it('hands the restrictions to the picker it opens', async () => {
    const { container } = render(VTimeInput, {
      props: { modelValue: '09:00', mode: 'readonly', format: '24h', max: '11:00' },
    })
    await openPanel(container)
    const disabled = container.querySelectorAll('.v-time-picker-number[data-disabled]')
    expect(disabled.length).toBeGreaterThan(0)
    expect([...disabled].map((n) => n.textContent!.trim())).not.toContain('9')
  })

  it('warns about restrictions that leave nothing to choose', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(VTimeInput, { props: { min: '17:00', max: '09:00' } })
    expect(warn.mock.calls.flat().join(' ')).toContain('falls after max')
    warn.mockRestore()
  })
})

describe('VTimeInput — list mode', () => {
  const mount = (props: Record<string, unknown> = {}) =>
    render(VTimeInput, {
      props: {
        mode: 'list',
        minuteStep: 30,
        format: '24h',
        locale: 'fr-FR',
        label: 'Heure',
        ...props,
      },
    })

  const optionsOf = (container: Element) =>
    [...container.querySelectorAll('[role="option"]')] as HTMLElement[]

  it('leaves out the times that cannot be chosen', async () => {
    // A list is READ before it is chosen from, so a row nobody may take has no reason to
    // be in it. That is the opposite of the picker, where a disabled numeral is what
    // makes a bound legible against the hours around it.
    const { container } = mount({ min: '09:00', max: '10:00' })
    await openList(container)
    expect(optionsOf(container).map((o) => o.textContent!.trim())).toEqual([
      '9:00',
      '9:30',
      '10:00',
    ])
  })

  it('keeps the row of a value that is no longer allowed', async () => {
    // Without it the field falls back to printing the raw canonical string, a combobox
    // naming a value through the option that carries it.
    const { container } = mount({ modelValue: '08:00', min: '09:00', max: '10:00' })
    await openList(container)
    expect(optionsOf(container).map((o) => o.textContent!.trim())).toEqual([
      '8:00',
      '9:00',
      '9:30',
      '10:00',
    ])
  })

  /** Opens the combobox the way a reader does, by clicking its field. */
  const openList = async (container: Element) => {
    await fireEvent.click(container.querySelector('input') as HTMLInputElement)
    await nextTick()
  }

  it('is a VCombobox, so the times can be searched rather than only scrolled', async () => {
    const { container, getByRole } = mount({ modelValue: '14:30' })
    expect(container.querySelector('.v-combobox')).toBeTruthy()
    // The field is a real search box, not the read-only one the other two forms use.
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.readOnly).toBe(false)
    expect(input.getAttribute('aria-haspopup')).toBe('listbox')
    // Nothing of the component's own panel machinery is left in the list form.
    expect(container.querySelector('.v-time-input-panel')).toBeNull()
    // `label` and `hint` are not VCombobox props: they reach the field by falling THROUGH
    // it into the VInput that declares them. Silent if it ever stops working.
    expect(container.querySelector('.v-input-label')?.textContent?.trim()).toBe('Heure')

    await openList(container)
    expect(getByRole('listbox')).toBeTruthy()
    const options = optionsOf(container)
    expect(options).toHaveLength(48)
    expect(options[0]?.textContent?.trim()).toBe('0:00')
    expect(
      options.find((o) => o.getAttribute('aria-selected') === 'true')?.textContent?.trim(),
    ).toBe('14:30')
  })

  it('narrows the list as one types, digits alone included', async () => {
    const { container } = mount({ modelValue: null })
    await openList(container)
    const input = container.querySelector('input') as HTMLInputElement

    await fireEvent.update(input, '930')
    await nextTick()
    // A 30-minute step on a 24 hour clock: only half past nine answers "930". Red if the
    // rule reads a 24 hour label as a 12 hour one — 21:30 would answer too.
    expect(optionsOf(container).map((o) => o.textContent?.trim())).toEqual(['9:30'])

    await fireEvent.update(input, 'nope')
    await nextTick()
    expect(optionsOf(container)).toHaveLength(0)
  })

  it('commits on click and empties to null rather than to a blank string', async () => {
    const { container, emitted } = mount({ modelValue: '14:30', clearable: true })
    await openList(container)
    await fireEvent.click(optionsOf(container)[3] as HTMLElement) // 01:30
    await nextTick()
    expect(emitted('update:modelValue')?.at(-1)).toEqual(['01:30'])

    // A combobox says "nothing chosen" with an empty string, which is not a time: the
    // bridge has to hand a consumer back the null their model is typed for.
    await fireEvent.click(container.querySelector('.v-input-clear') as HTMLElement)
    await nextTick()
    expect(emitted('update:modelValue')?.at(-1)).toEqual([null])
  })

  /*
   * A value the consumer set off the step is a real value, and the list is the only thing
   * that can give the field a word for it.
   */
  it('offers a value that is not on the step, in its place', async () => {
    const { container } = mount({ modelValue: '09:07' })
    const input = container.querySelector('input') as HTMLInputElement
    // Red without the inserted row: a combobox names a value through the option carrying
    // it, so the field would fall back to the raw canonical "09:07".
    expect(input.value).toBe('9:07')

    await openList(container)
    const labels = optionsOf(container).map((o) => o.textContent?.trim())
    expect(labels).toHaveLength(49)
    expect(labels.slice(18, 21)).toEqual(['9:00', '9:07', '9:30'])
  })

  it('warns about showPicker and about too fine a step', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mount({ modelValue: null, showPicker: true, minuteStep: 1 })
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('showPicker'))
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('rows'))
    warn.mockRestore()
  })
})

describe('VTimeInput — the meridiem', () => {
  /**
   * There are two AM/PM controls in the design, never the same one twice: a BUTTON inside
   * the typed field, which flips the value on the spot because a mask says nothing about
   * the half of the day; and the PICKER's own pair, which serves the read-only form and
   * writes to the draft rather than to the value.
   *
   * The list form has neither: every row spells its own half of the day out.
   */
  const fieldMeridiem = (container: Element) =>
    container.querySelector('.v-time-input-meridiem') as HTMLElement | null

  const pmInPicker = (container: Element) =>
    [...container.querySelectorAll('.v-time-picker-meridiem button')].find(
      (b) => b.textContent?.trim() === 'PM',
    ) as HTMLElement

  it('reads the half of the day off the value, and names it', () => {
    const { container } = render(VTimeInput, { props: { modelValue: '19:00', format: '12h' } })
    const button = fieldMeridiem(container)!
    expect(button.textContent?.trim()).toBe('PM')
    // The name repeats the visible word rather than replacing it, so a reader arriving on
    // the button is told which half is chosen.
    expect(button.getAttribute('aria-label')).toBe('AM or PM: PM')
  })

  it('flips the v-model without opening or confirming', async () => {
    const { container, emitted } = render(VTimeInput, {
      props: { modelValue: '07:00', format: '12h' },
    })
    const button = fieldMeridiem(container)!
    expect(button.textContent?.trim()).toBe('AM')
    await fireEvent.click(button)
    expect(emitted('update:modelValue')?.at(-1)).toEqual(['19:00'])
    expect(panelOpen(container)).toBe(false)
  })

  it('with no value: the choice is remembered and applies to the first entry', async () => {
    const { container, emitted } = render(VTimeInput, {
      props: { modelValue: null, format: '12h', mode: 'input' },
    })
    await fireEvent.click(fieldMeridiem(container)!)
    expect(emitted('update:modelValue')).toBeUndefined() // nothing to convert
    // The button shows the remembered choice even though nothing is set.
    expect(fieldMeridiem(container)!.textContent?.trim()).toBe('PM')
    const input = container.querySelector('input') as HTMLInputElement
    await type(input, '07:00')
    expect(emitted('update:modelValue')?.at(-1)).toEqual(['19:00'])
  })

  it('is rendered by the typed form alone, and only on a 12 hour clock', () => {
    for (const props of [
      { format: '24h' as const },
      { format: '12h' as const, mode: 'list' as const },
      { format: '12h' as const, mode: 'readonly' as const },
    ]) {
      const { container } = render(VTimeInput, { props: { modelValue: '19:00', ...props } })
      expect(fieldMeridiem(container)).toBeNull()
    }
    const { container } = render(VTimeInput, { props: { modelValue: '19:00', format: '12h' } })
    expect(fieldMeridiem(container)).toBeTruthy()
  })

  /*
   * The rule separates what acts on the VALUE from what acts on the FIELD, so it only
   * belongs there when the field has controls of its own to be separated from.
   */
  it('carries a rule after it only when something follows', () => {
    const bare = render(VTimeInput, { props: { modelValue: '19:00', format: '12h' } })
    expect(bare.container.querySelector('.v-time-input-divider')).toBeNull()

    const withPicker = render(VTimeInput, {
      props: { modelValue: '19:00', format: '12h', showPicker: true },
    })
    expect(withPicker.container.querySelector('.v-time-input-divider')).toBeTruthy()

    const withClear = render(VTimeInput, {
      props: { modelValue: '19:00', format: '12h', clearable: true },
    })
    expect(withClear.container.querySelector('.v-time-input-divider')).toBeTruthy()
  })

  /*
   * What acts on the value comes before what acts on the field, in the DOM and therefore
   * in the tab order too. Reversing the two would need a CSS `order`, which moves the
   * painting and leaves the focus where it was.
   */
  it('sits before the controls that clear and open', () => {
    const { container } = render(VTimeInput, {
      props: { modelValue: '19:00', format: '12h', clearable: true, showPicker: true },
    })
    const field = container.querySelector('.v-input-field') as HTMLElement
    const at = (selector: string) => [...field.children].findIndex((el) => el.matches(selector))
    expect(at('.v-input-control')).toBe(0)
    expect(at('.v-time-input-meridiem')).toBe(1)
    expect(at('.v-time-input-divider')).toBe(2)
    expect(at('.v-input-clear')).toBe(3)
    expect(field.children).toHaveLength(5) // the icon that opens the picker closes the row
  })

  it('inside the picker: the draft follows the meridiem, and OK commits the right value', async () => {
    const { container, emitted, getByText } = render(VTimeInput, {
      props: { mode: 'readonly', modelValue: '07:00', format: '12h' },
    })
    await openPanel(container)
    await fireEvent.click(pmInPicker(container))
    await nextTick()
    // Still nothing written: inside the picker the half of the day is part of the draft.
    expect(emitted('update:modelValue')).toBeUndefined()
    await fireEvent.click(getByText('OK'))
    expect(emitted('update:modelValue')?.at(-1)).toEqual(['19:00'])
  })

  it('inside the picker: Cancel drops the meridiem along with the rest of the draft', async () => {
    const { container, emitted, getByText } = render(VTimeInput, {
      props: { mode: 'readonly', modelValue: '07:00', format: '12h' },
    })
    await openPanel(container)
    await fireEvent.click(pmInPicker(container))
    await nextTick()
    await fireEvent.click(getByText('Cancel'))
    expect(emitted('update:modelValue')).toBeUndefined()
  })
})
