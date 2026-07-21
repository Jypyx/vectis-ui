import { render } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick } from 'vue'

import DropdownMenu from './DropdownMenu.vue'
import DropdownMenuItem from './DropdownMenuItem.vue'

function renderMenu(onSelect = vi.fn()) {
  const Harness = defineComponent({
    components: { DropdownMenu, DropdownMenuItem },
    setup: () => ({ onSelect }),
    template: `
      <DropdownMenu>
        <template #trigger="{ triggerProps }">
          <button data-testid="trigger" v-bind="triggerProps">Actions</button>
        </template>
        <DropdownMenuItem @select="onSelect">Renommer</DropdownMenuItem>
        <DropdownMenuItem disabled>Archiver</DropdownMenuItem>
        <DropdownMenuItem danger>Supprimer</DropdownMenuItem>
      </DropdownMenu>
    `,
  })
  return { onSelect, ...render(Harness) }
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
})
