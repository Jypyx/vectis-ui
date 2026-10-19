import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import VTooltip from '../VTooltip/VTooltip.vue'
import VAvatar from './VAvatar.vue'

const PORTRAIT =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="%236366f1"/><circle cx="20" cy="15" r="7" fill="white"/><ellipse cx="20" cy="34" rx="12" ry="9" fill="white"/></svg>'

const meta = {
  title: 'Components/Avatar',
  component: VAvatar,
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
  },
  args: { size: 'md', name: 'Xavier Darmet' },
} satisfies Meta<typeof VAvatar>

export default meta
type Story = StoryObj<typeof meta>

export const WithImage: Story = {
  args: { src: PORTRAIT },
}

export const Icon: Story = {
  args: { name: undefined, icon: 'person' },
}

export const Initials: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('XD')).toBeVisible()
  },
}

export const BrokenImage: Story = {
  args: { src: 'https://example.invalid/not-found.png' },
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(within(canvasElement).getByText('XD')).toBeVisible(), {
      timeout: 3000,
    })
  },
}

export const Sizes: Story = {
  render: () => ({
    components: { VAvatar },
    template: `
      <div style="display: flex; gap: 8px; align-items: center">
        <VAvatar size="xs" name="Ada Lovelace" />
        <VAvatar size="sm" name="Grace Hopper" />
        <VAvatar size="md" name="Margaret Hamilton" />
        <VAvatar size="lg" name="Katherine Johnson" />
        <VAvatar size="xl" name="Radia Perlman" />
      </div>
    `,
  }),
}

/** An OKLCH hue derived from the name: each person gets a stable, distinct colour. */
export const AutoColor: Story = {
  render: () => ({
    components: { VAvatar },
    template: `
      <div style="display: flex; gap: 8px; flex-wrap: wrap">
        <VAvatar name="Ada Lovelace" />
        <VAvatar name="Grace Hopper" />
        <VAvatar name="Margaret Hamilton" />
        <VAvatar name="Katherine Johnson" />
        <VAvatar name="Radia Perlman" />
        <VAvatar name="Barbara Liskov" />
        <VAvatar name="Frances Allen" />
      </div>
    `,
  }),
}

/**
 * The auto colour follows the NEAREST theme scope: a light subtree inside a dark one
 * paints the light pair. jsdom evaluates no stylesheet, so this is the only guard.
 */
export const NestedTheme: Story = {
  render: () => ({
    components: { VAvatar },
    template: `
      <div style="display: flex; gap: 8px">
        <div data-theme="light" data-testid="light"><VAvatar name="Ada Lovelace" /></div>
        <div data-theme="dark" data-testid="dark">
          <VAvatar name="Ada Lovelace" />
          <div data-theme="light" data-testid="nested"><VAvatar name="Ada Lovelace" /></div>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const bg = (testId: string) =>
      getComputedStyle(canvasElement.querySelector(`[data-testid="${testId}"] > .v-avatar`)!)
        .backgroundColor
    await expect(bg('nested')).toBe(bg('light'))
    await expect(bg('nested')).not.toBe(bg('dark'))
  },
}

/** The `color` prop replaces the auto hue (white text, contrast on the consumer). */
export const CustomColor: Story = {
  args: { color: 'teal' },
  play: async ({ canvasElement }) => {
    const avatar = canvasElement.querySelector<HTMLElement>('.v-avatar')!
    await expect(getComputedStyle(avatar).backgroundColor).toBe('rgb(0, 128, 128)')
    // `color` can come from untrusted data: anything but a colour, an image included, is dropped.
    avatar.style.setProperty('--custom-color', 'url("data:image/gif;base64,R0lGODlhAQABAAAAACw=")')
    await expect(getComputedStyle(avatar).backgroundImage).toBe('none')
    avatar.style.setProperty('--custom-color', 'teal')
  },
}

/** Rendered as `<button>`: focusable, hover state, keyboard focus ring. */
export const Clickable: Story = {
  args: { clickable: true },
  play: async ({ canvasElement }) => {
    const btn = within(canvasElement).getByRole('button')
    await userEvent.tab()
    await waitFor(() => expect(btn).toHaveFocus())
  },
}

/** VTooltip attached: the VAvatar (clickable, hence focusable) receives `triggerProps` through fallthrough. */
export const WithTooltip: Story = {
  render: () => ({
    components: { VAvatar, VTooltip },
    template: `
      <VTooltip text="Ada Lovelace">
        <template #default="{ triggerProps }">
          <VAvatar v-bind="triggerProps" name="Ada Lovelace" clickable />
        </template>
      </VTooltip>
    `,
  }),
  play: async ({ canvasElement }) => {
    const btn = within(canvasElement).getByRole('button')
    await userEvent.hover(btn)
    await waitFor(() => expect(within(document.body).getByRole('tooltip')).toBeVisible())
  },
}
