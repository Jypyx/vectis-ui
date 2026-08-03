import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, within } from 'storybook/test'

import IconButton from '../VIconButton/VIconButton.vue'
import Button from './VButton.vue'
import ButtonGroup from './VButtonGroup.vue'

const meta = {
  title: 'Composants/ButtonGroup',
  component: ButtonGroup,
  argTypes: {
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
  },
  args: {
    orientation: 'horizontal',
  },
  render: (args) => ({
    components: { ButtonGroup, Button },
    setup: () => ({ args }),
    template: `
      <ButtonGroup v-bind="args" aria-label="Alignement">
        <Button variant="outline" tone="neutral">Gauche</Button>
        <Button variant="outline" tone="neutral">Centre</Button>
        <Button variant="outline" tone="neutral">Droite</Button>
      </ButtonGroup>
    `,
  }),
} satisfies Meta<typeof ButtonGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Variants: Story = {
  render: () => ({
    components: { ButtonGroup, Button },
    template: `
      <div style="display: grid; gap: 16px">
        <ButtonGroup aria-label="Solid">
          <Button variant="solid">Jour</Button>
          <Button variant="solid">Semaine</Button>
          <Button variant="solid">Mois</Button>
        </ButtonGroup>
        <ButtonGroup aria-label="Outline">
          <Button variant="outline" tone="neutral">Jour</Button>
          <Button variant="outline" tone="neutral">Semaine</Button>
          <Button variant="outline" tone="neutral">Mois</Button>
        </ButtonGroup>
        <ButtonGroup aria-label="Tonal">
          <Button variant="tonal">Jour</Button>
          <Button variant="tonal">Semaine</Button>
          <Button variant="tonal">Mois</Button>
        </ButtonGroup>
      </div>
    `,
  }),
}

export const Vertical: Story = {
  render: () => ({
    components: { ButtonGroup, Button },
    template: `
      <ButtonGroup orientation="vertical" aria-label="Navigation">
        <Button variant="outline" tone="neutral" icon-start="home">Accueil</Button>
        <Button variant="outline" tone="neutral" icon-start="folder">Projets</Button>
        <Button variant="outline" tone="neutral" icon-start="settings">Réglages</Button>
      </ButtonGroup>
    `,
  }),
}

export const WithIconButton: Story = {
  render: () => ({
    components: { ButtonGroup, IconButton },
    // role="toolbar" (surcharge du role par défaut) : barre d'outils de mise en forme.
    template: `
      <ButtonGroup role="toolbar" aria-label="Mise en forme">
        <IconButton variant="outline" tone="neutral" label="Gras">
          <span style="font-weight: 700">B</span>
        </IconButton>
        <IconButton variant="outline" tone="neutral" label="Italique">
          <span style="font-style: italic">I</span>
        </IconButton>
        <IconButton variant="outline" tone="neutral" label="Souligné">
          <span style="text-decoration: underline">U</span>
        </IconButton>
      </ButtonGroup>
    `,
  }),
}

export const Sizes: Story = {
  render: () => ({
    components: { ButtonGroup, Button },
    // L'approche CSS-only : la taille se pose sur CHAQUE bouton (mêmes valeurs → cohérence).
    template: `
      <div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap">
        <ButtonGroup aria-label="Small">
          <Button v-for="l in ['A', 'B', 'C']" :key="l" size="sm" variant="outline" tone="neutral">{{ l }}</Button>
        </ButtonGroup>
        <ButtonGroup aria-label="Medium">
          <Button v-for="l in ['A', 'B', 'C']" :key="l" size="md" variant="outline" tone="neutral">{{ l }}</Button>
        </ButtonGroup>
        <ButtonGroup aria-label="Large">
          <Button v-for="l in ['A', 'B', 'C']" :key="l" size="lg" variant="outline" tone="neutral">{{ l }}</Button>
        </ButtonGroup>
      </div>
    `,
  }),
}

export const CasLimites: Story = {
  render: () => ({
    components: { ButtonGroup, Button },
    template: `
      <div style="display: grid; gap: 16px; max-width: 420px">
        <!-- Un seul bouton : coins tous arrondis (aucune jointure). -->
        <ButtonGroup aria-label="Seul">
          <Button variant="outline" tone="neutral">Bouton unique</Button>
        </ButtonGroup>
        <!-- Libellés longs. -->
        <ButtonGroup aria-label="Longs libellés">
          <Button variant="outline" tone="neutral">Exporter en CSV</Button>
          <Button variant="outline" tone="neutral">Exporter en PDF</Button>
        </ButtonGroup>
      </div>
    `,
  }),
}

export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const group = within(canvasElement).getByRole('group', { name: 'Alignement' })
    await expect(group).toHaveAttribute('data-orientation', 'horizontal')
    await expect(within(group).getAllByRole('button')).toHaveLength(3)
  },
}
