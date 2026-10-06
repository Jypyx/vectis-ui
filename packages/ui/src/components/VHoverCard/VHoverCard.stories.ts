import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import VAvatar from '../VAvatar/VAvatar.vue'
import VButton from '../VButton/VButton.vue'
import VLink from '../VLink/VLink.vue'
import VSkeletonLoader from '../VSkeletonLoader/VSkeletonLoader.vue'
import VTypography from '../VTypography/VTypography.vue'
import { storyText } from '../../stories/storyText'
import VHoverCard from './VHoverCard.vue'

const t = storyText({
  en: {
    bio: 'Mathematician. Wrote the first published algorithm for the Analytical Engine.',
    sentenceStart: 'The notes were translated and expanded by',
    sentenceEnd: ', whose Note G describes how to compute Bernoulli numbers.',
    loaded: 'Profile loaded when the card opened.',
  },
  fr: {
    bio: 'Mathématicienne. Auteure du premier algorithme publié pour la machine analytique.',
    sentenceStart: 'Les notes ont été traduites et enrichies par',
    sentenceEnd: ', dont la note G décrit le calcul des nombres de Bernoulli.',
    loaded: 'Profil chargé à l’ouverture de la carte.',
  },
})

const profile = `
  <div style="display: flex; gap: 12px; align-items: center;">
    <VAvatar name="Ada Lovelace" size="lg" />
    <div>
      <VTypography variant="subtitle">Ada Lovelace</VTypography>
      <VTypography variant="body-sm" tone="muted">@ada</VTypography>
    </div>
  </div>
  <VTypography variant="body-sm">{{ t.bio }}</VTypography>
  <div style="display: flex; gap: 8px; align-items: center; margin-block-start: 4px;">
    <VButton size="sm">Follow</VButton>
    <VButton size="sm" variant="ghost" tone="neutral">Message</VButton>
  </div>
`

const components = { VHoverCard, VAvatar, VButton, VLink, VTypography }

const meta = {
  title: 'Components/HoverCard',
  component: VHoverCard,
  argTypes: {
    placement: {
      control: 'select',
      options: [
        'top',
        'top-start',
        'top-end',
        'bottom',
        'bottom-start',
        'bottom-end',
        'left',
        'right',
      ],
    },
  },
  args: {
    placement: 'bottom',
    openDelay: 500,
    closeDelay: 300,
  },
  render: (args) => ({
    components,
    setup: () => ({ args, t }),
    template: `
      <div style="padding: 24px 24px 240px;">
        <VHoverCard v-bind="args">
          <template #default="{ triggerProps }">
            <VLink href="#ada" v-bind="triggerProps">@ada</VLink>
          </template>
          <template #content>${profile}</template>
        </VHoverCard>
      </div>
    `,
  }),
} satisfies Meta<typeof VHoverCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Hovering opens the card after `openDelay`; leaving both closes it after `closeDelay`. */
export const OpenOnHover: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('link', { name: '@ada' })
    const card = canvasElement.querySelector('.v-hover-card-panel') as HTMLElement

    await expect(trigger).toHaveAttribute('aria-details', card.id)
    await userEvent.hover(trigger)
    await waitFor(() => expect(card.matches(':popover-open')).toBe(true))

    // The compound selector must outrank `.v-panel`, which pads with space-1.
    await expect(getComputedStyle(card).padding).toBe('16px')

    await userEvent.unhover(trigger)
    await waitFor(() => expect(card.matches(':popover-open')).toBe(false))

    await userEvent.hover(trigger)
    await waitFor(() => expect(card.matches(':popover-open')).toBe(true))
  },
}

/** Keyboard focus opens the card after the delay; Tab enters it and Escape returns the focus. */
export const KeyboardAccess: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('link', { name: '@ada' })
    const card = canvasElement.querySelector('.v-hover-card-panel') as HTMLElement

    await userEvent.tab()
    await expect(trigger).toHaveFocus()
    await waitFor(() => expect(card.matches(':popover-open')).toBe(true))

    await userEvent.tab()
    await expect(within(card).getByRole('button', { name: 'Follow' })).toHaveFocus()

    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(card.matches(':popover-open')).toBe(false))
    await expect(trigger).toHaveFocus()

    // The card stays closed after Escape, until the focus comes back to the trigger.
    await userEvent.tab({ shift: true })
    await userEvent.tab()
    await waitFor(() => expect(card.matches(':popover-open')).toBe(true))
  },
}

/** A trigger inside running text: the wrapper flows with the sentence. */
export const InText: Story = {
  render: (args) => ({
    components,
    setup: () => ({ args, t }),
    template: `
      <div style="padding: 24px 24px 240px; max-width: 32rem;">
        <VTypography>
          {{ t.sentenceStart }}
          <VHoverCard v-bind="args">
            <template #default="{ triggerProps }">
              <VLink href="#ada" v-bind="triggerProps">Ada Lovelace</VLink>
            </template>
            <template #content>${profile}</template>
          </VHoverCard>{{ t.sentenceEnd }}
        </VTypography>
      </div>
    `,
  }),
}

/** `v-model:open` tells when the card opens, to load its content only then. */
export const LoadOnOpen: Story = {
  render: (args) => ({
    components: { ...components, VSkeletonLoader },
    setup: () => {
      const open = ref(false)
      const loaded = ref(false)
      function onOpen(value: boolean) {
        if (value && !loaded.value) setTimeout(() => (loaded.value = true), 800)
      }
      return { args, t, open, loaded, onOpen }
    },
    template: `
      <div style="padding: 24px 24px 240px;">
        <VHoverCard v-bind="args" v-model:open="open" @update:open="onOpen">
          <template #default="{ triggerProps }">
            <VLink href="#ada" v-bind="triggerProps">@ada</VLink>
          </template>
          <template #content>
            <div v-if="!loaded" style="display: grid; gap: 8px; inline-size: 16rem;">
              <VSkeletonLoader shape="circle" size="lg" />
              <VSkeletonLoader :lines="2" />
            </div>
            <template v-else>
              ${profile}
              <VTypography variant="caption" tone="muted">{{ t.loaded }}</VTypography>
            </template>
          </template>
        </VHoverCard>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const card = canvasElement.querySelector('.v-hover-card-panel') as HTMLElement
    await userEvent.hover(canvas.getByRole('link', { name: '@ada' }))
    await waitFor(
      () => expect(within(card).getByRole('button', { name: 'Follow' })).toBeVisible(),
      {
        timeout: 3000,
      },
    )
  },
}
