import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import VTooltip from '../VTooltip/VTooltip.vue'
import VAvatar from './VAvatar.vue'
import VAvatarGroup from './VAvatarGroup.vue'

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
  component: VAvatarGroup,
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    compact: { control: 'boolean' },
    max: { control: { type: 'number' } },
  },
} satisfies Meta<typeof VAvatarGroup>

export default meta
type Story = StoryObj<typeof meta>

/** Empilement : le disque de droite passe par-dessus celui de gauche, séparé par l'anneau. */
export const Empilement: Story = {
  render: () => ({
    components: { VAvatarGroup, VAvatar },
    setup: () => ({ names: NAMES.slice(0, 4) }),
    template: `
      <VAvatarGroup>
        <VAvatar v-for="n in names" :key="n" :name="n" />
      </VAvatarGroup>
    `,
  }),
}

/** `max` tronque et pousse un agrégat « +X » (statique, neutre). */
export const Overflow: Story = {
  render: () => ({
    components: { VAvatarGroup, VAvatar },
    setup: () => ({ names: NAMES }),
    template: `
      <VAvatarGroup :max="3">
        <VAvatar v-for="n in names" :key="n" :name="n" />
      </VAvatarGroup>
    `,
  }),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('+3')).toBeVisible()
  },
}

/** La taille se propage à tous les enfants. */
export const TailleHeritee: Story = {
  render: () => ({
    components: { VAvatarGroup, VAvatar },
    setup: () => ({ names: NAMES.slice(0, 4) }),
    template: `
      <VAvatarGroup size="lg" :max="3">
        <VAvatar v-for="n in names" :key="n" :name="n" />
      </VAvatarGroup>
    `,
  }),
}

/** Slot #overflow : rendre l'agrégat cliquable / y attacher un comportement. */
export const OverflowPersonnalise: Story = {
  render: () => ({
    components: { VAvatarGroup, VAvatar },
    setup: () => ({ names: NAMES }),
    template: `
      <VAvatarGroup :max="3">
        <VAvatar v-for="n in names" :key="n" :name="n" />
        <template #overflow="{ count }">
          <VAvatar clickable :aria-label="count + ' membres de plus'">+{{ count }}</VAvatar>
        </template>
      </VAvatarGroup>
    `,
  }),
}

/**
 * VTooltip par VAvatar (le nom) + VTooltip sur l'agrégat (les membres masqués).
 * Chaque VAvatar est `clickable` (donc focusable) et reçoit `triggerProps` par
 * fallthrough. Le VTooltip enveloppe le trigger dans un <span> : l'empilement
 * du groupe reste correct car il cible l'enfant direct, wrapper compris.
 */
export const AvecTooltips: Story = {
  render: () => {
    const max = 4
    return {
      components: { VAvatarGroup, VAvatar, VTooltip },
      setup: () => ({ names: NAMES, max, hidden: NAMES.slice(max) }),
      template: `
        <VAvatarGroup :max="max">
          <VTooltip v-for="n in names" :key="n" :text="n">
            <template #default="{ triggerProps }">
              <VAvatar v-bind="triggerProps" :name="n" clickable />
            </template>
          </VTooltip>
          <template #overflow="{ count }">
            <VTooltip :text="hidden.join(', ')">
              <template #default="{ triggerProps }">
                <VAvatar
                  v-bind="triggerProps"
                  clickable
                  :aria-label="count + ' autres membres'"
                >+{{ count }}</VAvatar>
              </template>
            </VTooltip>
          </template>
        </VAvatarGroup>
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
