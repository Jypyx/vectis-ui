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
    // `:not(.v-input-clear)`: the cross is rendered BEFORE the end icon.
    const endIcon = (props: Record<string, unknown>) =>
      render(VTimeInput, { props }).container.querySelector<HTMLElement>(
        '.v-input-action:not(.v-input-clear) .v-icon',
      )?.dataset.icon

    expect(endIcon({ modelValue: null, showPicker: true, pickerIcon: 'alarm' })).toBe('alarm')

    // In list mode the chevron follows the VCombobox convention: the prop is inert.
    expect(endIcon({ modelValue: null, mode: 'list', pickerIcon: 'alarm' })).toBe('expand_more')

    // And the clear cross does not replace it: both coexist.
    expect(endIcon({ modelValue: '09:30', showPicker: true, pickerIcon: 'alarm' })).toBe('alarm')
  })

  it('renders the clear cross to the LEFT of the end icon', () => {
    const { container } = render(VTimeInput, {
      props: { modelValue: '09:30', mode: 'list', clearable: true },
    })
    // The cross first, then the chevron — exactly VCombobox's pairing.
    const actions = [...container.querySelectorAll('.v-input-field .v-input-action')]
    expect(actions.map((el) => el.getAttribute('aria-label'))).toEqual([
      'Clear time',
      'Open the list of times',
    ])
    expect(actions.at(0)?.classList.contains('v-input-clear')).toBe(true)
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

  it('renders a listbox of times at the requested step, with a read-only field', async () => {
    const { container, getByRole } = mount({ modelValue: '14:30' })
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.readOnly).toBe(true)
    expect(input.getAttribute('aria-haspopup')).toBe('listbox')
    await openPanel(container)
    expect(getByRole('listbox')).toBeTruthy()
    const options = optionsOf(container)
    expect(options).toHaveLength(48)
    expect(options[0]?.textContent?.trim()).toBe('0:00')
    const selected = options.find((o) => o.getAttribute('aria-selected') === 'true')
    expect(selected?.dataset.value).toBe('14:30')
    // The list panel takes the same surface as the dial one, from the same VPopover.
    expect(
      (container.querySelector('.v-time-input-list') as HTMLElement).classList.contains('v-panel'),
    ).toBe(true)
  })

  it('commits directly on click and closes (no draft, no OK)', async () => {
    const { container, emitted } = mount({ modelValue: '14:30' })
    await openPanel(container)
    expect(container.querySelector('.v-time-input-footer')).toBeNull()
    await fireEvent.click(optionsOf(container)[3] as HTMLElement) // 01:30
    await nextTick()
    expect(emitted('update:modelValue')?.at(-1)).toEqual(['01:30'])
    expect(container.querySelector('.v-time-input-list')?.hasAttribute('data-popover-open')).toBe(
      false,
    )
  })

  it('Enter on a row commits and does not reopen the panel', async () => {
    // Without onPanelKeydown's preventDefault, Enter bubbles to the root without being
    // marked consumed and useFieldPanel's `defaultPrevented` guard does not apply: the
    // panel reopens at once.
    const { container, emitted } = mount({ modelValue: '14:30' })
    await openPanel(container)
    const option = optionsOf(container)[5] as HTMLElement // 02:30
    option.focus()
    await fireEvent.keyDown(option, { key: 'Enter', bubbles: true })
    await nextTick()
    expect(emitted('update:modelValue')?.at(-1)).toEqual(['02:30'])
    expect(container.querySelector('.v-time-input-list')?.hasAttribute('data-popover-open')).toBe(
      false,
    )
  })

  it('navigates the list with the keyboard (arrows, Home, End)', async () => {
    const { container } = mount({ modelValue: '00:00' })
    await openPanel(container)
    const options = optionsOf(container)
    const panel = container.querySelector('.v-time-input-list') as HTMLElement
    options[0]?.focus()
    await fireEvent.keyDown(panel, { key: 'ArrowDown', bubbles: true })
    expect(document.activeElement).toBe(options[1])
    await fireEvent.keyDown(panel, { key: 'End', bubbles: true })
    expect(document.activeElement).toBe(options.at(-1))
    await fireEvent.keyDown(panel, { key: 'Home', bubbles: true })
    expect(document.activeElement).toBe(options[0])
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
   * There are two AM/PM controls in the design, never both at once for the same reason:
   * the one beside the FIELD serves the forms that can be typed or listed, where the half
   * of the day has to be known with no panel open; the one inside the PICKER serves the
   * read-only form, and writes to the draft rather than to the value.
   */
  const pmIn = (container: Element, scope: 'field' | 'picker') =>
    [
      ...container.querySelectorAll(
        `${scope === 'field' ? '.v-time-input-meridiem' : '.v-time-picker-meridiem'} button`,
      ),
    ].find((b) => b.textContent?.trim() === 'PM') as HTMLElement

  const pmOf = (container: Element) => pmIn(container, 'field')

  it('drives the v-model without opening or confirming', async () => {
    const { container, emitted } = render(VTimeInput, {
      props: { modelValue: '07:00', format: '12h' },
    })
    const pm = pmOf(container)
    expect(pm.getAttribute('aria-pressed')).toBe('false')
    await fireEvent.click(pm)
    expect(emitted('update:modelValue')?.at(-1)).toEqual(['19:00'])
    expect(panelOpen(container)).toBe(false)
  })

  it('with no value: the choice is remembered and applies to the first entry', async () => {
    const { container, emitted } = render(VTimeInput, {
      props: { modelValue: null, format: '12h', mode: 'input' },
    })
    await fireEvent.click(pmOf(container))
    expect(emitted('update:modelValue')).toBeUndefined() // nothing to convert
    const input = container.querySelector('input') as HTMLInputElement
    await type(input, '07:00')
    expect(emitted('update:modelValue')?.at(-1)).toEqual(['19:00'])
  })

  it('inside the picker: the draft follows the meridiem, and OK commits the right value', async () => {
    const { container, emitted, getByText } = render(VTimeInput, {
      props: { mode: 'readonly', modelValue: '07:00', format: '12h' },
    })
    await openPanel(container)
    await fireEvent.click(pmIn(container, 'picker'))
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
    await fireEvent.click(pmIn(container, 'picker'))
    await nextTick()
    await fireEvent.click(getByText('Cancel'))
    expect(emitted('update:modelValue')).toBeUndefined()
  })
})
