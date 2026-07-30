import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'

import VTab from './VTab.vue'
import VTabPanel from './VTabPanel.vue'
import VTabs from './VTabs.vue'

/**
 * Harness: the v-model must be live (without a local ref, clicking a tab would
 * change nothing) and the ref is returned so the emitted value can be asserted.
 */
function mount(
  options: {
    /** Raw attributes set on <VTabs>. */
    tabsAttrs?: string
    /** Body of the default slot; three a/b/c tabs by default. */
    tabs?: string
    /** `true` renders three a/b/c panels; a string replaces their content. */
    panels?: boolean | string
    initial?: string | number
  } = {},
) {
  const model = ref<string | number | undefined>('initial' in options ? options.initial : 'a')
  const tabs =
    options.tabs ??
    `<VTab value="a" label="Un" />
     <VTab value="b" label="Two" />
     <VTab value="c" label="Three" />`
  const panelsBody =
    typeof options.panels === 'string'
      ? options.panels
      : options.panels
        ? `<VTabPanel value="a">Contenu A</VTabPanel>
           <VTabPanel value="b">Contenu B</VTabPanel>
           <VTabPanel value="c">Contenu C</VTabPanel>`
        : ''
  const panels = panelsBody ? `<template #panels>${panelsBody}</template>` : ''

  const Harness = defineComponent({
    components: { VTabs, VTab, VTabPanel },
    setup: () => ({ model }),
    template: `
      <VTabs v-model="model" ${options.tabsAttrs ?? ''}>
        ${tabs}
        ${panels}
      </VTabs>
    `,
  })
  return { model, ...render(Harness) }
}

/** The tabs in DOM order. */
const tabsOf = (container: Element) => [...container.querySelectorAll<HTMLElement>('[role="tab"]')]

describe('VTabs', () => {
  describe('accessibility', () => {
    it('renders a named tablist and tabs linked to their panels', () => {
      const { container } = mount({ panels: true })
      const list = container.querySelector('[role="tablist"]')
      expect(list?.getAttribute('aria-label')).toBe('Tabs')

      const [first, second] = tabsOf(container)
      expect(first?.getAttribute('aria-selected')).toBe('true')
      expect(second?.getAttribute('aria-selected')).toBe('false')

      const panels = [...container.querySelectorAll<HTMLElement>('[role="tabpanel"]')]
      expect(first?.getAttribute('aria-controls')).toBe(panels[0]?.id)
      expect(panels[0]?.getAttribute('aria-labelledby')).toBe(first?.id)
      expect(first?.id).toBeTruthy()
      expect(panels[0]?.id).toBeTruthy()
    })

    it('without a #panels slot, no aria-controls points at nothing', () => {
      const { container } = mount()
      expect(container.querySelector('[role="tabpanel"]')).toBeNull()
      for (const tab of tabsOf(container)) {
        expect(tab.hasAttribute('aria-controls')).toBe(false)
      }
    })

    it('aria-orientation set in vertical mode only', () => {
      const horizontal = mount()
      expect(
        horizontal.container.querySelector('[role="tablist"]')?.hasAttribute('aria-orientation'),
      ).toBe(false)
      horizontal.unmount()

      const { container } = mount({ tabsAttrs: 'orientation="vertical"' })
      expect(container.querySelector('[role="tablist"]')?.getAttribute('aria-orientation')).toBe(
        'vertical',
      )
    })

    it('the ids are sanitized: aria-controls is a list of IDREFs', () => {
      const { container } = mount({
        initial: 'mon onglet',
        tabs: `<VTab value="mon onglet" label="Un" />`,
        panels: false,
      })
      // the panel comes from the same deriver: check the tab, with no blank
      expect(container.querySelector('[role="tab"]')?.id).not.toContain(' ')
    })

    it('roving tabindex: only the active tab is in the tab order', () => {
      const { container } = mount()
      expect(tabsOf(container).map((el) => el.getAttribute('tabindex'))).toEqual(['0', '-1', '-1'])
    })
  })

  describe('v-model', () => {
    it('a click selects the tab', async () => {
      const { container, model } = mount()
      await fireEvent.click(tabsOf(container)[1] as HTMLElement)
      expect(model.value).toBe('b')
      expect(tabsOf(container).map((el) => el.getAttribute('aria-selected'))).toEqual([
        'false',
        'true',
        'false',
      ])
    })

    it('a value matching no tab selects nothing', () => {
      const { container } = mount({ initial: 'inconnu' })
      for (const tab of tabsOf(container)) {
        expect(tab.getAttribute('aria-selected')).toBe('false')
      }
    })
  })

  describe('keyboard navigation', () => {
    it('the arrows move focus without changing the selection (manual activation)', async () => {
      const { container, model } = mount()
      const tabs = tabsOf(container)
      tabs[0]?.focus()

      await fireEvent.keyDown(tabs[0] as HTMLElement, { key: 'ArrowRight' })
      expect(document.activeElement).toBe(tabs[1])
      expect(model.value).toBe('a')

      await fireEvent.keyDown(tabs[1] as HTMLElement, { key: 'End' })
      expect(document.activeElement).toBe(tabs[2])

      await fireEvent.keyDown(tabs[2] as HTMLElement, { key: 'ArrowRight' })
      expect(document.activeElement).toBe(tabs[0])

      await fireEvent.keyDown(tabs[0] as HTMLElement, { key: 'ArrowLeft' })
      expect(document.activeElement).toBe(tabs[2])

      await fireEvent.keyDown(tabs[2] as HTMLElement, { key: 'Home' })
      expect(document.activeElement).toBe(tabs[0])
    })

    it('in vertical mode, it is the up/down arrows', async () => {
      const { container } = mount({ tabsAttrs: 'orientation="vertical"' })
      const tabs = tabsOf(container)
      tabs[0]?.focus()

      await fireEvent.keyDown(tabs[0] as HTMLElement, { key: 'ArrowRight' })
      expect(document.activeElement).toBe(tabs[0])

      await fireEvent.keyDown(tabs[0] as HTMLElement, { key: 'ArrowDown' })
      expect(document.activeElement).toBe(tabs[1])

      await fireEvent.keyDown(tabs[1] as HTMLElement, { key: 'ArrowUp' })
      expect(document.activeElement).toBe(tabs[0])
    })

    it('automatic activation: the selection follows focus', async () => {
      const { container, model } = mount({ tabsAttrs: 'activation="automatic"' })
      tabsOf(container)[1]?.focus()
      await nextTick()
      expect(model.value).toBe('b')
    })
  })

  describe('disabled tab', () => {
    const tabs = `<VTab value="a" label="Un" />
                  <VTab value="b" label="Two" disabled />
                  <VTab value="c" label="Three" />`

    it('renders a <button disabled> (the states come from VButton)', () => {
      const { container } = mount({ tabs })
      const [, second] = tabsOf(container) as HTMLButtonElement[]
      expect(second?.disabled).toBe(true)
    })

    it('is skipped by the arrows', async () => {
      const { container } = mount({ tabs })
      const all = tabsOf(container)
      all[0]?.focus()
      await fireEvent.keyDown(all[0] as HTMLElement, { key: 'ArrowRight' })
      expect(document.activeElement).toBe(all[2])
    })
  })

  describe('panels', () => {
    it('only the active panel is visible, the others carry hidden', async () => {
      const { container, model } = mount({ panels: true })
      const panels = [...container.querySelectorAll<HTMLElement>('[role="tabpanel"]')]
      expect(panels.map((el) => el.hidden)).toEqual([false, true, true])

      model.value = 'c'
      await nextTick()
      expect(panels.map((el) => el.hidden)).toEqual([true, true, false])
    })

    it('the content of inactive panels stays mounted (hidden, not v-if)', () => {
      const { container } = mount({ panels: true })
      expect(container.textContent).toContain('Contenu B')
    })

    it('lazy: the content is only mounted on first display, then kept', async () => {
      const { container, model } = mount({
        panels: `<VTabPanel value="a">Contenu A</VTabPanel>
                 <VTabPanel value="b" lazy>Contenu B</VTabPanel>
                 <VTabPanel value="c">Contenu C</VTabPanel>`,
      })
      expect(container.textContent).not.toContain('Contenu B')

      model.value = 'b'
      await nextTick()
      expect(container.textContent).toContain('Contenu B')

      model.value = 'a'
      await nextTick()
      expect(container.textContent).toContain('Contenu B')
    })
  })

  describe('content and fallthrough', () => {
    it('icon only: a data-icon-only marker, no label container', () => {
      const { container } = mount({
        tabs: `<VTab value="a" icon="home" aria-label="Accueil" />`,
      })
      const tab = tabsOf(container)[0]
      expect(tab?.hasAttribute('data-icon-only')).toBe(true)
      expect(tab?.getAttribute('aria-label')).toBe('Accueil')
      expect(tab?.querySelector('.v-tab-label')).toBeNull()
    })

    it('a label or a slot cancels icon-only mode', () => {
      const { container } = mount({ tabs: `<VTab value="a" icon="home" label="Accueil" />` })
      const tab = tabsOf(container)[0]
      expect(tab?.hasAttribute('data-icon-only')).toBe(false)
      expect(tab?.querySelector('.v-tab-label')?.textContent).toBe('Accueil')
    })

    it('wrapper-root pattern: class on the root, the rest on the tablist', () => {
      const { container } = mount({ tabsAttrs: 'class="custom" data-testid="barre"' })
      const root = container.querySelector('.v-tabs')
      const list = container.querySelector('[role="tablist"]')
      expect(root?.classList.contains('custom')).toBe(true)
      expect(root?.hasAttribute('data-testid')).toBe(false)
      expect(list?.getAttribute('data-testid')).toBe('barre')
    })

    it('a consumer aria-label wins over the label prop', () => {
      const { container } = mount({ tabsAttrs: 'aria-label="Sections"' })
      expect(container.querySelector('[role="tablist"]')?.getAttribute('aria-label')).toBe(
        'Sections',
      )
    })

    it('an aria-labelledby removes the default aria-label', () => {
      const { container } = mount({ tabsAttrs: 'aria-labelledby="titre"' })
      const list = container.querySelector('[role="tablist"]')
      expect(list?.hasAttribute('aria-label')).toBe(false)
      expect(list?.getAttribute('aria-labelledby')).toBe('titre')
    })

    it('the tab stays a .v-button: the class is merged, not replaced', () => {
      const { container } = mount()
      const tab = tabsOf(container)[0]
      expect(tab?.classList.contains('v-button')).toBe(true)
      expect(tab?.classList.contains('v-tab')).toBe(true)
    })
  })

  describe('variants', () => {
    it('variant: data-variant set on the root, flat by default', () => {
      const variantOf = (tabsAttrs?: string) =>
        mount({ tabsAttrs }).container.querySelector('.v-tabs')?.getAttribute('data-variant')
      expect(variantOf()).toBe('flat')
      expect(variantOf('variant="outlined"')).toBe('outlined')
      expect(variantOf('variant="inset"')).toBe('inset')
    })

    /*
     * The only real logic on this axis (everything else is CSS, out of jsdom's
     * reach): `outlined` is a decorated `flat`, so it does not raise the active tab
     * — inside a card, the frame is what carries the elevation.
     */
    it("only `inset` raises the active tab (mapping to VButton's elevated)", () => {
      const activeTabOf = (tabsAttrs?: string) => tabsOf(mount({ tabsAttrs }).container)[0]
      // the variant stays ghost throughout: elevation is orthogonal to it
      expect(activeTabOf()?.getAttribute('data-variant')).toBe('ghost')
      expect(activeTabOf('variant="inset"')?.getAttribute('data-variant')).toBe('ghost')
      expect(activeTabOf()?.hasAttribute('data-elevated')).toBe(false)
      expect(activeTabOf('variant="outlined"')?.hasAttribute('data-elevated')).toBe(false)
      expect(activeTabOf('variant="inset"')?.hasAttribute('data-elevated')).toBe(true)
    })
  })

  describe('scroll buttons', () => {
    it('absent by default', () => {
      const { container } = mount()
      expect(container.querySelector('.v-tabs-scroll')).toBeNull()
      expect(container.querySelector('.v-tabs-sentinel')).toBeNull()
    })

    it('rendered and disabled until the ends are measured', () => {
      const { container } = mount({ tabsAttrs: 'scroll-buttons' })
      const controls = [...container.querySelectorAll<HTMLButtonElement>('.v-tabs-scroll')]
      expect(controls).toHaveLength(2)
      // IntersectionObserver does not exist in jsdom: the safe state is "at the end"
      expect(controls.every((el) => el.disabled)).toBe(true)
      expect(container.querySelectorAll('.v-tabs-sentinel')).toHaveLength(2)
    })
  })
})
