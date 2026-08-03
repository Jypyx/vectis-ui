import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, ref } from 'vue'

import VSideNavigation from './VSideNavigation.vue'
import VSideNavigationGroup from './VSideNavigationGroup.vue'
import VSideNavigationItem from './VSideNavigationItem.vue'
import VSideNavigationSeparator from './VSideNavigationSeparator.vue'

/** Single harness: the nav's content, the root's raw attributes, the exposed state. */
function renderNav(inner: string, navAttrs = '', state: Record<string, unknown> = {}) {
  const Harness = defineComponent({
    components: {
      VSideNavigation,
      VSideNavigationItem,
      VSideNavigationGroup,
      VSideNavigationSeparator,
    },
    setup: () => state,
    template: `<VSideNavigation ${navAttrs}>${inner}</VSideNavigation>`,
  })
  return render(Harness)
}

/** Reference tree: 3 levels, a group, a separator, an active leaf. */
const TREE = `
  <VSideNavigationItem href="/" active icon="home">Home</VSideNavigationItem>
  <VSideNavigationItem icon="folder" default-open>
    Projects
    <template #items>
      <VSideNavigationItem href="/a">Alpha</VSideNavigationItem>
      <VSideNavigationItem>
        Beta
        <template #items>
          <VSideNavigationItem href="/b/1">Beta 1</VSideNavigationItem>
        </template>
      </VSideNavigationItem>
    </template>
  </VSideNavigationItem>
  <VSideNavigationSeparator />
  <VSideNavigationGroup label="Settings">
    <VSideNavigationItem href="/profile">Profile</VSideNavigationItem>
  </VSideNavigationGroup>
`

const renderTree = (navAttrs = '') => renderNav(TREE, navAttrs)

/** An item's row, by its label — a <summary> for a branch, otherwise the container. */
function row(container: Element, label: string): HTMLElement {
  const found = [...container.querySelectorAll<HTMLElement>('.v-side-nav-row')].find(
    (el) => el.querySelector('.v-side-nav-label')?.textContent?.trim() === label,
  )
  if (!found) throw new Error(`Row "${label}" not found`)
  return found
}

/** Names of a row's <VIcon>s — `data-icon` is set whatever the source. */
const icons = (rowEl: Element) =>
  [...rowEl.querySelectorAll<HTMLElement>('.v-icon')].map((el) => el.dataset.icon)

describe('VSideNavigation', () => {
  describe('root', () => {
    it('names the <nav>: the dictionary, then the `label` prop, then the consumer attributes', () => {
      const nav = (attrs: string) => renderTree(attrs).container.querySelector('nav')
      expect(nav('')?.getAttribute('aria-label')).toBe('Navigation')
      expect(nav('label="Main menu"')?.getAttribute('aria-label')).toBe('Main menu')
      // fallthrough: the consumer's attribute wins over the prop
      expect(nav('label="Menu" aria-label="Sections"')?.getAttribute('aria-label')).toBe('Sections')
      // aria-labelledby removes the default, or two names would coexist
      expect(nav('aria-labelledby="title"')?.hasAttribute('aria-label')).toBe(false)
    })

    it('renders a list: nav > ul, items as direct <li> children', () => {
      const { container } = renderTree()
      const list = container.querySelector('nav > ul.v-side-nav-list')
      expect(list).not.toBeNull()
      expect(list?.querySelector(':scope > li.v-side-nav-item')).not.toBeNull()
      expect(list?.querySelector(':scope > hr.v-side-nav-separator')).not.toBeNull()
      expect(list?.querySelector(':scope > li.v-side-nav-group')).not.toBeNull()
    })

    it('`v-control` is set ONLY on the <nav> — otherwise compact would be lost from level 2 on', () => {
      const { container } = renderTree('size="sm" compact')
      expect(container.querySelectorAll('.v-control')).toHaveLength(1)
      const nav = container.querySelector('nav')
      expect(nav?.classList.contains('v-control')).toBe(true)
      expect(nav?.dataset.size).toBe('sm')
      expect(nav?.dataset.compact).toBe('')
      expect(container.querySelectorAll('[data-size], [data-compact]')).toHaveLength(1)
    })
  })

  describe('leaf', () => {
    it('renders an <a href> with href, a <button type=button> otherwise', () => {
      const { container } = renderNav(`
        <VSideNavigationItem href="/x">Link</VSideNavigationItem>
        <VSideNavigationItem>Action</VSideNavigationItem>
      `)
      const [link, button] = [...container.querySelectorAll('.v-side-nav-action')]
      expect(link?.tagName).toBe('A')
      expect(link?.getAttribute('href')).toBe('/x')
      expect(button?.tagName).toBe('BUTTON')
      expect(button?.getAttribute('type')).toBe('button')
    })

    it('emits `select` on activation', async () => {
      const onSelect = vi.fn()
      const { container } = renderNav(
        `<VSideNavigationItem @select="onSelect">Action</VSideNavigationItem>`,
        '',
        { onSelect },
      )
      await fireEvent.click(container.querySelector('.v-side-nav-action')!)
      expect(onSelect).toHaveBeenCalledTimes(1)
    })

    it('active: aria-current="page" on a link, "true" on a button, data-active on the row', () => {
      const { container } = renderNav(`
        <VSideNavigationItem href="/x" active>Link</VSideNavigationItem>
        <VSideNavigationItem active>Button</VSideNavigationItem>
      `)
      expect(row(container, 'Link').dataset.active).toBe('')
      expect(row(container, 'Link').querySelector('a')?.getAttribute('aria-current')).toBe('page')
      expect(row(container, 'Button').querySelector('button')?.getAttribute('aria-current')).toBe(
        'true',
      )
    })

    it('disabled: a natively inert button, an inert link through aria-disabled, no `select`', async () => {
      const onSelect = vi.fn()
      const { container } = renderNav(
        `
          <VSideNavigationItem disabled @select="onSelect">Button</VSideNavigationItem>
          <VSideNavigationItem href="/x" disabled @select="onSelect">Link</VSideNavigationItem>
        `,
        '',
        { onSelect },
      )
      const [button, link] = [...container.querySelectorAll<HTMLElement>('.v-side-nav-action')]
      expect(button).toHaveProperty('disabled', true)
      expect(link?.hasAttribute('href')).toBe(false)
      expect(link?.getAttribute('aria-disabled')).toBe('true')
      expect(row(container, 'Link').dataset.disabled).toBe('')

      await fireEvent.click(link!)
      expect(onSelect).not.toHaveBeenCalled()
    })

    it('the #end slot: a sibling of the action, never a control nested inside a link', () => {
      const { container } = renderNav(`
        <VSideNavigationItem href="/x">
          Link
          <template #end><button type="button" data-testid="action">More</button></template>
        </VSideNavigationItem>
      `)
      const action = container.querySelector('.v-side-nav-action')!
      const end = container.querySelector('[data-testid="action"]')!
      expect(action.contains(end)).toBe(false)
      expect(container.querySelector('.v-side-nav-end')?.contains(end)).toBe(true)
    })
  })

  describe('branch', () => {
    const BRANCH = `
      <VSideNavigationItem @select="onSelect">
        Parent
        <template #items><VSideNavigationItem href="/a">Alpha</VSideNavigationItem></template>
      </VSideNavigationItem>
    `

    it('renders <details> + a sublist, one chevron, and emits no `select`', async () => {
      const onSelect = vi.fn()
      const { container } = renderNav(BRANCH, '', { onSelect })
      const details = container.querySelector('details.v-side-nav-branch')!
      const summary = details.querySelector(':scope > summary.v-side-nav-row')
      expect(summary).not.toBeNull()
      expect(details.querySelector(':scope > ul.v-side-nav-children')).not.toBeNull()
      expect(icons(summary!)).toEqual(['expand_more'])
      expect(details.hasAttribute('data-swap')).toBe(false)

      await fireEvent.click(summary!)
      expect(onSelect).not.toHaveBeenCalled()
    })

    it('`default-open` opens on the first render', () => {
      const { container } = renderTree()
      const [projects, beta] = [...container.querySelectorAll('details')]
      expect(projects?.open).toBe(true)
      expect(beta?.open).toBe(false)
    })

    it('v-model:open — driven from the parent, and rewritten by the native `toggle` event', async () => {
      const open = ref(false)
      const { container } = renderNav(
        `
          <VSideNavigationItem v-model:open="open">
            Parent
            <template #items><VSideNavigationItem href="/a">Alpha</VSideNavigationItem></template>
          </VSideNavigationItem>
        `,
        '',
        { open },
      )
      const details = container.querySelector('details')!
      expect(details.open).toBe(false)

      open.value = true
      await Promise.resolve()
      expect(details.open).toBe(true)

      // the DOM is the source of truth: the model is fed by `toggle`
      details.open = false
      await fireEvent(details, new Event('toggle'))
      expect(open.value).toBe(false)
    })

    it('disabled: the summary is out of the tab order and the toggling is cancelled', async () => {
      const { container } = renderNav(`
        <VSideNavigationItem disabled>
          Parent
          <template #items><VSideNavigationItem href="/a">Alpha</VSideNavigationItem></template>
        </VSideNavigationItem>
      `)
      const summary = container.querySelector('summary')!
      expect(summary.getAttribute('aria-disabled')).toBe('true')
      expect(summary.getAttribute('tabindex')).toBe('-1')

      await fireEvent.click(summary)
      expect(container.querySelector('details')?.open).toBe(false)
    })

    it('the #end slot is rendered before the chevron', () => {
      const { container } = renderNav(`
        <VSideNavigationItem>
          Parent
          <template #end><span data-testid="badge">3</span></template>
          <template #items><VSideNavigationItem href="/a">Alpha</VSideNavigationItem></template>
        </VSideNavigationItem>
      `)
      const children = [...container.querySelector('summary')!.children]
      const end = children.findIndex((el) => el.classList.contains('v-side-nav-end'))
      const chevron = children.findIndex((el) => el.classList.contains('v-side-nav-chevron'))
      expect(end).toBeGreaterThan(-1)
      expect(chevron).toBeGreaterThan(end)
    })

    it('`collapseIcon`: two chevrons rendered and a data-swap marker (CSS swap)', () => {
      const { container } = renderNav(
        `
          <VSideNavigationItem>
            Parent
            <template #items><VSideNavigationItem href="/a">Alpha</VSideNavigationItem></template>
          </VSideNavigationItem>
        `,
        'expand-icon="add" collapse-icon="remove"',
      )
      const details = container.querySelector('details')!
      expect(details.hasAttribute('data-swap')).toBe(true)
      expect(icons(details.querySelector('summary')!)).toEqual(['add', 'remove'])
    })
  })

  describe('exclusivity', () => {
    it('the same `name` between siblings, a different `name` from one level to the next', () => {
      const { container } = renderTree('exclusive')
      const [projects, beta] = [...container.querySelectorAll('details')]
      // "Beta" is a child of "Projects": it belongs to another level
      expect(projects?.getAttribute('name')).toBeTruthy()
      expect(beta?.getAttribute('name')).toBeTruthy()
      expect(beta?.getAttribute('name')).not.toBe(projects?.getAttribute('name'))
    })

    it('without `exclusive`, no name: multiple can be open', () => {
      const { container } = renderTree()
      for (const details of container.querySelectorAll('details')) {
        expect(details.hasAttribute('name')).toBe(false)
      }
    })
  })

  describe('hierarchy', () => {
    it('recursion with no limit, and depth carried by the CSS cascade alone', () => {
      const { container } = renderTree()
      expect(container.querySelectorAll('ul.v-side-nav-children')).toHaveLength(2)
      for (const rowEl of container.querySelectorAll<HTMLElement>('.v-side-nav-row')) {
        expect(rowEl.getAttribute('style')).toBeNull()
        expect(rowEl.dataset.depth).toBeUndefined()
      }
    })

    it('group: a <li> + a list named by its label; the separator is an <hr>', () => {
      const { container } = renderTree()
      const group = container.querySelector('li.v-side-nav-group')!
      const label = group.querySelector('.v-side-nav-group-label')!
      expect(label.textContent).toBe('Settings')
      expect(label.id).toBeTruthy()
      expect(group.querySelector('ul')?.getAttribute('aria-labelledby')).toBe(label.id)
      expect(container.querySelector('hr.v-side-nav-separator')).not.toBeNull()
    })
  })

  describe('icons and attributes', () => {
    it('`icon` accepts a name as well as an explicit render; the #start slot wins', () => {
      const { container } = renderNav(
        `
          <VSideNavigationItem href="/a" icon="home">Name</VSideNavigationItem>
          <VSideNavigationItem href="/b" :icon="logo">Render</VSideNavigationItem>
          <VSideNavigationItem href="/c" icon="home">
            Slot
            <template #start><span data-testid="avatar" /></template>
          </VSideNavigationItem>
        `,
        '',
        { logo: { src: '/logo.svg' } },
      )
      expect(icons(row(container, 'Name'))).toEqual(['home'])
      expect(row(container, 'Render').querySelector('img')?.getAttribute('src')).toBe('/logo.svg')
      expect(icons(row(container, 'Slot'))).toEqual([])
      expect(row(container, 'Slot').querySelector('[data-testid="avatar"]')).not.toBeNull()
    })

    it('wrapper-root: class/style on the <li>, the rest on the control', () => {
      const { container } = renderNav(`
        <VSideNavigationItem href="/x" class="custom" target="_blank" data-tracking="nav">
          External
        </VSideNavigationItem>
      `)
      const li = container.querySelector('li.v-side-nav-item')!
      const action = container.querySelector('.v-side-nav-action')!
      expect(li.classList.contains('custom')).toBe(true)
      expect(li.hasAttribute('target')).toBe(false)
      expect(action.getAttribute('target')).toBe('_blank')
      expect(action.getAttribute('data-tracking')).toBe('nav')
    })

    it('the sublabel accepts the prop as well as the slot', () => {
      const { container } = renderNav(`
        <VSideNavigationItem href="/a" sublabel="3 projects">Prop</VSideNavigationItem>
        <VSideNavigationItem href="/b">
          Slot
          <template #sublabel>yesterday</template>
        </VSideNavigationItem>
      `)
      const text = (label: string) =>
        row(container, label).querySelector('.v-side-nav-sublabel')?.textContent?.trim()
      expect(text('Prop')).toBe('3 projects')
      expect(text('Slot')).toBe('yesterday')
    })
  })

  describe('keyboard', () => {
    /** Links only: the programmatic focus of a <summary> is not modelled by jsdom, so
        moving to a branch is covered by a play function. */
    const LINKS = `
      <VSideNavigationItem href="/1">One</VSideNavigationItem>
      <VSideNavigationItem href="/2" disabled>Two</VSideNavigationItem>
      <VSideNavigationItem href="/3">Three</VSideNavigationItem>
      <VSideNavigationItem href="/4">
        Four
        <template #items><VSideNavigationItem href="/4-1">Hidden</VSideNavigationItem></template>
      </VSideNavigationItem>
    `

    it('the arrows move the focus both ways and skip disabled items', async () => {
      const { container } = renderNav(LINKS)
      const nav = container.querySelector('nav')!
      // [One, Two (disabled), Three, Hidden] — "Four" is a branch, hence a <summary>,
      // not an <a>.
      const [one, , three] = [...container.querySelectorAll<HTMLElement>('a.v-side-nav-action')]

      one!.focus()
      await fireEvent.keyDown(nav, { key: 'ArrowDown' })
      expect(document.activeElement).toBe(three)
      await fireEvent.keyDown(nav, { key: 'ArrowUp' })
      expect(document.activeElement).toBe(one)
      await fireEvent.keyDown(nav, { key: 'Home' })
      expect(document.activeElement).toBe(one)
    })

    it('the items of a collapsed branch are ignored, and the run wraps around', async () => {
      const { container } = renderNav(LINKS)
      const nav = container.querySelector('nav')!
      const one = container.querySelector<HTMLElement>('a.v-side-nav-action')!
      const hidden = container.querySelector<HTMLElement>('.v-side-nav-children a')!

      one.focus()
      await fireEvent.keyDown(nav, { key: 'End' })
      expect(document.activeElement).not.toBe(hidden)

      // once open, the same row becomes the last stop of the run again
      container.querySelector('details')!.open = true
      await fireEvent.keyDown(nav, { key: 'End' })
      expect(document.activeElement).toBe(hidden)
      await fireEvent.keyDown(nav, { key: 'ArrowDown' })
      expect(document.activeElement).toBe(one)
    })
  })
})
