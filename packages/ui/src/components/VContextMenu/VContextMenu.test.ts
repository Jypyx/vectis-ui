import { fireEvent, render, waitFor } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'

import VMenuItem from '../VMenu/VMenuItem.vue'
import VContextMenu from './VContextMenu.vue'

function renderHarness(template: string, bindings: Record<string, unknown> = {}) {
  const Harness = defineComponent({
    components: { VContextMenu, VMenuItem },
    setup: () => bindings,
    template,
  })
  return render(Harness)
}

const BASIC = `
  <VContextMenu data-testid="zone" class="files" aria-label="Files">
    <button data-testid="first">report.pdf</button>
    <span data-testid="second">notes.txt</span>
    <template #menu="{ target }">
      <VMenuItem label="Rename" @select="onSelect(target)" />
      <VMenuItem label="Delete" tone="danger" />
    </template>
  </VContextMenu>
`

function panel(container: Element): HTMLElement {
  return container.querySelector('[role="menu"]') as HTMLElement
}

function isOpen(container: Element): boolean {
  return panel(container).hasAttribute('data-popover-open')
}

/** Dispatches a `contextmenu` event; false when the component kept the native menu away. */
function contextMenu(el: Element, init: MouseEventInit): boolean {
  return el.dispatchEvent(
    new MouseEvent('contextmenu', { bubbles: true, cancelable: true, ...init }),
  )
}

/** A right click as the browser reports it: the secondary button, already released. */
function rightClick(el: Element, init: MouseEventInit = {}): boolean {
  return contextMenu(el, { button: 2, clientX: 120, clientY: 80, ...init })
}

function keyDown(el: Element, init: KeyboardEventInit): boolean {
  return el.dispatchEvent(
    new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init }),
  )
}

describe('VContextMenu', () => {
  it('renders the zone as a div by default, with the attributes on it', () => {
    const { getByTestId } = renderHarness(BASIC, { onSelect: vi.fn() })
    const zone = getByTestId('zone')
    expect(zone.tagName).toBe('DIV')
    expect(zone.classList.contains('v-context-menu')).toBe(true)
    expect(zone.classList.contains('files')).toBe(true)
    expect(zone.getAttribute('aria-label')).toBe('Files')
  })

  it('as: renders the zone as another element', () => {
    const { getByTestId } = renderHarness(`
      <VContextMenu as="ul" data-testid="zone">
        <li>One</li>
        <template #menu><VMenuItem label="Rename" /></template>
      </VContextMenu>
    `)
    expect(getByTestId('zone').tagName).toBe('UL')
  })

  it('a right click opens the menu at the pointer and keeps the native menu away', async () => {
    const { container, getByTestId } = renderHarness(BASIC, { onSelect: vi.fn() })
    expect(isOpen(container)).toBe(false)

    const allowed = rightClick(getByTestId('second'))
    await nextTick()

    expect(allowed).toBe(false)
    expect(isOpen(container)).toBe(true)
    const anchor = container.querySelector('.v-context-menu-anchor') as HTMLElement
    expect(anchor.style.left).toBe('120px')
    expect(anchor.style.top).toBe('80px')
    // The anchor name the panel is positioned against is the one the anchor carries.
    expect(panel(container).style.getPropertyValue('--menu-anchor')).toBe(
      anchor.style.getPropertyValue('anchor-name'),
    )
    // A pointer opening singles out no command.
    expect(document.activeElement).toBe(panel(container))
  })

  it('the menu slot receives the element the menu was opened on', async () => {
    const onSelect = vi.fn()
    const { getByTestId, getByRole } = renderHarness(BASIC, { onSelect })

    rightClick(getByTestId('second'))
    await nextTick()
    await fireEvent.click(getByRole('menuitem', { name: 'Rename' }))

    expect(onSelect).toHaveBeenCalledWith(getByTestId('second'))
  })

  it('a right click with Shift leaves the native menu', async () => {
    const { container, getByTestId } = renderHarness(BASIC, { onSelect: vi.fn() })
    const allowed = rightClick(getByTestId('second'), { shiftKey: true })
    await nextTick()
    expect(allowed).toBe(true)
    expect(isOpen(container)).toBe(false)
  })

  it('disabled: leaves the native menu', async () => {
    const { container, getByTestId } = renderHarness(`
      <VContextMenu disabled data-testid="zone">
        Zone
        <template #menu><VMenuItem label="Rename" /></template>
      </VContextMenu>
    `)
    const allowed = rightClick(getByTestId('zone'))
    await nextTick()
    expect(allowed).toBe(true)
    expect(isOpen(container)).toBe(false)
  })

  it('a nested context menu answers for its own zone only', async () => {
    const { container, getByTestId } = renderHarness(`
      <VContextMenu>
        <VContextMenu data-testid="inner">
          Inner
          <template #menu><VMenuItem label="Inner command" /></template>
        </VContextMenu>
        <template #menu><VMenuItem label="Outer command" /></template>
      </VContextMenu>
    `)
    rightClick(getByTestId('inner'))
    await nextTick()
    // The inner zone, its panel included, comes first in the document.
    const [inner, outer] = [...container.querySelectorAll('[role="menu"]')]
    expect(inner?.hasAttribute('data-popover-open')).toBe(true)
    expect(outer?.hasAttribute('data-popover-open')).toBe(false)
  })

  it('the Menu key opens the menu with the focus on the first command', async () => {
    const { container, getByTestId, getByRole } = renderHarness(BASIC, { onSelect: vi.fn() })
    const first = getByTestId('first')
    first.focus()

    // No button pressed or released: the keyboard's signature.
    const allowed = contextMenu(first, { button: 0, buttons: 0 })
    await nextTick()

    expect(allowed).toBe(false)
    expect(isOpen(container)).toBe(true)
    expect(document.activeElement).toBe(getByRole('menuitem', { name: 'Rename' }))
  })

  it('Shift+F10 opens the menu under the focused element', async () => {
    const { container, getByTestId, getByRole } = renderHarness(BASIC, { onSelect: vi.fn() })
    const first = getByTestId('first')
    first.focus()

    const allowed = keyDown(first, { key: 'F10', shiftKey: true })
    await nextTick()

    expect(allowed).toBe(false)
    expect(isOpen(container)).toBe(true)
    expect(document.activeElement).toBe(getByRole('menuitem', { name: 'Rename' }))
  })

  it('F10 without Shift, or with another modifier, does nothing', async () => {
    const { container, getByTestId } = renderHarness(BASIC, { onSelect: vi.fn() })
    const first = getByTestId('first')
    keyDown(first, { key: 'F10' })
    keyDown(first, { key: 'F10', shiftKey: true, ctrlKey: true })
    await nextTick()
    expect(isOpen(container)).toBe(false)
  })

  it('a keyboard contextmenu after Shift+F10 does not reopen the menu', async () => {
    const { getByTestId, getByRole } = renderHarness(BASIC, { onSelect: vi.fn() })
    const first = getByTestId('first')
    first.focus()
    keyDown(first, { key: 'F10', shiftKey: true })
    await nextTick()
    await fireEvent.keyDown(getByRole('menuitem', { name: 'Rename' }), { key: 'ArrowDown' })
    expect(document.activeElement).toBe(getByRole('menuitem', { name: 'Delete' }))

    const allowed = contextMenu(first, { button: 0, buttons: 0 })
    await nextTick()
    expect(allowed).toBe(false)
    expect(document.activeElement).toBe(getByRole('menuitem', { name: 'Delete' }))
  })

  it('opened while the button is still down, it waits for the release', async () => {
    const { container, getByTestId } = renderHarness(BASIC, { onSelect: vi.fn() })
    rightClick(getByTestId('second'), { buttons: 2 })
    await nextTick()
    expect(isOpen(container)).toBe(false)

    await fireEvent.pointerUp(document.body)
    await waitFor(() => expect(isOpen(container)).toBe(true))
  })

  it('a right click on the open menu is kept from the browser', async () => {
    const { container, getByTestId, getByRole } = renderHarness(BASIC, { onSelect: vi.fn() })
    rightClick(getByTestId('second'))
    await nextTick()
    expect(rightClick(getByRole('menuitem', { name: 'Rename' }))).toBe(false)
    expect(isOpen(container)).toBe(true)
  })

  it('a second right click moves the menu to the new target', async () => {
    const onSelect = vi.fn()
    const { container, getByTestId, getByRole } = renderHarness(BASIC, { onSelect })
    const first = getByTestId('first')
    first.focus()
    rightClick(getByTestId('second'))
    await nextTick()
    rightClick(first, { clientX: 10, clientY: 20 })
    await nextTick()

    expect(isOpen(container)).toBe(true)
    const anchor = container.querySelector('.v-context-menu-anchor') as HTMLElement
    expect(anchor.style.left).toBe('10px')
    await fireEvent.click(getByRole('menuitem', { name: 'Rename' }))
    expect(onSelect).toHaveBeenCalledWith(first)
    // The focus held before the first opening is still the one returned to.
    expect(document.activeElement).toBe(first)
  })

  it('choosing a command closes the menu and returns the focus', async () => {
    const { container, getByTestId, getByRole } = renderHarness(BASIC, { onSelect: vi.fn() })
    const first = getByTestId('first')
    first.focus()
    keyDown(first, { key: 'F10', shiftKey: true })
    await nextTick()

    await fireEvent.click(getByRole('menuitem', { name: 'Rename' }))
    expect(isOpen(container)).toBe(false)
    expect(document.activeElement).toBe(first)
  })

  it('Escape closes the menu and returns the focus', async () => {
    const { container, getByTestId, getByRole } = renderHarness(BASIC, { onSelect: vi.fn() })
    const first = getByTestId('first')
    first.focus()
    keyDown(first, { key: 'F10', shiftKey: true })
    await nextTick()

    await fireEvent.keyDown(getByRole('menuitem', { name: 'Rename' }), { key: 'Escape' })
    expect(isOpen(container)).toBe(false)
    expect(document.activeElement).toBe(first)
  })

  it('v-model:open opens the menu and follows its closing', async () => {
    const open = ref(false)
    const { container, getByRole } = renderHarness(
      `
        <VContextMenu v-model:open="open">
          Zone
          <template #menu><VMenuItem label="Rename" /></template>
        </VContextMenu>
      `,
      { open },
    )
    open.value = true
    await nextTick()
    expect(isOpen(container)).toBe(true)

    await fireEvent.click(getByRole('menuitem', { name: 'Rename' }))
    expect(open.value).toBe(false)
  })

  it('exposes show(event), close() and the panel element', async () => {
    const menu = ref<InstanceType<typeof VContextMenu> | null>(null)
    const { container } = renderHarness(
      `
        <VContextMenu ref="menu">
          Zone
          <template #menu><VMenuItem label="Rename" /></template>
        </VContextMenu>
      `,
      { menu },
    )
    menu.value?.show(new MouseEvent('click', { clientX: 40, clientY: 50 }))
    await nextTick()
    expect(isOpen(container)).toBe(true)
    const anchor = container.querySelector('.v-context-menu-anchor') as HTMLElement
    expect(anchor.style.top).toBe('50px')
    expect(menu.value?.el).toBe(panel(container))

    menu.value?.close()
    await nextTick()
    expect(isOpen(container)).toBe(false)
  })

  it('size, compact and width reach the panel', () => {
    const { container } = renderHarness(`
      <VContextMenu size="lg" compact :width="240">
        Zone
        <template #menu><VMenuItem label="Rename" /></template>
      </VContextMenu>
    `)
    const menu = panel(container)
    expect(menu.getAttribute('data-size')).toBe('lg')
    expect(menu.hasAttribute('data-compact')).toBe(true)
    expect(menu.style.getPropertyValue('--menu-width')).toBe('240px')
  })
})
