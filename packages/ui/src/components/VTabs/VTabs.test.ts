import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'

import Tab from './VTab.vue'
import TabPanel from './VTabPanel.vue'
import Tabs from './VTabs.vue'

/**
 * Harnais : le v-model doit être vivant (sans ref locale, cliquer un onglet ne
 * changerait rien) et la ref est renvoyée pour asserter la valeur émise.
 */
function mount(
  options: {
    /** Attributs bruts posés sur <Tabs>. */
    tabsAttrs?: string
    /** Corps du slot par défaut ; par défaut trois onglets a/b/c. */
    tabs?: string
    /** `true` rend trois panneaux a/b/c ; une chaîne remplace leur contenu. */
    panels?: boolean | string
    initial?: string | number
  } = {},
) {
  const model = ref<string | number | undefined>('initial' in options ? options.initial : 'a')
  const tabs =
    options.tabs ??
    `<Tab value="a" label="Un" />
     <Tab value="b" label="Deux" />
     <Tab value="c" label="Trois" />`
  const panelsBody =
    typeof options.panels === 'string'
      ? options.panels
      : options.panels
        ? `<TabPanel value="a">Contenu A</TabPanel>
           <TabPanel value="b">Contenu B</TabPanel>
           <TabPanel value="c">Contenu C</TabPanel>`
        : ''
  const panels = panelsBody ? `<template #panels>${panelsBody}</template>` : ''

  const Harness = defineComponent({
    components: { Tabs, Tab, TabPanel },
    setup: () => ({ model }),
    template: `
      <Tabs v-model="model" ${options.tabsAttrs ?? ''}>
        ${tabs}
        ${panels}
      </Tabs>
    `,
  })
  return { model, ...render(Harness) }
}

/** Onglets dans l'ordre du DOM. */
const tabsOf = (container: Element) => [...container.querySelectorAll<HTMLElement>('[role="tab"]')]

describe('Tabs', () => {
  describe('accessibilité', () => {
    it('rend une tablist nommée et des onglets liés à leurs panneaux', () => {
      const { container } = mount({ panels: true })
      const list = container.querySelector('[role="tablist"]')
      expect(list?.getAttribute('aria-label')).toBe('Onglets')

      const [first, second] = tabsOf(container)
      expect(first?.getAttribute('aria-selected')).toBe('true')
      expect(second?.getAttribute('aria-selected')).toBe('false')

      const panels = [...container.querySelectorAll<HTMLElement>('[role="tabpanel"]')]
      expect(first?.getAttribute('aria-controls')).toBe(panels[0]?.id)
      expect(panels[0]?.getAttribute('aria-labelledby')).toBe(first?.id)
      expect(first?.id).toBeTruthy()
      expect(panels[0]?.id).toBeTruthy()
    })

    it('sans slot #panels, aucun aria-controls ne pointe dans le vide', () => {
      const { container } = mount()
      expect(container.querySelector('[role="tabpanel"]')).toBeNull()
      for (const tab of tabsOf(container)) {
        expect(tab.hasAttribute('aria-controls')).toBe(false)
      }
    })

    it('aria-orientation posé en vertical seulement', () => {
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

    it("les ids sont assainis : aria-controls est une liste d'IDREF", () => {
      const { container } = mount({
        initial: 'mon onglet',
        tabs: `<Tab value="mon onglet" label="Un" />`,
        panels: false,
      })
      // le panneau vient du même dérivateur : on vérifie l'onglet, sans blanc
      expect(container.querySelector('[role="tab"]')?.id).not.toContain(' ')
    })

    it('roving tabindex : seul l’onglet actif est dans l’ordre de tabulation', () => {
      const { container } = mount()
      expect(tabsOf(container).map((el) => el.getAttribute('tabindex'))).toEqual(['0', '-1', '-1'])
    })
  })

  describe('v-model', () => {
    it('un clic sélectionne l’onglet', async () => {
      const { container, model } = mount()
      await fireEvent.click(tabsOf(container)[1] as HTMLElement)
      expect(model.value).toBe('b')
      expect(tabsOf(container).map((el) => el.getAttribute('aria-selected'))).toEqual([
        'false',
        'true',
        'false',
      ])
    })

    it('une valeur ne correspondant à aucun onglet ne sélectionne rien', () => {
      const { container } = mount({ initial: 'inconnu' })
      for (const tab of tabsOf(container)) {
        expect(tab.getAttribute('aria-selected')).toBe('false')
      }
    })
  })

  describe('navigation clavier', () => {
    it('les flèches déplacent le focus sans changer la sélection (activation manuelle)', async () => {
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

    it('en vertical, ce sont les flèches haut/bas', async () => {
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

    it('activation automatique : la sélection suit le focus', async () => {
      const { container, model } = mount({ tabsAttrs: 'activation="automatic"' })
      tabsOf(container)[1]?.focus()
      await nextTick()
      expect(model.value).toBe('b')
    })
  })

  describe('onglet désactivé', () => {
    const tabs = `<Tab value="a" label="Un" />
                  <Tab value="b" label="Deux" disabled />
                  <Tab value="c" label="Trois" />`

    it('rend un <button disabled> (les états viennent de Button)', () => {
      const { container } = mount({ tabs })
      const [, second] = tabsOf(container) as HTMLButtonElement[]
      expect(second?.disabled).toBe(true)
    })

    it('est sauté par les flèches', async () => {
      const { container } = mount({ tabs })
      const all = tabsOf(container)
      all[0]?.focus()
      await fireEvent.keyDown(all[0] as HTMLElement, { key: 'ArrowRight' })
      expect(document.activeElement).toBe(all[2])
    })
  })

  describe('panneaux', () => {
    it('seul le panneau actif est visible, les autres portent hidden', async () => {
      const { container, model } = mount({ panels: true })
      const panels = [...container.querySelectorAll<HTMLElement>('[role="tabpanel"]')]
      expect(panels.map((el) => el.hidden)).toEqual([false, true, true])

      model.value = 'c'
      await nextTick()
      expect(panels.map((el) => el.hidden)).toEqual([true, true, false])
    })

    it('le contenu des panneaux inactifs reste monté (hidden, pas v-if)', () => {
      const { container } = mount({ panels: true })
      expect(container.textContent).toContain('Contenu B')
    })

    it('lazy : le contenu n’est monté qu’au premier affichage, puis conservé', async () => {
      const { container, model } = mount({
        panels: `<TabPanel value="a">Contenu A</TabPanel>
                 <TabPanel value="b" lazy>Contenu B</TabPanel>
                 <TabPanel value="c">Contenu C</TabPanel>`,
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

  describe('contenu et fallthrough', () => {
    it('icône seule : marqueur data-icon-only, aucun conteneur de libellé', () => {
      const { container } = mount({
        tabs: `<Tab value="a" icon="home" aria-label="Accueil" />`,
      })
      const tab = tabsOf(container)[0]
      expect(tab?.hasAttribute('data-icon-only')).toBe(true)
      expect(tab?.getAttribute('aria-label')).toBe('Accueil')
      expect(tab?.querySelector('.v-tab-label')).toBeNull()
    })

    it('un libellé ou un slot annule le mode icône seule', () => {
      const { container } = mount({ tabs: `<Tab value="a" icon="home" label="Accueil" />` })
      const tab = tabsOf(container)[0]
      expect(tab?.hasAttribute('data-icon-only')).toBe(false)
      expect(tab?.querySelector('.v-tab-label')?.textContent).toBe('Accueil')
    })

    it('pattern wrapper-root : class sur la racine, le reste sur la tablist', () => {
      const { container } = mount({ tabsAttrs: 'class="custom" data-testid="barre"' })
      const root = container.querySelector('.v-tabs')
      const list = container.querySelector('[role="tablist"]')
      expect(root?.classList.contains('custom')).toBe(true)
      expect(root?.hasAttribute('data-testid')).toBe(false)
      expect(list?.getAttribute('data-testid')).toBe('barre')
    })

    it('un aria-label du consommateur prime sur la prop label', () => {
      const { container } = mount({ tabsAttrs: 'aria-label="Sections"' })
      expect(container.querySelector('[role="tablist"]')?.getAttribute('aria-label')).toBe(
        'Sections',
      )
    })

    it('un aria-labelledby retire l’aria-label par défaut', () => {
      const { container } = mount({ tabsAttrs: 'aria-labelledby="titre"' })
      const list = container.querySelector('[role="tablist"]')
      expect(list?.hasAttribute('aria-label')).toBe(false)
      expect(list?.getAttribute('aria-labelledby')).toBe('titre')
    })

    it('l’onglet reste un .v-button : la classe est fusionnée, pas remplacée', () => {
      const { container } = mount()
      const tab = tabsOf(container)[0]
      expect(tab?.classList.contains('v-button')).toBe(true)
      expect(tab?.classList.contains('v-tab')).toBe(true)
    })
  })

  describe('variantes', () => {
    it('variant : data-variant posé sur la racine, flat par défaut', () => {
      const variantOf = (tabsAttrs?: string) =>
        mount({ tabsAttrs }).container.querySelector('.v-tabs')?.getAttribute('data-variant')
      expect(variantOf()).toBe('flat')
      expect(variantOf('variant="outlined"')).toBe('outlined')
      expect(variantOf('variant="inset"')).toBe('inset')
    })

    /*
     * Seule vraie logique de l'axe (tout le reste est du CSS, hors de portée de
     * jsdom) : `outlined` est `flat` habillé, il ne surélève donc pas l'onglet
     * actif — dans une carte, c'est le cadre qui porte l'élévation.
     */
    it('seul `inset` surélève l’onglet actif (mapping vers la variante de Button)', () => {
      const activeVariantOf = (tabsAttrs?: string) =>
        tabsOf(mount({ tabsAttrs }).container)[0]?.getAttribute('data-variant')
      expect(activeVariantOf()).toBe('ghost')
      expect(activeVariantOf('variant="outlined"')).toBe('ghost')
      expect(activeVariantOf('variant="inset"')).toBe('elevated')
    })
  })

  describe('boutons de défilement', () => {
    it('absents par défaut', () => {
      const { container } = mount()
      expect(container.querySelector('.v-tabs-scroll')).toBeNull()
      expect(container.querySelector('.v-tabs-sentinel')).toBeNull()
    })

    it('rendus et désactivés tant que les butées ne sont pas mesurées', () => {
      const { container } = mount({ tabsAttrs: 'scroll-buttons' })
      const controls = [...container.querySelectorAll<HTMLButtonElement>('.v-tabs-scroll')]
      expect(controls).toHaveLength(2)
      // IntersectionObserver n'existe pas en jsdom : l'état sûr est « en butée »
      expect(controls.every((el) => el.disabled)).toBe(true)
      expect(container.querySelectorAll('.v-tabs-sentinel')).toHaveLength(2)
    })
  })
})
