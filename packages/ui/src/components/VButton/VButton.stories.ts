import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, within } from 'storybook/test'

import VIcon from '../VIcon/VIcon.vue'
import VButton from './VButton.vue'

const meta = {
  title: 'Composants/Button',
  component: VButton,
  argTypes: {
    variant: { control: 'select', options: ['solid', 'outline', 'ghost', 'elevated', 'tonal'] },
    tone: { control: 'select', options: ['accent', 'neutral', 'danger', 'success', 'warning'] },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    compact: { control: 'boolean' },
    iconStart: { control: 'text' },
    iconEnd: { control: 'text' },
    iconFilled: { control: 'boolean' },
    href: { control: 'text' },
  },
  args: {
    variant: 'solid',
    tone: 'accent',
    size: 'md',
    compact: false,
    disabled: false,
    loading: false,
  },
  render: (args) => ({
    components: { VButton },
    setup: () => ({ args }),
    template: '<VButton v-bind="args">Enregistrer</VButton>',
  }),
} satisfies Meta<typeof VButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Variants: Story = {
  render: () => ({
    components: { VButton },
    template: `
      <div style="display: grid; gap: 12px">
        <div v-for="tone in ['accent', 'neutral', 'danger', 'success', 'warning']" :key="tone" style="display: flex; gap: 8px; flex-wrap: wrap">
          <VButton v-for="variant in ['solid', 'outline', 'ghost', 'elevated', 'tonal']" :key="variant" :tone="tone" :variant="variant">
            {{ tone }} / {{ variant }}
          </VButton>
        </div>
      </div>
    `,
  }),
}

export const Sizes: Story = {
  render: () => ({
    components: { VButton },
    template: `
      <div style="display: grid; gap: 12px">
        <div style="display: flex; gap: 8px; align-items: center">
          <VButton size="xs">XSmall 24px</VButton>
          <VButton size="sm">Small 32px</VButton>
          <VButton size="md">Medium 40px</VButton>
          <VButton size="lg">Large 48px</VButton>
          <VButton size="xl">XLarge 56px</VButton>
        </div>
        <div style="display: flex; gap: 8px; align-items: center">
          <VButton size="xs" compact>XSmall 20px</VButton>
          <VButton size="sm" compact>Small 28px</VButton>
          <VButton size="md" compact>Medium 36px</VButton>
          <VButton size="lg" compact>Large 44px</VButton>
          <VButton size="xl" compact>XLarge 52px</VButton>
        </div>
      </div>
    `,
  }),
}

export const Icons: Story = {
  render: () => ({
    components: { VButton },
    template: `
      <div style="display: grid; gap: 12px">
        <div style="display: flex; gap: 8px; align-items: center">
          <VButton icon-start="add" size="sm">Ajouter</VButton>
          <VButton icon-start="add" size="md">Ajouter</VButton>
          <VButton icon-end="arrow_forward" size="lg">Suivant</VButton>
        </div>
        <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap">
          <VButton icon-start="check" variant="outline" tone="success">Valider</VButton>
          <VButton icon-start="warning" variant="tonal" tone="warning">Attention</VButton>
          <VButton icon-start="delete" variant="ghost" tone="danger">Supprimer</VButton>
          <VButton icon-start="cloud_upload" icon-end="expand_more" variant="elevated" tone="neutral">Importer</VButton>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Les icônes sont décoratives : le nom accessible reste le libellé seul.
    const button = canvas.getByRole('button', { name: 'Suivant' })
    const icon = button.querySelector('.v-icon')
    await expect(icon).not.toBeNull()
    await expect(icon).toHaveAttribute('aria-hidden', 'true')
  },
}

export const IconsFilled: Story = {
  render: () => ({
    components: { VButton },
    template: `
      <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap">
        <VButton icon-start="favorite" variant="tonal">Contour</VButton>
        <VButton icon-start="favorite" icon-filled variant="tonal">Plein</VButton>
        <VButton icon-start="home" icon-end="star" icon-filled variant="solid">Début + fin pleins</VButton>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Plein' })
    const icon = button.querySelector('.v-icon')
    await expect(icon).toHaveAttribute('data-filled')
  },
}

export const IconsTypes: Story = {
  render: () => ({
    components: { VButton, VIcon },
    template: `
      <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap">
        <!-- Par props : nom Material Symbols -->
        <VButton icon-start="add">Par props</VButton>

        <!-- Par slot : SVG inline -->
        <VButton>
          <template #start>
            <VIcon>
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M8 2v12M2 8h12" stroke="currentcolor" stroke-width="1.5" stroke-linecap="round" />
              </svg>
            </VIcon>
          </template>
          Par SVG
        </VButton>

        <!-- Par slot : image -->
        <VButton variant="outline" tone="neutral">
          <template #start>
            <VIcon src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='10' fill='%236366f1'/%3E%3C/svg%3E" />
          </template>
          Par image
        </VButton>
      </div>
    `,
  }),
}

export const Link: Story = {
  render: () => ({
    components: { VButton },
    template: `
      <VButton href="https://exemple.fr" target="_blank" rel="noreferrer" icon-end="open_in_new">
        Documentation
      </VButton>
    `,
  }),
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: 'Documentation' })
    await expect(link).toHaveAttribute('href', 'https://exemple.fr')
    await expect(link).not.toHaveAttribute('type')
    await expect(link).toHaveAttribute('target', '_blank')
  },
}

export const DisabledLink: Story = {
  render: () => ({
    components: { VButton },
    template: `
      <VButton href="https://exemple.fr" disabled>
        Lien désactivé
      </VButton>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Un <a> sans href n'a pas le rôle link : le lien inerte disparaît de l'arbre d'accessibilité en tant que lien.
    await expect(canvas.queryByRole('link')).toBeNull()
    const anchor = canvasElement.querySelector('a.v-button') as HTMLAnchorElement
    await expect(anchor).not.toHaveAttribute('href')
    await expect(anchor).toHaveAttribute('aria-disabled', 'true')
  },
}

export const Loading: Story = {
  args: { loading: true },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button')
    await expect(button).toBeDisabled()
    await expect(button).toHaveAttribute('aria-busy', 'true')
  },
}

export const Disabled: Story = {
  render: () => ({
    components: { VButton },
    template: `
      <div style="display: flex; gap: 8px; flex-wrap: wrap">
        <VButton v-for="variant in ['solid', 'outline', 'ghost', 'elevated', 'tonal']" :key="variant" :variant="variant" disabled>
          {{ variant }}
        </VButton>
      </div>
    `,
  }),
}
