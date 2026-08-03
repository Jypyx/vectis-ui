import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, within } from 'storybook/test'

import { storyText } from '../../stories/storyText'
import VIconButton from '../VIconButton/VIconButton.vue'
import VButton from './VButton.vue'
import VButtonGroup from './VButtonGroup.vue'

const t = storyText({
  en: {
    alignment: 'Alignment',
    left: 'Left',
    centre: 'Centre',
    right: 'Right',
    day: 'Day',
    week: 'Week',
    month: 'Month',
    navigation: 'Navigation',
    home: 'Home',
    projects: 'Projects',
    settings: 'Settings',
    formatting: 'Formatting',
    bold: 'Bold',
    italic: 'Italic',
    underline: 'Underline',
    alone: 'Alone',
    singleButton: 'Single button',
    longLabels: 'Long labels',
    exportCsv: 'Export as CSV',
    exportPdf: 'Export as PDF',
  },
  fr: {
    alignment: 'Alignement',
    left: 'Gauche',
    centre: 'Centre',
    right: 'Droite',
    day: 'Jour',
    week: 'Semaine',
    month: 'Mois',
    navigation: 'Navigation',
    home: 'Accueil',
    projects: 'Projets',
    settings: 'Réglages',
    formatting: 'Mise en forme',
    bold: 'Gras',
    italic: 'Italique',
    underline: 'Souligné',
    alone: 'Seul',
    singleButton: 'Bouton unique',
    longLabels: 'Libellés longs',
    exportCsv: 'Exporter en CSV',
    exportPdf: 'Exporter en PDF',
  },
})

const meta = {
  title: 'Components/ButtonGroup',
  component: VButtonGroup,
  argTypes: {
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
  },
  args: {
    orientation: 'horizontal',
  },
  render: (args) => ({
    components: { VButtonGroup, VButton },
    setup: () => ({ args, t }),
    template: `
      <VButtonGroup v-bind="args" :aria-label="t.alignment">
        <VButton variant="outline" tone="neutral">{{ t.left }}</VButton>
        <VButton variant="outline" tone="neutral">{{ t.centre }}</VButton>
        <VButton variant="outline" tone="neutral">{{ t.right }}</VButton>
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
    setup: () => ({ t }),
    template: `
      <div style="display: grid; gap: 16px">
        <VButtonGroup aria-label="Solid">
          <VButton variant="solid">{{ t.day }}</VButton>
          <VButton variant="solid">{{ t.week }}</VButton>
          <VButton variant="solid">{{ t.month }}</VButton>
        </VButtonGroup>
        <VButtonGroup aria-label="Outline">
          <VButton variant="outline" tone="neutral">{{ t.day }}</VButton>
          <VButton variant="outline" tone="neutral">{{ t.week }}</VButton>
          <VButton variant="outline" tone="neutral">{{ t.month }}</VButton>
        </VButtonGroup>
        <VButtonGroup aria-label="Tonal">
          <VButton variant="tonal">{{ t.day }}</VButton>
          <VButton variant="tonal">{{ t.week }}</VButton>
          <VButton variant="tonal">{{ t.month }}</VButton>
        </VButtonGroup>
      </div>
    `,
  }),
}

export const Vertical: Story = {
  render: () => ({
    components: { VButtonGroup, VButton },
    setup: () => ({ t }),
    template: `
      <VButtonGroup orientation="vertical" :aria-label="t.navigation">
        <VButton variant="outline" tone="neutral" icon-start="home">{{ t.home }}</VButton>
        <VButton variant="outline" tone="neutral" icon-start="folder">{{ t.projects }}</VButton>
        <VButton variant="outline" tone="neutral" icon-start="settings">{{ t.settings }}</VButton>
      </VButtonGroup>
    `,
  }),
}

export const WithIconButton: Story = {
  render: () => ({
    components: { VButtonGroup, VIconButton },
    setup: () => ({ t }),
    // role="toolbar" (overriding the default role): a text-formatting toolbar.
    template: `
      <VButtonGroup role="toolbar" :aria-label="t.formatting">
        <VIconButton variant="outline" tone="neutral" :label="t.bold">
          <span style="font-weight: 700">B</span>
        </VIconButton>
        <VIconButton variant="outline" tone="neutral" :label="t.italic">
          <span style="font-style: italic">I</span>
        </VIconButton>
        <VIconButton variant="outline" tone="neutral" :label="t.underline">
          <span style="text-decoration: underline">U</span>
        </VIconButton>
      </VButtonGroup>
    `,
  }),
}

export const Sizes: Story = {
  render: () => ({
    components: { VButtonGroup, VButton },
    // The CSS-only approach: the size goes on EACH button (same values → coherence).
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

export const EdgeCases: Story = {
  render: () => ({
    components: { VButtonGroup, VButton },
    setup: () => ({ t }),
    template: `
      <div style="display: grid; gap: 16px; max-width: 420px">
        <VButtonGroup :aria-label="t.alone">
          <VButton variant="outline" tone="neutral">{{ t.singleButton }}</VButton>
        </VButtonGroup>
        <VButtonGroup :aria-label="t.longLabels">
          <VButton variant="outline" tone="neutral">{{ t.exportCsv }}</VButton>
          <VButton variant="outline" tone="neutral">{{ t.exportPdf }}</VButton>
        </VButtonGroup>
      </div>
    `,
  }),
}

export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const group = within(canvasElement).getByRole('group', { name: 'Alignment' })
    await expect(group).toHaveAttribute('data-orientation', 'horizontal')
    await expect(within(group).getAllByRole('button')).toHaveLength(3)
  },
}
