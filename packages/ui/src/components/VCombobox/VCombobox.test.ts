import { fireEvent, render } from '@testing-library/vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'

import VCombobox from './VCombobox.vue'
import type { ComboboxOption } from './VCombobox.vue'

// `Réunion` carries an accent on purpose: it is what the accent-insensitive
// filtering is asserted against, in both directions (accented query on an accented
// label, and the reverse).
const OPTIONS = [
  { value: 'fr', label: 'France' },
  { value: 'be', label: 'Belgium' },
  { value: 're', label: 'Réunion' },
  { value: 'mc', label: 'Monaco', disabled: true },
]

function renderCombobox(props: Record<string, unknown> = {}) {
  return render(VCombobox, {
    props: { options: OPTIONS, modelValue: '', ...props },
    attrs: { 'aria-label': 'Country' },
  })
}

describe('VCombobox', () => {
  it('ARIA contract: the combobox bound to the listbox, activedescendant while navigating', async () => {
    const { getByRole, container } = renderCombobox()
    const input = getByRole('combobox')
    const listbox = container.querySelector('[role="listbox"]') as HTMLElement
    expect(input.getAttribute('aria-controls')).toBe(listbox.id)
    expect(input.getAttribute('aria-expanded')).toBe('false')

    await fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(input.getAttribute('aria-expanded')).toBe('true')
    expect(input.getAttribute('aria-activedescendant')).toBe(
      container.querySelector('[role="option"][data-active]')?.id,
    )
  })

  it('filters regardless of accents', async () => {
    const { getByRole, container } = renderCombobox()
    const input = getByRole('combobox') as HTMLInputElement
    await fireEvent.update(input, 'reun')
    const options = [...container.querySelectorAll('[role="option"]')]
    expect(options.map((o) => o.textContent?.trim())).toEqual(['Réunion'])
  })

  it('single selection: Enter picks the active option and closes', async () => {
    const { getByRole, emitted } = renderCombobox()
    const input = getByRole('combobox') as HTMLInputElement
    await fireEvent.update(input, 'bel')
    await fireEvent.keyDown(input, { key: 'Enter' })
    expect(emitted('update:modelValue')).toEqual([['be']])
    expect(input.getAttribute('aria-expanded')).toBe('false')
    expect(input.value).toBe('Belgium')
  })

  it('single selection by click: the input displays the chosen label (parent v-model)', async () => {
    // With defineModel + a parent v-model, re-reading model.value just after writing it returns
    // the old value; the displayed label must come from the chosen option, not from a
    // re-derivation out of the model.
    const Harness = defineComponent({
      components: { VCombobox },
      setup: () => ({ options: OPTIONS, value: ref('') }),
      template: `<VCombobox :options="options" v-model="value" aria-label="Country" />
                 <output>{{ value }}</output>`,
    })
    const { getByRole, container } = render(Harness)
    const input = getByRole('combobox') as HTMLInputElement
    const optionByText = (text: string) =>
      [...container.querySelectorAll<HTMLElement>('[role="option"]')].find((o) =>
        o.textContent?.includes(text),
      )!

    await fireEvent.update(input, 'bel')
    await nextTick()
    await fireEvent.click(optionByText('Belgium'))
    await nextTick()
    expect(container.querySelector('output')?.textContent).toBe('be')
    expect(input.value).toBe('Belgium')

    // 2nd choice: reopen, search France, click → the input must not stay on "Belgium"
    await fireEvent.click(input)
    await fireEvent.update(input, 'France')
    await nextTick()
    await fireEvent.click(optionByText('France'))
    await nextTick()
    expect(container.querySelector('output')?.textContent).toBe('fr')
    expect(input.value).toBe('France')
  })

  it('keeps the filtered list while closing, and offers the whole list again on reopening', async () => {
    const { getByRole, container } = renderCombobox()
    const input = getByRole('combobox') as HTMLInputElement
    const labels = () =>
      [...container.querySelectorAll('[role="option"] .v-combobox-option-label')].map((o) =>
        o.textContent?.trim(),
      )

    await fireEvent.update(input, 'bel')
    await fireEvent.keyDown(input, { key: 'Enter' })
    expect(input.getAttribute('aria-expanded')).toBe('false')
    expect(labels()).toEqual(['Belgium'])

    await fireEvent.click(input)
    expect(labels()).toEqual(['France', 'Belgium', 'Réunion', 'Monaco'])

    await fireEvent.update(input, 'fra')
    await fireEvent.keyDown(input, { key: 'Escape' })
    expect(labels()).toEqual(['France'])
  })

  it('reopening in single mode does not filter on the chosen value (the full list, filtering on typing)', async () => {
    const { getByRole, container } = renderCombobox({ modelValue: 'fr' })
    const input = getByRole('combobox') as HTMLInputElement
    expect(input.value).toBe('France')
    const labels = () =>
      [...container.querySelectorAll('[role="option"] .v-combobox-option-label')].map((o) =>
        o.textContent?.trim(),
      )

    expect(labels()).toEqual(['France', 'Belgium', 'Réunion', 'Monaco'])

    await fireEvent.update(input, 'réun')
    expect(labels()).toEqual(['Réunion'])
  })

  it('Enter selects the single result (even after a filter with no result)', async () => {
    const { getByRole, emitted } = renderCombobox()
    const input = getByRole('combobox') as HTMLInputElement
    await fireEvent.update(input, 'zzz')
    await fireEvent.update(input, 'bel')
    await fireEvent.keyDown(input, { key: 'Enter' })
    expect(emitted('update:modelValue')?.at(-1)).toEqual(['be'])
  })

  it('the navigation skips disabled options', async () => {
    const { getByRole, container } = renderCombobox()
    const input = getByRole('combobox')
    await fireEvent.keyDown(input, { key: 'ArrowDown' })
    // One step up from the first: wraps around, skipping Monaco (disabled)
    await fireEvent.keyDown(input, { key: 'ArrowUp' })
    expect(container.querySelector('[data-active]')?.textContent).toContain('Réunion')
  })

  it('mousedown is cancelled on the panel: clicking an option does not steal the field focus', async () => {
    const { getByRole, container } = renderCombobox()
    await fireEvent.keyDown(getByRole('combobox'), { key: 'ArrowDown' })
    const option = container.querySelector('[role="option"]') as HTMLElement

    const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true })
    option.dispatchEvent(event)
    // Without it, the focusout would close the panel before @select was handled (a dead mouse
    // selection, invisible in jsdom)
    expect(event.defaultPrevented).toBe(true)
  })

  it('the panel has no keyboard handler at all: the field drives everything', async () => {
    const { getByRole, container } = renderCombobox()
    await fireEvent.keyDown(getByRole('combobox'), { key: 'ArrowDown' })
    const panel = container.querySelector('[role="listbox"]') as HTMLElement

    const before = document.activeElement
    panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }))
    // No option has taken the focus: it never leaves the input
    expect(document.activeElement).toBe(before)
  })

  it('a disabled option goes through aria-disabled, never through the native attribute', async () => {
    const { getByRole, container } = renderCombobox()
    await fireEvent.keyDown(getByRole('combobox'), { key: 'ArrowDown' })
    const options = [...container.querySelectorAll('[role="option"]')] as HTMLButtonElement[]
    const disabled = options.find((o) => o.textContent?.includes('Monaco'))!

    expect(disabled.getAttribute('aria-disabled')).toBe('true')
    // The option must stay in the a11y tree the field walks
    expect(disabled.disabled).toBe(false)
  })

  it('multiple: toggling values, removable tags, Backspace removes the last', async () => {
    const { getByRole, getAllByRole, emitted, rerender } = renderCombobox({
      multiple: true,
      modelValue: ['fr', 'be'],
    })
    expect(
      getAllByRole('button', { name: /Remove/ }).map((b) => b.getAttribute('aria-label')),
    ).toEqual(['Remove France', 'Remove Belgium'])

    await fireEvent.click(getAllByRole('button', { name: 'Remove France' })[0]!)
    expect(emitted('update:modelValue').at(-1)).toEqual([['be']])

    await rerender({ modelValue: ['be'] })
    await fireEvent.keyDown(getByRole('combobox'), { key: 'Backspace' })
    expect(emitted('update:modelValue').at(-1)).toEqual([[]])
  })

  it('numeric values: the single field shows the label, and Backspace removes the chip keyed 0', async () => {
    const numeric = [
      { value: 0, label: 'Zero' },
      { value: 7, label: 'Seven' },
    ]
    const single = renderCombobox({ options: numeric, modelValue: 7 })
    expect((single.getByRole('combobox') as HTMLInputElement).value).toBe('Seven')
    single.unmount()

    const { getByRole, emitted } = renderCombobox({
      options: numeric,
      multiple: true,
      modelValue: [7, 0],
    })
    await fireEvent.keyDown(getByRole('combobox'), { key: 'Backspace' })
    expect(emitted('update:modelValue').at(-1)).toEqual([[7]])
  })

  it("the cross (VInput's clearable) empties the value in single mode", async () => {
    const { getByRole, emitted } = renderCombobox({ modelValue: 'fr', clearable: true })
    const input = getByRole('combobox') as HTMLInputElement
    expect(input.value).toBe('France')
    await fireEvent.click(getByRole('button', { name: 'Clear selection' }))
    expect(emitted('update:modelValue').at(-1)).toEqual([''])
    expect(input.value).toBe('')
  })

  it('in multiple mode, the cross shows as soon as there are Chips and empties the whole selection', async () => {
    const { getByRole, emitted } = renderCombobox({
      multiple: true,
      modelValue: ['fr', 'be'],
      clearable: true,
    })
    // Visible without typing at all (there is a selection)
    await fireEvent.click(getByRole('button', { name: 'Clear selection' }))
    expect(emitted('update:modelValue').at(-1)).toEqual([[]])
  })

  it('no cross unless it was asked for, and never without a selection or a search', () => {
    const off = renderCombobox({ modelValue: 'fr' })
    expect(off.queryByRole('button', { name: 'Clear selection' })).toBeNull()
    const empty = renderCombobox({ clearable: true })
    expect(empty.queryByRole('button', { name: 'Clear selection' })).toBeNull()
    const emptyMulti = renderCombobox({ clearable: true, multiple: true, modelValue: [] })
    expect(emptyMulti.queryByRole('button', { name: 'Clear selection' })).toBeNull()
  })

  it('display="text": the labels joined by commas, no chip, and Backspace still takes the last back', async () => {
    const { container, getByRole, queryAllByRole, emitted, rerender } = renderCombobox({
      multiple: true,
      display: 'text',
      modelValue: ['fr', 're'],
    })
    expect(container.querySelector('.v-combobox-text')?.textContent).toBe('France, Réunion')
    expect(container.querySelector('.v-chip')).toBeNull()
    expect(queryAllByRole('button', { name: /Remove/ })).toHaveLength(0)
    // One line: the field does not take the arrangement that lets chips wrap
    expect(container.querySelector('.v-input-chips')).toBeNull()

    await fireEvent.keyDown(getByRole('combobox'), { key: 'Backspace' })
    expect(emitted('update:modelValue').at(-1)).toEqual([['fr']])

    await rerender({ modelValue: [] })
    expect(container.querySelector('.v-combobox-text')).toBeNull()
  })

  it('display="text" changes nothing for a single value', () => {
    const { container, getByRole } = renderCombobox({ display: 'text', modelValue: 'fr' })
    expect(container.querySelector('.v-combobox-text')).toBeNull()
    expect((getByRole('combobox') as HTMLInputElement).value).toBe('France')
  })

  it('display="text" read-only: the search input stays folded under the focus', async () => {
    const { container, getByRole } = renderCombobox({
      multiple: true,
      display: 'text',
      readonly: true,
      modelValue: ['fr'],
    })
    await fireEvent.focus(getByRole('combobox'))
    expect(container.querySelector('.v-combobox')?.hasAttribute('data-collapsed')).toBe(true)
  })

  describe('max', () => {
    const FIVE = ['fr', 'be', 're', 'mc', 'lu']
    const MANY = [...OPTIONS, { value: 'lu', label: 'Luxembourg' }]
    const chipLabels = (container: Element) =>
      [...container.querySelectorAll('.v-chip:not(.v-combobox-overflow-chip)')].map((c) =>
        c.textContent?.trim(),
      )

    it('folded, shows the first values and sums the rest up as a neutral +X chip', () => {
      const { container } = renderCombobox({
        options: MANY,
        multiple: true,
        max: 2,
        modelValue: FIVE,
      })
      expect(chipLabels(container)).toEqual(['France', 'Belgium'])
      const overflow = container.querySelector('.v-combobox-overflow-chip') as HTMLElement
      expect(overflow.textContent?.trim()).toBe('+3')
      expect(overflow.dataset.tone).toBe('neutral')
      expect(overflow.querySelector('.v-chip-dismiss')).toBeNull()
    })

    it('focused, every value comes back, and Backspace removes the last one', async () => {
      const { container, getByRole, emitted } = renderCombobox({
        options: MANY,
        multiple: true,
        max: 2,
        modelValue: FIVE,
      })
      await fireEvent.focus(getByRole('combobox'))
      expect(chipLabels(container)).toHaveLength(5)
      expect(container.querySelector('.v-combobox-overflow-chip')).toBeNull()

      await fireEvent.keyDown(getByRole('combobox'), { key: 'Backspace' })
      expect(emitted('update:modelValue').at(-1)).toEqual([['fr', 'be', 're', 'mc']])
    })

    it('0, or a max the selection does not reach, shows everything with no +X', () => {
      for (const max of [0, 5]) {
        const { container, unmount } = renderCombobox({
          options: MANY,
          multiple: true,
          max,
          modelValue: FIVE,
        })
        expect(chipLabels(container)).toHaveLength(5)
        expect(container.querySelector('.v-combobox-overflow-chip')).toBeNull()
        unmount()
      }
    })

    it('overflowText rephrases the count, in both displays', () => {
      const overflowText = (count: number) => `+${count} countries`
      const chips = renderCombobox({
        options: MANY,
        multiple: true,
        max: 1,
        overflowText,
        modelValue: FIVE,
      })
      expect(chips.container.querySelector('.v-combobox-overflow-chip')?.textContent?.trim()).toBe(
        '+4 countries',
      )
      chips.unmount()

      const { container } = renderCombobox({
        options: MANY,
        multiple: true,
        display: 'text',
        max: 1,
        overflowText,
        modelValue: FIVE,
      })
      // The count sits beside the line, never inside what the ellipsis cuts
      expect(container.querySelector('.v-combobox-text')?.textContent).toBe('France')
      expect(container.querySelector('.v-combobox-overflow')?.textContent?.trim()).toBe(
        '+4 countries',
      )
    })

    it('the #overflow slot replaces the +X and receives the count and the chip scale', () => {
      const { container } = render(VCombobox, {
        props: { options: MANY, multiple: true, max: 3, size: 'lg', modelValue: FIVE },
        attrs: { 'aria-label': 'Country' },
        slots: {
          overflow: ({ count, size, compact }: { count: number; size: string; compact: boolean }) =>
            h('output', { class: 'custom' }, `${count} ${size} ${compact}`),
        },
      })
      expect(container.querySelector('.custom')?.textContent).toBe('2 sm false')
      expect(container.querySelector('.v-combobox-overflow-chip')).toBeNull()
    })

    it('changes nothing without multiple', () => {
      const { container, getByRole } = renderCombobox({ max: 1, modelValue: 'fr' })
      expect((getByRole('combobox') as HTMLInputElement).value).toBe('France')
      expect(container.querySelector('.v-combobox-overflow, .v-combobox-overflow-chip')).toBeNull()
    })
  })

  it('the chevron closes an open panel, and keeps the focus in the field while doing so', async () => {
    const { container, getByRole } = renderCombobox()
    const input = getByRole('combobox')
    const chevron = container.querySelector('.v-combobox-chevron') as HTMLElement
    const field = container.querySelector('.v-input-field') as HTMLElement
    const pressed = (el: Element) =>
      el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }))

    await fireEvent.click(chevron)
    expect(input.getAttribute('aria-expanded')).toBe('true')

    // The press is cancelled, or the focus would leave the field and the root's focusout would
    // close the panel before the click reopened it
    expect(pressed(chevron)).toBe(false)
    await fireEvent.click(chevron)
    expect(input.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(input)

    await fireEvent.click(chevron)
    await fireEvent.click(field)
    expect(input.getAttribute('aria-expanded')).toBe('true')
    expect(pressed(field)).toBe(true)
  })

  it('displays a tick on the right of the selected option', () => {
    const { container } = renderCombobox({ multiple: true, modelValue: ['fr'] })
    const optionByText = (text: string) =>
      [...container.querySelectorAll<HTMLElement>('[role="option"]')].find((o) =>
        o.textContent?.includes(text),
      )
    expect(optionByText('France')?.querySelector('.v-combobox-option-check')).toBeTruthy()
    expect(optionByText('Belgium')?.querySelector('.v-combobox-option-check')).toBeFalsy()
  })
})

describe('VCombobox grouped', () => {
  const GROUPS = [
    {
      label: 'Europe',
      options: [
        { value: 'fr', label: 'France' },
        { value: 'be', label: 'Belgium' },
      ],
    },
    { separator: true as const },
    {
      label: 'Africa',
      options: [
        { value: 're', label: 'Réunion' },
        { value: 'ma', label: 'Morocco', disabled: true },
      ],
    },
    { separator: true as const },
    { value: 'jp', label: 'Japan' },
  ]

  const renderGroup = (props: Record<string, unknown> = {}) =>
    render(VCombobox, {
      props: { options: GROUPS, modelValue: '', ...props },
      attrs: { 'aria-label': 'Country' },
    })

  const labels = (container: Element) =>
    [...container.querySelectorAll('[role="option"] .v-combobox-option-label')].map((o) =>
      o.textContent?.trim(),
    )

  it('renders a role="group" named by its label, without breaking the option order', async () => {
    const { getByRole, container } = renderGroup()
    await fireEvent.keyDown(getByRole('combobox'), { key: 'ArrowDown' })
    // Aria-labelledby resolved: the group does carry its accessible name
    expect(getByRole('group', { name: 'Europe' })).toBeTruthy()
    expect(getByRole('group', { name: 'Africa' })).toBeTruthy()
    expect(labels(container)).toEqual(['France', 'Belgium', 'Réunion', 'Morocco', 'Japan'])
  })

  it('the keyboard navigation crosses the groups without stopping on a label', async () => {
    const { getByRole, container } = renderGroup()
    const input = getByRole('combobox')
    const active = () => container.querySelector('[data-active]')?.textContent?.trim()

    await fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(active()).toBe('France')
    await fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(active()).toBe('Belgium')
    await fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(active()).toBe('Réunion')
    // Morocco is disabled: skipped, like a disabled option outside a group
    await fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(active()).toBe('Japan')
    // Aria-activedescendant always designates a real role="option"
    expect(input.getAttribute('aria-activedescendant')).toBe(
      container.querySelector('[role="option"][data-active]')?.id,
    )
  })

  it('a group emptied by the filter disappears, label included', async () => {
    const { getByRole, queryByRole, container } = renderGroup()
    await fireEvent.update(getByRole('combobox') as HTMLInputElement, 'réun')
    expect(labels(container)).toEqual(['Réunion'])
    expect(queryByRole('group', { name: 'Europe' })).toBeNull()
    expect(queryByRole('group', { name: 'Africa' })).toBeTruthy()
  })

  it('orphaned separators are not rendered (head, tail, consecutive)', async () => {
    const { getByRole, container } = renderGroup()
    const separators = () => container.querySelectorAll('.v-combobox-separator').length
    const panel = () => container.querySelector('[role="listbox"]')!
    expect(separators()).toBe(2)

    await fireEvent.update(getByRole('combobox') as HTMLInputElement, 'japan')
    expect(separators()).toBe(0)

    // "France" + "Réunion" + "Japan": the rules survive between the blocks, and
    // neither sits at the head nor at the tail of the panel
    await fireEvent.update(getByRole('combobox') as HTMLInputElement, 'n')
    expect(labels(container)).toEqual(['France', 'Réunion', 'Japan'])
    expect(separators()).toBe(2)
    expect(panel().firstElementChild?.classList.contains('v-combobox-separator')).toBe(false)
    expect(panel().lastElementChild?.classList.contains('v-combobox-separator')).toBe(false)
  })

  it('a group option is selected and feeds the Chips like a bare option', async () => {
    const { emitted, container } = renderGroup({ multiple: true, modelValue: [] })
    const option = [...container.querySelectorAll<HTMLElement>('[role="option"]')].find((o) =>
      o.textContent?.includes('Réunion'),
    )!
    await fireEvent.click(option)
    expect(emitted('update:modelValue').at(-1)).toEqual([['re']])

    const second = renderGroup({ multiple: true, modelValue: ['re'] })
    expect(
      [...second.container.querySelectorAll('.v-chip [aria-label]')].map((b) =>
        b.getAttribute('aria-label'),
      ),
    ).toEqual(['Remove Réunion'])
  })
})

describe('VCombobox asynchronous', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  const labels = (container: Element) =>
    [...container.querySelectorAll('[role="option"] .v-combobox-option-label')].map((o) =>
      o.textContent?.trim(),
    )

  it('filter=false: typing no longer filters (the source has already filtered)', async () => {
    const { getByRole, container } = renderCombobox({ filter: false, searchDebounce: 0 })
    await fireEvent.update(getByRole('combobox'), 'zzz')
    expect(labels(container)).toEqual(['France', 'Belgium', 'Réunion', 'Monaco'])
  })

  it('filter=false: Enter selects the active option of the unfiltered list', async () => {
    const { getByRole, emitted } = renderCombobox({ filter: false, searchDebounce: 0 })
    const input = getByRole('combobox')
    await fireEvent.update(input, 'zzz')
    await fireEvent.keyDown(input, { key: 'Enter' })
    expect(emitted('update:modelValue').at(-1)).toEqual(['fr'])
  })

  it('a filter function: it receives the raw trimmed query, and its result applies', async () => {
    const seen: string[] = []
    const { getByRole, container, emitted } = renderCombobox({
      searchDebounce: 0,
      filter: (option: ComboboxOption, query: string) => {
        seen.push(query)
        return String(option.value).startsWith(query)
      },
    })
    await fireEvent.update(getByRole('combobox'), '  fr  ')
    expect(seen).toContain('fr')
    expect(labels(container)).toEqual(['France'])
    expect(emitted('search').at(-1)).toEqual(['fr'])
  })

  it('search: emitted on typing, with the term trimmed', async () => {
    const { getByRole, emitted } = renderCombobox({ searchDebounce: 0 })
    await fireEvent.update(getByRole('combobox'), 'reun ')
    expect(emitted('search')).toEqual([['reun']])
  })

  it('search: emitted immediately on opening (the first load)', async () => {
    const { getByRole, emitted } = renderCombobox()
    await fireEvent.keyDown(getByRole('combobox'), { key: 'ArrowDown' })
    expect(emitted('search')).toEqual([['']])
  })

  it('search: debounced (a single request for a burst of keystrokes)', async () => {
    vi.useFakeTimers()
    const { getByRole, emitted } = renderCombobox({ searchDebounce: 250 })
    const input = getByRole('combobox')
    await fireEvent.keyDown(input, { key: 'ArrowDown' })
    await fireEvent.update(input, 'r')
    await fireEvent.update(input, 're')
    await fireEvent.update(input, 'reu')
    expect(emitted('search')).toEqual([['']])

    vi.advanceTimersByTime(250)
    expect(emitted('search')).toEqual([[''], ['reu']])
  })

  it('search: no stray request after a single selection', async () => {
    vi.useFakeTimers()
    const { getByRole, emitted } = renderCombobox({ searchDebounce: 250 })
    const input = getByRole('combobox')
    await fireEvent.update(input, 'bel')
    await fireEvent.keyDown(input, { key: 'Enter' })
    // The timer armed by the keystroke must not fire after the close
    vi.advanceTimersByTime(1000)
    expect(emitted('search')).toEqual([['bel']])
  })

  it('search: no stray request after Escape', async () => {
    vi.useFakeTimers()
    const { getByRole, emitted } = renderCombobox({ searchDebounce: 250 })
    const input = getByRole('combobox')
    await fireEvent.keyDown(input, { key: 'ArrowDown' })
    await fireEvent.update(input, 'bel')
    await fireEvent.keyDown(input, { key: 'Escape' })
    vi.advanceTimersByTime(1000)
    expect(emitted('search')).toEqual([['']])
  })

  it('search: in multiple mode, selecting resets the list (panel open)', async () => {
    const { getByRole, emitted } = renderCombobox({ multiple: true, searchDebounce: 0 })
    const input = getByRole('combobox')
    await fireEvent.update(input, 'bel')
    await fireEvent.keyDown(input, { key: 'Enter' })
    expect(emitted('search')).toEqual([['bel'], ['']])
  })

  it('search: the same term is not re-emitted (reopening does not relaunch it)', async () => {
    const { getByRole, emitted } = renderCombobox({ searchDebounce: 0 })
    const input = getByRole('combobox')
    await fireEvent.keyDown(input, { key: 'ArrowDown' })
    await fireEvent.keyDown(input, { key: 'Escape' })
    await fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(emitted('search')).toEqual([['']])
  })

  it('search: nothing when the component is disabled', async () => {
    const { getByRole, emitted } = renderCombobox({ disabled: true, searchDebounce: 0 })
    await fireEvent.keyDown(getByRole('combobox'), { key: 'ArrowDown' })
    expect(emitted('search')).toBeUndefined()
  })

  it('the label of a chosen value survives the options being renewed (single)', async () => {
    const { getByRole, rerender } = renderCombobox({ modelValue: 'fr' })
    const input = getByRole('combobox') as HTMLInputElement
    expect(input.value).toBe('France')
    await rerender({ options: [{ value: 'be', label: 'Belgium' }] })
    expect(input.value).toBe('France')
  })

  it('the label of a chosen value survives the options being renewed (multiple)', async () => {
    const { getAllByRole, container, rerender } = renderCombobox({
      multiple: true,
      modelValue: ['fr'],
    })
    await rerender({ options: [{ value: 'be', label: 'Belgium' }] })
    expect(
      getAllByRole('button', { name: /Remove/ }).map((b) => b.getAttribute('aria-label')),
    ).toEqual(['Remove France'])
    expect(container.querySelector('.v-chip')?.textContent).toContain('France')
  })

  it('the field displays the label as soon as the options arrive (mounted with none)', async () => {
    const { getByRole, rerender } = renderCombobox({ options: [], modelValue: 'fr' })
    const input = getByRole('combobox') as HTMLInputElement
    // With no options, the raw value is the only possible fallback
    expect(input.value).toBe('fr')
    await rerender({ options: OPTIONS })
    expect(input.value).toBe('France')
  })

  it('loading with no option: a loading state, never "no results"', () => {
    const { container } = renderCombobox({ options: [], loading: true })
    const state = container.querySelector('.v-combobox-state')
    expect(state?.textContent).toContain('Loading…')
    expect(state?.textContent).not.toContain('No results')
  })

  it('no option: a small VEmptyState titled with emptyText', () => {
    const { container } = renderCombobox({ options: [], emptyText: 'No country found' })
    const empty = container.querySelector('.v-combobox-state .v-empty-state')
    expect(empty?.getAttribute('data-size')).toBe('sm')
    expect(empty?.querySelector('.v-empty-state-title')?.textContent).toBe('No country found')
    expect(empty?.querySelector('.v-empty-state-icon')).toBeTruthy()
  })

  it('loading with options: the options stay displayed', () => {
    const { container } = renderCombobox({ loading: true })
    expect(container.querySelectorAll('[role="option"]').length).toBe(4)
    expect(container.querySelector('.v-combobox-state')).toBeNull()
  })

  it('loading: the field swaps its chevron for a decorative spinner', () => {
    const { container } = renderCombobox({ loading: true })
    expect(container.querySelector('.v-combobox-chevron')).toBeNull()
    const spinner = container.querySelector('.v-input-field > .v-spinner')
    // Decorative: its role="status" must not double the panel's announcement
    expect(spinner?.getAttribute('aria-hidden')).toBe('true')
  })

  it('sizes: the Chips stay one step below the field, and the panel follows its size', async () => {
    // A single mapping (in the script) which the CSS `--chip-height` must mirror: xs up
    // to md, sm at lg; the step below goes through `compact`.
    const { container, rerender } = renderCombobox({ multiple: true, modelValue: ['fr'] })
    const chip = () => container.querySelector('.v-chip') as HTMLElement
    const panel = () => container.querySelector('[role="listbox"]') as HTMLElement

    expect(chip().getAttribute('data-size')).toBe('xs')
    expect(chip().hasAttribute('data-compact')).toBe(false)

    await rerender({ size: 'sm' })
    expect(chip().getAttribute('data-size')).toBe('xs')
    expect(chip().hasAttribute('data-compact')).toBe(true)

    await rerender({ size: 'lg', compact: false })
    expect(chip().getAttribute('data-size')).toBe('sm')
    expect(chip().hasAttribute('data-compact')).toBe(false)
    expect(panel().getAttribute('data-size')).toBe('lg')

    await rerender({ size: 'lg', compact: true })
    expect(chip().getAttribute('data-size')).toBe('sm')
    expect(chip().hasAttribute('data-compact')).toBe(true)
    expect(container.querySelector('.v-combobox')?.hasAttribute('data-compact')).toBe(true)
  })

  it('hasMore: a sentinel closes the list (infinite-scroll support)', () => {
    const { container } = renderCombobox({ hasMore: true })
    const listbox = container.querySelector('[role="listbox"]') as HTMLElement
    expect(listbox.lastElementChild?.className).toContain('v-combobox-more')
    expect(renderCombobox().container.querySelector('.v-combobox-more')).toBeNull()
  })

  it("the #option slot: custom content, with the option's state", async () => {
    const { getByRole, container } = render(VCombobox, {
      props: { options: OPTIONS, modelValue: '' },
      attrs: { 'aria-label': 'Country' },
      slots: {
        option: (slotProps: { option: ComboboxOption; active: boolean; index: number }) =>
          h(
            'span',
            { class: 'v-test-option' },
            `${slotProps.index}:${slotProps.option.label}${slotProps.active ? '*' : ''}`,
          ),
      },
    })
    await fireEvent.keyDown(getByRole('combobox'), { key: 'ArrowDown' })
    expect([...container.querySelectorAll('.v-test-option')].map((o) => o.textContent)).toEqual([
      '0:France*',
      '1:Belgium',
      '2:Réunion',
      '3:Monaco',
    ])
  })

  it('the #empty and #loading slots: they replace the default contents', async () => {
    const { getByRole, container } = render(VCombobox, {
      props: { options: OPTIONS, modelValue: '', searchDebounce: 0 },
      attrs: { 'aria-label': 'Country' },
      slots: {
        empty: (slotProps: { query: string }) =>
          h('span', { class: 'v-test-empty' }, `create "${slotProps.query}"`),
      },
    })
    await fireEvent.update(getByRole('combobox'), 'zzz')
    expect(container.querySelector('.v-test-empty')?.textContent).toBe('create "zzz"')

    const loadingRender = render(VCombobox, {
      props: { options: [], modelValue: '', loading: true },
      attrs: { 'aria-label': 'Country' },
      slots: { loading: () => h('span', { class: 'v-test-loading' }, 'please wait') },
    })
    expect(loadingRender.container.querySelector('.v-test-loading')?.textContent).toBe(
      'please wait',
    )
  })

  it('option.icon renders an icon in the row, and its absence renders none', async () => {
    const { getByRole, container } = renderCombobox({
      options: [
        { value: 'fr', label: 'France', icon: 'flag' },
        { value: 'be', label: 'Belgium' },
      ],
    })
    await fireEvent.keyDown(getByRole('combobox'), { key: 'ArrowDown' })
    const [withIcon, withoutIcon] = [...container.querySelectorAll('[role="option"]')] as [
      HTMLElement,
      HTMLElement,
    ]
    expect(withIcon.querySelector('.v-icon-symbol')?.textContent).toBe('flag')
    expect(withIcon.firstElementChild?.classList.contains('v-combobox-option-label')).toBe(false)
    expect(withoutIcon.querySelector('.v-icon-symbol')).toBeNull()
    expect(withoutIcon.firstElementChild?.classList.contains('v-combobox-option-label')).toBe(true)
  })

  it('the #chip slot: it replaces the default VChip, and `remove` removes the value', async () => {
    const { getByRole, container, emitted } = render(VCombobox, {
      props: { options: OPTIONS, modelValue: ['fr'], multiple: true },
      attrs: { 'aria-label': 'Country' },
      slots: {
        chip: (slotProps: {
          value: string
          option: ComboboxOption | undefined
          label: string
          remove: () => void
          size: string
          compact: boolean
        }) =>
          h(
            'button',
            { class: 'v-test-chip', onClick: slotProps.remove },
            `${slotProps.label}/${slotProps.option?.icon ?? '—'}/${slotProps.size}`,
          ),
      },
    })
    expect(container.querySelector('.v-chip')).toBeNull()
    const chip = container.querySelector('.v-test-chip') as HTMLElement
    expect(chip.textContent).toBe('France/—/xs')

    await fireEvent.click(chip)
    expect(emitted('update:modelValue').at(-1)).toEqual([[]])
    expect(getByRole('combobox')).toBeTruthy()
  })

  it('the #chip slot keeps the option when it leaves the received options (async source)', async () => {
    const { container, rerender } = render(VCombobox, {
      props: {
        options: [{ value: 'fr', label: 'France', icon: 'flag' }],
        modelValue: ['fr'],
        multiple: true,
      },
      attrs: { 'aria-label': 'Country' },
      slots: {
        chip: (slotProps: { option: ComboboxOption | undefined; label: string }) =>
          h('span', { class: 'v-test-chip' }, `${slotProps.label}/${slotProps.option?.icon}`),
      },
    })
    expect(container.querySelector('.v-test-chip')?.textContent).toBe('France/flag')

    await rerender({ options: [] })
    expect(container.querySelector('.v-test-chip')?.textContent).toBe('France/flag')
  })

  it('label and hint: rendered by the field and linked to it', () => {
    const { getByText, getByRole } = render(VCombobox, {
      props: { options: OPTIONS, modelValue: '', label: 'Country', hint: 'Pick one' },
    })
    const input = getByRole('combobox')
    expect(getByText('Country').getAttribute('for')).toBe(input.id)
    expect(input.getAttribute('aria-describedby')).toBe(getByText('Pick one').id)
  })

  it('iconStart is rendered beside the chips, not in their place', () => {
    const { container } = renderCombobox({
      multiple: true,
      modelValue: ['fr'],
      iconStart: 'search',
    })
    expect(container.querySelector('.v-input-field > .v-icon')).not.toBeNull()
    expect(container.querySelector('.v-chip')).not.toBeNull()
  })

  it('clearLabel names the cross, the dictionary otherwise', () => {
    const { getByRole } = renderCombobox({
      modelValue: 'fr',
      clearable: true,
      clearLabel: 'Empty the country',
    })
    expect(getByRole('button', { name: 'Empty the country' })).toBeTruthy()
  })

  it('readonly: the native attribute is set and the list never opens', async () => {
    const { getByRole, container } = renderCombobox({ readonly: true })
    const input = getByRole('combobox')
    expect(input.hasAttribute('readonly')).toBe(true)

    await fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(input.getAttribute('aria-expanded')).toBe('false')
    await fireEvent.click(container.querySelector('.v-combobox-control') as HTMLElement)
    expect(input.getAttribute('aria-expanded')).toBe('false')
  })

  it('readonly: no clear cross, and the chips lose theirs', () => {
    const { container, queryByRole } = renderCombobox({
      multiple: true,
      modelValue: ['fr', 'be'],
      clearable: true,
      readonly: true,
    })
    expect(container.querySelectorAll('.v-chip')).toHaveLength(2)
    expect(queryByRole('button')).toBeNull()
  })

  // The VFileInput rule: a disabled field offers no removal at all, rather than a row of
  // greyed crosses that suggest one.
  it('disabled: the chips render no dismiss cross', () => {
    const { container } = renderCombobox({
      multiple: true,
      modelValue: ['fr', 'be'],
      disabled: true,
    })
    expect(container.querySelectorAll('.v-chip')).toHaveLength(2)
    expect(container.querySelector('.v-chip button')).toBeNull()
  })

  it('two options sharing a value keep distinct ids and a single active row', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { getByRole, container } = renderCombobox({
      options: [
        { value: 1, label: 'One (number)' },
        { value: '1', label: 'One (string)' },
        { value: 'x', label: 'Ex' },
        { value: 'x', label: 'Ex again' },
      ],
    })
    const input = getByRole('combobox')
    await fireEvent.keyDown(input, { key: 'ArrowDown' })
    const options = [...container.querySelectorAll('[role="option"]')]
    expect(options).toHaveLength(4)
    expect(new Set(options.map((o) => o.id)).size).toBe(4)
    expect(container.querySelectorAll('[role="option"][data-active]')).toHaveLength(1)
    await fireEvent.keyDown(input, { key: 'End' })
    expect(container.querySelectorAll('[role="option"][data-active]')).toHaveLength(1)
    expect(warn).not.toHaveBeenCalledWith(expect.stringContaining('Duplicate keys'), ...[])
    warn.mockRestore()
  })

  it('readonly: Backspace no longer takes the last chip back', async () => {
    const { getByRole, emitted } = renderCombobox({
      multiple: true,
      modelValue: ['fr', 'be'],
      readonly: true,
    })
    await fireEvent.keyDown(getByRole('combobox'), { key: 'Backspace' })
    expect(emitted('update:modelValue')).toBeUndefined()
  })

  it('declares clear and click:icon-start, rather than letting them slip through the attrs', async () => {
    const { getByRole, emitted } = renderCombobox({ modelValue: 'fr', clearable: true })
    await fireEvent.click(getByRole('button', { name: /clear/i }))
    expect(emitted('clear')).toHaveLength(1)
  })

  it('the start icon stays decoration until a listener is attached', async () => {
    const decorative = renderCombobox({ iconStart: 'search', iconStartLabel: 'Search' })
    expect(decorative.queryByRole('button', { name: 'Search' })).toBeNull()
    decorative.unmount()

    const { getByRole, emitted } = render(VCombobox, {
      props: { options: OPTIONS, modelValue: '', iconStart: 'search', iconStartLabel: 'Search' },
      attrs: { 'aria-label': 'Country', 'onClick:icon-start': () => {} },
    })
    await fireEvent.click(getByRole('button', { name: 'Search' }))
    expect(emitted('click:icon-start')).toHaveLength(1)
  })

  it('expandIcon replaces the chevron, which stays out of the accessibility tree', () => {
    const { container } = renderCombobox({ expandIcon: 'unfold_more' })
    const chevron = container.querySelector('.v-combobox-chevron') as HTMLElement
    expect(chevron.dataset.icon).toBe('unfold_more')
    expect(chevron.getAttribute('aria-hidden')).toBe('true')
  })

  it('hideExpandIcon leaves the chevron out, but not the loading spinner', async () => {
    const { container, rerender } = renderCombobox({ hideExpandIcon: true })
    const field = container.querySelector('.v-input-field')!
    expect(container.querySelector('.v-combobox-chevron')).toBeNull()
    expect(field.querySelector(':scope > .v-input-icon-end')).toBeNull()
    await rerender({ hideExpandIcon: true, loading: true })
    expect(field.querySelector(':scope > .v-combobox-spinner')).not.toBeNull()
  })

  it('exposes focus, select and the real input', async () => {
    const field = ref<InstanceType<typeof VCombobox> | null>(null)
    const container = document.createElement('div')
    document.body.appendChild(container)
    render(
      {
        components: { VCombobox },
        setup: () => ({ field, options: OPTIONS }),
        template:
          '<VCombobox ref="field" :options="options" model-value="" aria-label="Country" />',
      },
      { container },
    )
    await nextTick()
    field.value?.focus()
    expect(document.activeElement).toBe(field.value?.el)
    expect(field.value?.el?.tagName).toBe('INPUT')
  })
})

describe('VCombobox state kept in step', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  const keydown = (el: Element, key: string) => {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
    el.dispatchEvent(event)
    return event
  }

  // In single mode the field shows a COPY of the label. A value the parent sets or resets
  // after mount (an edit form loading its record, a form reset) must reach that copy.
  it('single mode: the field follows a value the parent changes', async () => {
    const { getByRole, rerender } = renderCombobox({ modelValue: 'fr' })
    const input = getByRole('combobox') as HTMLInputElement
    expect(input.value).toBe('France')
    await rerender({ modelValue: 'be' })
    await nextTick()
    expect(input.value).toBe('Belgium')
    await rerender({ modelValue: '' })
    await nextTick()
    expect(input.value).toBe('')
  })

  it('single mode: a value loaded after mount is labelled', async () => {
    const { getByRole, rerender } = renderCombobox({ modelValue: '' })
    await rerender({ modelValue: 're' })
    await nextTick()
    expect((getByRole('combobox') as HTMLInputElement).value).toBe('Réunion')
  })

  it('Escape cancels its default only when it closes the list', async () => {
    const { getByRole } = renderCombobox()
    const input = getByRole('combobox')
    await fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(keydown(input, 'Escape').defaultPrevented).toBe(true)
    await nextTick()
    expect(input.getAttribute('aria-expanded')).toBe('false')
    expect(keydown(input, 'Escape').defaultPrevented).toBe(false)
  })

  // The cross empties the selection while the list stays open: a highlight must survive,
  // or Enter does nothing and the reader is left with no current option.
  it('clearing with the list open keeps an option highlighted', async () => {
    const { getByRole, container } = renderCombobox({
      multiple: true,
      modelValue: ['be'],
      clearable: true,
      options: [
        { value: 'a', label: 'Alpha' },
        { value: 'b', label: 'Bravo' },
        { value: 'c', label: 'Charlie' },
      ],
    })
    const input = getByRole('combobox')
    await fireEvent.keyDown(input, { key: 'ArrowDown' })
    await fireEvent.click(container.querySelector('.v-input-clear') as HTMLElement)
    await nextTick()
    const active = () => container.querySelector('[role="option"][data-active]')?.textContent
    expect(input.getAttribute('aria-activedescendant')).toBeTruthy()
    await fireEvent.keyDown(input, { key: 'ArrowUp' })
    expect(active()).toContain('Charlie')
  })

  it('readonly set while the list is open closes it and refuses the selection', async () => {
    const { getByRole, rerender, emitted } = renderCombobox()
    const input = getByRole('combobox')
    await fireEvent.keyDown(input, { key: 'ArrowDown' })
    await rerender({ readonly: true })
    await nextTick()
    expect(input.getAttribute('aria-expanded')).toBe('false')
    await fireEvent.keyDown(input, { key: 'Enter' })
    expect(emitted('update:modelValue')).toBeUndefined()
  })

  // A screen reader announces the current option when aria-activedescendant CHANGES. An
  // id taken from the position in the filtered list keeps the same value while the filter
  // swaps the option under it, and the new option goes unannounced.
  it('narrowing the list to another option changes the active descendant', async () => {
    const { getByRole } = renderCombobox()
    const input = getByRole('combobox')
    await fireEvent.update(input, 'r')
    const before = input.getAttribute('aria-activedescendant')
    await fireEvent.update(input, 'reu')
    expect(input.getAttribute('aria-activedescendant')).not.toBe(before)
  })

  describe('paging', () => {
    /** Stubs the observer and hands back a function that reports the sentinel as crossed. */
    function stubObserver() {
      let notify: ((entries: Partial<IntersectionObserverEntry>[]) => void) | undefined
      vi.stubGlobal(
        'IntersectionObserver',
        class {
          constructor(callback: (entries: Partial<IntersectionObserverEntry>[]) => void) {
            notify = callback
          }
          observe() {}
          unobserve() {}
          disconnect() {}
        },
      )
      return () => notify?.([{ isIntersecting: true }])
    }

    const page = (prefix: string) =>
      Array.from({ length: 3 }, (_, i) => ({ value: `${prefix}${i}`, label: `${prefix} ${i}` }))

    // A new search replaces the list, so a page asked for under the old term will never
    // arrive; a first page of the new term that happens to be as long as the old list
    // must not leave the paging frozen.
    it('a new search releases the lock, even when its page has the same length', async () => {
      const cross = stubObserver()
      const { getByRole, rerender, emitted } = renderCombobox({
        options: page('a'),
        hasMore: true,
        filter: false,
        searchDebounce: 0,
      })
      const input = getByRole('combobox')
      await fireEvent.keyDown(input, { key: 'ArrowDown' })
      await nextTick()
      cross()
      expect(emitted('load-more')).toHaveLength(1)
      await fireEvent.update(input, 'b')
      await rerender({ options: page('b') })
      await nextTick()
      cross()
      expect(emitted('load-more')).toHaveLength(2)
    })

    it('choosing an option while a page is pending releases the lock', async () => {
      const cross = stubObserver()
      const { getByRole, emitted } = renderCombobox({ options: page('a'), hasMore: true })
      const input = getByRole('combobox')
      await fireEvent.keyDown(input, { key: 'ArrowDown' })
      await nextTick()
      cross()
      await fireEvent.keyDown(input, { key: 'Enter' })
      await fireEvent.keyDown(input, { key: 'ArrowDown' })
      await nextTick()
      cross()
      expect(emitted('load-more')).toHaveLength(2)
    })
  })
})

describe('VCombobox virtual', () => {
  const MANY = Array.from({ length: 1000 }, (_, i) => ({ value: i, label: `Option ${i + 1}` }))

  // jsdom lays nothing out: the panel has no height, so the window holds the first row and the
  // five rows of margin below it.
  it('renders only the rows of the window, the rest as one hidden spacer', async () => {
    const { getByRole, container } = renderCombobox({ options: MANY, virtual: true })
    await fireEvent.keyDown(getByRole('combobox'), { key: 'ArrowDown' })
    const listbox = container.querySelector('[role="listbox"]')!
    expect(listbox.querySelectorAll('[role="option"]')).toHaveLength(6)
    const spacer = listbox.querySelector<HTMLElement>('.v-combobox-spacer')!
    expect(spacer.getAttribute('aria-hidden')).toBe('true')
    expect(parseFloat(spacer.style.blockSize)).toBeGreaterThan(30000)
  })

  it('each option says where it stands in the list', async () => {
    const { getByRole, container } = renderCombobox({ options: MANY, virtual: true })
    await fireEvent.keyDown(getByRole('combobox'), { key: 'ArrowDown' })
    const option = container.querySelectorAll('[role="option"]')[1]!
    expect(option.getAttribute('aria-setsize')).toBe('1000')
    expect(option.getAttribute('aria-posinset')).toBe('2')
  })

  it('the total is unknown while more pages may come', async () => {
    const { getByRole, container } = renderCombobox({ options: MANY, virtual: true, hasMore: true })
    await fireEvent.keyDown(getByRole('combobox'), { key: 'ArrowDown' })
    expect(container.querySelector('[role="option"]')!.getAttribute('aria-setsize')).toBe('-1')
  })

  it('keeps the highlighted option rendered, so aria-activedescendant names an element', async () => {
    const { getByRole } = renderCombobox({ options: MANY, virtual: true })
    const input = getByRole('combobox')
    await fireEvent.keyDown(input, { key: 'ArrowDown' })
    // From the first option, ArrowUp wraps to the last one, far outside the window.
    await fireEvent.keyDown(input, { key: 'ArrowUp' })
    await nextTick()
    const active = document.getElementById(input.getAttribute('aria-activedescendant')!)
    expect(active?.textContent?.trim()).toBe('Option 1000')
    await fireEvent.keyDown(input, { key: 'Enter' })
    expect(input).toHaveProperty('value', 'Option 1000')
  })

  it('filtering renders the matching rows', async () => {
    const { getByRole, container } = renderCombobox({ options: MANY, virtual: true })
    await fireEvent.update(getByRole('combobox'), 'Option 99')
    const labels = [...container.querySelectorAll('[role="option"]')].map((o) =>
      o.textContent?.trim(),
    )
    expect(labels).toEqual([
      'Option 99',
      'Option 990',
      'Option 991',
      'Option 992',
      'Option 993',
      'Option 994',
    ])
  })

  it('a block whose heading is outside the window is named by aria-label', async () => {
    const groups = [
      { label: 'First', options: MANY.slice(0, 20) },
      { label: 'Second', options: MANY.slice(20, 40) },
    ]
    const { getByRole } = renderCombobox({ options: groups, virtual: true })
    const input = getByRole('combobox')
    await fireEvent.keyDown(input, { key: 'ArrowDown' })
    const first = getByRole('group', { name: 'First' })
    // The heading is rendered at the top: it names its block.
    expect(first.getAttribute('aria-labelledby')).toBe(
      first.querySelector('.v-combobox-group-label')!.id,
    )
    // The last option of the second block is pinned without its heading.
    await fireEvent.keyDown(input, { key: 'ArrowUp' })
    await nextTick()
    const second = getByRole('group', { name: 'Second' })
    expect(second.getAttribute('aria-label')).toBe('Second')
    expect(second.querySelector('.v-combobox-group-label')).toBeNull()
    const option = second.querySelector('[role="option"]')!
    expect(option.getAttribute('aria-setsize')).toBe('20')
    expect(option.getAttribute('aria-posinset')).toBe('20')
  })

  it('without virtual, every option is rendered and no position is set', async () => {
    const { getByRole, container } = renderCombobox({ options: MANY })
    await fireEvent.keyDown(getByRole('combobox'), { key: 'ArrowDown' })
    expect(container.querySelectorAll('[role="option"]')).toHaveLength(1000)
    expect(container.querySelector('[role="option"]')!.hasAttribute('aria-posinset')).toBe(false)
    expect(container.querySelector('.v-combobox-spacer')).toBeNull()
  })
})
