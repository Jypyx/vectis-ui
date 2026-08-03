import { render } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick } from 'vue'

import VMenu from './VMenu.vue'
import VMenuGroup from './VMenuGroup.vue'
import VMenuItem from './VMenuItem.vue'
import VMenuSeparator from './VMenuSeparator.vue'
import { SUBMENU_HOVER_DELAY } from './context'

function renderHarness(template: string, onSelect = vi.fn()) {
  const Harness = defineComponent({
    components: { VMenu, VMenuItem, VMenuGroup, VMenuSeparator },
    setup: () => ({ onSelect }),
    template,
  })
  return { onSelect, ...render(Harness) }
}

function renderMenu(onSelect = vi.fn()) {
  return renderHarness(
    `
      <VMenu>
        <template #trigger="{ triggerProps }">
          <button data-testid="trigger" v-bind="triggerProps">Actions</button>
        </template>
        <VMenuItem label="Rename" @select="onSelect" />
        <VMenuItem label="Archive" disabled />
        <VMenuItem label="Delete" danger />
      </VMenu>
    `,
    onSelect,
  )
}

/** Opens the root panel (the jsdom popover stub) and makes the menu queryable. */
async function openMenu(container: Element): Promise<HTMLElement> {
  const menu = container.querySelector('[role="menu"]') as HTMLElement
  menu.showPopover()
  await nextTick()
  return menu
}

describe('VMenu', () => {
  it('width prop: data-width + an inline variable on the root panel', () => {
    const { container } = renderHarness(`
      <VMenu width="max-content">
        <template #trigger="{ triggerProps }">
          <button v-bind="triggerProps">Actions</button>
        </template>
        <VMenuItem label="Rename" />
      </VMenu>
    `)
    const menu = container.querySelector('[role="menu"]') as HTMLElement
    expect(menu.hasAttribute('data-width')).toBe(true)
    expect(menu.style.getPropertyValue('--menu-width')).toBe('max-content')
  })

  it('the subpanels do not render data-width (default width)', () => {
    const { container } = renderHarness(`
      <VMenu width="max-content">
        <template #trigger="{ triggerProps }">
          <button v-bind="triggerProps">Actions</button>
        </template>
        <VMenuItem label="Export">
          <template #submenu>
            <VMenuItem label="PDF" />
          </template>
        </VMenuItem>
      </VMenu>
    `)
    const [root, sub] = [...container.querySelectorAll<HTMLElement>('[role="menu"]')]
    expect(root?.hasAttribute('data-width')).toBe(true)
    expect(sub?.hasAttribute('data-width')).toBe(false)
  })

  // The floor itself (`min-inline-size: anchor-size(width)`) is not observable here
  // — jsdom resolves neither the anchor nor the layout: the `VMenu/Width` play
  // function is what covers it. Only the wiring is left.
  it('matchTrigger prop: data-match-trigger on the root panel alone', () => {
    const { container } = renderHarness(`
      <VMenu match-trigger>
        <template #trigger="{ triggerProps }">
          <button v-bind="triggerProps">Actions</button>
        </template>
        <VMenuItem label="Export">
          <template #submenu>
            <VMenuItem label="PDF" />
          </template>
        </VMenuItem>
      </VMenu>
    `)
    const [root, sub] = [...container.querySelectorAll<HTMLElement>('[role="menu"]')]
    expect(root?.hasAttribute('data-match-trigger')).toBe(true)
    expect(sub?.hasAttribute('data-match-trigger')).toBe(false)
  })

  it('without matchTrigger, no data-match-trigger (default width)', () => {
    const { container } = renderHarness(`
      <VMenu>
        <template #trigger="{ triggerProps }">
          <button v-bind="triggerProps">Actions</button>
        </template>
        <VMenuItem label="Rename" />
      </VMenu>
    `)
    const menu = container.querySelector('[role="menu"]') as HTMLElement
    expect(menu.hasAttribute('data-match-trigger')).toBe(false)
  })

  it('sets the ARIA contract on the trigger and on the panel', () => {
    // closed menu ([popover] is display:none): query outside the accessibility tree
    const { getByTestId, container } = renderMenu()
    const trigger = getByTestId('trigger')
    const menu = container.querySelector('[role="menu"]') as HTMLElement
    expect(trigger.getAttribute('popovertarget')).toBe(menu.id)
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(trigger.getAttribute('aria-controls')).toBe(menu.id)
  })

  it('focuses the first item on opening and updates aria-expanded', async () => {
    const { getByTestId, getByRole, container } = renderMenu()
    await openMenu(container)
    expect(getByRole('menuitem', { name: 'Rename' })).toBe(document.activeElement)
    expect(getByTestId('trigger').getAttribute('aria-expanded')).toBe('true')
  })

  it('navigates with the arrows, skipping disabled items, and wraps around', async () => {
    const { getByRole, container } = renderMenu()
    const menu = await openMenu(container)

    const arrowDown = () =>
      menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))

    arrowDown()
    // "Archive" (disabled) is skipped
    expect(getByRole('menuitem', { name: 'Delete' })).toBe(document.activeElement)
    arrowDown()
    expect(getByRole('menuitem', { name: 'Rename' })).toBe(document.activeElement)

    menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }))
    expect(getByRole('menuitem', { name: 'Delete' })).toBe(document.activeElement)
  })

  it('selecting emits select, closes the menu and hands focus back to the trigger', async () => {
    const { onSelect, getByRole, getByTestId, container } = renderMenu()
    const menu = await openMenu(container)

    getByRole('menuitem', { name: 'Rename' }).click()
    await nextTick()
    expect(onSelect).toHaveBeenCalledOnce()
    expect(menu.hasAttribute('data-popover-open')).toBe(false)
    expect(getByTestId('trigger')).toBe(document.activeElement)
  })

  it('a disabled item does not trigger select', async () => {
    const { onSelect, getByRole, container } = renderMenu()
    await openMenu(container)

    getByRole('menuitem', { name: 'Archive' }).click()
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('hovering an item gives it the focus (never a disabled item)', async () => {
    const { getByRole, container } = renderMenu()
    await openMenu(container)
    const danger = getByRole('menuitem', { name: 'Delete' })

    // hovering transfers the focus: a single highlight at a time
    danger.dispatchEvent(new Event('pointerenter'))
    expect(danger).toBe(document.activeElement)

    // hovering a disabled item does not move the focus
    getByRole('menuitem', { name: 'Archive' }).dispatchEvent(new Event('pointerenter'))
    expect(danger).toBe(document.activeElement)
  })

  describe('anatomy of an item', () => {
    it('the slots win over the label/sublabel props', async () => {
      const { getByRole, container } = renderHarness(`
        <VMenu>
          <template #trigger="{ triggerProps }">
            <button v-bind="triggerProps">Actions</button>
          </template>
          <VMenuItem label="Ignored" sublabel="Ignored too">
            Share
            <template #sublabel>To another workspace</template>
          </VMenuItem>
          <VMenuItem label="Duplicate" sublabel="Copy into the current folder" />
        </VMenu>
      `)
      await openMenu(container)

      const slotted = getByRole('menuitem', { name: /Share/ })
      expect(slotted.querySelector('.v-menu-item-label')?.textContent).toContain('Share')
      expect(slotted.querySelector('.v-menu-item-sublabel')?.textContent).toBe(
        'To another workspace',
      )

      const fromProps = getByRole('menuitem', { name: /Duplicate/ })
      expect(fromProps.querySelector('.v-menu-item-label')?.textContent).toBe('Duplicate')
      expect(fromProps.querySelector('.v-menu-item-sublabel')?.textContent).toBe(
        'Copy into the current folder',
      )
    })

    it('iconStart accepts a name or an explicit `{ src }` render', async () => {
      const { getByRole, container } = renderHarness(`
        <VMenu>
          <template #trigger="{ triggerProps }">
            <button v-bind="triggerProps">Actions</button>
          </template>
          <VMenuItem label="Rename" icon-start="edit" icon-end="chevron_right" />
          <VMenuItem label="Logo" :icon-start="{ src: '/logo.svg' }" />
        </VMenu>
      `)
      await openMenu(container)

      const named = getByRole('menuitem', { name: 'Rename' })
      const icons = [...named.querySelectorAll<HTMLElement>('.v-icon')].map((el) => el.dataset.icon)
      expect(icons).toEqual(['edit', 'chevron_right'])

      const img = getByRole('menuitem', { name: 'Logo' }).querySelector('.v-icon-img')
      expect(img?.getAttribute('src')).toBe('/logo.svg')
    })

    it('selected sets data-selected and aria-current', async () => {
      const { getByRole, container } = renderHarness(`
        <VMenu>
          <template #trigger="{ triggerProps }">
            <button v-bind="triggerProps">Sort</button>
          </template>
          <VMenuItem label="By name" selected />
          <VMenuItem label="By date" />
        </VMenu>
      `)
      await openMenu(container)

      const selected = getByRole('menuitem', { name: 'By name' })
      expect(selected.hasAttribute('data-selected')).toBe(true)
      expect(selected.getAttribute('aria-current')).toBe('true')
      const other = getByRole('menuitem', { name: 'By date' })
      expect(other.hasAttribute('data-selected')).toBe(false)
      expect(other.hasAttribute('aria-current')).toBe(false)
    })
  })

  it('size/compact set data-size/data-compact on the root panel', () => {
    const { container } = renderHarness(`
      <VMenu size="md" compact>
        <template #trigger="{ triggerProps }">
          <button v-bind="triggerProps">Actions</button>
        </template>
        <VMenuItem label="Rename" />
      </VMenu>
    `)
    const menu = container.querySelector('[role="menu"]') as HTMLElement
    expect(menu.getAttribute('data-size')).toBe('md')
    expect(menu.hasAttribute('data-compact')).toBe(true)
  })

  it('the subpanels render neither data-size nor data-compact (CSS inheritance)', () => {
    const { container } = renderHarness(`
      <VMenu size="md" compact>
        <template #trigger="{ triggerProps }">
          <button v-bind="triggerProps">Actions</button>
        </template>
        <VMenuItem label="Export">
          <template #submenu>
            <VMenuItem label="PDF" />
          </template>
        </VMenuItem>
      </VMenu>
    `)
    const [root, sub] = [...container.querySelectorAll<HTMLElement>('[role="menu"]')]
    expect(root?.getAttribute('data-size')).toBe('md')
    expect(sub?.hasAttribute('data-size')).toBe(false)
    expect(sub?.hasAttribute('data-compact')).toBe(false)
  })

  it('v-control is set ONLY on the root panel (the inherited compact depends on it)', () => {
    // On a subpanel, `.v-control` would redefine --control-height from
    // --control-height-base WITHOUT the [data-compact] condition (which it does not
    // carry): the height would snap back there to its non-compact value.
    const { container } = renderHarness(`
      <VMenu size="md" compact>
        <template #trigger="{ triggerProps }">
          <button v-bind="triggerProps">Actions</button>
        </template>
        <VMenuItem label="Export">
          <template #submenu>
            <VMenuItem label="PDF" />
          </template>
        </VMenuItem>
      </VMenu>
    `)
    const [root, sub] = [...container.querySelectorAll<HTMLElement>('[role="menu"]')]
    expect(root?.classList.contains('v-control')).toBe(true)
    expect(sub?.classList.contains('v-control')).toBe(false)
  })

  describe('groups and separators', () => {
    function renderGrouped() {
      return renderHarness(`
        <VMenu>
          <template #trigger="{ triggerProps }">
            <button v-bind="triggerProps">Actions</button>
          </template>
          <VMenuGroup label="File">
            <VMenuItem label="Rename" />
            <VMenuItem label="Duplicate" />
          </VMenuGroup>
          <VMenuSeparator />
          <VMenuItem label="Delete" danger />
        </VMenu>
      `)
    }

    it('the group exposes role="group" named by its label, outside the roving focus', async () => {
      const { getByRole, container } = renderGrouped()
      const menu = await openMenu(container)

      const group = getByRole('group', { name: 'File' })
      const labelId = group.getAttribute('aria-labelledby') as string
      expect(document.getElementById(labelId)?.textContent).toBe('File')
      // the group label is not an item: never focused by the roving
      expect(getByRole('menuitem', { name: 'Rename' })).toBe(document.activeElement)
      menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }))
      expect(getByRole('menuitem', { name: 'Rename' })).toBe(document.activeElement)
    })

    it('the roving focus crosses the groups and ignores the separators', async () => {
      const { getByRole, container } = renderGrouped()
      const menu = await openMenu(container)

      const arrowDown = () =>
        menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
      arrowDown()
      expect(getByRole('menuitem', { name: 'Duplicate' })).toBe(document.activeElement)
      arrowDown()
      // the separator (role="separator") is ignored: the next item is outside the group
      expect(getByRole('menuitem', { name: 'Delete' })).toBe(document.activeElement)
      expect(getByRole('separator')).toBeTruthy()
    })
  })

  describe('submenus', () => {
    function renderSubmenu(onSelect = vi.fn()) {
      return renderHarness(
        `
          <VMenu>
            <template #trigger="{ triggerProps }">
              <button data-testid="trigger" v-bind="triggerProps">Actions</button>
            </template>
            <VMenuItem label="Rename" @select="onSelect" />
            <VMenuItem label="Export" icon-end="download" @select="onSelect">
              <template #submenu>
                <VMenuItem label="PDF" @select="onSelect" />
                <VMenuItem label="PNG" />
              </template>
            </VMenuItem>
          </VMenu>
        `,
        onSelect,
      )
    }

    function panels(container: Element): HTMLElement[] {
      return [...container.querySelectorAll<HTMLElement>('[role="menu"]')]
    }

    it('the parent item is wired as the subpanel invoker, a chevron replacing iconEnd', async () => {
      const { getByRole, container } = renderSubmenu()
      await openMenu(container)

      const parent = getByRole('menuitem', { name: 'Export' })
      const sub = panels(container)[1] as HTMLElement
      expect(parent.getAttribute('aria-haspopup')).toBe('menu')
      expect(parent.getAttribute('aria-expanded')).toBe('false')
      expect(parent.getAttribute('popovertarget')).toBe(sub.id)
      expect(parent.getAttribute('aria-controls')).toBe(sub.id)
      // the subpanel is a DOM descendant of the parent panel (the native stack)
      expect(panels(container)[0]?.contains(sub)).toBe(true)
      expect(parent.querySelector<HTMLElement>('.v-menu-item-chevron')?.dataset.icon).toBe(
        'chevron_right',
      )
      const icons = [...parent.querySelectorAll<HTMLElement>('.v-icon')].map(
        (el) => el.dataset.icon,
      )
      expect(icons).not.toContain('download')
    })

    it('ArrowRight opens the submenu, focuses its first item and emits no select', async () => {
      const { onSelect, getByRole, container } = renderSubmenu()
      await openMenu(container)

      const parent = getByRole('menuitem', { name: 'Export' })
      parent.focus()
      parent.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
      await nextTick()

      const sub = panels(container)[1] as HTMLElement
      expect(sub.hasAttribute('data-popover-open')).toBe(true)
      expect(parent.getAttribute('aria-expanded')).toBe('true')
      expect(getByRole('menuitem', { name: 'PDF' })).toBe(document.activeElement)
      expect(onSelect).not.toHaveBeenCalled()
    })

    it('the roving focus is confined to the open subpanel', async () => {
      const { getByRole, container } = renderSubmenu()
      await openMenu(container)

      const parent = getByRole('menuitem', { name: 'Export' })
      parent.focus()
      parent.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
      await nextTick()

      const arrowDown = () =>
        document.activeElement?.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
        )
      arrowDown()
      expect(getByRole('menuitem', { name: 'PNG' })).toBe(document.activeElement)
      // wrapping inside the subpanel: never a leak towards the parent's items
      arrowDown()
      expect(getByRole('menuitem', { name: 'PDF' })).toBe(document.activeElement)
    })

    it('ArrowLeft closes the submenu and hands focus back to the parent item', async () => {
      const { getByRole, container } = renderSubmenu()
      await openMenu(container)

      const parent = getByRole('menuitem', { name: 'Export' })
      parent.focus()
      parent.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
      await nextTick()

      document.activeElement?.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }),
      )
      await nextTick()
      const sub = panels(container)[1] as HTMLElement
      expect(sub.hasAttribute('data-popover-open')).toBe(false)
      expect(parent).toBe(document.activeElement)
    })

    it('Escape closes the current submenu, then the menu on the second press', async () => {
      const { getByRole, getByTestId, container } = renderSubmenu()
      const menu = await openMenu(container)

      const parent = getByRole('menuitem', { name: 'Export' })
      parent.focus()
      parent.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
      await nextTick()

      const escape = () =>
        document.activeElement?.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
        )

      // 1st Escape: only the current level closes, focus on the parent item
      escape()
      await nextTick()
      expect(panels(container)[1]?.hasAttribute('data-popover-open')).toBe(false)
      expect(menu.hasAttribute('data-popover-open')).toBe(true)
      expect(parent).toBe(document.activeElement)

      // 2nd Escape: the root panel closes, focus on the trigger
      escape()
      await nextTick()
      expect(menu.hasAttribute('data-popover-open')).toBe(false)
      expect(getByTestId('trigger')).toBe(document.activeElement)
    })

    it('selecting a submenu leaf emits select and closes the whole stack', async () => {
      const { onSelect, getByRole, container } = renderSubmenu()
      const menu = await openMenu(container)

      const parent = getByRole('menuitem', { name: 'Export' })
      parent.focus()
      parent.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
      await nextTick()

      getByRole('menuitem', { name: 'PDF' }).click()
      await nextTick()
      expect(onSelect).toHaveBeenCalledOnce()
      expect(panels(container)[1]?.hasAttribute('data-popover-open')).toBe(false)
      expect(menu.hasAttribute('data-popover-open')).toBe(false)
    })

    it('activating an item with a submenu never emits select', async () => {
      const { onSelect, getByRole, container } = renderSubmenu()
      await openMenu(container)

      getByRole('menuitem', { name: 'Export' }).click()
      expect(onSelect).not.toHaveBeenCalled()
    })

    it('opens on hover after the intent delay and closes when the pointer leaves', async () => {
      vi.useFakeTimers()
      try {
        const { getByRole, container } = renderSubmenu()
        await openMenu(container)

        const parent = getByRole('menuitem', { name: 'Export' })
        const sub = panels(container)[1] as HTMLElement

        parent.dispatchEvent(new Event('pointerenter'))
        // no opening before the intent delay
        expect(sub.hasAttribute('data-popover-open')).toBe(false)
        vi.advanceTimersByTime(SUBMENU_HOVER_DELAY)
        expect(sub.hasAttribute('data-popover-open')).toBe(true)

        parent.dispatchEvent(new Event('pointerleave'))
        vi.advanceTimersByTime(SUBMENU_HOVER_DELAY)
        expect(sub.hasAttribute('data-popover-open')).toBe(false)
      } finally {
        vi.useRealTimers()
      }
    })

    it('hovering does not close a submenu the keyboard is navigating', async () => {
      vi.useFakeTimers()
      try {
        const { getByRole, container } = renderSubmenu()
        await openMenu(container)

        const parent = getByRole('menuitem', { name: 'Export' })
        parent.focus()
        parent.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
        await nextTick()
        // the focus is on "PDF", inside the subpanel

        parent.dispatchEvent(new Event('pointerleave'))
        vi.advanceTimersByTime(SUBMENU_HOVER_DELAY)
        expect(panels(container)[1]?.hasAttribute('data-popover-open')).toBe(true)
      } finally {
        vi.useRealTimers()
      }
    })
  })

  describe('navigation items (href)', () => {
    function renderNavMenu(onSelect = vi.fn()) {
      return renderHarness(
        `
          <VMenu>
            <template #trigger="{ triggerProps }">
              <button data-testid="trigger" v-bind="triggerProps">Go to</button>
            </template>
            <VMenuItem href="#profile" label="Profile" @select="onSelect" />
            <VMenuItem href="#archives" label="Archives" disabled />
            <VMenuItem label="Action" @select="onSelect" />
          </VMenu>
        `,
        onSelect,
      )
    }

    it('href renders an <a role="menuitem"> with the link', async () => {
      const { getByRole, container } = renderNavMenu()
      await openMenu(container)
      const item = getByRole('menuitem', { name: 'Profile' })
      expect(item.tagName).toBe('A')
      expect(item.getAttribute('href')).toBe('#profile')
      // the item with no href stays a <button>
      expect(getByRole('menuitem', { name: 'Action' }).tagName).toBe('BUTTON')
    })

    it('selecting a link emits select and closes the menu', async () => {
      const { onSelect, getByRole, container } = renderNavMenu()
      const menu = await openMenu(container)

      getByRole('menuitem', { name: 'Profile' }).click()
      await nextTick()
      expect(onSelect).toHaveBeenCalledOnce()
      expect(menu.hasAttribute('data-popover-open')).toBe(false)
    })

    it('a disabled link is inert and excluded from the roving focus', async () => {
      const { getByRole, container } = renderNavMenu()
      const menu = await openMenu(container)

      const inert = getByRole('menuitem', { name: 'Archives' })
      expect(inert.hasAttribute('href')).toBe(false)
      expect(inert.getAttribute('aria-disabled')).toBe('true')
      // "Archives" is skipped by the arrow navigation
      expect(getByRole('menuitem', { name: 'Profile' })).toBe(document.activeElement)
      menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
      expect(getByRole('menuitem', { name: 'Action' })).toBe(document.activeElement)
    })
  })
})
