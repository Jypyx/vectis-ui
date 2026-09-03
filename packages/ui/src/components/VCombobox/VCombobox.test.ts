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
    // outside editing, the input displays the label
    expect(input.value).toBe('Belgium')
  })

  it('single selection by click: the input displays the chosen label (parent v-model)', async () => {
    // With defineModel + a parent v-model, re-reading model.value just after writing
    // it returns the old value — the displayed label must come from the chosen option,
    // not from a re-derivation out of the model.
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

    // 2nd choice: reopen, search France, click → the input must NOT stay on "Belgium"
    await fireEvent.click(input)
    await fireEvent.update(input, 'France')
    await nextTick()
    await fireEvent.click(optionByText('France'))
    await nextTick()
    expect(container.querySelector('output')?.textContent).toBe('fr')
    expect(input.value).toBe('France')
  })

  it('reopening in single mode does not filter on the chosen value (the full list, filtering on typing)', async () => {
    const { getByRole, container } = renderCombobox({ modelValue: 'fr' })
    const input = getByRole('combobox') as HTMLInputElement
    expect(input.value).toBe('France') // the label stays displayed
    const labels = () =>
      [...container.querySelectorAll('[role="option"] .v-combobox-option-label')].map((o) =>
        o.textContent?.trim(),
      )

    // the selected value is NOT a filter: the whole list is offered
    expect(labels()).toEqual(['France', 'Belgium', 'Réunion', 'Monaco'])

    // the filter only kicks in on typing — and an accented query matches too
    await fireEvent.update(input, 'réun')
    expect(labels()).toEqual(['Réunion'])
  })

  it('Enter selects the single result (even after a filter with no result)', async () => {
    const { getByRole, emitted } = renderCombobox()
    const input = getByRole('combobox') as HTMLInputElement
    // an empty filter then narrowed to a single result, with no arrow key
    await fireEvent.update(input, 'zzz')
    await fireEvent.update(input, 'bel')
    await fireEvent.keyDown(input, { key: 'Enter' })
    expect(emitted('update:modelValue')?.at(-1)).toEqual(['be'])
  })

  it('the navigation skips disabled options', async () => {
    const { getByRole, container } = renderCombobox()
    const input = getByRole('combobox')
    await fireEvent.keyDown(input, { key: 'ArrowDown' })
    // one step up from the first: wraps around, skipping Monaco (disabled)
    await fireEvent.keyDown(input, { key: 'ArrowUp' })
    expect(container.querySelector('[data-active]')?.textContent).toContain('Réunion')
  })

  it('mousedown is cancelled on the panel: clicking an option does not steal the field focus', async () => {
    const { getByRole, container } = renderCombobox()
    await fireEvent.keyDown(getByRole('combobox'), { key: 'ArrowDown' })
    const option = container.querySelector('[role="option"]') as HTMLElement

    const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true })
    option.dispatchEvent(event)
    // without it, the focusout would close the panel before @select was handled (a dead
    // mouse selection, invisible in jsdom)
    expect(event.defaultPrevented).toBe(true)
  })

  it('the panel has no keyboard handler at all: the field drives everything', async () => {
    const { getByRole, container } = renderCombobox()
    await fireEvent.keyDown(getByRole('combobox'), { key: 'ArrowDown' })
    const panel = container.querySelector('[role="listbox"]') as HTMLElement

    const before = document.activeElement
    panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }))
    // no option has taken the focus: it never leaves the input
    expect(document.activeElement).toBe(before)
  })

  it('a disabled option goes through aria-disabled, never through the native attribute', async () => {
    const { getByRole, container } = renderCombobox()
    await fireEvent.keyDown(getByRole('combobox'), { key: 'ArrowDown' })
    const options = [...container.querySelectorAll('[role="option"]')] as HTMLButtonElement[]
    const disabled = options.find((o) => o.textContent?.includes('Monaco'))!

    expect(disabled.getAttribute('aria-disabled')).toBe('true')
    // the option must stay in the a11y tree the field walks
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
    // visible without typing at all (there is a selection)
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

  it('displays a tick on the right of the selected option', () => {
    const { container } = renderCombobox({ multiple: true, modelValue: ['fr'] })
    const optionByText = (text: string) =>
      [...container.querySelectorAll<HTMLElement>('[role="option"]')].find((o) =>
        o.textContent?.includes(text),
      )
    // France is selected → a tick; Belgium is not → no tick
    expect(optionByText('France')?.querySelector('.v-combobox-option-check')).toBeTruthy()
    expect(optionByText('Belgium')?.querySelector('.v-combobox-option-check')).toBeFalsy()
  })
})

// Groups and separators

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
    // aria-labelledby resolved: the group does carry its accessible name
    expect(getByRole('group', { name: 'Europe' })).toBeTruthy()
    expect(getByRole('group', { name: 'Africa' })).toBeTruthy()
    // the options of a group and those outside one form ONE flat list
    expect(labels(container)).toEqual(['France', 'Belgium', 'Réunion', 'Morocco', 'Japan'])
  })

  it('the keyboard navigation crosses the groups without stopping on a label', async () => {
    const { getByRole, container } = renderGroup()
    const input = getByRole('combobox')
    const active = () => container.querySelector('[data-active]')?.textContent?.trim()

    await fireEvent.keyDown(input, { key: 'ArrowDown' }) // opens on France
    expect(active()).toBe('France')
    await fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(active()).toBe('Belgium')
    // crosses the separator AND the "Africa" label in a single step
    await fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(active()).toBe('Réunion')
    // Morocco is disabled: skipped, like a disabled option outside a group
    await fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(active()).toBe('Japan')
    // aria-activedescendant always designates a real role="option"
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

    // "Japan" alone: the two separators preceding it become orphans
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

    // the VChip's label does come from the option unwrapped out of the group
    // (`allOptions`) — queries bounded to `container`: both renders share document.body
    const second = renderGroup({ multiple: true, modelValue: ['re'] })
    expect(
      [...second.container.querySelectorAll('.v-chip [aria-label]')].map((b) =>
        b.getAttribute('aria-label'),
      ),
    ).toEqual(['Remove Réunion'])
  })
})

// Asynchronous source (server-side search, loading, pagination)

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
        return option.value.startsWith(query)
      },
    })
    await fireEvent.update(getByRole('combobox'), '  fr  ')
    // raw and trimmed: neither NFD-normalized nor lowercased by the component
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
    // no debounce on opening, despite the default searchDebounce (250 ms)
    expect(emitted('search')).toEqual([['']])
  })

  it('search: debounced (a single request for a burst of keystrokes)', async () => {
    vi.useFakeTimers()
    const { getByRole, emitted } = renderCombobox({ searchDebounce: 250 })
    const input = getByRole('combobox')
    await fireEvent.keyDown(input, { key: 'ArrowDown' }) // opens: search('')
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
    await fireEvent.update(input, 'bel') // opens + emits 'bel' (immediately)
    await fireEvent.keyDown(input, { key: 'Enter' })
    // the timer armed by the keystroke must not fire after the close
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
    // the next page of results: "fr" is no longer in it
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
    // with no options, the raw value is the only possible fallback
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

  it('loading with options: the options stay displayed', () => {
    const { container } = renderCombobox({ loading: true })
    expect(container.querySelectorAll('[role="option"]').length).toBe(4)
    expect(container.querySelector('.v-combobox-state')).toBeNull()
  })

  it('loading: the field swaps its chevron for a decorative spinner', () => {
    const { container } = renderCombobox({ loading: true })
    expect(container.querySelector('.v-combobox-chevron')).toBeNull()
    const spinner = container.querySelector('.v-input-field > .v-spinner')
    // decorative: its role="status" must not double the panel's announcement
    expect(spinner?.getAttribute('aria-hidden')).toBe('true')
  })

  it('sizes: the Chips stay one step below the field, and the panel follows its size', async () => {
    // A single mapping (in the script) which the CSS `--chip-height` must mirror: xs up
    // to md, sm at lg; the step below goes through `compact`.
    const { container, rerender } = renderCombobox({ multiple: true, modelValue: ['fr'] })
    const chip = () => container.querySelector('.v-chip') as HTMLElement
    const panel = () => container.querySelector('[role="listbox"]') as HTMLElement

    // default (md): a full xs VChip
    expect(chip().getAttribute('data-size')).toBe('xs')
    expect(chip().hasAttribute('data-compact')).toBe(false)

    await rerender({ size: 'sm' })
    expect(chip().getAttribute('data-size')).toBe('xs')
    expect(chip().hasAttribute('data-compact')).toBe(true)

    await rerender({ size: 'lg', compact: false })
    expect(chip().getAttribute('data-size')).toBe('sm')
    expect(chip().hasAttribute('data-compact')).toBe(false)
    // the panel follows the field's size (no clamp)
    expect(panel().getAttribute('data-size')).toBe('lg')

    await rerender({ size: 'lg', compact: true })
    expect(chip().getAttribute('data-size')).toBe('sm')
    expect(chip().hasAttribute('data-compact')).toBe(true)
    // data-compact on the root: it is what arms the lg+compact CSS rule
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
    // a Material ligature: the icon's name is the symbol's content
    expect(withIcon.querySelector('.v-icon-symbol')?.textContent).toBe('flag')
    // the icon precedes the label (the tick, on the other hand, comes after)
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
    // the default VChip has indeed given way
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

    // the next search no longer returns the option: the cache keeps it whole (without
    // it, the VChip would display the raw identifier and lose its icon)
    await rerender({ options: [] })
    expect(container.querySelector('.v-test-chip')?.textContent).toBe('France/flag')
  })
})
