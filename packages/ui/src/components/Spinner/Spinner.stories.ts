import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, within } from 'storybook/test'

import Spinner from './Spinner.vue'

const meta = {
  title: 'Composants/Spinner',
  component: Spinner,
  argTypes: {
    size: { control: { type: 'number', min: 12, max: 96, step: 4 } },
  },
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
      <div style="display: flex; flex-direction: column; gap: 12px">
        <span style="font-size: var(--ds-font-size-sm); display: inline-flex; gap: 8px; align-items: center">
          <Spinner /> Suit un texte sm (1em)
        </span>
        <span style="font-size: var(--ds-font-size-xl); display: inline-flex; gap: 8px; align-items: center">
          <Spinner /> Suit un texte xl (1em)
        </span>
        <span style="display: inline-flex; gap: 8px; align-items: center">
          <Spinner :size="32" />
          <span>(surcharge numérique 32)</span>
        </span>
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
        <Spinner label="Envoi en cours…" />
        <span>Envoi en cours…</span>
      </div>
    `,
  }),
}
