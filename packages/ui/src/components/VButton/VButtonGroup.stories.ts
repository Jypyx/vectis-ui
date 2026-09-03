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
    rowActions: 'Row actions',
    rename: 'Rename',
    duplicate: 'Duplicate',
    remove: 'Delete',
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
    rowActions: 'Actions de ligne',
    rename: 'Renommer',
    duplicate: 'Dupliquer',
    remove: 'Supprimer',
  },
})

const meta = {
  title: 'Components/ButtonGroup',
  component: VButtonGroup,
  argTypes: {
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    variant: { control: 'inline-radio', options: ['solid', 'outline', 'ghost', 'soft'] },
    tone: { control: 'inline-radio', options: ['accent', 'neutral', 'danger'] },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
  },
  args: {
    orientation: 'horizontal',
    variant: 'outline',
    tone: 'neutral',
  },
  // The buttons carry none of the appearance props: the group does, which is what the
  // controls above drive.
  render: (args) => ({
    components: { VButtonGroup, VButton },
    setup: () => ({ args, t }),
    template: `
      <VButtonGroup v-bind="args" :aria-label="t.alignment">
        <VButton>{{ t.left }}</VButton>
        <VButton>{{ t.centre }}</VButton>
        <VButton>{{ t.right }}</VButton>
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
    // One variant per row, named once on the group.
    template: `
      <div style="display: grid; gap: 16px">
        <VButtonGroup variant="solid" aria-label="Solid">
          <VButton>{{ t.day }}</VButton>
          <VButton>{{ t.week }}</VButton>
          <VButton>{{ t.month }}</VButton>
        </VButtonGroup>
        <VButtonGroup variant="outline" tone="neutral" aria-label="Outline">
          <VButton>{{ t.day }}</VButton>
          <VButton>{{ t.week }}</VButton>
          <VButton>{{ t.month }}</VButton>
        </VButtonGroup>
        <VButtonGroup variant="soft" aria-label="Tonal">
          <VButton>{{ t.day }}</VButton>
          <VButton>{{ t.week }}</VButton>
          <VButton>{{ t.month }}</VButton>
        </VButtonGroup>
      </div>
    `,
  }),
}

export const ToneOverride: Story = {
  render: () => ({
    components: { VButtonGroup, VButton },
    setup: () => ({ t }),
    // The tone is the one prop a segment keeps against its group: the row is neutral,
    // the destructive action says so.
    template: `
      <VButtonGroup variant="outline" tone="neutral" :aria-label="t.rowActions">
        <VButton>{{ t.rename }}</VButton>
        <VButton>{{ t.duplicate }}</VButton>
        <VButton tone="danger">{{ t.remove }}</VButton>
      </VButtonGroup>
    `,
  }),
}

export const Elevated: Story = {
  render: () => ({
    components: { VButtonGroup, VButton },
    setup: () => ({ t }),
    template: `
      <VButtonGroup elevated variant="ghost" tone="neutral" :aria-label="t.alignment">
        <VButton>{{ t.left }}</VButton>
        <VButton>{{ t.centre }}</VButton>
        <VButton>{{ t.right }}</VButton>
      </VButtonGroup>
    `,
  }),
}

export const Vertical: Story = {
  render: () => ({
    components: { VButtonGroup, VButton },
    setup: () => ({ t }),
    template: `
      <VButtonGroup orientation="vertical" variant="outline" tone="neutral" :aria-label="t.navigation">
        <VButton icon-start="home">{{ t.home }}</VButton>
        <VButton icon-start="folder">{{ t.projects }}</VButton>
        <VButton icon-start="settings">{{ t.settings }}</VButton>
      </VButtonGroup>
    `,
  }),
}

export const WithIconButton: Story = {
  render: () => ({
    components: { VButtonGroup, VIconButton },
    setup: () => ({ t }),
    // role="toolbar" (overriding the default role): a text-formatting toolbar. The icon
    // buttons take the group's appearance the same way a VButton does.
    template: `
      <VButtonGroup role="toolbar" variant="outline" tone="neutral" :aria-label="t.formatting">
        <VIconButton :label="t.bold">
          <span style="font-weight: 700">B</span>
        </VIconButton>
        <VIconButton :label="t.italic">
          <span style="font-style: italic">I</span>
        </VIconButton>
        <VIconButton :label="t.underline">
          <span style="text-decoration: underline">U</span>
        </VIconButton>
      </VButtonGroup>
    `,
  }),
}

export const Sizes: Story = {
  render: () => ({
    components: { VButtonGroup, VButton },
    // The size is a property of the row, so it is named once, on the group.
    template: `
      <div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap">
        <VButtonGroup size="sm" variant="outline" tone="neutral" aria-label="Small">
          <VButton v-for="l in ['A', 'B', 'C']" :key="l">{{ l }}</VButton>
        </VButtonGroup>
        <VButtonGroup size="md" variant="outline" tone="neutral" aria-label="Medium">
          <VButton v-for="l in ['A', 'B', 'C']" :key="l">{{ l }}</VButton>
        </VButtonGroup>
        <VButtonGroup size="lg" variant="outline" tone="neutral" aria-label="Large">
          <VButton v-for="l in ['A', 'B', 'C']" :key="l">{{ l }}</VButton>
        </VButtonGroup>
        <VButtonGroup size="lg" compact variant="outline" tone="neutral" aria-label="Large compact">
          <VButton v-for="l in ['A', 'B', 'C']" :key="l">{{ l }}</VButton>
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
        <VButtonGroup variant="outline" tone="neutral" :aria-label="t.alone">
          <VButton>{{ t.singleButton }}</VButton>
        </VButtonGroup>
        <VButtonGroup variant="outline" tone="neutral" :aria-label="t.longLabels">
          <VButton>{{ t.exportCsv }}</VButton>
          <VButton>{{ t.exportPdf }}</VButton>
        </VButtonGroup>
      </div>
    `,
  }),
}

export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const group = within(canvasElement).getByRole('group', { name: 'Alignment' })
    await expect(group).toHaveAttribute('data-orientation', 'horizontal')

    const buttons = within(group).getAllByRole('button')
    await expect(buttons).toHaveLength(3)

    // The buttons are given nothing: what they render is what the group decided.
    for (const button of buttons) {
      await expect(button).toHaveAttribute('data-variant', 'outline')
      await expect(button).toHaveAttribute('data-tone', 'neutral')
    }
  },
}
