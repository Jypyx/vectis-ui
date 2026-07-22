import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, within } from 'storybook/test'

import Icon from '../Icon/Icon.vue'
import Button from './Button.vue'

const meta = {
  title: 'Composants/Button',
  component: Button,
  argTypes: {
    variant: { control: 'select', options: ['solid', 'outline', 'ghost', 'elevated', 'tonal'] },
    tone: { control: 'select', options: ['accent', 'neutral', 'danger', 'success', 'warning'] },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    compact: { control: 'boolean' },
    iconStart: { control: 'text' },
    iconEnd: { control: 'text' },
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
    components: { Button },
    setup: () => ({ args }),
    template: '<Button v-bind="args">Enregistrer</Button>',
  }),
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Variants: Story = {
  render: () => ({
    components: { Button },
    template: `
      <div style="display: grid; gap: 12px">
        <div v-for="tone in ['accent', 'neutral', 'danger', 'success', 'warning']" :key="tone" style="display: flex; gap: 8px; flex-wrap: wrap">
          <Button v-for="variant in ['solid', 'outline', 'ghost', 'elevated', 'tonal']" :key="variant" :tone="tone" :variant="variant">
            {{ tone }} / {{ variant }}
          </Button>
        </div>
      </div>
    `,
  }),
}

export const Sizes: Story = {
  render: () => ({
    components: { Button },
    template: `
      <div style="display: grid; gap: 12px">
        <div style="display: flex; gap: 8px; align-items: center">
          <Button size="xs">XSmall 24px</Button>
          <Button size="sm">Small 32px</Button>
          <Button size="md">Medium 40px</Button>
          <Button size="lg">Large 48px</Button>
          <Button size="xl">XLarge 56px</Button>
        </div>
        <div style="display: flex; gap: 8px; align-items: center">
          <Button size="xs" compact>XSmall 20px</Button>
          <Button size="sm" compact>Small 28px</Button>
          <Button size="md" compact>Medium 36px</Button>
          <Button size="lg" compact>Large 44px</Button>
          <Button size="xl" compact>XLarge 52px</Button>
        </div>
      </div>
    `,
  }),
}

export const Icons: Story = {
  render: () => ({
    components: { Button },
    template: `
      <div style="display: grid; gap: 12px">
        <div style="display: flex; gap: 8px; align-items: center">
          <Button icon-start="add" size="sm">Ajouter</Button>
          <Button icon-start="add" size="md">Ajouter</Button>
          <Button icon-end="arrow_forward" size="lg">Suivant</Button>
        </div>
        <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap">
          <Button icon-start="check" variant="outline" tone="success">Valider</Button>
          <Button icon-start="warning" variant="tonal" tone="warning">Attention</Button>
          <Button icon-start="delete" variant="ghost" tone="danger">Supprimer</Button>
          <Button icon-start="cloud_upload" icon-end="expand_more" variant="elevated" tone="neutral">Importer</Button>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Les icônes sont décoratives : le nom accessible reste le libellé seul.
    const button = canvas.getByRole('button', { name: 'Suivant' })
    const icon = button.querySelector('.ds-icon')
    await expect(icon).not.toBeNull()
    await expect(icon).toHaveAttribute('aria-hidden', 'true')
  },
}

export const IconsTypes: Story = {
  render: () => ({
    components: { Button, Icon },
    template: `
      <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap">
        <!-- Par props : nom Material Symbols -->
        <Button icon-start="add">Par props</Button>

        <!-- Par slot : SVG inline -->
        <Button>
          <template #start>
            <Icon>
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M8 2v12M2 8h12" stroke="currentcolor" stroke-width="1.5" stroke-linecap="round" />
              </svg>
            </Icon>
          </template>
          Par SVG
        </Button>

        <!-- Par slot : image -->
        <Button variant="outline" tone="neutral">
          <template #start>
            <Icon src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='10' fill='%236366f1'/%3E%3C/svg%3E" />
          </template>
          Par image
        </Button>
      </div>
    `,
  }),
}

export const Link: Story = {
  render: () => ({
    components: { Button },
    template: `
      <Button href="https://exemple.fr" target="_blank" rel="noreferrer" icon-end="open_in_new">
        Documentation
      </Button>
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
    components: { Button },
    template: `
      <Button href="https://exemple.fr" disabled>
        Lien désactivé
      </Button>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Un <a> sans href n'a pas le rôle link : le lien inerte disparaît de l'arbre d'accessibilité en tant que lien.
    await expect(canvas.queryByRole('link')).toBeNull()
    const anchor = canvasElement.querySelector('a.ds-button') as HTMLAnchorElement
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
    components: { Button },
    template: `
      <div style="display: flex; gap: 8px; flex-wrap: wrap">
        <Button v-for="variant in ['solid', 'outline', 'ghost', 'elevated', 'tonal']" :key="variant" :variant="variant" disabled>
          {{ variant }}
        </Button>
      </div>
    `,
  }),
}
