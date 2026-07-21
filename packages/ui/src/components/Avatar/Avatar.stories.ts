import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'

import Avatar from './Avatar.vue'

const PORTRAIT =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="%236366f1"/><circle cx="20" cy="15" r="7" fill="white"/><ellipse cx="20" cy="34" rx="12" ry="9" fill="white"/></svg>'

const meta = {
  title: 'Composants/Avatar',
  component: Avatar,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
  args: { size: 'md', name: 'Xavier Darmet' },
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

export const AvecImage: Story = {
  args: { src: PORTRAIT },
}

export const Initiales: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('XD')).toBeVisible()
  },
}

export const ImageCassee: Story = {
  args: { src: 'https://exemple.invalid/introuvable.png' },
  play: async ({ canvasElement }) => {
    // l'échec de chargement bascule sur les initiales
    await waitFor(() => expect(within(canvasElement).getByText('XD')).toBeVisible(), {
      timeout: 3000,
    })
  },
}

export const Tailles: Story = {
  render: () => ({
    components: { Avatar },
    template: `
      <div style="display: flex; gap: 8px; align-items: center">
        <Avatar size="sm" name="Ada Lovelace" />
        <Avatar size="md" name="Grace Hopper" />
        <Avatar size="lg" name="Margaret Hamilton" />
      </div>
    `,
  }),
}
