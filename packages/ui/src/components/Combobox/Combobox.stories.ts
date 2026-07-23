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
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    compact: { control: 'boolean' },
  },
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

/**
 * Tailles `sm` (32px, défaut) et `md` (40px), combinables avec `compact` (-4px).
 * En multiple, les Chips descendent d'un cran (sm→xs, md→sm) et s'alignent pile
 * sur la hauteur du champ.
 */
export const Tailles: Story = {
  render: (args) => ({
    components: { Combobox },
    setup: () => ({
      args,
      variants: [
        { label: 'sm', props: { size: 'sm' } },
        { label: 'sm compact', props: { size: 'sm', compact: true } },
        { label: 'md', props: { size: 'md' } },
        { label: 'md compact', props: { size: 'md', compact: true } },
      ],
      value: ['fr', 'be'],
    }),
    template: `
      <div style="display: grid; gap: 16px; width: 340px">
        <div v-for="v in variants" :key="v.label" style="display: grid; gap: 4px">
          <span style="font: 12px sans-serif; color: #888">{{ v.label }}</span>
          <Combobox v-bind="{ ...args, ...v.props }" multiple :model-value="value" aria-label="Pays" />
        </div>
      </div>
    `,
  }),
}

/**
 * Hors focus, en mode multiple, le champ de saisie est replié : seuls les Chips
 * restent, sans espace vide. Au focus, le champ de recherche réapparaît.
 */
export const RepliAuBlur: Story = {
  render: (args) => ({
    components: { Combobox },
    setup: () => ({ args, value: ref<string[]>(['fr', 'be', 'ch']) }),
    template: `
      <div style="display: grid; gap: 8px; width: 340px">
        <button type="button">Élément voisin (pour retirer le focus)</button>
        <Combobox v-bind="args" multiple v-model="value" aria-label="Pays desservis" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('combobox') as HTMLInputElement

    // au focus, le champ de recherche est développé (largeur non nulle)
    await userEvent.click(input)
    await waitFor(() => expect(input.offsetWidth).toBeGreaterThan(0))

    // hors focus, le champ est replié (largeur nulle), seuls les Chips subsistent
    await userEvent.click(canvas.getByRole('button', { name: /voisin/ }))
    await waitFor(() => expect(input.offsetWidth).toBe(0))
    await expect(canvas.getByRole('button', { name: 'Retirer France' })).toBeVisible()
  },
}

/**
 * Deux Combobox côte à côte : chaque panneau s'ancre à SON contrôle grâce à
 * `anchor-scope` (le nom d'ancre est confiné à chaque instance).
 */
export const DeuxComboboxes: Story = {
  render: (args) => ({
    components: { Combobox },
    setup: () => ({ args, a: ref(''), b: ref('') }),
    template: `
      <div style="display: flex; gap: 16px; width: 640px">
        <Combobox v-bind="args" v-model="a" aria-label="Pays A" />
        <Combobox v-bind="args" v-model="b" aria-label="Pays B" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const [first, second] = canvas.getAllByRole('combobox')

    await userEvent.click(first!)
    await waitFor(() => expect(canvas.getByRole('option', { name: 'France' })).toBeVisible())
    // le second reste fermé et indépendant
    await expect(second!).toHaveAttribute('aria-expanded', 'false')
  },
}
