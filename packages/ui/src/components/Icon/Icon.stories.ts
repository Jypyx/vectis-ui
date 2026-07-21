import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, within } from 'storybook/test'

import Icon from './Icon.vue'

const meta = {
  title: 'Composants/Icon',
  component: Icon,
  argTypes: {
    size: { control: 'select', options: [undefined, 'sm', 'md', 'lg'] },
    name: { control: 'text' },
    src: { control: 'text' },
    label: { control: 'text' },
  },
  args: {
    name: 'favorite',
  },
} satisfies Meta<typeof Icon>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Tailles: Story = {
  render: () => ({
    components: { Icon },
    template: `
      <div style="display: flex; gap: 12px; align-items: center">
        <Icon name="favorite" size="sm" />
        <Icon name="favorite" size="md" />
        <Icon name="favorite" size="lg" />
        <Icon name="favorite" />
        <span>(sm / md / lg / défaut = md)</span>
      </div>
    `,
  }),
}

export const TroisSources: Story = {
  render: () => ({
    components: { Icon },
    template: `
      <div style="display: flex; gap: 12px; align-items: center">
        <Icon name="rocket_launch" size="lg" />
        <Icon
          size="lg"
          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='10' fill='%236366f1'/%3E%3C/svg%3E"
        />
        <Icon size="lg">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 12h16M12 4v16" stroke="currentcolor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </Icon>
        <span>(ligature / image / SVG inline)</span>
      </div>
    `,
  }),
}

export const AvecLabel: Story = {
  args: { name: 'warning', label: 'Attention' },
  play: async ({ canvasElement }) => {
    const icon = within(canvasElement).getByRole('img', { name: 'Attention' })
    await expect(icon).not.toHaveAttribute('aria-hidden')
  },
}

export const PiloteParLeParent: Story = {
  render: () => ({
    components: { Icon },
    template: `
      <!-- Le conteneur pose l'API de contexte ; la prop size explicite prime -->
      <div style="--ds-icon-size: var(--ds-icon-size-lg); --ds-icon-opsz: 24; display: flex; gap: 12px; align-items: center">
        <Icon name="palette" />
        <Icon name="palette" size="sm" />
        <span>(contexte lg / prop sm qui prime)</span>
      </div>
    `,
  }),
}
