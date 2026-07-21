import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, fn, userEvent, within } from 'storybook/test'

import Button from './Button.vue'

const meta = {
  title: 'Composants/Button',
  component: Button,
  argTypes: {
    variant: { control: 'select', options: ['solid', 'outline', 'ghost', 'elevated', 'tonal'] },
    tone: { control: 'select', options: ['accent', 'neutral', 'danger', 'success', 'warning'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
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

export const Variantes: Story = {
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

export const Tailles: Story = {
  render: () => ({
    components: { Button },
    template: `
      <div style="display: flex; gap: 8px; align-items: center">
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </div>
    `,
  }),
}

export const Compact: Story = {
  render: () => ({
    components: { Button },
    template: `
      <div style="display: grid; gap: 12px">
        <div style="display: flex; gap: 8px; align-items: center">
          <Button size="sm">Small 32px</Button>
          <Button size="md">Medium 40px</Button>
          <Button size="lg">Large 48px</Button>
        </div>
        <div style="display: flex; gap: 8px; align-items: center">
          <Button size="sm" compact>Small 28px</Button>
          <Button size="md" compact>Medium 36px</Button>
          <Button size="lg" compact>Large 44px</Button>
        </div>
      </div>
    `,
  }),
}

export const IconesParProps: Story = {
  render: () => ({
    components: { Button },
    template: `
      <div style="display: flex; gap: 8px; align-items: center">
        <Button icon-start="add" size="sm">Ajouter</Button>
        <Button icon-start="add">Ajouter</Button>
        <Button icon-end="arrow_forward" size="lg">Suivant</Button>
        <Button icon-start="cloud_upload" icon-end="expand_more" variant="tonal">Importer</Button>
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

export const AvecIcones: Story = {
  render: () => ({
    components: { Button },
    template: `
      <Button>
        <template #start>
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            <path d="M8 2v12M2 8h12" stroke="currentcolor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </template>
        Ajouter
      </Button>
    `,
  }),
}

export const Lien: Story = {
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

export const LienDesactive: Story = {
  render: () => ({
    components: { Button },
    setup: () => ({ onClick: fn() }),
    template: `
      <Button href="https://exemple.fr" disabled @click="onClick">
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
  args: { disabled: true },
}

export const DisabledParVariante: Story = {
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

export const DisabledNeCliquePas: Story = {
  args: { disabled: true },
  render: (args) => ({
    components: { Button },
    setup: () => ({ args, onClick: fn() }),
    template: '<Button v-bind="args" @click="onClick">Désactivé</Button>',
  }),
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button')
    await userEvent.click(button).catch(() => {
      // pointer-events refusés sur un bouton disabled : c'est le comportement attendu
    })
    await expect(button).toBeDisabled()
  },
}

export const TexteLong: Story = {
  render: () => ({
    components: { Button },
    template: `
      <div style="max-width: 200px">
        <Button>Un libellé anormalement long qui ne devrait pas casser la mise en page</Button>
      </div>
    `,
  }),
}
