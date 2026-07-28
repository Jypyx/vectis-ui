import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import Breadcrumb from './Breadcrumb.vue'
import type { BreadcrumbItem } from './Breadcrumb.vue'

const items: BreadcrumbItem[] = [
  { label: 'Accueil', href: '/' },
  { label: 'Projets', href: '/projets' },
  { label: 'Socle', href: '/projets/socle' },
]

describe('Breadcrumb', () => {
  it('rend une navigation nommée avec liste ordonnée et un lien par item', () => {
    const { getByRole, getAllByRole } = render(Breadcrumb, { props: { items } })
    expect(getByRole('navigation', { name: "Fil d'Ariane" })).toBeTruthy()
    expect(getByRole('list').tagName).toBe('OL')
    expect(getAllByRole('link')).toHaveLength(3)
    expect(getByRole('link', { name: 'Accueil' }).getAttribute('href')).toBe('/')
  })

  describe('currentPath', () => {
    it("pose aria-current='page' sur l'item au href correspondant, lui seul", () => {
      const { getByRole } = render(Breadcrumb, {
        props: { items, currentPath: '/projets/socle' },
      })
      expect(getByRole('link', { name: 'Socle' }).getAttribute('aria-current')).toBe('page')
      expect(getByRole('link', { name: 'Accueil' }).hasAttribute('aria-current')).toBe(false)
      expect(getByRole('link', { name: 'Projets' }).hasAttribute('aria-current')).toBe(false)
    })

    it('normalise le slash final des deux côtés', () => {
      const { getByRole } = render(Breadcrumb, {
        props: { items, currentPath: '/projets/' },
      })
      expect(getByRole('link', { name: 'Projets' }).getAttribute('aria-current')).toBe('page')
      // la racine '/' n'est pas vidée par la normalisation
      expect(getByRole('link', { name: 'Accueil' }).hasAttribute('aria-current')).toBe(false)
    })

    it("sans currentPath : aucun item n'est marqué courant", () => {
      const { getAllByRole } = render(Breadcrumb, { props: { items } })
      for (const link of getAllByRole('link')) {
        expect(link.hasAttribute('aria-current')).toBe(false)
      }
    })
  })

  describe('séparateurs', () => {
    it('un séparateur décoratif (aria-hidden) par item, chevron_right par défaut', () => {
      const { container } = render(Breadcrumb, { props: { items } })
      const separators = container.querySelectorAll('.ds-breadcrumb-separator')
      expect(separators).toHaveLength(3)
      for (const sep of separators) {
        expect(sep.getAttribute('aria-hidden')).toBe('true')
        expect(sep.querySelector('.ds-icon-symbol')?.textContent).toBe('chevron_right')
      }
    })

    it('separator (nom Material Symbols) rend la ligature', () => {
      const { container } = render(Breadcrumb, {
        props: { items, separator: 'arrow_forward' },
      })
      const symbol = container.querySelector('.ds-breadcrumb-separator .ds-icon-symbol')
      expect(symbol?.textContent).toBe('arrow_forward')
    })

    it("separator contenant '.', '/' ou ':' est détecté comme une image", () => {
      const { container } = render(Breadcrumb, {
        props: { items, separator: '/sep.svg' },
      })
      const img = container.querySelector('.ds-breadcrumb-separator img')
      expect(img?.getAttribute('src')).toBe('/sep.svg')
      expect(container.querySelector('.ds-breadcrumb-separator .ds-icon-symbol')).toBeNull()
    })
  })

  describe("icône d'item (iconStart)", () => {
    it('nom Material Symbols → ligature avant le libellé', () => {
      const { getByRole } = render(Breadcrumb, {
        props: { items: [{ label: 'Accueil', href: '/', iconStart: 'home' }] },
      })
      const link = getByRole('link', { name: 'Accueil' })
      expect(link.querySelector('.ds-icon-symbol')?.textContent).toBe('home')
    })

    it('URL → image', () => {
      const { getByRole } = render(Breadcrumb, {
        props: { items: [{ label: 'Accueil', href: '/', iconStart: '/home.png' }] },
      })
      const img = getByRole('link', { name: 'Accueil' }).querySelector('img')
      expect(img?.getAttribute('src')).toBe('/home.png')
    })
  })

  describe('maxItems', () => {
    const sixItems: BreadcrumbItem[] = [
      { label: 'Accueil', href: '/' },
      { label: 'Alpha', href: '/a', iconStart: 'folder' },
      { label: 'Bravo', href: '/a/b' },
      { label: 'Charlie', href: '/a/b/c' },
      { label: 'Delta', href: '/a/b/c/d' },
      { label: 'Echo', href: '/a/b/c/d/e' },
    ]

    it('tronque : 1er + ellipsis + avant-dernier + dernier visibles', () => {
      const { getAllByRole, getByRole, queryByRole } = render(Breadcrumb, {
        props: { items: sixItems, maxItems: 4, currentPath: '/a/b/c/d/e' },
      })
      expect(getAllByRole('listitem')).toHaveLength(4)
      expect(getByRole('link', { name: 'Accueil' })).toBeTruthy()
      expect(getByRole('link', { name: 'Delta' })).toBeTruthy()
      expect(getByRole('link', { name: 'Echo' }).getAttribute('aria-current')).toBe('page')
      expect(queryByRole('link', { name: 'Bravo' })).toBeNull()
      expect(getByRole('button', { name: 'Afficher les pages intermédiaires' })).toBeTruthy()
    })

    it('le menu contient uniquement les items masqués, dans l’ordre, avec leur href', async () => {
      const { getByRole, getAllByRole, container } = render(Breadcrumb, {
        props: { items: sixItems, maxItems: 4 },
      })
      ;(container.querySelector('[role="menu"]') as HTMLElement).showPopover()
      await nextTick()

      // ordre et noms accessibles (l'icône aria-hidden n'entre pas dans le nom)
      const menuitems = getAllByRole('menuitem')
      expect(menuitems).toHaveLength(3)
      for (const [index, name] of ['Alpha', 'Bravo', 'Charlie'].entries()) {
        expect(getByRole('menuitem', { name })).toBe(menuitems[index])
      }
      expect(getByRole('menuitem', { name: 'Bravo' }).getAttribute('href')).toBe('/a/b')
      // l'icône de l'item masqué est reprise dans le menu
      expect(
        getByRole('menuitem', { name: 'Alpha' }).querySelector('.ds-icon-symbol')?.textContent,
      ).toBe('folder')
    })

    it("pas d'ellipsis quand le nombre d'items ne dépasse pas maxItems", () => {
      const { getAllByRole, queryByRole } = render(Breadcrumb, {
        props: { items: sixItems.slice(0, 4), maxItems: 4 },
      })
      expect(getAllByRole('listitem')).toHaveLength(4)
      expect(queryByRole('button')).toBeNull()
    })
  })
})
