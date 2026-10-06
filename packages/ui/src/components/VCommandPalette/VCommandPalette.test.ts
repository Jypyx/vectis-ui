import { fireEvent, render, within } from '@testing-library/vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'

import VCommandPalette from './VCommandPalette.vue'
import type { CommandPaletteItem } from './VCommandPalette.vue'

/** Logic only (jsdom + the showModal/close stubs, see vitest.setup.ts). */
async function flush() {
  await nextTick()
  await new Promise((r) => setTimeout(r))
  await nextTick()
}

const ITEMS: CommandPaletteItem[] = [
  { label: 'New file', shortcut: 'mod+n', id: 'new' },
  { label: 'Open recent', description: 'Files from this week', keywords: ['history'] },
  { separator: true },
  {
    label: 'Navigation',
    commands: [
      { label: 'Go to settings', href: '/settings' },
      { label: 'Go to billing', disabled: true },
      { label: 'Go to équipe' },
    ],
  },
  { separator: true },
  { label: 'Sign out', keepOpen: true },
]

function renderHarness(props: Record<string, unknown> = {}, slots = '') {
  const open = ref((props.open as boolean) ?? false)
  const query = ref('')
  const onSelect = vi.fn()
  const onSearch = vi.fn()
  const Harness = defineComponent({
    components: { VCommandPalette },
    setup: () => ({ open, query, props, items: ITEMS, onSelect, onSearch }),
    template: `
      <VCommandPalette
        v-model:open="open"
        v-model:query="query"
        :items="items"
        v-bind="props"
        @select="onSelect"
        @search="onSearch"
      >
        <template #trigger="{ triggerProps }">
          <button data-testid="trigger" v-bind="triggerProps">Commands</button>
        </template>
        ${slots}
      </VCommandPalette>
    `,
  })
  const utils = render(Harness)
  const getDialog = () => utils.container.querySelector('dialog') as HTMLDialogElement | null
  return { open, query, onSelect, onSearch, getDialog, ...utils }
}

async function openHarness(props: Record<string, unknown> = {}, slots = '') {
  const h = renderHarness(props, slots)
  h.open.value = true
  await flush()
  const dialog = h.getDialog() as HTMLDialogElement
  const input = within(dialog).getByRole('combobox')
  const options = () => within(dialog).queryAllByRole('option')
  const labels = () =>
    options().map((o) => o.querySelector('.v-command-palette-item-label')?.textContent)
  const active = () => {
    const id = input.getAttribute('aria-activedescendant')
    return id ? document.getElementById(id) : null
  }
  async function type(text: string) {
    await fireEvent.update(input, text)
    await flush()
  }
  return { ...h, dialog, input, options, labels, active, type }
}

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('VCommandPalette', () => {
  it('the trigger opens a named modal dialog and synchronizes the v-model', async () => {
    const { open, getDialog, getByTestId } = renderHarness()
    expect(getDialog()).toBeNull()
    expect(getByTestId('trigger').getAttribute('aria-haspopup')).toBe('dialog')
    getByTestId('trigger').click()
    await flush()
    expect(getDialog()?.open).toBe(true)
    expect(getDialog()?.getAttribute('aria-label')).toBe('Command palette')
    expect(open.value).toBe(true)
  })

  it('the field is an expanded combobox pointing at the listbox, focused by the dialog', async () => {
    const { dialog, input } = await openHarness()
    const listbox = within(dialog).getByRole('listbox')
    expect(input.getAttribute('aria-controls')).toBe(listbox.id)
    expect(input.getAttribute('aria-expanded')).toBe('true')
    expect(input.getAttribute('aria-autocomplete')).toBe('list')
    expect(input.getAttribute('aria-label')).toBe('Search commands')
    expect(input.getAttribute('placeholder')).toBe('Type a command or search…')
    expect(input.hasAttribute('autofocus')).toBe(true)
    expect(listbox.getAttribute('aria-label')).toBe('Command palette')
  })

  it('renders commands, named groups and separators', async () => {
    const { dialog, labels } = await openHarness()
    expect(labels()).toEqual([
      'New file',
      'Open recent',
      'Go to settings',
      'Go to billing',
      'Go to équipe',
      'Sign out',
    ])
    const group = within(dialog).getByRole('group', { name: 'Navigation' })
    expect(within(group).getAllByRole('option')).toHaveLength(3)
    expect(dialog.querySelectorAll('.v-command-palette-separator')).toHaveLength(2)
  })

  it('a command with href is a link, which loses its address when disabled', async () => {
    const { options } = await openHarness()
    const settings = options()[2]!
    expect(settings.tagName).toBe('A')
    expect(settings.getAttribute('href')).toBe('/settings')
    const billing = options()[3]!
    expect(billing.tagName).toBe('BUTTON')
    expect(billing.getAttribute('aria-disabled')).toBe('true')
  })

  it("a command's own id never reaches the option, whose id is the palette's", async () => {
    const { options, input } = await openHarness()
    expect(options()[0]!.id).not.toBe('new')
    expect(input.getAttribute('aria-activedescendant')).toBe(options()[0]!.id)
  })

  it('a command listed twice, as recent and in its block, gets two distinct option ids', async () => {
    const sync = { label: 'Sync now' }
    const { options, input } = await openHarness({
      items: [
        { label: 'Recent', commands: [sync] },
        { label: 'All', commands: [sync, { label: 'Help' }] },
      ],
    })
    const ids = options().map((o) => o.id)
    expect(new Set(ids).size).toBe(3)
    await fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(input.getAttribute('aria-activedescendant')).toBe(ids[1])
  })

  it('filters on the label and the keywords, ignoring case and accents', async () => {
    const { labels, type } = await openHarness()
    await type('EQUIPE')
    expect(labels()).toEqual(['Go to équipe'])
    await type('history')
    expect(labels()).toEqual(['Open recent'])
  })

  it('hides a group with no match, and a separator the search strands', async () => {
    const { dialog, labels, type } = await openHarness()
    await type('sign')
    expect(labels()).toEqual(['Sign out'])
    expect(within(dialog).queryByRole('group')).toBeNull()
    expect(dialog.querySelectorAll('.v-command-palette-separator')).toHaveLength(0)
  })

  it('shows an empty state and announces it when nothing matches', async () => {
    const { dialog, type } = await openHarness()
    await type('zzz')
    expect(dialog.querySelector('.v-command-palette-empty')?.textContent).toContain('No results')
    expect(within(dialog).getByRole('status').textContent).toBe('No results')
  })

  it('filter false keeps every command; a function replaces the rule', async () => {
    const off = await openHarness({ filter: false })
    await off.type('zzz')
    expect(off.options()).toHaveLength(6)
    off.unmount()

    const custom = await openHarness({
      filter: (c: { label: string }, q: string) => c.label.startsWith(q),
    })
    await custom.type('Go')
    expect(custom.options()).toHaveLength(3)
  })

  it('the arrows walk the commands, skipping disabled ones and wrapping', async () => {
    const { input, active } = await openHarness()
    expect(active()?.textContent).toContain('New file')
    await fireEvent.keyDown(input, { key: 'ArrowUp' })
    expect(active()?.textContent).toContain('Sign out')
    await fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(active()?.textContent).toContain('New file')
    await fireEvent.keyDown(input, { key: 'ArrowDown' })
    await fireEvent.keyDown(input, { key: 'ArrowDown' })
    await fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(active()?.textContent).toContain('Go to équipe')
    expect(active()?.getAttribute('aria-selected')).toBe('true')
  })

  it('the active option keeps its id while the filter changes the list around it', async () => {
    const { input, options, type } = await openHarness()
    const id = options()[5]!.id
    await type('sign')
    expect(options()[0]!.id).toBe(id)
    expect(input.getAttribute('aria-activedescendant')).toBe(id)
  })

  it('Enter chooses the active command, emits select and closes', async () => {
    const { input, onSelect, open } = await openHarness()
    await fireEvent.keyDown(input, { key: 'Enter' })
    await flush()
    expect(onSelect).toHaveBeenCalledOnce()
    expect(onSelect.mock.calls[0]![0]).toMatchObject({ label: 'New file', id: 'new' })
    expect(onSelect.mock.calls[0]![1]).toBeInstanceOf(MouseEvent)
    expect(open.value).toBe(false)
  })

  it('keepOpen leaves the palette open once chosen', async () => {
    const { options, onSelect, open } = await openHarness()
    await fireEvent.click(options()[5]!)
    expect(onSelect).toHaveBeenCalledOnce()
    expect(open.value).toBe(true)
  })

  it('a link opened elsewhere with a modifier leaves the palette open', async () => {
    const { options, onSelect, open } = await openHarness()
    const link = options()[2]!
    link.addEventListener('click', (e) => e.preventDefault())
    await fireEvent.click(link, { ctrlKey: true })
    expect(onSelect).toHaveBeenCalledOnce()
    expect(open.value).toBe(true)
  })

  it('a disabled command cannot be chosen', async () => {
    const { options, onSelect, open } = await openHarness()
    await fireEvent.click(options()[3]!)
    expect(onSelect).not.toHaveBeenCalled()
    expect(open.value).toBe(true)
  })

  it('hovering a command makes it active, a disabled one is skipped', async () => {
    const { options, active } = await openHarness()
    await fireEvent.pointerMove(options()[2]!)
    expect(active()).toBe(options()[2])
    await fireEvent.pointerMove(options()[3]!)
    expect(active()).toBe(options()[2])
  })

  it('reports the search on opening, then debounced and never twice', async () => {
    vi.useFakeTimers()
    const h = renderHarness({ searchDebounce: 200 })
    h.open.value = true
    await nextTick()
    await nextTick()
    expect(h.onSearch).toHaveBeenLastCalledWith('')
    const input = within(h.getDialog()!).getByRole('combobox')
    await fireEvent.update(input, 'se')
    await fireEvent.update(input, 'set')
    vi.advanceTimersByTime(199)
    expect(h.onSearch).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(1)
    expect(h.onSearch).toHaveBeenLastCalledWith('set')
    expect(h.onSearch).toHaveBeenCalledTimes(2)
  })

  it('empties the query on closing', async () => {
    const { query, type, open } = await openHarness()
    await type('set')
    expect(query.value).toBe('set')
    open.value = false
    await flush()
    expect(query.value).toBe('')
  })

  it('loading shows a spinner, and announces the loading text while the list is empty', async () => {
    const { dialog, type } = await openHarness({ loading: true, loadingText: 'Searching…' })
    expect(dialog.querySelector('.v-command-palette-spinner')).not.toBeNull()
    await type('zzz')
    expect(within(dialog).getByRole('status').textContent).toBe('Searching…')
    expect(dialog.querySelector('.v-command-palette-state')?.textContent).toContain('Searching…')
  })

  it('the shortcut opens the palette from the page, and closes it from its field', async () => {
    const { open, getDialog, getByTestId } = renderHarness({ shortcut: 'mod+k' })
    await flush()
    expect(getByTestId('trigger').getAttribute('aria-keyshortcuts')).toBe('Control+K')
    const press = new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    })
    document.body.dispatchEvent(press)
    await flush()
    expect(open.value).toBe(true)
    expect(press.defaultPrevented).toBe(true)
    const input = within(getDialog()!).getByRole('combobox')
    await fireEvent.keyDown(input, { key: 'k', ctrlKey: true })
    await flush()
    expect(open.value).toBe(false)
  })

  it('without shortcut, nothing is listened for', async () => {
    const { open, getByTestId } = renderHarness()
    await flush()
    expect(getByTestId('trigger').hasAttribute('aria-keyshortcuts')).toBe(false)
    document.body.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }),
    )
    await flush()
    expect(open.value).toBe(false)
  })

  it('shows the shortcut of a command at the end of its row', async () => {
    const { options } = await openHarness()
    expect(options()[0]!.querySelector('.v-hotkeys')).not.toBeNull()
  })

  it('the footer lists the keys, hideFooter removes it and the slot replaces it', async () => {
    const shown = await openHarness()
    expect(
      shown.dialog.querySelector('.v-command-palette-hints')?.getAttribute('aria-hidden'),
    ).toBe('true')
    expect(shown.dialog.querySelector('.v-command-palette-footer')?.textContent).toContain(
      'Navigate',
    )
    shown.unmount()

    const hidden = await openHarness({ hideFooter: true })
    expect(hidden.dialog.querySelector('.v-command-palette-footer')).toBeNull()
    hidden.unmount()

    const custom = await openHarness({}, '<template #footer>Mine</template>')
    expect(custom.dialog.querySelector('.v-command-palette-footer')?.textContent).toBe('Mine')
  })

  it('the item slot replaces the label and description, keeping the icon and the shortcut', async () => {
    const { options } = await openHarness(
      {},
      '<template #item="{ command, active }"><b>{{ command.label }}{{ active ? "*" : "" }}</b></template>',
    )
    expect(options()[0]!.querySelector('b')?.textContent).toBe('New file*')
    expect(options()[0]!.querySelector('.v-hotkeys')).not.toBeNull()
  })

  it('texts and names come from props when given', async () => {
    const { dialog, input, type } = await openHarness({
      label: 'Actions',
      searchLabel: 'Find an action',
      placeholder: 'Find…',
      emptyText: 'Nothing here',
    })
    expect(dialog.getAttribute('aria-label')).toBe('Actions')
    expect(input.getAttribute('aria-label')).toBe('Find an action')
    expect(input.getAttribute('placeholder')).toBe('Find…')
    await type('zzz')
    expect(within(dialog).getByRole('status').textContent).toBe('Nothing here')
  })

  it('attributes fall through to the dialog, where a consumer aria-label wins', async () => {
    const { dialog } = await openHarness({ 'aria-label': 'Mine', 'data-test': 'x' })
    expect(dialog.getAttribute('aria-label')).toBe('Mine')
    expect(dialog.getAttribute('data-test')).toBe('x')
  })

  it('width is read as pixels for a number and as a CSS length for a string', async () => {
    const px = await openHarness({ width: 480 })
    expect(px.dialog.style.getPropertyValue('--command-palette-width')).toBe('480px')
    px.unmount()
    const length = await openHarness({ width: '50vw' })
    expect(length.dialog.style.getPropertyValue('--command-palette-width')).toBe('50vw')
  })
})
