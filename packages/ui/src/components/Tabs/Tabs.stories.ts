import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import Tab from './Tab.vue'
import TabList from './TabList.vue'
import TabPanel from './TabPanel.vue'
import Tabs from './Tabs.vue'

const meta = {
  title: 'Composants/Tabs',
  component: Tabs,
  // le v-model de Tabs est requis par le type ; les render() gèrent leur propre état
  args: { modelValue: 'general' },
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

const TEMPLATE = `
  <Tabs v-model="active" style="width: 420px">
    <TabList>
      <Tab value="general">Général</Tab>
      <Tab value="securite">Sécurité</Tab>
      <Tab value="facturation" :disabled="disableLast">Facturation</Tab>
    </TabList>
    <TabPanel value="general">Paramètres généraux du compte.</TabPanel>
    <TabPanel value="securite">Mot de passe et double authentification.</TabPanel>
    <TabPanel value="facturation">Moyens de paiement et factures.</TabPanel>
  </Tabs>
`

export const Default: Story = {
  render: () => ({
    components: { Tabs, TabList, Tab, TabPanel },
    setup: () => ({ active: ref('general'), disableLast: false }),
    template: TEMPLATE,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // sélection à la souris
    await userEvent.click(canvas.getByRole('tab', { name: 'Sécurité' }))
    await waitFor(() =>
      expect(canvas.getByRole('tab', { name: 'Sécurité' })).toHaveAttribute(
        'aria-selected',
        'true',
      ),
    )
    await expect(canvas.getByText('Mot de passe et double authentification.')).toBeVisible()

    // activation automatique aux flèches (roving tabindex)
    await userEvent.keyboard('{ArrowRight}')
    await waitFor(() =>
      expect(canvas.getByRole('tab', { name: 'Facturation' })).toHaveAttribute(
        'aria-selected',
        'true',
      ),
    )
    // bouclage : flèche droite depuis le dernier revient au premier
    await userEvent.keyboard('{ArrowRight}')
    await waitFor(() =>
      expect(canvas.getByRole('tab', { name: 'Général' })).toHaveAttribute('aria-selected', 'true'),
    )
  },
}

export const OngletDesactive: Story = {
  render: () => ({
    components: { Tabs, TabList, Tab, TabPanel },
    setup: () => ({ active: ref('general'), disableLast: true }),
    template: TEMPLATE,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('tab', { name: 'Général' }))
    // la navigation aux flèches saute l'onglet désactivé
    await userEvent.keyboard('{ArrowLeft}')
    await waitFor(() =>
      expect(canvas.getByRole('tab', { name: 'Sécurité' })).toHaveAttribute(
        'aria-selected',
        'true',
      ),
    )
  },
}

export const LibellesLongs: Story = {
  render: () => ({
    components: { Tabs, TabList, Tab, TabPanel },
    setup: () => ({ active: ref('a') }),
    template: `
      <Tabs v-model="active" style="max-width: 360px">
        <TabList>
          <Tab value="a">Un premier onglet au libellé long</Tab>
          <Tab value="b">Un second onglet encore plus long que le premier</Tab>
        </TabList>
        <TabPanel value="a">Contenu A</TabPanel>
        <TabPanel value="b">Contenu B</TabPanel>
      </Tabs>
    `,
  }),
}
