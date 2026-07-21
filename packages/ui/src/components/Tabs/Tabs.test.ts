import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent, ref } from 'vue'

import Tab from './Tab.vue'
import TabList from './TabList.vue'
import TabPanel from './TabPanel.vue'
import Tabs from './Tabs.vue'

function renderTabs(initial = 'a') {
  const active = ref(initial)
  const Harness = defineComponent({
    components: { Tabs, TabList, Tab, TabPanel },
    setup: () => ({ active }),
    template: `
      <Tabs v-model="active">
        <TabList>
          <Tab value="a">Alpha</Tab>
          <Tab value="b" disabled>Beta</Tab>
          <Tab value="c">Gamma</Tab>
        </TabList>
        <TabPanel value="a">Contenu A</TabPanel>
        <TabPanel value="b">Contenu B</TabPanel>
        <TabPanel value="c">Contenu C</TabPanel>
      </Tabs>
    `,
  })
  return { active, ...render(Harness) }
}

describe('Tabs', () => {
  it('relie tab et panel par IDs (aria-controls / aria-labelledby)', () => {
    const { getByRole } = renderTabs()
    const tab = getByRole('tab', { name: 'Alpha' })
    const panel = getByRole('tabpanel')
    expect(tab.getAttribute('aria-controls')).toBe(panel.id)
    expect(panel.getAttribute('aria-labelledby')).toBe(tab.id)
  })

  it("n'affiche que le panneau actif (attribut hidden), roving tabindex sur les tabs", () => {
    const { getByRole, getByText } = renderTabs()
    expect(getByText('Contenu A').hidden).toBe(false)
    expect(getByText('Contenu C').hidden).toBe(true)
    expect(getByRole('tab', { name: 'Alpha' }).getAttribute('tabindex')).toBe('0')
    expect(getByRole('tab', { name: 'Gamma' }).getAttribute('tabindex')).toBe('-1')
  })

  it('le clic sélectionne et synchronise le v-model', async () => {
    const { active, getByRole, getByText } = renderTabs()
    await fireEvent.click(getByRole('tab', { name: 'Gamma' }))
    expect(active.value).toBe('c')
    expect(getByText('Contenu C').hidden).toBe(false)
    expect(getByRole('tab', { name: 'Alpha' }).getAttribute('aria-selected')).toBe('false')
  })

  it('les flèches naviguent en sautant les onglets désactivés (activation automatique)', async () => {
    const { active, getByRole } = renderTabs()
    const tablist = getByRole('tablist')
    getByRole('tab', { name: 'Alpha' }).focus()

    await fireEvent.keyDown(tablist, { key: 'ArrowRight' })
    // Beta (disabled) est sauté
    expect(active.value).toBe('c')
    await fireEvent.keyDown(tablist, { key: 'ArrowRight' })
    // bouclage vers le premier
    expect(active.value).toBe('a')
    await fireEvent.keyDown(tablist, { key: 'End' })
    expect(active.value).toBe('c')
  })
})
