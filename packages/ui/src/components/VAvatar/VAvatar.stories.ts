import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import Tooltip from '../VTooltip/VTooltip.vue'
import Avatar from './VAvatar.vue'

const PORTRAIT =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="%236366f1"/><circle cx="20" cy="15" r="7" fill="white"/><ellipse cx="20" cy="34" rx="12" ry="9" fill="white"/></svg>'

const meta = {
  title: 'Composants/Avatar',
  component: Avatar,
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    compact: { control: 'boolean' },
  },
  args: { size: 'md', compact: false, name: 'Xavier Darmet' },
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

export const AvecImage: Story = {
  args: { src: PORTRAIT },
}

export const Icone: Story = {
  args: { name: undefined, icon: 'person' },
}

export const Initiales: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('XD')).toBeVisible()
  },
}

export const ImageCassee: Story = {
  args: { src: 'https://exemple.invalid/introuvable.png' },
  play: async ({ canvasElement }) => {
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
        <Avatar size="xs" name="Ada Lovelace" />
        <Avatar size="sm" name="Grace Hopper" />
        <Avatar size="md" name="Margaret Hamilton" />
        <Avatar size="lg" name="Katherine Johnson" />
        <Avatar size="xl" name="Radia Perlman" />
      </div>
    `,
  }),
}

/** Compact : hauteur réduite de 4px à chaque taille (typo/icône inchangées). */
export const Compact: Story = {
  render: () => ({
    components: { Avatar },
    template: `
      <div style="display: flex; gap: 8px; align-items: center">
        <Avatar size="sm" name="Ada Lovelace" />
        <Avatar size="sm" compact name="Ada Lovelace" />
        <Avatar size="md" name="Grace Hopper" />
        <Avatar size="md" compact name="Grace Hopper" />
        <Avatar size="lg" name="Margaret Hamilton" />
        <Avatar size="lg" compact name="Margaret Hamilton" />
      </div>
    `,
  }),
}

/** Teinte OKLCH dérivée du nom : chaque personne obtient une couleur stable et distincte. */
export const CouleurAuto: Story = {
  render: () => ({
    components: { Avatar },
    template: `
      <div style="display: flex; gap: 8px; flex-wrap: wrap">
        <Avatar name="Ada Lovelace" />
        <Avatar name="Grace Hopper" />
        <Avatar name="Margaret Hamilton" />
        <Avatar name="Katherine Johnson" />
        <Avatar name="Radia Perlman" />
        <Avatar name="Barbara Liskov" />
        <Avatar name="Frances Allen" />
      </div>
    `,
  }),
}

/** La prop `color` remplace la teinte auto (texte blanc, contraste au consommateur). */
export const CouleurCustom: Story = {
  args: { color: 'teal' },
}

/** Rendu `<button>` : focusable, état survol, anneau de focus au clavier. */
export const Cliquable: Story = {
  args: { clickable: true },
  play: async ({ canvasElement }) => {
    const btn = within(canvasElement).getByRole('button')
    await userEvent.tab()
    await waitFor(() => expect(btn).toHaveFocus())
  },
}

/** Tooltip attaché : l'Avatar (cliquable = focusable) reçoit `triggerProps` par fallthrough. */
export const AvecTooltip: Story = {
  render: () => ({
    components: { Avatar, Tooltip },
    template: `
      <Tooltip text="Ada Lovelace">
        <template #default="{ triggerProps }">
          <Avatar v-bind="triggerProps" name="Ada Lovelace" clickable />
        </template>
      </Tooltip>
    `,
  }),
  play: async ({ canvasElement }) => {
    const btn = within(canvasElement).getByRole('button')
    await userEvent.hover(btn)
    await waitFor(() => expect(within(document.body).getByRole('tooltip')).toBeVisible())
  },
}
