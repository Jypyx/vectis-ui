import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, within } from 'storybook/test'

import Icon from '../VIcon/VIcon.vue'
import IconButton from './VIconButton.vue'

const ICON = `
  <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
    <path d="M8 2v12M2 8h12" stroke="currentcolor" stroke-width="1.5" stroke-linecap="round" />
  </svg>
`

const meta = {
  title: 'Composants/IconButton',
  component: IconButton,
  argTypes: {
    variant: { control: 'select', options: ['solid', 'outline', 'ghost', 'elevated', 'tonal'] },
    tone: { control: 'select', options: ['accent', 'neutral', 'danger', 'success', 'warning'] },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    compact: { control: 'boolean' },
    icon: { control: 'text' },
    iconFilled: { control: 'boolean' },
  },
  args: {
    label: 'Ajouter un élément',
    variant: 'ghost',
    tone: 'neutral',
    size: 'md',
    compact: false,
    disabled: false,
    loading: false,
  },
  render: (args) => ({
    components: { IconButton, Icon },
    setup: () => ({ args }),
    template: '<IconButton v-bind="args"><Icon name="add" /></IconButton>',
  }),
} satisfies Meta<typeof IconButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    // Le libellé accessible est obligatoire : vérifie qu'il est bien exposé.
    const button = within(canvasElement).getByRole('button', { name: 'Ajouter un élément' })
    await expect(button).toBeVisible()
  },
}

export const Variants: Story = {
  render: (args) => ({
    components: { IconButton, Icon },
    setup: () => ({ args }),
    template: `
      <div style="display: grid; gap: 12px">
        <div v-for="tone in ['accent', 'neutral', 'danger', 'success', 'warning']" :key="tone" style="display: flex; gap: 8px; flex-wrap: wrap">
          <IconButton
            v-for="variant in ['solid', 'outline', 'ghost', 'elevated', 'tonal']"
            :key="variant"
            :label="args.label"
            :tone="tone"
            :variant="variant"
          >
            <Icon name="favorite" />
          </IconButton>
        </div>
      </div>
    `,
  }),
}

export const Sizes: Story = {
  render: (args) => ({
    components: { IconButton, Icon },
    setup: () => ({ args }),
    template: `
      <div style="display: grid; gap: 12px">
        <div style="display: flex; gap: 8px; align-items: center">
          <IconButton v-bind="args" size="xs"><Icon name="add" /></IconButton>
          <IconButton v-bind="args" size="sm"><Icon name="add" /></IconButton>
          <IconButton v-bind="args" size="md"><Icon name="add" /></IconButton>
          <IconButton v-bind="args" size="lg"><Icon name="add" /></IconButton>
          <IconButton v-bind="args" size="xl"><Icon name="add" /></IconButton>
        </div>
        <div style="display: flex; gap: 8px; align-items: center">
          <IconButton v-bind="args" size="xs" compact><Icon name="add" /></IconButton>
          <IconButton v-bind="args" size="sm" compact><Icon name="add" /></IconButton>
          <IconButton v-bind="args" size="md" compact><Icon name="add" /></IconButton>
          <IconButton v-bind="args" size="lg" compact><Icon name="add" /></IconButton>
          <IconButton v-bind="args" size="xl" compact><Icon name="add" /></IconButton>
        </div>
      </div>
    `,
  }),
}

export const IconsTypes: Story = {
  render: (args) => ({
    components: { IconButton, Icon },
    setup: () => ({ args }),
    template: `
      <div style="display: flex; gap: 8px; align-items: center">
        <!-- Ligature Material Symbols -->
        <IconButton label="Paramètres"><Icon name="settings" /></IconButton>

        <!-- SVG inline -->
        <IconButton label="Ajouter">${ICON}</IconButton>

        <!-- Image -->
        <IconButton label="Profil" variant="outline">
          <Icon src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='10' fill='%236366f1'/%3E%3C/svg%3E" />
        </IconButton>
      </div>
    `,
  }),
}

export const IconProp: Story = {
  render: (args) => ({
    components: { IconButton },
    setup: () => ({ args }),
    template: `
      <div style="display: flex; gap: 8px; align-items: center">
        <!-- Icône par prop, sans passer par le slot -->
        <IconButton :label="args.label" icon="favorite" />
        <IconButton :label="args.label" icon="favorite" icon-filled />
        <span>(prop icon : contour / plein)</span>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const icons = canvasElement.querySelectorAll('.v-icon')
    await expect(icons[0]).not.toHaveAttribute('data-filled')
    await expect(icons[1]).toHaveAttribute('data-filled')
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
  render: (args) => ({
    components: { IconButton, Icon },
    setup: () => ({ args }),
    template: `
      <div style="display: flex; gap: 8px; flex-wrap: wrap">
        <IconButton
          v-for="variant in ['solid', 'outline', 'ghost', 'elevated', 'tonal']"
          :key="variant"
          :label="args.label"
          :variant="variant"
          disabled
        >
          <Icon name="favorite" />
        </IconButton>
      </div>
    `,
  }),
}
