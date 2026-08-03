import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import Tooltip from '../VTooltip/VTooltip.vue'
import Avatar from './VAvatar.vue'
import AvatarGroup from './VAvatarGroup.vue'

const NAMES = [
  'Ada Lovelace',
  'Grace Hopper',
  'Margaret Hamilton',
  'Katherine Johnson',
  'Radia Perlman',
  'Barbara Liskov',
]

const meta = {
  title: 'Composants/AvatarGroup',
  component: AvatarGroup,
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    compact: { control: 'boolean' },
    max: { control: { type: 'number' } },
  },
} satisfies Meta<typeof AvatarGroup>

export default meta
type Story = StoryObj<typeof meta>

/** Empilement : le disque de droite passe par-dessus celui de gauche, séparé par l'anneau. */
export const Empilement: Story = {
  render: () => ({
    components: { AvatarGroup, Avatar },
    setup: () => ({ names: NAMES.slice(0, 4) }),
    template: `
      <AvatarGroup>
        <Avatar v-for="n in names" :key="n" :name="n" />
      </AvatarGroup>
    `,
  }),
}

/** `max` tronque et pousse un agrégat « +X » (statique, neutre). */
export const Overflow: Story = {
  render: () => ({
    components: { AvatarGroup, Avatar },
    setup: () => ({ names: NAMES }),
    template: `
      <AvatarGroup :max="3">
        <Avatar v-for="n in names" :key="n" :name="n" />
      </AvatarGroup>
    `,
  }),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('+3')).toBeVisible()
  },
}

/** La taille se propage à tous les enfants. */
export const TailleHeritee: Story = {
  render: () => ({
    components: { AvatarGroup, Avatar },
    setup: () => ({ names: NAMES.slice(0, 4) }),
    template: `
      <AvatarGroup size="lg" :max="3">
        <Avatar v-for="n in names" :key="n" :name="n" />
      </AvatarGroup>
    `,
  }),
}

/** Slot #overflow : rendre l'agrégat cliquable / y attacher un comportement. */
export const OverflowPersonnalise: Story = {
  render: () => ({
    components: { AvatarGroup, Avatar },
    setup: () => ({ names: NAMES }),
    template: `
      <AvatarGroup :max="3">
        <Avatar v-for="n in names" :key="n" :name="n" />
        <template #overflow="{ count }">
          <Avatar clickable :aria-label="count + ' membres de plus'">+{{ count }}</Avatar>
        </template>
      </AvatarGroup>
    `,
  }),
}

/**
 * Tooltip par Avatar (le nom) + Tooltip sur l'agrégat (les membres masqués).
 * Chaque Avatar est `clickable` (donc focusable) et reçoit `triggerProps` par
 * fallthrough. Le Tooltip enveloppe le trigger dans un <span> : l'empilement
 * du groupe reste correct car il cible l'enfant direct, wrapper compris.
 */
export const AvecTooltips: Story = {
  render: () => {
    const max = 4
    return {
      components: { AvatarGroup, Avatar, Tooltip },
      setup: () => ({ names: NAMES, max, hidden: NAMES.slice(max) }),
      template: `
        <AvatarGroup :max="max">
          <Tooltip v-for="n in names" :key="n" :text="n">
            <template #default="{ triggerProps }">
              <Avatar v-bind="triggerProps" :name="n" clickable />
            </template>
          </Tooltip>
          <template #overflow="{ count }">
            <Tooltip :text="hidden.join(', ')">
              <template #default="{ triggerProps }">
                <Avatar
                  v-bind="triggerProps"
                  clickable
                  :aria-label="count + ' autres membres'"
                >+{{ count }}</Avatar>
              </template>
            </Tooltip>
          </template>
        </AvatarGroup>
      `,
    }
  },
  play: async ({ canvasElement }) => {
    // survol de l'agrégat +X → tooltip listant les membres masqués
    const overflow = within(canvasElement).getByText('+2')
    await userEvent.hover(overflow)
    await waitFor(() => expect(within(document.body).getByText(/Barbara Liskov/)).toBeVisible())
  },
}
