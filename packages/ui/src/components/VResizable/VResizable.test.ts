import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'

import VResizable from './VResizable.vue'
import VResizablePanel from './VResizablePanel.vue'

function renderHarness(template: string, bindings: Record<string, unknown> = {}) {
  const Harness = defineComponent({
    components: { VResizable, VResizablePanel },
    setup: () => bindings,
    template,
  })
  return render(Harness)
}

/** Two panels under a live v-model, with what the group emits. */
function renderPair(groupAttrs = '', first = '', second = '', initial?: number[]) {
  const sizes = ref<number[] | undefined>(initial)
  const changes: number[][] = []
  const onChange = (value: number[]) => changes.push(value)
  const utils = renderHarness(
    `<VResizable v-model="sizes" ${groupAttrs} @change="onChange">
      <VResizablePanel ${first}>One</VResizablePanel>
      <VResizablePanel ${second}>Two</VResizablePanel>
    </VResizable>`,
    { sizes, onChange },
  )
  const handle = () => utils.getByRole('separator')
  return { sizes, changes, handle, ...utils }
}

const panelsOf = (container: Element) => [
  ...container.querySelectorAll<HTMLElement>('.v-resizable-panel'),
]
const weightOf = (panel: HTMLElement) => panel.style.getPropertyValue('--resizable-panel-size')

describe('VResizable', () => {
  it('places a focusable separator between each pair of panels', () => {
    const { getAllByRole, container } = renderHarness(`
      <VResizable>
        <VResizablePanel>A</VResizablePanel>
        <VResizablePanel>B</VResizablePanel>
        <VResizablePanel>C</VResizablePanel>
      </VResizable>
    `)
    const handles = getAllByRole('separator')
    expect(handles).toHaveLength(2)
    expect(handles.every((handle) => handle.tabIndex === 0)).toBe(true)
    const children = [...container.querySelector('.v-resizable')!.children]
    expect(children.map((child) => child.className)).toEqual([
      'v-resizable-panel',
      'v-resizable-handle',
      'v-resizable-panel',
      'v-resizable-handle',
      'v-resizable-panel',
    ])
  })

  it('shares the space equally, or by defaultSize, as flex weights', () => {
    const equal = renderPair()
    expect(panelsOf(equal.container).map(weightOf)).toEqual(['50', '50'])
    equal.unmount()
    const sized = renderPair('', ':default-size="30"')
    expect(panelsOf(sized.container).map(weightOf)).toEqual(['30', '70'])
  })

  it('the v-model wins over defaultSize', () => {
    const { container } = renderPair('', ':default-size="30"', '', [60, 40])
    expect(panelsOf(container).map(weightOf)).toEqual(['60', '40'])
  })

  it('a handle reports the size and limits of the panel before it, which it controls', async () => {
    const { handle, container } = renderPair('', 'label="Sidebar" :min-size="20" :max-size="70"')
    // The limits come from the panels once they have registered, one render later.
    await nextTick()
    const [first] = panelsOf(container)
    expect(handle().getAttribute('aria-label')).toBe('Sidebar')
    expect(handle().getAttribute('aria-controls')).toBe(first!.id)
    expect(handle().getAttribute('aria-valuenow')).toBe('50')
    expect(handle().getAttribute('aria-valuemin')).toBe('20')
    expect(handle().getAttribute('aria-valuemax')).toBe('70')
  })

  it('an unlabelled panel names its handle from the dictionary', () => {
    const { handle } = renderPair()
    expect(handle().getAttribute('aria-label')).toBe('Panel 1')
  })

  it('a horizontal group has vertical separators; a vertical one, implicit horizontal ones', () => {
    const row = renderPair()
    expect(row.handle().getAttribute('aria-orientation')).toBe('vertical')
    row.unmount()
    const column = renderPair('orientation="vertical"')
    expect(column.handle().hasAttribute('aria-orientation')).toBe(false)
  })

  it('the arrow keys move the handle by step and settle the sizes', async () => {
    const { handle, sizes, changes } = renderPair()
    await fireEvent.keyDown(handle(), { key: 'ArrowRight' })
    expect(sizes.value).toEqual([55, 45])
    await fireEvent.keyDown(handle(), { key: 'ArrowLeft' })
    await fireEvent.keyDown(handle(), { key: 'ArrowLeft' })
    expect(sizes.value).toEqual([45, 55])
    expect(changes).toEqual([
      [55, 45],
      [50, 50],
      [45, 55],
    ])
    expect(handle().getAttribute('aria-valuenow')).toBe('45')
  })

  it('step sets how far a key moves the handle; the cross-axis arrows do nothing', async () => {
    const { handle, sizes } = renderPair(':step="10"')
    await fireEvent.keyDown(handle(), { key: 'ArrowDown' })
    expect(sizes.value).toBeUndefined()
    await fireEvent.keyDown(handle(), { key: 'ArrowRight' })
    expect(sizes.value).toEqual([60, 40])
  })

  it('follows the direction of the text', async () => {
    const { handle, sizes } = renderPair('style="direction: rtl"')
    await fireEvent.keyDown(handle(), { key: 'ArrowLeft' })
    expect(sizes.value).toEqual([55, 45])
  })

  it('a vertical group moves with the up and down arrows', async () => {
    const { handle, sizes } = renderPair('orientation="vertical"')
    await fireEvent.keyDown(handle(), { key: 'ArrowDown' })
    expect(sizes.value).toEqual([55, 45])
    await fireEvent.keyDown(handle(), { key: 'ArrowRight' })
    expect(sizes.value).toEqual([55, 45])
  })

  it('Home and End give the primary panel its smallest and largest size', async () => {
    const { handle, sizes } = renderPair('', ':min-size="20" :max-size="80"')
    await fireEvent.keyDown(handle(), { key: 'Home' })
    expect(sizes.value).toEqual([20, 80])
    await fireEvent.keyDown(handle(), { key: 'End' })
    expect(sizes.value).toEqual([80, 20])
  })

  it('stops at the limits of the panel on the other side', async () => {
    const { handle, sizes, changes } = renderPair('', '', ':min-size="45"')
    await fireEvent.keyDown(handle(), { key: 'ArrowRight' })
    expect(sizes.value).toEqual([55, 45])
    await fireEvent.keyDown(handle(), { key: 'ArrowRight' })
    expect(changes).toHaveLength(1)
  })

  it('Enter collapses a collapsible panel and reopens it at its previous size', async () => {
    const collapsed = ref(false)
    const sizes = ref<number[]>([40, 60])
    const { getByRole, getByText } = renderHarness(
      `<VResizable v-model="sizes">
        <VResizablePanel v-model:collapsed="collapsed" collapsible :min-size="20">Side</VResizablePanel>
        <VResizablePanel>Main</VResizablePanel>
      </VResizable>`,
      { collapsed, sizes },
    )
    const handle = getByRole('separator')
    expect(handle.getAttribute('aria-valuemin')).toBe('0')
    await fireEvent.keyDown(handle, { key: 'Enter' })
    expect(sizes.value).toEqual([0, 100])
    expect(collapsed.value).toBe(true)
    const side = getByText('Side')
    expect(side.hasAttribute('data-collapsed')).toBe(true)
    // A collapsed size of zero hides the content, focus included.
    expect(side.hasAttribute('data-hidden')).toBe(true)
    expect(handle.getAttribute('aria-valuenow')).toBe('0')
    await fireEvent.keyDown(handle, { key: 'Enter' })
    expect(sizes.value).toEqual([40, 60])
    expect(collapsed.value).toBe(false)
  })

  it('an arrow below the minimum collapses the panel', async () => {
    const { handle, sizes } = renderPair('', 'collapsible :min-size="45"')
    await fireEvent.keyDown(handle(), { key: 'ArrowLeft' })
    expect(sizes.value).toEqual([45, 55])
    await fireEvent.keyDown(handle(), { key: 'ArrowLeft' })
    expect(sizes.value).toEqual([0, 100])
  })

  it('reports on the panel after the handle when only that one collapses', async () => {
    const collapsed = ref(false)
    const sizes = ref<number[]>([70, 30])
    const { getByRole } = renderHarness(
      `<VResizable v-model="sizes">
        <VResizablePanel>Main</VResizablePanel>
        <VResizablePanel v-model:collapsed="collapsed" collapsible label="Details">Details</VResizablePanel>
      </VResizable>`,
      { collapsed, sizes },
    )
    await nextTick()
    const handle = getByRole('separator')
    expect(handle.getAttribute('aria-label')).toBe('Details')
    expect(handle.getAttribute('aria-valuenow')).toBe('30')
    // The arrows still move the handle where they point.
    await fireEvent.keyDown(handle, { key: 'ArrowRight' })
    expect(sizes.value).toEqual([75, 25])
    expect(handle.getAttribute('aria-valuenow')).toBe('25')
    await fireEvent.keyDown(handle, { key: 'Enter' })
    expect(collapsed.value).toBe(true)
    expect(sizes.value).toEqual([100, 0])
  })

  it('collapsing a panel from its v-model makes room for it', async () => {
    const collapsed = ref(false)
    const sizes = ref<number[]>([30, 70])
    renderHarness(
      `<VResizable v-model="sizes">
        <VResizablePanel v-model:collapsed="collapsed" collapsible :min-size="20">Side</VResizablePanel>
        <VResizablePanel>Main</VResizablePanel>
      </VResizable>`,
      { collapsed, sizes },
    )
    collapsed.value = true
    await nextTick()
    expect(sizes.value).toEqual([0, 100])
    collapsed.value = false
    await nextTick()
    expect(sizes.value).toEqual([30, 70])
  })

  it('collapses to collapsedSize and keeps the content shown above zero', async () => {
    const { handle, sizes, getByText } = renderPair(
      '',
      'collapsible :min-size="30" :collapsed-size="10"',
    )
    await fireEvent.keyDown(handle(), { key: 'Home' })
    expect(sizes.value).toEqual([10, 90])
    const panel = getByText('One')
    expect(panel.style.getPropertyValue('--resizable-panel-collapsed')).toBe('10%')
    expect(panel.hasAttribute('data-hidden')).toBe(false)
  })

  it('writes CSS lengths into the panel limits', () => {
    const { getByText } = renderPair('', 'min-size="12rem" max-size="480px"')
    const panel = getByText('One')
    expect(panel.style.getPropertyValue('--resizable-panel-min')).toBe('12rem')
    expect(panel.style.getPropertyValue('--resizable-panel-max')).toBe('480px')
    expect(getByText('Two').style.getPropertyValue('--resizable-panel-max')).toBe('none')
  })

  it('drags the handle with the pointer and settles on release', async () => {
    const { handle, sizes, changes, container } = renderPair()
    for (const panel of panelsOf(container))
      panel.getBoundingClientRect = () => ({ width: 500, height: 200 }) as DOMRect
    const fire = (type: string, clientX: number) =>
      handle().dispatchEvent(
        new PointerEvent(type, { bubbles: true, cancelable: true, pointerId: 1, clientX }),
      )
    fire('pointerdown', 500)
    await nextTick()
    expect(container.querySelector('.v-resizable')!.hasAttribute('data-dragging')).toBe(true)
    expect(handle().hasAttribute('data-active')).toBe(true)
    fire('pointermove', 600)
    expect(sizes.value).toEqual([60, 40])
    fire('pointermove', 550)
    expect(sizes.value).toEqual([55, 45])
    expect(changes).toEqual([])
    fire('pointerup', 550)
    expect(changes).toEqual([[55, 45]])
    await nextTick()
    expect(handle().hasAttribute('data-active')).toBe(false)
  })

  it('disabled fixes the sizes and takes the handles out of the tab order', async () => {
    const { handle, sizes } = renderPair('disabled')
    expect(handle().hasAttribute('tabindex')).toBe(false)
    expect(handle().getAttribute('aria-disabled')).toBe('true')
    await fireEvent.keyDown(handle(), { key: 'ArrowRight' })
    expect(sizes.value).toBeUndefined()
  })

  it('grip draws a grip on every handle, hidden from assistive technology', () => {
    const { handle } = renderPair('grip')
    const grip = handle().querySelector('.v-resizable-grip')!
    expect(grip.getAttribute('aria-hidden')).toBe('true')
  })

  it('passes attributes through to the group and to each panel', () => {
    const { container, getByText } = renderPair(
      'class="layout" data-test="group"',
      'id="side" class="side"',
    )
    const root = container.querySelector('.v-resizable')!
    expect(root.classList.contains('layout')).toBe(true)
    expect(root.getAttribute('data-test')).toBe('group')
    const side = getByText('One')
    expect(side.id).toBe('side')
    expect(side.classList.contains('side')).toBe(true)
  })

  it('warns about children that are not panels', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    renderHarness(`
      <VResizable>
        <VResizablePanel>A</VResizablePanel>
        <div>Stray</div>
      </VResizable>
    `)
    expect(warn).toHaveBeenCalledWith('[VResizable] Only VResizablePanel children are rendered.')
    warn.mockRestore()
  })
})
