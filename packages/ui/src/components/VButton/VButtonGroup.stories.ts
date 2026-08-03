import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, within } from 'storybook/test'

import VIconButton from '../VIconButton/VIconButton.vue'
import VButton from './VButton.vue'
import VButtonGroup from './VButtonGroup.vue'

const meta = {
  title: 'Composants/ButtonGroup',
  component: VButtonGroup,
  argTypes: {
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
  },
  args: {
    orientation: 'horizontal',
  },
  render: (args) => ({
    components: { VButtonGroup, VButton },
    setup: () => ({ args }),
    template: `
      <VButtonGroup v-bind="args" aria-label="Alignement">
        <VButton variant="outline" tone="neutral">Gauche</VButton>
        <VButton variant="outline" tone="neutral">Centre</VButton>
        <VButton variant="outline" tone="neutral">Droite</VButton>
      </VButtonGroup>
    `,
  }),
} satisfies Meta<typeof VButtonGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Variants: Story = {
  render: () => ({
    components: { VButtonGroup, VButton },
    template: `
      <div style="display: grid; gap: 16px">
        <VButtonGroup aria-label="Solid">
          <VButton variant="solid">Jour</VButton>
          <VButton variant="solid">Semaine</VButton>
          <VButton variant="solid">Mois</VButton>
        </VButtonGroup>
        <VButtonGroup aria-label="Outline">
          <VButton variant="outline" tone="neutral">Jour</VButton>
          <VButton variant="outline" tone="neutral">Semaine</VButton>
          <VButton variant="outline" tone="neutral">Mois</VButton>
        </VButtonGroup>
        <VButtonGroup aria-label="Tonal">
          <VButton variant="tonal">Jour</VButton>
          <VButton variant="tonal">Semaine</VButton>
          <VButton variant="tonal">Mois</VButton>
        </VButtonGroup>
      </div>
    `,
  }),
}

export const Vertical: Story = {
  render: () => ({
    components: { VButtonGroup, VButton },
    template: `
      <VButtonGroup orientation="vertical" aria-label="Navigation">
        <VButton variant="outline" tone="neutral" icon-start="home">Accueil</VButton>
        <VButton variant="outline" tone="neutral" icon-start="folder">Projets</VButton>
        <VButton variant="outline" tone="neutral" icon-start="settings">Réglages</VButton>
      </VButtonGroup>
    `,
  }),
}

export const WithIconButton: Story = {
  render: () => ({
    components: { VButtonGroup, VIconButton },
    // role="toolbar" (surcharge du role par défaut) : barre d'outils de mise en forme.
    template: `
      <VButtonGroup role="toolbar" aria-label="Mise en forme">
        <VIconButton variant="outline" tone="neutral" label="Gras">
          <span style="font-weight: 700">B</span>
        </VIconButton>
        <VIconButton variant="outline" tone="neutral" label="Italique">
          <span style="font-style: italic">I</span>
        </VIconButton>
        <VIconButton variant="outline" tone="neutral" label="Souligné">
          <span style="text-decoration: underline">U</span>
        </VIconButton>
      </VButtonGroup>
    `,
  }),
}

export const Sizes: Story = {
  render: () => ({
    components: { VButtonGroup, VButton },
    // L'approche CSS-only : la taille se pose sur CHAQUE bouton (mêmes valeurs → cohérence).
    template: `
      <div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap">
        <VButtonGroup aria-label="Small">
          <VButton v-for="l in ['A', 'B', 'C']" :key="l" size="sm" variant="outline" tone="neutral">{{ l }}</VButton>
        </VButtonGroup>
        <VButtonGroup aria-label="Medium">
          <VButton v-for="l in ['A', 'B', 'C']" :key="l" size="md" variant="outline" tone="neutral">{{ l }}</VButton>
        </VButtonGroup>
        <VButtonGroup aria-label="Large">
          <VButton v-for="l in ['A', 'B', 'C']" :key="l" size="lg" variant="outline" tone="neutral">{{ l }}</VButton>
        </VButtonGroup>
      </div>
    `,
  }),
}

export const CasLimites: Story = {
  render: () => ({
    components: { VButtonGroup, VButton },
    template: `
      <div style="display: grid; gap: 16px; max-width: 420px">
        <!-- Un seul bouton : coins tous arrondis (aucune jointure). -->
        <VButtonGroup aria-label="Seul">
          <VButton variant="outline" tone="neutral">Bouton unique</VButton>
        </VButtonGroup>
        <!-- Libellés longs. -->
        <VButtonGroup aria-label="Longs libellés">
          <VButton variant="outline" tone="neutral">Exporter en CSV</VButton>
          <VButton variant="outline" tone="neutral">Exporter en PDF</VButton>
        </VButtonGroup>
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
