import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import Combobox from './Combobox.vue'

const PAYS = [
  { value: 'fr', label: 'France' },
  { value: 'be', label: 'Belgique' },
  { value: 'ch', label: 'Suisse' },
  { value: 'ca', label: 'Canada' },
  { value: 'lu', label: 'Luxembourg' },
  { value: 'mc', label: 'Monaco', disabled: true },
  { value: 'sn', label: 'Sénégal' },
  { value: 'ci', label: "Côte d'Ivoire" },
]

const meta = {
  title: 'Composants/Combobox',
  component: Combobox,
  args: { options: PAYS, placeholder: 'Choisir un pays…' },
} satisfies Meta<typeof Combobox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { Combobox },
    setup: () => ({ args, value: ref('') }),
    template: `
      <div style="display: grid; gap: 8px; width: 300px">
        <Combobox v-bind="args" v-model="value" aria-label="Pays" />
        <output data-testid="mirror">{{ value }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('combobox')

    // recherche insensible aux accents, navigation clavier, sélection
    await userEvent.click(input)
    await userEvent.keyboard('sene')
    await waitFor(() => expect(canvas.getByRole('option', { name: /Sénégal/ })).toBeVisible())
    await userEvent.keyboard('{ArrowDown}{Enter}')
    await waitFor(() => expect(canvas.getByTestId('mirror')).toHaveTextContent('sn'))
    await expect(input).toHaveValue('Sénégal')
  },
}

export const SelectionMultiple: Story = {
  render: (args) => ({
    components: { Combobox },
    setup: () => ({ args, value: ref<string[]>(['fr']) }),
    template: `
      <div style="display: grid; gap: 8px; width: 340px">
        <Combobox v-bind="args" multiple v-model="value" aria-label="Pays desservis" />
        <output data-testid="mirror">{{ value.join(',') }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('combobox')

    // sélection multiple : le panneau reste ouvert, des tags apparaissent
    await userEvent.click(input)
    await userEvent.keyboard('bel')
    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(canvas.getByTestId('mirror')).toHaveTextContent('fr,be'))

    // Backspace sur champ vide retire le dernier tag
    await userEvent.keyboard('{Backspace}')
    await waitFor(() => expect(canvas.getByTestId('mirror')).toHaveTextContent(/^fr$/))

    // retrait via le bouton du tag
    await userEvent.click(canvas.getByRole('button', { name: 'Retirer France' }))
    await waitFor(() => expect(canvas.getByTestId('mirror')).toHaveTextContent(/^$/))
  },
}

export const AucunResultat: Story = {
  render: (args) => ({
    components: { Combobox },
    setup: () => ({ args, value: ref('') }),
    template: `
      <div style="width: 300px">
        <Combobox v-bind="args" v-model="value" aria-label="Pays" empty-text="Aucun pays trouvé" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('combobox'))
    await userEvent.keyboard('zzz')
    await waitFor(() => expect(canvas.getByText('Aucun pays trouvé')).toBeVisible())
  },
}

export const Invalide: Story = {
  render: (args) => ({
    components: { Combobox },
    setup: () => ({ args, value: ref('') }),
    template: `
      <div style="width: 300px">
        <Combobox v-bind="args" v-model="value" invalid aria-label="Pays" />
      </div>
    `,
  }),
}

export const Disabled: Story = {
  render: (args) => ({
    components: { Combobox },
    setup: () => ({ args, value: ref('fr') }),
    template: `
      <div style="width: 300px">
        <Combobox v-bind="args" v-model="value" disabled aria-label="Pays" />
      </div>
    `,
  }),
}
