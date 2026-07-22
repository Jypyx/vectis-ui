import { render } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick } from 'vue'

import DropdownMenu from './DropdownMenu.vue'
import DropdownMenuItem from './DropdownMenuItem.vue'

function renderHarness(template: string, onSelect = vi.fn()) {
  const Harness = defineComponent({
    components: { DropdownMenu, DropdownMenuItem },
    setup: () => ({ onSelect }),
    template,
  })
  return { onSelect, ...render(Harness) }
}

function renderMenu(onSelect = vi.fn()) {
  return renderHarness(
    `
      <DropdownMenu>
        <template #trigger="{ triggerProps }">
          <button data-testid="trigger" v-bind="triggerProps">Actions</button>
        </template>
        <DropdownMenuItem @select="onSelect">Renommer</DropdownMenuItem>
        <DropdownMenuItem disabled>Archiver</DropdownMenuItem>
        <DropdownMenuItem danger>Supprimer</DropdownMenuItem>
      </DropdownMenu>
    `,
    onSelect,
  )
}

describe('DropdownMenu', () => {
  it('pose le contrat ARIA sur le déclencheur et le panneau', () => {
    // menu fermé ([popover] est display:none) : requête hors arbre d'accessibilité
    const { getByTestId, container } = renderMenu()
    const trigger = getByTestId('trigger')
    const menu = container.querySelector('[role="menu"]') as HTMLElement
    expect(trigger.getAttribute('popovertarget')).toBe(menu.id)
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(trigger.getAttribute('aria-controls')).toBe(menu.id)
  })

  it("focus le premier item à l'ouverture et met à jour aria-expanded", async () => {
    const { getByTestId, getByRole, container } = renderMenu()
    const menu = container.querySelector('[role="menu"]') as HTMLElement

    menu.showPopover()
    await nextTick()
    expect(getByRole('menuitem', { name: 'Renommer' })).toBe(document.activeElement)
    expect(getByTestId('trigger').getAttribute('aria-expanded')).toBe('true')
  })

  it('navigue aux flèches en sautant les items désactivés, avec bouclage', async () => {
    const { getByRole, container } = renderMenu()
    const menu = container.querySelector('[role="menu"]') as HTMLElement
    menu.showPopover()
    await nextTick()

    const arrowDown = () =>
      menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))

    arrowDown()
    // « Archiver » (disabled) est sauté
    expect(getByRole('menuitem', { name: 'Supprimer' })).toBe(document.activeElement)
    arrowDown()
    expect(getByRole('menuitem', { name: 'Renommer' })).toBe(document.activeElement)

    menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }))
    expect(getByRole('menuitem', { name: 'Supprimer' })).toBe(document.activeElement)
  })

  it('la sélection émet select, ferme le menu et rend le focus au déclencheur', async () => {
    const { onSelect, getByRole, getByTestId, container } = renderMenu()
    const menu = container.querySelector('[role="menu"]') as HTMLElement
    menu.showPopover()
    await nextTick()

    getByRole('menuitem', { name: 'Renommer' }).click()
    await nextTick()
    expect(onSelect).toHaveBeenCalledOnce()
    expect(menu.hasAttribute('data-popover-open')).toBe(false)
    expect(getByTestId('trigger')).toBe(document.activeElement)
  })

  it('un item désactivé ne déclenche pas select', async () => {
    const { onSelect, getByRole, container } = renderMenu()
    ;(container.querySelector('[role="menu"]') as HTMLElement).showPopover()
    await nextTick()

    getByRole('menuitem', { name: 'Archiver' }).click()
    expect(onSelect).not.toHaveBeenCalled()
  })

  describe('items de navigation (href)', () => {
    function renderNavMenu(onSelect = vi.fn()) {
      return renderHarness(
        `
          <DropdownMenu>
            <template #trigger="{ triggerProps }">
              <button data-testid="trigger" v-bind="triggerProps">Aller à</button>
            </template>
            <DropdownMenuItem href="#profil" @select="onSelect">Profil</DropdownMenuItem>
            <DropdownMenuItem href="#archives" disabled>Archives</DropdownMenuItem>
            <DropdownMenuItem @select="onSelect">Action</DropdownMenuItem>
          </DropdownMenu>
        `,
        onSelect,
      )
    }

    it('href rend un <a role="menuitem"> avec le lien', async () => {
      // menu ouvert : fermé, [popover] est display:none → hors requêtes par rôle
      const { getByRole, container } = renderNavMenu()
      ;(container.querySelector('[role="menu"]') as HTMLElement).showPopover()
      await nextTick()
      const item = getByRole('menuitem', { name: 'Profil' })
      expect(item.tagName).toBe('A')
      expect(item.getAttribute('href')).toBe('#profil')
      // l'item sans href reste un <button>
      expect(getByRole('menuitem', { name: 'Action' }).tagName).toBe('BUTTON')
    })

    it('la sélection d’un lien émet select et ferme le menu', async () => {
      const { onSelect, getByRole, container } = renderNavMenu()
      const menu = container.querySelector('[role="menu"]') as HTMLElement
      menu.showPopover()
      await nextTick()

      getByRole('menuitem', { name: 'Profil' }).click()
      await nextTick()
      expect(onSelect).toHaveBeenCalledOnce()
      expect(menu.hasAttribute('data-popover-open')).toBe(false)
    })

    it('un lien désactivé est inerte et exclu du roving focus', async () => {
      const { getByRole, container } = renderNavMenu()
      const menu = container.querySelector('[role="menu"]') as HTMLElement
      menu.showPopover()
      await nextTick()

      const inert = getByRole('menuitem', { name: 'Archives' })
      expect(inert.hasAttribute('href')).toBe(false)
      expect(inert.getAttribute('aria-disabled')).toBe('true')
      // « Archives » est sauté par la navigation aux flèches
      expect(getByRole('menuitem', { name: 'Profil' })).toBe(document.activeElement)
      menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
      expect(getByRole('menuitem', { name: 'Action' })).toBe(document.activeElement)
    })
  })
})
