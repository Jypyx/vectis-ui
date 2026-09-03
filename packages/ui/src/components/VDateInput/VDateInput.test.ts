import { fireEvent, render } from '@testing-library/vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import VDateInput from './VDateInput.vue'

const JUNE = '2026-06-10'

/**
 * Simulated typing: jsdom places no caret, so it is set explicitly at the end of the
 * text, as sequential typing would.
 */
// Several tests pass `locale: 'fr-FR'`: the dd/mm/yyyy mask and the French month names
// are what they assert. The DS dictionary is a separate axis — the button labels stay in
// the base locale (English).
async function type(input: HTMLInputElement, value: string) {
  input.value = value
  input.setSelectionRange(value.length, value.length)
  await fireEvent.input(input)
}

describe('VDateInput — default', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('is a masked input field, with no calendar and no popup ARIA', async () => {
    const { container } = render(VDateInput, { props: { modelValue: JUNE, locale: 'fr-FR' } })
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.readOnly).toBe(false)
    expect(input.value).toBe('10/06/2026')
    expect(input.getAttribute('inputmode')).toBe('numeric')
    expect(container.querySelector('button[aria-label="Open calendar"]')).toBeNull()
    expect(input.getAttribute('aria-haspopup')).toBeNull()
    expect(input.getAttribute('aria-controls')).toBeNull()

    await fireEvent.focus(input)
    await fireEvent.keyDown(input, { key: 'ArrowDown', bubbles: true })
    await nextTick()
    expect(container.querySelector('.v-date-input-panel')).toBeNull()
  })

  it('pickerIcon: it overrides the opening icon, which the clear cross does not replace', async () => {
    const { container, rerender } = render(VDateInput, {
      props: { modelValue: null, showPicker: true, pickerIcon: 'event', clearable: true },
    })
    // `:not(.v-input-clear)`: the cross is rendered BEFORE the end icon.
    const endIcon = () =>
      container.querySelector<HTMLElement>('.v-input-action:not(.v-input-clear) .v-icon')?.dataset
        .icon
    expect(endIcon()).toBe('event')

    // With something to clear, the two coexist — the VInput/VTextarea/VCombobox
    // convention, which would break silently.
    await rerender({ modelValue: JUNE })
    expect(endIcon()).toBe('event')

    // The cross FIRST: to the left of the opening icon.
    const actions = [...container.querySelectorAll('.v-input-field .v-input-action')]
    expect(actions.map((el) => el.getAttribute('aria-label'))).toEqual([
      'Clear date',
      'Open calendar',
    ])
    expect(actions.at(0)?.classList.contains('v-input-clear')).toBe(true)
  })

  it('warns neither when empty nor on a range selection (which falls back to read-only)', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(VDateInput, { props: { modelValue: JUNE } })
    expect(warn).not.toHaveBeenCalled()

    // `mode` is not supplied: falling back to read-only is the expected behaviour, not a
    // mistake by the consumer.
    const { container, getByRole } = render(VDateInput, {
      props: { selection: 'range', modelValue: { start: '2026-06-19', end: '2026-06-26' } },
    })
    expect(warn).not.toHaveBeenCalled()
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.readOnly).toBe(true)
    await fireEvent.click(container.querySelector('.v-date-input-control') as HTMLElement)
    await nextTick()
    expect(getByRole('grid')).toBeTruthy()
  })

  it('warns when mode="input" is explicitly requested outside a single selection', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(VDateInput, {
      props: { mode: 'input', selection: 'range', modelValue: { start: null, end: null } },
    })
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('mode="input" ignored'))
  })
})

describe('VDateInput — read-only', () => {
  const mount = (props: Record<string, unknown> = {}) =>
    render(VDateInput, {
      props: { mode: 'readonly', locale: 'fr-FR', label: 'Date', ...props },
    })

  it('displays the formatted value in a read-only field', () => {
    const { container } = mount({ modelValue: JUNE })
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.readOnly).toBe(true)
    expect(input.value).toContain('10')
    expect(input.value.toLowerCase()).toContain('juin')
    expect(input.getAttribute('aria-haspopup')).toBe('dialog')
    expect(input.getAttribute('aria-expanded')).toBe('false')
  })

  it('opens the panel on click and renders the grid', async () => {
    const { container, getByRole } = mount({ modelValue: JUNE })
    const control = container.querySelector('.v-date-input-control') as HTMLElement
    await fireEvent.click(control)
    await nextTick()
    expect(getByRole('dialog')).toBeTruthy()
    expect(getByRole('grid')).toBeTruthy()
    expect(container.querySelector('input')?.getAttribute('aria-expanded')).toBe('true')
  })

  it('ignores showPicker (the calendar is the only route there)', async () => {
    const { container, getByRole } = mount({ modelValue: JUNE, showPicker: false, clearable: true })
    expect(container.querySelector('button[aria-label="Clear date"]')).toBeTruthy()
    await fireEvent.click(container.querySelector('.v-date-input-control') as HTMLElement)
    await nextTick()
    expect(getByRole('grid')).toBeTruthy()
  })

  it('the panel is drawn on the shared surface', async () => {
    // TRAP — VDatePicker paints no background, border or shadow of its own: the panel
    // takes all of it from `.v-panel`, which VPopover sets on any panel it is not told
    // is `bare`. Nothing else guards it — jsdom evaluates no styles, and the play
    // function asserts the padding, which comes from the `.v-popover-panel
    // .v-date-input-panel` compound and survives the loss of the class. Without this
    // assertion, a `bare` slipping in leaves the calendar floating transparent over the
    // page, and every check in the repo stays green.
    const { container } = mount({ modelValue: JUNE })
    await fireEvent.click(container.querySelector('.v-date-input-control') as HTMLElement)
    await nextTick()
    const panel = container.querySelector('.v-date-input-panel') as HTMLElement
    expect(panel.classList.contains('v-panel')).toBe(true)
  })

  it('selects a date, updates the model and closes (single)', async () => {
    const { container, emitted, getByRole } = mount({ modelValue: JUNE })
    await fireEvent.click(container.querySelector('.v-date-input-control') as HTMLElement)
    await nextTick()
    const day15 = [...getByRole('grid').querySelectorAll('.v-date-picker-day')].find(
      (b) => b.textContent?.trim() === '15' && !b.hasAttribute('data-outside'),
    ) as HTMLElement
    await fireEvent.click(day15)
    await nextTick()
    expect(emitted('update:modelValue')?.at(-1)).toEqual(['2026-06-15'])
    // closed: the panel is no longer marked open
    expect(container.querySelector('.v-date-input-panel')?.hasAttribute('data-popover-open')).toBe(
      false,
    )
  })

  it('the Enter that selects in the grid does not reopen the panel', async () => {
    // VDatePicker's Enter calls preventDefault then closes (single mode); it then bubbles
    // to the root, where ArrowDown/Enter open. Without the composable's
    // `defaultPrevented` guard, the panel would reopen at once.
    const { container, getByRole } = mount({ modelValue: JUNE })
    await fireEvent.click(container.querySelector('.v-date-input-control') as HTMLElement)
    await nextTick()
    const grid = getByRole('grid')
    await fireEvent.keyDown(grid, { key: 'Enter', bubbles: true })
    await nextTick()
    expect(container.querySelector('.v-date-input-panel')?.hasAttribute('data-popover-open')).toBe(
      false,
    )
  })

  it('clears the value through the cross, without losing the opening icon', async () => {
    const { container, emitted } = mount({ modelValue: JUNE, clearable: true })
    const clearBtn = container.querySelector('button[aria-label="Clear date"]') as HTMLElement
    expect(clearBtn).toBeTruthy()
    // The field is readonly in this mode: the cross only survives there because
    // `clearVisible` is authoritative on the VInput side.
    expect((container.querySelector('input') as HTMLInputElement).readOnly).toBe(true)
    expect(container.querySelector('button[aria-label="Open calendar"]')).toBeTruthy()

    await fireEvent.click(clearBtn)
    expect(emitted('update:modelValue')?.at(-1)).toEqual([null])
    // The panel does not open on the refocus handed back to the field.
    expect(container.querySelector('.v-date-input-panel')?.hasAttribute('data-popover-open')).toBe(
      false,
    )
  })

  it('closes when focus leaves the component', async () => {
    const { container } = mount({ modelValue: JUNE })
    const root = container.querySelector('.v-date-input') as HTMLElement
    await fireEvent.click(container.querySelector('.v-date-input-control') as HTMLElement)
    await nextTick()
    expect(container.querySelector('.v-date-input-panel')?.hasAttribute('data-popover-open')).toBe(
      true,
    )
    root.dispatchEvent(new FocusEvent('focusout', { relatedTarget: null, bubbles: true }))
    await nextTick()
    expect(container.querySelector('.v-date-input-panel')?.hasAttribute('data-popover-open')).toBe(
      false,
    )
  })

  it('displays a formatted range (range selection)', () => {
    const { container } = mount({
      selection: 'range',
      modelValue: { start: '2026-06-19', end: '2026-06-26' },
    })
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.value).toContain('19')
    expect(input.value).toContain('26')
  })
})

describe('VDateInput — input mode', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  const mount = (props: Record<string, unknown> = {}) =>
    render(VDateInput, {
      props: { mode: 'input', locale: 'fr-FR', label: 'Date', ...props },
    })

  it("renders an editable field in the locale's numeric mask", () => {
    const { container } = mount({ modelValue: JUNE })
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.readOnly).toBe(false)
    expect(input.value).toBe('10/06/2026')
    expect(input.getAttribute('inputmode')).toBe('numeric')
    expect(input.getAttribute('autocomplete')).toBe('off')
    expect(input.getAttribute('placeholder')).toBe('jj/mm/aaaa')
  })

  it('places the separators as you type and only commits a complete date', async () => {
    const { container, emitted } = mount()
    const input = container.querySelector('input') as HTMLInputElement
    await type(input, '1')
    expect(input.value).toBe('1')
    await type(input, '10')
    expect(input.value).toBe('10/')
    await type(input, '10/06')
    expect(input.value).toBe('10/06/')
    expect(emitted('update:modelValue')).toBeUndefined()
    await type(input, '10/06/2026')
    expect(input.value).toBe('10/06/2026')
    expect(emitted('update:modelValue')?.at(-1)).toEqual([JUNE])
  })

  it('ignores rejected characters without the raw text reappearing', async () => {
    // The mask does not change → Vue re-patches nothing. Without the `v-model` on the
    // VInput (whose internal state would copy the raw text), the 9th digit and the letter
    // would reappear in the DOM on the next patch.
    const { container } = mount({ modelValue: JUNE })
    const input = container.querySelector('input') as HTMLInputElement
    await type(input, '10/06/20261')
    await nextTick()
    expect(input.value).toBe('10/06/2026')
    await type(input, '10/06/2026a')
    await nextTick()
    expect(input.value).toBe('10/06/2026')
  })

  it('silently reverts an impossible date on leaving the field', async () => {
    const { container, emitted } = mount({ modelValue: JUNE })
    const input = container.querySelector('input') as HTMLInputElement
    await type(input, '31/02/2026')
    await fireEvent.change(input)
    expect(emitted('update:modelValue')).toBeUndefined()
    expect(input.value).toBe('10/06/2026')
  })

  it('reverts an incomplete, out-of-bounds or disabled entry', async () => {
    const { container, emitted } = mount({
      modelValue: JUNE,
      min: '2026-06-01',
      max: '2026-06-30',
      disabledDates: ['2026-06-15'],
    })
    const input = container.querySelector('input') as HTMLInputElement

    await type(input, '10/06/20') // incomplet
    await fireEvent.change(input)
    expect(input.value).toBe('10/06/2026')

    await type(input, '10/07/2026') // beyond max
    await fireEvent.change(input)
    expect(input.value).toBe('10/06/2026')

    await type(input, '15/06/2026') // a disabled date
    await fireEvent.change(input)
    expect(input.value).toBe('10/06/2026')

    expect(emitted('update:modelValue')).toBeUndefined()
  })

  it('empties the value when the field is emptied', async () => {
    const { container, emitted } = mount({ modelValue: JUNE })
    const input = container.querySelector('input') as HTMLInputElement
    await type(input, '')
    await fireEvent.change(input)
    expect(emitted('update:modelValue')?.at(-1)).toEqual([null])
  })

  it('expands a 2-digit year on leaving the field, never while typing', async () => {
    const { container, emitted } = mount()
    const input = container.querySelector('input') as HTMLInputElement
    await type(input, '10/06/26')
    expect(emitted('update:modelValue')).toBeUndefined()
    await fireEvent.change(input)
    expect(emitted('update:modelValue')?.at(-1)).toEqual([JUNE])
    expect(input.value).toBe('10/06/2026')
  })

  it('Backspace on a separator erases the digit preceding it', async () => {
    const { container } = mount()
    const input = container.querySelector('input') as HTMLInputElement
    await type(input, '10')
    expect(input.value).toBe('10/')
    // the caret after the separator placed by the mask
    input.setSelectionRange(3, 3)
    await fireEvent.keyDown(input, { key: 'Backspace' })
    expect(input.value).toBe('1')
  })

  it('a typed separator completes the current field with a leading zero', async () => {
    const { container } = mount()
    const input = container.querySelector('input') as HTMLInputElement
    await type(input, '5')
    await fireEvent.keyDown(input, { key: '/' })
    expect(input.value).toBe('05/')
  })

  it('the down arrow moves the focus into the grid, without having stolen it on opening', async () => {
    const { container, getByRole } = mount({ modelValue: JUNE, showPicker: true })
    const input = container.querySelector('input') as HTMLInputElement
    await fireEvent.focus(input)
    await nextTick()
    // the panel opens but the caret stays in the field
    expect(container.querySelector('.v-date-input-panel')?.hasAttribute('data-popover-open')).toBe(
      true,
    )
    await fireEvent.keyDown(input, { key: 'ArrowDown', bubbles: true })
    await nextTick()
    expect(getByRole('grid').contains(document.activeElement)).toBe(true)
  })

  it('Escape closes without the focus handed back to the field reopening the panel', async () => {
    const { container } = mount({ modelValue: JUNE, showPicker: true })
    const input = container.querySelector('input') as HTMLInputElement
    await fireEvent.focus(input)
    await nextTick()
    await fireEvent.keyDown(input, { key: 'Escape', bubbles: true })
    await nextTick()
    expect(container.querySelector('.v-date-input-panel')?.hasAttribute('data-popover-open')).toBe(
      false,
    )
  })

  it('selecting a day closes the panel for good', async () => {
    const { container, emitted, getByRole } = mount({ modelValue: JUNE, showPicker: true })
    const input = container.querySelector('input') as HTMLInputElement
    await fireEvent.focus(input)
    await nextTick()
    const day15 = [...getByRole('grid').querySelectorAll('.v-date-picker-day')].find(
      (b) => b.textContent?.trim() === '15' && !b.hasAttribute('data-outside'),
    ) as HTMLElement
    await fireEvent.click(day15)
    await nextTick()
    expect(emitted('update:modelValue')?.at(-1)).toEqual(['2026-06-15'])
    expect(container.querySelector('.v-date-input-panel')?.hasAttribute('data-popover-open')).toBe(
      false,
    )
  })

  it('falls back to read-only (and warns) on a range or multiple selection', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { container } = mount({ selection: 'range', modelValue: { start: null, end: null } })
    expect((container.querySelector('input') as HTMLInputElement).readOnly).toBe(true)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('[VDateInput]'))
  })

  // "no calendar without showPicker" is the component's DEFAULT behaviour: that test
  // lives in the "default" describe.

  it('showPicker restores the icon and the opening on focus', async () => {
    const { container } = mount({ modelValue: JUNE, showPicker: true })
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.getAttribute('aria-haspopup')).toBe('dialog')
    await fireEvent.focus(input)
    await nextTick()
    expect(container.querySelector('.v-date-input-panel')?.hasAttribute('data-popover-open')).toBe(
      true,
    )
  })

  it('keeps the clear cross with no calendar', async () => {
    const { container, emitted } = mount({ modelValue: JUNE, clearable: true })
    const clearBtn = container.querySelector('button[aria-label="Clear date"]') as HTMLElement
    expect(clearBtn).toBeTruthy()
    await fireEvent.click(clearBtn)
    expect(emitted('update:modelValue')?.at(-1)).toEqual([null])
  })

  it('raises no warning when mounting an empty input field', () => {
    // `useIconClickHandlers` warns AT SETUP when a `@click:icon-end` is
    // attached without an `iconEndLabel` — even with no icon rendered. That is what
    // forces `endIconLabel` to stay defined at all times.
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mount()
    expect(warn).not.toHaveBeenCalled()
  })

  it('ignores displayFormat in input mode (and says so)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { container } = mount({
      modelValue: JUNE,
      displayFormat: { day: 'numeric', month: 'long', year: 'numeric' },
    })
    expect((container.querySelector('input') as HTMLInputElement).value).toBe('10/06/2026')
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('displayFormat'))
  })
})
