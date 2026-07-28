import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { storyText } from '../../stories/storyText'
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

const t = storyText({
  en: {
    moreMembers: (count: number) => `${count} more members`,
    otherMembers: (count: number) => `${count} other members`,
  },
  fr: {
    moreMembers: (count: number) => `${count} membres de plus`,
    otherMembers: (count: number) => `${count} autres membres`,
  },
})

const meta = {
  title: 'Components/AvatarGroup',
  component: VAvatarGroup,
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    compact: { control: 'boolean' },
    max: { control: { type: 'number' } },
  },
} satisfies Meta<typeof VAvatarGroup>

export default meta
type Story = StoryObj<typeof meta>

/** Stacking: the right-hand disc paints over the left-hand one, separated by the ring. */
export const Stacking: Story = {
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

/** `max` truncates and pushes a "+X" aggregate (static, neutral). */
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

/** The size propagates to every child. */
export const InheritedSize: Story = {
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

/** The #overflow slot: making the aggregate clickable / attaching behaviour to it. */
export const CustomOverflow: Story = {
  render: () => ({
    components: { VAvatarGroup, VAvatar },
    setup: () => ({ names: NAMES, t }),
    template: `
      <VAvatarGroup :max="3">
        <VAvatar v-for="n in names" :key="n" :name="n" />
        <template #overflow="{ count }">
          <VAvatar clickable :aria-label="t.moreMembers(count)">+{{ count }}</VAvatar>
        </template>
      </VAvatarGroup>
    `,
  }),
}

/**
 * A VTooltip per VAvatar (the name) + a VTooltip on the aggregate (the hidden
 * members). Each VAvatar is `clickable` (hence focusable) and receives
 * `triggerProps` through fallthrough. The VTooltip wraps the trigger in a `<span>`:
 * the group's stacking stays correct because it targets the direct child, wrapper
 * included.
 */
export const WithTooltips: Story = {
  render: () => {
    const max = 4
    return {
      components: { VAvatarGroup, VAvatar, VTooltip },
      setup: () => ({ names: NAMES, max, hidden: NAMES.slice(max), t }),
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
                  :aria-label="t.otherMembers(count)"
                >+{{ count }}</VAvatar>
              </template>
            </VTooltip>
          </template>
        </VAvatarGroup>
      `,
    }
  },
  play: async ({ canvasElement }) => {
    // hovering the +X aggregate → a tooltip listing the hidden members
    const overflow = within(canvasElement).getByText('+2')
    await userEvent.hover(overflow)
    await waitFor(() => expect(within(document.body).getByText(/Barbara Liskov/)).toBeVisible())
  },
}
