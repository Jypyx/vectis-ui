import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import VBreadcrumb from './VBreadcrumb.vue'
import type { BreadcrumbItem } from './VBreadcrumb.vue'

const items: BreadcrumbItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Projects', href: '/projects' },
  { label: 'Vectis', href: '/projects/vectis' },
]

describe('VBreadcrumb', () => {
  it('renders a named navigation with an ordered list and one link per item', () => {
    const { getByRole, getAllByRole } = render(VBreadcrumb, { props: { items } })
    expect(getByRole('navigation', { name: 'Breadcrumb' })).toBeTruthy()
    expect(getByRole('list').tagName).toBe('OL')
    expect(getAllByRole('link')).toHaveLength(3)
    expect(getByRole('link', { name: 'Home' }).getAttribute('href')).toBe('/')
  })

  describe('currentPath', () => {
    it("sets aria-current='page' on the item with the matching href, and it alone", () => {
      const { getByRole } = render(VBreadcrumb, {
        props: { items, currentPath: '/projects/vectis' },
      })
      expect(getByRole('link', { name: 'Vectis' }).getAttribute('aria-current')).toBe('page')
      expect(getByRole('link', { name: 'Home' }).hasAttribute('aria-current')).toBe(false)
      expect(getByRole('link', { name: 'Projects' }).hasAttribute('aria-current')).toBe(false)
    })

    it('normalizes the trailing slash on both sides', () => {
      const { getByRole } = render(VBreadcrumb, {
        props: { items, currentPath: '/projects/' },
      })
      expect(getByRole('link', { name: 'Projects' }).getAttribute('aria-current')).toBe('page')
      // the root '/' is not emptied by the normalization
      expect(getByRole('link', { name: 'Home' }).hasAttribute('aria-current')).toBe(false)
    })

    it('without currentPath: no item is marked as current', () => {
      const { getAllByRole } = render(VBreadcrumb, { props: { items } })
      for (const link of getAllByRole('link')) {
        expect(link.hasAttribute('aria-current')).toBe(false)
      }
    })
  })

  describe('separators', () => {
    it('one decorative separator (aria-hidden) per item, chevron_right by default', () => {
      const { container } = render(VBreadcrumb, { props: { items } })
      const separators = container.querySelectorAll('.v-breadcrumb-separator')
      expect(separators).toHaveLength(3)
      for (const sep of separators) {
        expect(sep.getAttribute('aria-hidden')).toBe('true')
        // the class is set ON the VIcon: the separator is itself the .v-icon root
        expect((sep as HTMLElement).dataset.icon).toBe('chevron_right')
      }
    })

    it('separator: a custom name', () => {
      const { container } = render(VBreadcrumb, {
        props: { items, separator: 'arrow_forward' },
      })
      const icon = container.querySelector<HTMLElement>('.v-breadcrumb-separator')
      expect(icon?.dataset.icon).toBe('arrow_forward')
    })

    it('separator `{ src }`: an explicit image, never guessed from the string', () => {
      const { container } = render(VBreadcrumb, {
        props: { items, separator: { src: '/sep.svg' } },
      })
      const img = container.querySelector('.v-breadcrumb-separator img')
      expect(img?.getAttribute('src')).toBe('/sep.svg')
      expect(container.querySelector('.v-breadcrumb-separator .v-icon-symbol')).toBeNull()
    })
  })

  describe('item icon (iconStart)', () => {
    it('an icon name → an icon before the label', () => {
      const { getByRole } = render(VBreadcrumb, {
        props: { items: [{ label: 'Home', href: '/', iconStart: 'home' }] },
      })
      const link = getByRole('link', { name: 'Home' })
      expect(link.querySelector<HTMLElement>('.v-icon')?.dataset.icon).toBe('home')
    })

    it('`{ src }` → an image', () => {
      const { getByRole } = render(VBreadcrumb, {
        props: { items: [{ label: 'Home', href: '/', iconStart: { src: '/home.png' } }] },
      })
      const img = getByRole('link', { name: 'Home' }).querySelector('img')
      expect(img?.getAttribute('src')).toBe('/home.png')
    })
  })

  describe('maxItems', () => {
    const sixItems: BreadcrumbItem[] = [
      { label: 'Home', href: '/' },
      { label: 'Alpha', href: '/a', iconStart: 'folder' },
      { label: 'Bravo', href: '/a/b' },
      { label: 'Charlie', href: '/a/b/c' },
      { label: 'Delta', href: '/a/b/c/d' },
      { label: 'Echo', href: '/a/b/c/d/e' },
    ]

    it('truncates: first + ellipsis + second-to-last + last visible', () => {
      const { getAllByRole, getByRole, queryByRole } = render(VBreadcrumb, {
        props: { items: sixItems, maxItems: 4, currentPath: '/a/b/c/d/e' },
      })
      expect(getAllByRole('listitem')).toHaveLength(4)
      expect(getByRole('link', { name: 'Home' })).toBeTruthy()
      expect(getByRole('link', { name: 'Delta' })).toBeTruthy()
      expect(getByRole('link', { name: 'Echo' }).getAttribute('aria-current')).toBe('page')
      expect(queryByRole('link', { name: 'Bravo' })).toBeNull()
      expect(getByRole('button', { name: 'Show intermediate pages' })).toBeTruthy()
    })

    it('the menu holds the hidden items only, in order, with their href', async () => {
      const { getByRole, getAllByRole, container } = render(VBreadcrumb, {
        props: { items: sixItems, maxItems: 4 },
      })
      ;(container.querySelector('[role="menu"]') as HTMLElement).showPopover()
      await nextTick()

      // order and accessible names (the aria-hidden icon does not enter the name)
      const menuitems = getAllByRole('menuitem')
      expect(menuitems).toHaveLength(3)
      for (const [index, name] of ['Alpha', 'Bravo', 'Charlie'].entries()) {
        expect(getByRole('menuitem', { name })).toBe(menuitems[index])
      }
      expect(getByRole('menuitem', { name: 'Bravo' }).getAttribute('href')).toBe('/a/b')
      // the hidden item's icon is carried over into the menu
      expect(
        getByRole('menuitem', { name: 'Alpha' }).querySelector('.v-icon-symbol')?.textContent,
      ).toBe('folder')
    })

    it('no ellipsis when the number of items does not exceed maxItems', () => {
      const { getAllByRole, queryByRole } = render(VBreadcrumb, {
        props: { items: sixItems.slice(0, 4), maxItems: 4 },
      })
      expect(getAllByRole('listitem')).toHaveLength(4)
      expect(queryByRole('button')).toBeNull()
    })
  })
})
