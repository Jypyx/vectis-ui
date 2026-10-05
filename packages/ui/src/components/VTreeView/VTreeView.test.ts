import { fireEvent, render, waitFor } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'

import VTreeView from './VTreeView.vue'
import type { TreeItem, TreeViewModelValue } from './VTreeView.vue'
import type { ItemValue } from '../../types'

const ITEMS: TreeItem[] = [
  {
    value: 'docs',
    label: 'Documents',
    children: [
      { value: 'cv', label: 'CV.pdf' },
      {
        value: 'taxes',
        label: 'Taxes',
        children: [
          { value: 't2025', label: '2025.pdf' },
          { value: 't2026', label: '2026.pdf' },
        ],
      },
    ],
  },
  { value: 'music', label: 'Music', children: [{ value: 'song', label: 'Song.mp3' }] },
  { value: 'notes', label: 'Notes.txt' },
]

function renderHarness(template: string, bindings: Record<string, unknown> = {}) {
  const Harness = defineComponent({
    components: { VTreeView },
    setup: () => bindings,
    template,
  })
  return render(Harness)
}

function renderTree(
  attrs = '',
  {
    items = ITEMS,
    expanded = [] as ItemValue[],
    selected = null as TreeViewModelValue,
    extra = {} as Record<string, unknown>,
  } = {},
) {
  const open = ref(expanded)
  const value = ref(selected)
  const utils = renderHarness(
    `<VTreeView v-model="value" v-model:expanded="open" :items="items" ${attrs} />`,
    { open, value, items, ...extra },
  )
  const rows = () => [...utils.container.querySelectorAll<HTMLElement>('[role="treeitem"]')]
  const row = (name: string) => utils.getByRole('treeitem', { name })
  const labels = () => rows().map((el) => el.querySelector('.v-tree-label')!.textContent)
  return { open, value, rows, row, labels, ...utils }
}

describe('VTreeView', () => {
  it('is a tree named from the dictionary, showing the first level', () => {
    const { getByRole, labels } = renderTree()
    expect(getByRole('tree', { name: 'Tree' }).tagName).toBe('UL')
    expect(labels()).toEqual(['Documents', 'Music', 'Notes.txt'])
  })

  it('label renames the tree, and aria-labelledby takes over from it', () => {
    const { getByRole } = renderTree('label="Files"')
    expect(getByRole('tree', { name: 'Files' })).toBeTruthy()
    const labelled = renderTree('aria-labelledby="heading"')
    expect(labelled.getAllByRole('tree')[1]!.hasAttribute('aria-label')).toBe(false)
  })

  it('renders expanded rows flat, their depth in aria-level, setsize and posinset', () => {
    const { rows, labels } = renderTree('', { expanded: ['docs', 'taxes'] })
    expect(labels()).toEqual([
      'Documents',
      'CV.pdf',
      'Taxes',
      '2025.pdf',
      '2026.pdf',
      'Music',
      'Notes.txt',
    ])
    const taxes = rows()[2]!
    expect(taxes.getAttribute('aria-level')).toBe('2')
    expect(taxes.getAttribute('aria-setsize')).toBe('2')
    expect(taxes.getAttribute('aria-posinset')).toBe('2')
    expect(taxes.getAttribute('aria-expanded')).toBe('true')
    expect(rows()[5]!.getAttribute('aria-expanded')).toBe('false')
    expect(rows()[6]!.hasAttribute('aria-expanded')).toBe(false)
  })

  it('a treeitem is named by its own row, not by its subtree', () => {
    const { row } = renderTree('', { expanded: ['docs'] })
    expect(row('Documents')).toBeTruthy()
  })

  it('sends class and style to the wrapper, other attributes to the tree', () => {
    const { container, getByRole } = renderTree('class="extra" style="color: red" data-x="1"')
    const root = container.querySelector('.v-tree-view')!
    expect(root.classList.contains('extra')).toBe(true)
    expect(root.getAttribute('style')).toContain('color')
    expect(getByRole('tree').dataset.x).toBe('1')
    expect(getByRole('tree').classList.contains('extra')).toBe(false)
  })

  it('has a single tab stop, on the first row by default', () => {
    const { rows } = renderTree()
    expect(rows().map((el) => el.tabIndex)).toEqual([0, -1, -1])
  })

  it('puts the tab stop on the selected node', () => {
    const { rows } = renderTree('selection-mode="single"', { selected: 'music' })
    expect(rows().map((el) => el.tabIndex)).toEqual([-1, 0, -1])
  })

  describe('keyboard', () => {
    it('moves with the arrows, Home and End, without wrapping', async () => {
      const { rows, row } = renderTree('', { expanded: ['docs'] })
      row('Documents').focus()
      await fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' })
      expect(document.activeElement).toBe(row('CV.pdf'))
      await fireEvent.keyDown(document.activeElement!, { key: 'End' })
      expect(document.activeElement).toBe(row('Notes.txt'))
      await fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' })
      expect(document.activeElement).toBe(row('Notes.txt'))
      await fireEvent.keyDown(document.activeElement!, { key: 'Home' })
      expect(document.activeElement).toBe(rows()[0])
      await fireEvent.keyDown(document.activeElement!, { key: 'ArrowUp' })
      expect(document.activeElement).toBe(rows()[0])
      expect(rows()[0]!.tabIndex).toBe(0)
    })

    it('the right arrow expands a branch, then enters it', async () => {
      const { open, row } = renderTree()
      row('Documents').focus()
      await fireEvent.keyDown(document.activeElement!, { key: 'ArrowRight' })
      expect(open.value).toEqual(['docs'])
      expect(document.activeElement).toBe(row('Documents'))
      await fireEvent.keyDown(document.activeElement!, { key: 'ArrowRight' })
      expect(document.activeElement).toBe(row('CV.pdf'))
    })

    it('the left arrow goes up to the parent, then collapses it', async () => {
      const { open, row } = renderTree('', { expanded: ['docs'] })
      row('CV.pdf').focus()
      await fireEvent.keyDown(document.activeElement!, { key: 'ArrowLeft' })
      expect(document.activeElement).toBe(row('Documents'))
      await fireEvent.keyDown(document.activeElement!, { key: 'ArrowLeft' })
      expect(open.value).toEqual([])
    })

    it('the tab stop climbs to the closest ancestor on screen when a branch folds', async () => {
      const { open, row, rows } = renderTree('', { expanded: ['docs', 'taxes'] })
      row('2026.pdf').focus()
      open.value = []
      await nextTick()
      expect(rows().map((el) => el.tabIndex)).toEqual([0, -1, -1])
    })

    it('the asterisk expands every branch beside the focused node', async () => {
      const { open, row } = renderTree()
      row('Notes.txt').focus()
      await fireEvent.keyDown(document.activeElement!, { key: '*' })
      expect(open.value).toEqual(['docs', 'music'])
    })

    it('typing moves to the next row starting with the letters, ignoring accents', async () => {
      const items: TreeItem[] = [
        { value: 'a', label: 'Apple' },
        { value: 'b', label: 'Éclair' },
        { value: 'c', label: 'Avocado' },
        { value: 'd', label: 'Apricot' },
      ]
      const { row } = renderTree('', { items })
      row('Apple').focus()
      await fireEvent.keyDown(document.activeElement!, { key: 'e' })
      expect(document.activeElement).toBe(row('Éclair'))
      await fireEvent.keyDown(document.activeElement!, { key: 'a' })
      expect(document.activeElement).toBe(row('Éclair'))
    })

    it('repeating a letter cycles through the rows starting with it', async () => {
      vi.useFakeTimers()
      const items: TreeItem[] = [
        { value: 'a', label: 'Apple' },
        { value: 'c', label: 'Avocado' },
        { value: 'd', label: 'Apricot' },
      ]
      const { row } = renderTree('', { items })
      row('Apple').focus()
      await fireEvent.keyDown(document.activeElement!, { key: 'a' })
      expect(document.activeElement).toBe(row('Avocado'))
      await fireEvent.keyDown(document.activeElement!, { key: 'a' })
      expect(document.activeElement).toBe(row('Apricot'))
      vi.advanceTimersByTime(600)
      await fireEvent.keyDown(document.activeElement!, { key: 'a' })
      expect(document.activeElement).toBe(row('Apple'))
      await fireEvent.keyDown(document.activeElement!, { key: 'p' })
      await fireEvent.keyDown(document.activeElement!, { key: 'r' })
      expect(document.activeElement).toBe(row('Apricot'))
      vi.useRealTimers()
    })
  })

  describe('none mode', () => {
    it('clicking a branch folds it, and every click emits activate', async () => {
      const onActivate = vi.fn()
      const { open, row } = renderTree('@activate="onActivate"', { extra: { onActivate } })
      await fireEvent.click(row('Documents'))
      expect(open.value).toEqual(['docs'])
      await fireEvent.click(row('CV.pdf'))
      expect(onActivate).toHaveBeenCalledTimes(2)
      expect(onActivate.mock.calls[1]![0]).toMatchObject({ value: 'cv' })
      expect(row('CV.pdf').hasAttribute('aria-selected')).toBe(false)
      expect(row('CV.pdf').hasAttribute('aria-checked')).toBe(false)
    })

    it('Enter and Space activate a row', async () => {
      const onActivate = vi.fn()
      const { open, row } = renderTree('@activate="onActivate"', { extra: { onActivate } })
      await fireEvent.keyDown(row('Documents'), { key: 'Enter' })
      expect(open.value).toEqual(['docs'])
      await fireEvent.keyDown(row('Documents'), { key: ' ' })
      expect(open.value).toEqual([])
      expect(onActivate).toHaveBeenCalledTimes(2)
    })

    it('the chevron folds a branch without emitting activate', async () => {
      const onActivate = vi.fn()
      const { open, row } = renderTree('@activate="onActivate"', { extra: { onActivate } })
      await fireEvent.click(row('Music').querySelector('.v-tree-toggle')!)
      expect(open.value).toEqual(['music'])
      expect(onActivate).not.toHaveBeenCalled()
    })
  })

  describe('single mode', () => {
    it('selects the clicked node, marking every row', async () => {
      const { value, row, rows } = renderTree('selection-mode="single"')
      await fireEvent.click(row('Music'))
      expect(value.value).toBe('music')
      expect(rows().map((el) => el.getAttribute('aria-selected'))).toEqual([
        'false',
        'true',
        'false',
      ])
      expect(row('Music').getAttribute('aria-expanded')).toBe('false')
    })

    it('Space selects, and an array reads as no selection', async () => {
      const { value, row } = renderTree('selection-mode="single"', { selected: ['music'] })
      expect(row('Music').getAttribute('aria-selected')).toBe('false')
      await fireEvent.keyDown(row('Notes.txt'), { key: ' ' })
      expect(value.value).toBe('notes')
    })
  })

  describe('multiple mode', () => {
    it('checking a branch checks its subtree, in tree order', async () => {
      const { value, getByRole, row } = renderTree('selection-mode="multiple"', {
        expanded: ['docs'],
      })
      expect(getByRole('tree').getAttribute('aria-multiselectable')).toBe('true')
      await fireEvent.click(row('Documents'))
      expect(value.value).toEqual(['docs', 'cv', 'taxes', 't2025', 't2026'])
      expect(row('Taxes').getAttribute('aria-checked')).toBe('true')
    })

    it('unchecking a child leaves its ancestors mixed', async () => {
      const { value, row } = renderTree('selection-mode="multiple"', {
        expanded: ['docs', 'taxes'],
        selected: ['docs'],
      })
      expect(row('2025.pdf').getAttribute('aria-checked')).toBe('true')
      await fireEvent.click(row('2025.pdf'))
      expect(value.value).toEqual(['cv', 't2026'])
      expect(row('Taxes').getAttribute('aria-checked')).toBe('mixed')
      expect(row('Documents').getAttribute('aria-checked')).toBe('mixed')
      expect(row('Music').getAttribute('aria-checked')).toBe('false')
    })

    it('checking the last child checks its parent', async () => {
      const { value, row } = renderTree('selection-mode="multiple"', {
        expanded: ['music'],
      })
      await fireEvent.keyDown(row('Song.mp3'), { key: ' ' })
      expect(value.value).toEqual(['music', 'song'])
      expect(row('Music').getAttribute('aria-checked')).toBe('true')
    })

    it('a mixed branch checks everything, and a checked one unchecks it', async () => {
      const { value, row } = renderTree('selection-mode="multiple"', { selected: ['cv'] })
      expect(row('Documents').getAttribute('aria-checked')).toBe('mixed')
      await fireEvent.click(row('Documents'))
      expect(value.value).toEqual(['docs', 'cv', 'taxes', 't2025', 't2026'])
      await fireEvent.click(row('Documents'))
      expect(value.value).toEqual([])
    })

    it('leaves disabled nodes as they are, and keeps values it does not know', async () => {
      const items: TreeItem[] = [
        {
          value: 'p',
          label: 'Parent',
          children: [
            { value: 'a', label: 'A' },
            { value: 'b', label: 'B', disabled: true },
          ],
        },
      ]
      const { value, row } = renderTree('selection-mode="multiple"', {
        items,
        expanded: ['p'],
        selected: ['elsewhere'],
      })
      await fireEvent.click(row('Parent'))
      expect(value.value).toEqual(['a', 'elsewhere'])
      expect(row('Parent').getAttribute('aria-checked')).toBe('mixed')
      await fireEvent.click(row('Parent'))
      expect(value.value).toEqual(['elsewhere'])
      await fireEvent.click(row('B'))
      expect(value.value).toEqual(['elsewhere'])
    })
  })

  describe('disabled', () => {
    it('stays focusable but cannot be selected, activated or folded', async () => {
      const onActivate = vi.fn()
      const items: TreeItem[] = [
        { value: 'a', label: 'A', disabled: true, children: [{ value: 'x', label: 'X' }] },
        { value: 'b', label: 'B' },
      ]
      const { value, open, row } = renderTree('selection-mode="single" @activate="onActivate"', {
        items,
        extra: { onActivate },
      })
      expect(row('A').getAttribute('aria-disabled')).toBe('true')
      await fireEvent.click(row('A'))
      await fireEvent.click(row('A').querySelector('.v-tree-toggle')!)
      await fireEvent.keyDown(row('A'), { key: 'ArrowRight' })
      await fireEvent.keyDown(row('A'), { key: 'Enter' })
      expect(value.value).toBeNull()
      expect(open.value).toEqual([])
      expect(onActivate).not.toHaveBeenCalled()
      row('B').focus()
      await fireEvent.keyDown(document.activeElement!, { key: 'ArrowUp' })
      expect(document.activeElement).toBe(row('A'))
    })
  })

  describe('links', () => {
    const items: TreeItem[] = [
      { value: 'home', label: 'Home', href: '/home', current: true },
      { value: 'old', label: 'Archive', href: '/old', disabled: true },
      { value: 'about', label: 'About', href: '/about' },
    ]

    it('a node with href is a link carrying the treeitem role', () => {
      const { row } = renderTree('', { items: [items[2]!, ...items.slice(0, 2)] })
      expect(row('Home').tabIndex).toBe(0)
      expect(row('Home').tagName).toBe('A')
      expect(row('Home').getAttribute('href')).toBe('/home')
      expect(row('Home').getAttribute('aria-current')).toBe('page')
      expect(row('Archive').hasAttribute('href')).toBe(false)
    })

    it('Space selects a link without activating it; Enter is left to the browser', async () => {
      const onActivate = vi.fn()
      const { value, row } = renderTree('selection-mode="single" @activate="onActivate"', {
        items,
        extra: { onActivate },
      })
      await fireEvent.keyDown(row('About'), { key: ' ' })
      expect(value.value).toBe('about')
      const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
      row('Home').dispatchEvent(enter)
      expect(enter.defaultPrevented).toBe(false)
      expect(onActivate).not.toHaveBeenCalled()
    })

    it('the activate event can cancel the navigation', async () => {
      const onActivate = vi.fn((_item: TreeItem, event: Event) => event.preventDefault())
      const { row } = renderTree('@activate="onActivate"', { items, extra: { onActivate } })
      const click = new MouseEvent('click', { bubbles: true, cancelable: true })
      row('About').dispatchEvent(click)
      expect(onActivate).toHaveBeenCalledOnce()
      expect(click.defaultPrevented).toBe(true)
    })
  })

  describe('lazy loading', () => {
    const items: TreeItem[] = [{ value: 'remote', label: 'Remote', lazy: true }]

    it('fetches the children on the first expansion, busy meanwhile', async () => {
      let resolve: (children: TreeItem[]) => void = () => {}
      const loadChildren = vi.fn(() => new Promise<TreeItem[]>((r) => (resolve = r)))
      const { row, labels } = renderTree(':load-children="loadChildren"', {
        items,
        extra: { loadChildren },
      })
      expect(row('Remote').getAttribute('aria-expanded')).toBe('false')
      await fireEvent.click(row('Remote'))
      expect(loadChildren).toHaveBeenCalledWith(items[0])
      await waitFor(() => expect(row('Remote').getAttribute('aria-busy')).toBe('true'))
      resolve([{ value: 'child', label: 'Child' }])
      await waitFor(() => expect(labels()).toEqual(['Remote', 'Child']))
      expect(row('Remote').hasAttribute('aria-busy')).toBe(false)
      await fireEvent.click(row('Remote'))
      await fireEvent.click(row('Remote'))
      expect(loadChildren).toHaveBeenCalledOnce()
    })

    it('an empty answer turns the node into a leaf', async () => {
      const loadChildren = vi.fn(async () => [])
      const { row } = renderTree(':load-children="loadChildren"', {
        items,
        expanded: ['remote'],
        extra: { loadChildren },
      })
      await waitFor(() => expect(row('Remote').hasAttribute('aria-expanded')).toBe(false))
    })

    it('a failure collapses the node, says so, and the next expansion retries', async () => {
      const loadChildren = vi
        .fn<(item: TreeItem) => Promise<TreeItem[]>>()
        .mockRejectedValueOnce(new Error('offline'))
        .mockResolvedValueOnce([{ value: 'child', label: 'Child' }])
      const { open, getByRole, row, labels } = renderTree(':load-children="loadChildren"', {
        items,
        extra: { loadChildren },
      })
      await fireEvent.click(row('Remote'))
      await waitFor(() =>
        expect(getByRole('status').textContent).toBe('Could not load the contents of Remote'),
      )
      expect(open.value).toEqual([])
      expect(getByRole('treeitem', { name: /^Remote ?Could not load$/ })).toBeTruthy()
      await fireEvent.click(getByRole('treeitem', { name: /^Remote ?Could not load$/ }))
      await waitFor(() => expect(labels()).toEqual(['Remote', 'Child']))
    })

    it('without loadChildren, a lazy node is a leaf', () => {
      const { row } = renderTree('', { items })
      expect(row('Remote').hasAttribute('aria-expanded')).toBe(false)
    })
  })

  it('exposes focus, which reaches the tab stop, and the tree element', async () => {
    const tree = ref<InstanceType<typeof VTreeView> | null>(null)
    const { getByRole } = renderHarness(
      `<VTreeView ref="tree" :items="items" selection-mode="single" model-value="music" />`,
      { tree, items: ITEMS },
    )
    tree.value!.focus()
    expect(document.activeElement).toBe(getByRole('treeitem', { name: 'Music' }))
    expect(tree.value!.el).toBe(getByRole('tree'))
  })

  it('renders the slots with the node, its level and whether it is expanded', () => {
    const { container } = renderHarness(
      `<VTreeView :items="items" :expanded="['docs']">
        <template #icon="{ expanded, level }"><i class="icon">{{ level }}{{ expanded ? '+' : '-' }}</i></template>
        <template #label="{ item }">[{{ item.label }}]</template>
        <template #end="{ item }"><b class="end">{{ item.value }}</b></template>
      </VTreeView>`,
      { items: ITEMS },
    )
    const icons = [...container.querySelectorAll('.icon')].map((el) => el.textContent)
    expect(icons.slice(0, 2)).toEqual(['1+', '2-'])
    expect(container.querySelector('.v-tree-label')!.textContent).toBe('[Documents]')
    expect(container.querySelector('.end')!.textContent).toBe('docs')
  })
})
