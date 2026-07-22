import { render } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick } from 'vue'

import Menu from './Menu.vue'
import MenuGroup from './MenuGroup.vue'
import MenuItem from './MenuItem.vue'
import MenuSeparator from './MenuSeparator.vue'
import { SUBMENU_HOVER_DELAY } from './context'

function renderHarness(template: string, onSelect = vi.fn()) {
  const Harness = defineComponent({
    components: { Menu, MenuItem, MenuGroup, MenuSeparator },
    setup: () => ({ onSelect }),
    template,
  })
  return { onSelect, ...render(Harness) }
}

function renderMenu(onSelect = vi.fn()) {
  return renderHarness(
    `
      <Menu>
        <template #trigger="{ triggerProps }">
          <button data-testid="trigger" v-bind="triggerProps">Actions</button>
        </template>
        <MenuItem label="Renommer" @select="onSelect" />
        <MenuItem label="Archiver" disabled />
        <MenuItem label="Supprimer" danger />
      </Menu>
    `,
    onSelect,
  )
}

/** Ouvre le panneau racine (stub popover jsdom) et rend le menu interrogeable. */
async function openMenu(container: Element): Promise<HTMLElement> {
  const menu = container.querySelector('[role="menu"]') as HTMLElement
  menu.showPopover()
  await nextTick()
  return menu
}

describe('Menu', () => {
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
    await openMenu(container)
    expect(getByRole('menuitem', { name: 'Renommer' })).toBe(document.activeElement)
    expect(getByTestId('trigger').getAttribute('aria-expanded')).toBe('true')
  })

  it('navigue aux flèches en sautant les items désactivés, avec bouclage', async () => {
    const { getByRole, container } = renderMenu()
    const menu = await openMenu(container)

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
    const menu = await openMenu(container)

    getByRole('menuitem', { name: 'Renommer' }).click()
    await nextTick()
    expect(onSelect).toHaveBeenCalledOnce()
    expect(menu.hasAttribute('data-popover-open')).toBe(false)
    expect(getByTestId('trigger')).toBe(document.activeElement)
  })

  it('un item désactivé ne déclenche pas select', async () => {
    const { onSelect, getByRole, container } = renderMenu()
    await openMenu(container)

    getByRole('menuitem', { name: 'Archiver' }).click()
    expect(onSelect).not.toHaveBeenCalled()
  })

  describe("anatomie de l'item", () => {
    it('les slots priment sur les props label/sublabel', async () => {
      const { getByRole, container } = renderHarness(`
        <Menu>
          <template #trigger="{ triggerProps }">
            <button v-bind="triggerProps">Actions</button>
          </template>
          <MenuItem label="Ignoré" sublabel="Ignoré aussi">
            Partager
            <template #sublabel>Vers un autre espace</template>
          </MenuItem>
          <MenuItem label="Dupliquer" sublabel="Copie dans le dossier courant" />
        </Menu>
      `)
      await openMenu(container)

      const slotted = getByRole('menuitem', { name: /Partager/ })
      expect(slotted.querySelector('.ds-menu-item-label')?.textContent).toContain('Partager')
      expect(slotted.querySelector('.ds-menu-item-sublabel')?.textContent).toBe(
        'Vers un autre espace',
      )

      const fromProps = getByRole('menuitem', { name: /Dupliquer/ })
      expect(fromProps.querySelector('.ds-menu-item-label')?.textContent).toBe('Dupliquer')
      expect(fromProps.querySelector('.ds-menu-item-sublabel')?.textContent).toBe(
        'Copie dans le dossier courant',
      )
    })

    it("iconStart accepte un nom Material Symbols ou une URL d'image", async () => {
      const { getByRole, container } = renderHarness(`
        <Menu>
          <template #trigger="{ triggerProps }">
            <button v-bind="triggerProps">Actions</button>
          </template>
          <MenuItem label="Renommer" icon-start="edit" icon-end="chevron_right" />
          <MenuItem label="Logo" icon-start="/logo.svg" />
        </Menu>
      `)
      await openMenu(container)

      const named = getByRole('menuitem', { name: 'Renommer' })
      const symbols = [...named.querySelectorAll('.ds-icon-symbol')].map((el) => el.textContent)
      expect(symbols).toEqual(['edit', 'chevron_right'])

      const img = getByRole('menuitem', { name: 'Logo' }).querySelector('.ds-icon-img')
      expect(img?.getAttribute('src')).toBe('/logo.svg')
    })

    it('selected pose data-selected et aria-current', async () => {
      const { getByRole, container } = renderHarness(`
        <Menu>
          <template #trigger="{ triggerProps }">
            <button v-bind="triggerProps">Tri</button>
          </template>
          <MenuItem label="Par nom" selected />
          <MenuItem label="Par date" />
        </Menu>
      `)
      await openMenu(container)

      const selected = getByRole('menuitem', { name: 'Par nom' })
      expect(selected.hasAttribute('data-selected')).toBe(true)
      expect(selected.getAttribute('aria-current')).toBe('true')
      const other = getByRole('menuitem', { name: 'Par date' })
      expect(other.hasAttribute('data-selected')).toBe(false)
      expect(other.hasAttribute('aria-current')).toBe(false)
    })
  })

  it('compact pose data-compact sur le panneau racine', () => {
    const { container } = renderHarness(`
      <Menu compact>
        <template #trigger="{ triggerProps }">
          <button v-bind="triggerProps">Actions</button>
        </template>
        <MenuItem label="Renommer" />
      </Menu>
    `)
    const menu = container.querySelector('[role="menu"]') as HTMLElement
    expect(menu.hasAttribute('data-compact')).toBe(true)
  })

  describe('groupes et séparateurs', () => {
    function renderGrouped() {
      return renderHarness(`
        <Menu>
          <template #trigger="{ triggerProps }">
            <button v-bind="triggerProps">Actions</button>
          </template>
          <MenuGroup label="Fichier">
            <MenuItem label="Renommer" />
            <MenuItem label="Dupliquer" />
          </MenuGroup>
          <MenuSeparator />
          <MenuItem label="Supprimer" danger />
        </Menu>
      `)
    }

    it('le groupe expose role="group" nommé par son libellé, hors roving focus', async () => {
      const { getByRole, container } = renderGrouped()
      const menu = await openMenu(container)

      const group = getByRole('group', { name: 'Fichier' })
      const labelId = group.getAttribute('aria-labelledby') as string
      expect(document.getElementById(labelId)?.textContent).toBe('Fichier')
      // le libellé du groupe n'est pas un item : jamais focusé par le roving
      expect(getByRole('menuitem', { name: 'Renommer' })).toBe(document.activeElement)
      menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }))
      expect(getByRole('menuitem', { name: 'Renommer' })).toBe(document.activeElement)
    })

    it('le roving focus traverse les groupes et ignore les séparateurs', async () => {
      const { getByRole, container } = renderGrouped()
      const menu = await openMenu(container)

      const arrowDown = () =>
        menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
      arrowDown()
      expect(getByRole('menuitem', { name: 'Dupliquer' })).toBe(document.activeElement)
      arrowDown()
      // le séparateur (role="separator") est ignoré : item suivant hors groupe
      expect(getByRole('menuitem', { name: 'Supprimer' })).toBe(document.activeElement)
      expect(getByRole('separator')).toBeTruthy()
    })
  })

  describe('sous-menus', () => {
    function renderSubmenu(onSelect = vi.fn()) {
      return renderHarness(
        `
          <Menu>
            <template #trigger="{ triggerProps }">
              <button data-testid="trigger" v-bind="triggerProps">Actions</button>
            </template>
            <MenuItem label="Renommer" @select="onSelect" />
            <MenuItem label="Exporter" icon-end="download" @select="onSelect">
              <template #submenu>
                <MenuItem label="PDF" @select="onSelect" />
                <MenuItem label="PNG" />
              </template>
            </MenuItem>
          </Menu>
        `,
        onSelect,
      )
    }

    function panels(container: Element): HTMLElement[] {
      return [...container.querySelectorAll<HTMLElement>('[role="menu"]')]
    }

    it("l'item parent est câblé en invocateur du sous-panneau, chevron à la place d'iconEnd", async () => {
      const { getByRole, container } = renderSubmenu()
      await openMenu(container)

      const parent = getByRole('menuitem', { name: 'Exporter' })
      const sub = panels(container)[1] as HTMLElement
      expect(parent.getAttribute('aria-haspopup')).toBe('menu')
      expect(parent.getAttribute('aria-expanded')).toBe('false')
      expect(parent.getAttribute('popovertarget')).toBe(sub.id)
      expect(parent.getAttribute('aria-controls')).toBe(sub.id)
      // le sous-panneau est un descendant DOM du panneau parent (pile native)
      expect(panels(container)[0]?.contains(sub)).toBe(true)
      // le chevron remplace iconEnd
      expect(parent.querySelector('.ds-menu-item-chevron')?.textContent).toBe('chevron_right')
      const symbols = [...parent.querySelectorAll('.ds-icon-symbol')].map((el) => el.textContent)
      expect(symbols).not.toContain('download')
    })

    it("Flèche droite ouvre le sous-menu, focus son premier item et n'émet pas select", async () => {
      const { onSelect, getByRole, container } = renderSubmenu()
      await openMenu(container)

      const parent = getByRole('menuitem', { name: 'Exporter' })
      parent.focus()
      parent.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
      await nextTick()

      const sub = panels(container)[1] as HTMLElement
      expect(sub.hasAttribute('data-popover-open')).toBe(true)
      expect(parent.getAttribute('aria-expanded')).toBe('true')
      expect(getByRole('menuitem', { name: 'PDF' })).toBe(document.activeElement)
      expect(onSelect).not.toHaveBeenCalled()
    })

    it('le roving focus est confiné au sous-panneau ouvert', async () => {
      const { getByRole, container } = renderSubmenu()
      await openMenu(container)

      const parent = getByRole('menuitem', { name: 'Exporter' })
      parent.focus()
      parent.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
      await nextTick()

      const arrowDown = () =>
        document.activeElement?.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
        )
      arrowDown()
      expect(getByRole('menuitem', { name: 'PNG' })).toBe(document.activeElement)
      // bouclage dans le sous-panneau : jamais de fuite vers les items du parent
      arrowDown()
      expect(getByRole('menuitem', { name: 'PDF' })).toBe(document.activeElement)
    })

    it("Flèche gauche referme le sous-menu et rend le focus à l'item parent", async () => {
      const { getByRole, container } = renderSubmenu()
      await openMenu(container)

      const parent = getByRole('menuitem', { name: 'Exporter' })
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

    it('Échap dans un sous-menu ferme TOUTE la pile et rend le focus au déclencheur', async () => {
      const { getByRole, getByTestId, container } = renderSubmenu()
      const menu = await openMenu(container)

      const parent = getByRole('menuitem', { name: 'Exporter' })
      parent.focus()
      parent.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
      await nextTick()

      document.activeElement?.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
      )
      await nextTick()
      expect(panels(container)[1]?.hasAttribute('data-popover-open')).toBe(false)
      expect(menu.hasAttribute('data-popover-open')).toBe(false)
      expect(getByTestId('trigger')).toBe(document.activeElement)
    })

    it("la sélection d'une feuille de sous-menu émet select et ferme toute la pile", async () => {
      const { onSelect, getByRole, container } = renderSubmenu()
      const menu = await openMenu(container)

      const parent = getByRole('menuitem', { name: 'Exporter' })
      parent.focus()
      parent.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
      await nextTick()

      getByRole('menuitem', { name: 'PDF' }).click()
      await nextTick()
      expect(onSelect).toHaveBeenCalledOnce()
      expect(panels(container)[1]?.hasAttribute('data-popover-open')).toBe(false)
      expect(menu.hasAttribute('data-popover-open')).toBe(false)
    })

    it("l'activation d'un item à sous-menu n'émet jamais select", async () => {
      const { onSelect, getByRole, container } = renderSubmenu()
      await openMenu(container)

      getByRole('menuitem', { name: 'Exporter' }).click()
      expect(onSelect).not.toHaveBeenCalled()
    })

    it("ouvre au survol après le délai d'intention et referme quand le pointeur part", async () => {
      vi.useFakeTimers()
      try {
        const { getByRole, container } = renderSubmenu()
        await openMenu(container)

        const parent = getByRole('menuitem', { name: 'Exporter' })
        const sub = panels(container)[1] as HTMLElement

        parent.dispatchEvent(new Event('pointerenter'))
        // pas d'ouverture avant le délai d'intention
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

    it('le survol ne referme pas un sous-menu dans lequel le clavier navigue', async () => {
      vi.useFakeTimers()
      try {
        const { getByRole, container } = renderSubmenu()
        await openMenu(container)

        const parent = getByRole('menuitem', { name: 'Exporter' })
        parent.focus()
        parent.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
        await nextTick()
        // le focus est sur « PDF », dans le sous-panneau

        parent.dispatchEvent(new Event('pointerleave'))
        vi.advanceTimersByTime(SUBMENU_HOVER_DELAY)
        expect(panels(container)[1]?.hasAttribute('data-popover-open')).toBe(true)
      } finally {
        vi.useRealTimers()
      }
    })
  })

  describe('items de navigation (href)', () => {
    function renderNavMenu(onSelect = vi.fn()) {
      return renderHarness(
        `
          <Menu>
            <template #trigger="{ triggerProps }">
              <button data-testid="trigger" v-bind="triggerProps">Aller à</button>
            </template>
            <MenuItem href="#profil" label="Profil" @select="onSelect" />
            <MenuItem href="#archives" label="Archives" disabled />
            <MenuItem label="Action" @select="onSelect" />
          </Menu>
        `,
        onSelect,
      )
    }

    it('href rend un <a role="menuitem"> avec le lien', async () => {
      const { getByRole, container } = renderNavMenu()
      await openMenu(container)
      const item = getByRole('menuitem', { name: 'Profil' })
      expect(item.tagName).toBe('A')
      expect(item.getAttribute('href')).toBe('#profil')
      // l'item sans href reste un <button>
      expect(getByRole('menuitem', { name: 'Action' }).tagName).toBe('BUTTON')
    })

    it('la sélection d’un lien émet select et ferme le menu', async () => {
      const { onSelect, getByRole, container } = renderNavMenu()
      const menu = await openMenu(container)

      getByRole('menuitem', { name: 'Profil' }).click()
      await nextTick()
      expect(onSelect).toHaveBeenCalledOnce()
      expect(menu.hasAttribute('data-popover-open')).toBe(false)
    })

    it('un lien désactivé est inerte et exclu du roving focus', async () => {
      const { getByRole, container } = renderNavMenu()
      const menu = await openMenu(container)

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
