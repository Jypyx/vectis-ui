import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, within } from 'storybook/test'

import Icon from './Icon.vue'

const meta = {
  title: 'Composants/Icon',
  component: Icon,
  argTypes: {
    size: { control: { type: 'number', min: 12, max: 96, step: 4 } },
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

export const AdapteeAuTexte: Story = {
  render: () => ({
    components: { Icon },
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px">
        <span style="font-size: var(--ds-font-size-sm); display: inline-flex; gap: 8px; align-items: center">
          <Icon name="favorite" /> Suit un texte sm (1em)
        </span>
        <span style="font-size: var(--ds-font-size-xl); display: inline-flex; gap: 8px; align-items: center">
          <Icon name="favorite" /> Suit un texte xl (1em)
        </span>
        <span style="display: inline-flex; gap: 8px; align-items: center">
          <Icon name="favorite" :size="16" />
          <Icon name="favorite" :size="24" />
          <Icon name="favorite" :size="48" />
          <span>(surcharges numériques 16 / 24 / 48)</span>
        </span>
      </div>
    `,
  }),
}

export const TroisSources: Story = {
  render: () => ({
    components: { Icon },
    template: `
      <div style="display: flex; gap: 12px; align-items: center">
        <Icon name="rocket_launch" :size="24" />
        <Icon
          :size="24"
          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='10' fill='%236366f1'/%3E%3C/svg%3E"
        />
        <Icon :size="24">
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
      <!-- Le conteneur pose l'API de contexte ; la prop size numérique prime -->
      <div style="--ds-icon-size: var(--ds-icon-size-lg); --ds-icon-opsz: 24; display: flex; gap: 12px; align-items: center">
        <Icon name="palette" />
        <Icon name="palette" :size="16" />
        <span>(contexte lg / prop 16px qui prime)</span>
      </div>
    `,
  }),
}
