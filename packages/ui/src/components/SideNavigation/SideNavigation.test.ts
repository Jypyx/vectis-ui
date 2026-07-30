import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, ref } from 'vue'

import SideNavigation from './SideNavigation.vue'
import SideNavigationGroup from './SideNavigationGroup.vue'
import SideNavigationItem from './SideNavigationItem.vue'
import SideNavigationSeparator from './SideNavigationSeparator.vue'

/** Harnais unique : contenu de la nav, attributs bruts de la racine, état exposé. */
function renderNav(inner: string, navAttrs = '', state: Record<string, unknown> = {}) {
  const Harness = defineComponent({
    components: {
      SideNavigation,
      SideNavigationItem,
      SideNavigationGroup,
      SideNavigationSeparator,
    },
    setup: () => state,
    template: `<SideNavigation ${navAttrs}>${inner}</SideNavigation>`,
  })
  return render(Harness)
}

/** Arbre de référence : 3 niveaux, un groupe, un séparateur, une feuille active. */
const ARBRE = `
  <SideNavigationItem href="/" active icon="home">Accueil</SideNavigationItem>
  <SideNavigationItem icon="folder" default-open>
    Projets
    <template #items>
      <SideNavigationItem href="/a">Alpha</SideNavigationItem>
      <SideNavigationItem>
        Beta
        <template #items>
          <SideNavigationItem href="/b/1">Beta 1</SideNavigationItem>
        </template>
      </SideNavigationItem>
    </template>
  </SideNavigationItem>
  <SideNavigationSeparator />
  <SideNavigationGroup label="Réglages">
    <SideNavigationItem href="/profil">Profil</SideNavigationItem>
  </SideNavigationGroup>
`

const renderTree = (navAttrs = '') => renderNav(ARBRE, navAttrs)

/** Rangée d'un item, par son libellé — <summary> pour une branche, sinon le conteneur. */
function row(container: Element, label: string): HTMLElement {
  const found = [...container.querySelectorAll<HTMLElement>('.ds-side-nav-row')].find(
    (el) => el.querySelector('.ds-side-nav-label')?.textContent?.trim() === label,
  )
  if (!found) throw new Error(`Rangée « ${label} » introuvable`)
  return found
}

/** Noms des <Icon> d'une rangée — `data-icon` est posé quelle que soit la source. */
const icones = (rangee: Element) =>
  [...rangee.querySelectorAll<HTMLElement>('.ds-icon')].map((el) => el.dataset.icon)

describe('SideNavigation', () => {
  describe('racine', () => {
    it('nomme la <nav> : dictionnaire, puis prop `label`, puis attributs du consommateur', () => {
      const nav = (attrs: string) => renderTree(attrs).container.querySelector('nav')
      expect(nav('')?.getAttribute('aria-label')).toBe('Navigation')
      expect(nav('label="Menu principal"')?.getAttribute('aria-label')).toBe('Menu principal')
      // fallthrough : l'attribut du consommateur prime sur la prop
      expect(nav('label="Menu" aria-label="Sections"')?.getAttribute('aria-label')).toBe('Sections')
      // aria-labelledby supprime le défaut, sinon deux noms cohabiteraient
      expect(nav('aria-labelledby="titre"')?.hasAttribute('aria-label')).toBe(false)
    })

    it('rend une liste : nav > ul, items en <li> enfants directs', () => {
      const { container } = renderTree()
      const list = container.querySelector('nav > ul.ds-side-nav-list')
      expect(list).not.toBeNull()
      expect(list?.querySelector(':scope > li.ds-side-nav-item')).not.toBeNull()
      expect(list?.querySelector(':scope > hr.ds-side-nav-separator')).not.toBeNull()
      expect(list?.querySelector(':scope > li.ds-side-nav-group')).not.toBeNull()
    })

    it("`ds-control` n'est posé QUE sur la <nav> — sinon le compact serait perdu dès le niveau 2", () => {
      const { container } = renderTree('size="sm" compact')
      expect(container.querySelectorAll('.ds-control')).toHaveLength(1)
      const nav = container.querySelector('nav')
      expect(nav?.classList.contains('ds-control')).toBe(true)
      expect(nav?.dataset.size).toBe('sm')
      expect(nav?.dataset.compact).toBe('')
      expect(container.querySelectorAll('[data-size], [data-compact]')).toHaveLength(1)
    })
  })

  describe('feuille', () => {
    it('rend un <a href> avec href, un <button type=button> sinon', () => {
      const { container } = renderNav(`
        <SideNavigationItem href="/x">Lien</SideNavigationItem>
        <SideNavigationItem>Action</SideNavigationItem>
      `)
      const [lien, bouton] = [...container.querySelectorAll('.ds-side-nav-action')]
      expect(lien?.tagName).toBe('A')
      expect(lien?.getAttribute('href')).toBe('/x')
      expect(bouton?.tagName).toBe('BUTTON')
      expect(bouton?.getAttribute('type')).toBe('button')
    })

    it('émet `select` à l’activation', async () => {
      const onSelect = vi.fn()
      const { container } = renderNav(
        `<SideNavigationItem @select="onSelect">Action</SideNavigationItem>`,
        '',
        { onSelect },
      )
      await fireEvent.click(container.querySelector('.ds-side-nav-action')!)
      expect(onSelect).toHaveBeenCalledTimes(1)
    })

    it('active : aria-current="page" sur un lien, "true" sur un bouton, data-active sur la rangée', () => {
      const { container } = renderNav(`
        <SideNavigationItem href="/x" active>Lien</SideNavigationItem>
        <SideNavigationItem active>Bouton</SideNavigationItem>
      `)
      expect(row(container, 'Lien').dataset.active).toBe('')
      expect(row(container, 'Lien').querySelector('a')?.getAttribute('aria-current')).toBe('page')
      expect(row(container, 'Bouton').querySelector('button')?.getAttribute('aria-current')).toBe(
        'true',
      )
    })

    it('désactivée : bouton inerte natif, lien inerte par aria-disabled, aucun `select`', async () => {
      const onSelect = vi.fn()
      const { container } = renderNav(
        `
          <SideNavigationItem disabled @select="onSelect">Bouton</SideNavigationItem>
          <SideNavigationItem href="/x" disabled @select="onSelect">Lien</SideNavigationItem>
        `,
        '',
        { onSelect },
      )
      const [bouton, lien] = [...container.querySelectorAll<HTMLElement>('.ds-side-nav-action')]
      expect(bouton).toHaveProperty('disabled', true)
      expect(lien?.hasAttribute('href')).toBe(false)
      expect(lien?.getAttribute('aria-disabled')).toBe('true')
      expect(row(container, 'Lien').dataset.disabled).toBe('')

      await fireEvent.click(lien!)
      expect(onSelect).not.toHaveBeenCalled()
    })

    it('slot #end : frère de l’action, jamais un contrôle imbriqué dans un lien', () => {
      const { container } = renderNav(`
        <SideNavigationItem href="/x">
          Lien
          <template #end><button type="button" data-testid="action">Plus</button></template>
        </SideNavigationItem>
      `)
      const action = container.querySelector('.ds-side-nav-action')!
      const fin = container.querySelector('[data-testid="action"]')!
      expect(action.contains(fin)).toBe(false)
      expect(container.querySelector('.ds-side-nav-end')?.contains(fin)).toBe(true)
    })
  })

  describe('branche', () => {
    const BRANCHE = `
      <SideNavigationItem @select="onSelect">
        Parent
        <template #items><SideNavigationItem href="/a">Alpha</SideNavigationItem></template>
      </SideNavigationItem>
    `

    it('rend <details> + sous-liste, un chevron, et n’émet pas `select`', async () => {
      const onSelect = vi.fn()
      const { container } = renderNav(BRANCHE, '', { onSelect })
      const details = container.querySelector('details.ds-side-nav-branch')!
      const summary = details.querySelector(':scope > summary.ds-side-nav-row')
      expect(summary).not.toBeNull()
      expect(details.querySelector(':scope > ul.ds-side-nav-children')).not.toBeNull()
      expect(icones(summary!)).toEqual(['expand_more'])
      expect(details.hasAttribute('data-swap')).toBe(false)

      await fireEvent.click(summary!)
      expect(onSelect).not.toHaveBeenCalled()
    })

    it('`default-open` ouvre au premier rendu', () => {
      const { container } = renderTree()
      const [projets, beta] = [...container.querySelectorAll('details')]
      expect(projets?.open).toBe(true)
      expect(beta?.open).toBe(false)
    })

    it('v-model:open — piloté depuis le parent, et réécrit par l’événement natif `toggle`', async () => {
      const ouvert = ref(false)
      const { container } = renderNav(
        `
          <SideNavigationItem v-model:open="ouvert">
            Parent
            <template #items><SideNavigationItem href="/a">Alpha</SideNavigationItem></template>
          </SideNavigationItem>
        `,
        '',
        { ouvert },
      )
      const details = container.querySelector('details')!
      expect(details.open).toBe(false)

      ouvert.value = true
      await Promise.resolve()
      expect(details.open).toBe(true)

      // le DOM est la source de vérité : le modèle est alimenté par `toggle`
      details.open = false
      await fireEvent(details, new Event('toggle'))
      expect(ouvert.value).toBe(false)
    })

    it('désactivée : summary hors tabulation et basculement annulé', async () => {
      const { container } = renderNav(`
        <SideNavigationItem disabled>
          Parent
          <template #items><SideNavigationItem href="/a">Alpha</SideNavigationItem></template>
        </SideNavigationItem>
      `)
      const summary = container.querySelector('summary')!
      expect(summary.getAttribute('aria-disabled')).toBe('true')
      expect(summary.getAttribute('tabindex')).toBe('-1')

      await fireEvent.click(summary)
      expect(container.querySelector('details')?.open).toBe(false)
    })

    it('slot #end rendu avant le chevron', () => {
      const { container } = renderNav(`
        <SideNavigationItem>
          Parent
          <template #end><span data-testid="badge">3</span></template>
          <template #items><SideNavigationItem href="/a">Alpha</SideNavigationItem></template>
        </SideNavigationItem>
      `)
      const enfants = [...container.querySelector('summary')!.children]
      const fin = enfants.findIndex((el) => el.classList.contains('ds-side-nav-end'))
      const chevron = enfants.findIndex((el) => el.classList.contains('ds-side-nav-chevron'))
      expect(fin).toBeGreaterThan(-1)
      expect(chevron).toBeGreaterThan(fin)
    })

    it('`collapseIcon` : deux chevrons rendus et marqueur data-swap (permutation CSS)', () => {
      const { container } = renderNav(
        `
          <SideNavigationItem>
            Parent
            <template #items><SideNavigationItem href="/a">Alpha</SideNavigationItem></template>
          </SideNavigationItem>
        `,
        'expand-icon="add" collapse-icon="remove"',
      )
      const details = container.querySelector('details')!
      expect(details.hasAttribute('data-swap')).toBe(true)
      expect(icones(details.querySelector('summary')!)).toEqual(['add', 'remove'])
    })
  })

  describe('exclusivité', () => {
    it('même `name` entre frères, `name` différent d’un niveau à l’autre', () => {
      const { container } = renderTree('exclusive')
      const [projets, beta] = [...container.querySelectorAll('details')]
      // « Beta » est un enfant de « Projets » : il appartient à un autre niveau
      expect(projets?.getAttribute('name')).toBeTruthy()
      expect(beta?.getAttribute('name')).toBeTruthy()
      expect(beta?.getAttribute('name')).not.toBe(projets?.getAttribute('name'))
    })

    it('sans `exclusive`, aucun name : ouvertures multiples', () => {
      const { container } = renderTree()
      for (const details of container.querySelectorAll('details')) {
        expect(details.hasAttribute('name')).toBe(false)
      }
    })
  })

  describe('hiérarchie', () => {
    it('récursion sans limite, et profondeur portée par la seule cascade CSS', () => {
      const { container } = renderTree()
      expect(container.querySelectorAll('ul.ds-side-nav-children')).toHaveLength(2)
      for (const rangee of container.querySelectorAll<HTMLElement>('.ds-side-nav-row')) {
        expect(rangee.getAttribute('style')).toBeNull()
        expect(rangee.dataset.depth).toBeUndefined()
      }
    })

    it('groupe : <li> + liste nommée par son libellé ; le séparateur est un <hr>', () => {
      const { container } = renderTree()
      const groupe = container.querySelector('li.ds-side-nav-group')!
      const label = groupe.querySelector('.ds-side-nav-group-label')!
      expect(label.textContent).toBe('Réglages')
      expect(label.id).toBeTruthy()
      expect(groupe.querySelector('ul')?.getAttribute('aria-labelledby')).toBe(label.id)
      expect(container.querySelector('hr.ds-side-nav-separator')).not.toBeNull()
    })
  })

  describe('icônes et attributs', () => {
    it('`icon` accepte un nom comme un rendu explicite ; le slot #start prime', () => {
      const { container } = renderNav(
        `
          <SideNavigationItem href="/a" icon="home">Nom</SideNavigationItem>
          <SideNavigationItem href="/b" :icon="logo">Rendu</SideNavigationItem>
          <SideNavigationItem href="/c" icon="home">
            Slot
            <template #start><span data-testid="avatar" /></template>
          </SideNavigationItem>
        `,
        '',
        { logo: { src: '/logo.svg' } },
      )
      expect(icones(row(container, 'Nom'))).toEqual(['home'])
      expect(row(container, 'Rendu').querySelector('img')?.getAttribute('src')).toBe('/logo.svg')
      expect(icones(row(container, 'Slot'))).toEqual([])
      expect(row(container, 'Slot').querySelector('[data-testid="avatar"]')).not.toBeNull()
    })

    it('wrapper-root : class/style sur le <li>, le reste sur le contrôle', () => {
      const { container } = renderNav(`
        <SideNavigationItem href="/x" class="perso" target="_blank" data-tracking="nav">
          Externe
        </SideNavigationItem>
      `)
      const li = container.querySelector('li.ds-side-nav-item')!
      const action = container.querySelector('.ds-side-nav-action')!
      expect(li.classList.contains('perso')).toBe(true)
      expect(li.hasAttribute('target')).toBe(false)
      expect(action.getAttribute('target')).toBe('_blank')
      expect(action.getAttribute('data-tracking')).toBe('nav')
    })

    it('le sous-libellé accepte la prop comme le slot', () => {
      const { container } = renderNav(`
        <SideNavigationItem href="/a" sublabel="3 projets">Prop</SideNavigationItem>
        <SideNavigationItem href="/b">
          Slot
          <template #sublabel>hier</template>
        </SideNavigationItem>
      `)
      const texte = (label: string) =>
        row(container, label).querySelector('.ds-side-nav-sublabel')?.textContent?.trim()
      expect(texte('Prop')).toBe('3 projets')
      expect(texte('Slot')).toBe('hier')
    })
  })

  describe('clavier', () => {
    /** Liens seuls : le focus programmatique d'un <summary> n'est pas modélisé
        par jsdom, le déplacement vers une branche part en play function. */
    const LIENS = `
      <SideNavigationItem href="/1">Un</SideNavigationItem>
      <SideNavigationItem href="/2" disabled>Deux</SideNavigationItem>
      <SideNavigationItem href="/3">Trois</SideNavigationItem>
      <SideNavigationItem href="/4">
        Quatre
        <template #items><SideNavigationItem href="/4-1">Caché</SideNavigationItem></template>
      </SideNavigationItem>
    `

    it('les flèches déplacent le focus dans les deux sens et sautent les items désactivés', async () => {
      const { container } = renderNav(LIENS)
      const nav = container.querySelector('nav')!
      // [Un, Deux (désactivé), Trois, Caché] — « Quatre » est une branche, donc
      // un <summary>, pas un <a>.
      const [un, , trois] = [...container.querySelectorAll<HTMLElement>('a.ds-side-nav-action')]

      un!.focus()
      await fireEvent.keyDown(nav, { key: 'ArrowDown' })
      expect(document.activeElement).toBe(trois)
      await fireEvent.keyDown(nav, { key: 'ArrowUp' })
      expect(document.activeElement).toBe(un)
      await fireEvent.keyDown(nav, { key: 'Home' })
      expect(document.activeElement).toBe(un)
    })

    it('les items d’une branche repliée sont ignorés, et le parcours boucle', async () => {
      const { container } = renderNav(LIENS)
      const nav = container.querySelector('nav')!
      const un = container.querySelector<HTMLElement>('a.ds-side-nav-action')!
      const cache = container.querySelector<HTMLElement>('.ds-side-nav-children a')!

      un.focus()
      await fireEvent.keyDown(nav, { key: 'End' })
      expect(document.activeElement).not.toBe(cache)

      // ouverte, la même rangée redevient le dernier arrêt du parcours
      container.querySelector('details')!.open = true
      await fireEvent.keyDown(nav, { key: 'End' })
      expect(document.activeElement).toBe(cache)
      await fireEvent.keyDown(nav, { key: 'ArrowDown' })
      expect(document.activeElement).toBe(un)
    })
  })
})
