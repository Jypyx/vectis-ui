import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, within } from 'storybook/test'

import Spinner from './Spinner.vue'

const meta = {
  title: 'Composants/Spinner',
  component: Spinner,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
  args: { size: 'md' },
} satisfies Meta<typeof Spinner>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    // role="status" + libellé masqué : annoncé par les lecteurs d'écran
    await expect(within(canvasElement).getByRole('status')).toHaveTextContent('Chargement…')
  },
}

export const Tailles: Story = {
  render: () => ({
    components: { Spinner },
    template: `
      <div style="display: flex; gap: 16px; align-items: center">
        <Spinner size="sm" />
        <Spinner size="md" />
        <Spinner size="lg" />
      </div>
    `,
  }),
}

export const Colore: Story = {
  render: () => ({
    components: { Spinner },
    template: `
      <!-- le spinner hérite de currentcolor : il suit le texte environnant -->
      <div style="color: var(--ds-color-accent); display: flex; gap: 8px; align-items: center">
        <Spinner size="sm" label="Envoi en cours…" />
        <span>Envoi en cours…</span>
      </div>
    `,
  }),
}
