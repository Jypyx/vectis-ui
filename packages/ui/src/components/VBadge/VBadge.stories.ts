import type { Meta, StoryObj } from '@storybook/vue3-vite'

import { storyText } from '../../stories/storyText'
import VAvatar from '../VAvatar/VAvatar.vue'
import VButton from '../VButton/VButton.vue'
import VIcon from '../VIcon/VIcon.vue'
import VIconButton from '../VIconButton/VIconButton.vue'
import VBadge from './VBadge.vue'

const t = storyText({
  en: { messages: 'Messages', notifications: 'Notifications' },
  fr: { messages: 'Messages', notifications: 'Notifications' },
})

const meta = {
  title: 'Components/Badge',
  component: VBadge,
  argTypes: {
    tone: { control: 'select', options: ['neutral', 'accent', 'danger', 'success', 'warning'] },
    color: { control: 'color' },
    count: { control: 'number' },
    icon: { control: 'text' },
    dot: { control: 'boolean' },
    overlay: { control: 'boolean' },
    overlayPosition: { control: 'inline-radio', options: ['top', 'bottom'] },
    bordered: { control: 'boolean' },
  },
  args: {
    tone: 'accent',
    count: 8,
    dot: false,
    overlay: false,
    overlayPosition: 'top',
    bordered: false,
  },
  render: (args) => ({
    components: { VBadge },
    setup: () => ({ args }),
    template: '<VBadge v-bind="args" />',
  }),
} satisfies Meta<typeof VBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** The 5 tones in full-colour rendering — check `neutral` in both themes. */
export const Tones: Story = {
  render: () => ({
    components: { VBadge },
    setup: () => ({ tones: ['neutral', 'accent', 'success', 'warning', 'danger'] }),
    template: `
      <div style="display: flex; gap: 16px; flex-wrap: wrap">
        <div v-for="tone in tones" :key="tone" style="display: flex; flex-direction: column; align-items: center; gap: 4px">
          <VBadge :tone="tone" :count="8" />
          <small>{{ tone }}</small>
        </div>
      </div>
    `,
  }),
}

/**
 * A free colour (hex, CSS name, oklch()): the text adapts black/white through
 * contrast-color() (Safari 26+); elsewhere, a white fallback — the contrast of a
 * light colour is the consumer's responsibility.
 */
export const CustomColor: Story = {
  render: () => ({
    components: { VBadge },
    setup: () => ({ colors: ['#7c3aed', 'oklch(70% 0.15 180)', 'hotpink', 'gold'] }),
    template: `
      <div style="display: flex; gap: 16px; flex-wrap: wrap">
        <div v-for="color in colors" :key="color" style="display: flex; flex-direction: column; align-items: center; gap: 4px">
          <VBadge :color="color" :count="8" />
          <small>{{ color }}</small>
        </div>
      </div>
    `,
  }),
}

/**
 * `count` is a number; past 99 the display is capped at "99+". The reduced padding
 * keeps the badge round at one or two digits.
 */
export const Counters: Story = {
  render: () => ({
    components: { VBadge },
    setup: () => ({ counts: [3, 12, 99, 100, 1000] }),
    template: `
      <div style="display: flex; gap: 8px; align-items: center">
        <VBadge v-for="count in counts" :key="count" tone="danger" :count="count" />
      </div>
    `,
  }),
}

/** An icon alone (a name, or `{ src }`): a circular 20px badge, a 16px icon. */
export const Icon: Story = {
  render: () => ({
    components: { VBadge },
    setup: () => ({
      star: {
        src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8Z' fill='white'/%3E%3C/svg%3E",
      },
    }),
    template: `
      <div style="display: flex; gap: 8px; align-items: center">
        <VBadge icon="notifications" />
        <VBadge tone="success" icon="check" />
        <VBadge tone="warning" icon="priority_high" />
        <VBadge :icon="star" />
      </div>
    `,
  }),
}

/** `dot` reduces the badge to a 10px circle with no content — presence, status. */
export const Dot: Story = {
  render: () => ({
    components: { VBadge },
    template: `
      <div style="display: flex; gap: 8px; align-items: center">
        <VBadge dot />
        <VBadge dot tone="success" />
        <VBadge dot tone="danger" />
      </div>
    `,
  }),
}

/** With a target in the default slot, the badge sits to its right. */
export const Inline: Story = {
  render: () => ({
    components: { VBadge },
    setup: () => ({ t }),
    template: `
      <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 12px">
        <VBadge tone="danger" :count="3"><span>{{ t.messages }}</span></VBadge>
        <VBadge dot tone="success"><span>Xavier Darmet</span></VBadge>
      </div>
    `,
  }),
}

/** `overlay` places the badge on a corner of the target — top-right by default — shifted inwards. */
export const Overlay: Story = {
  render: () => ({
    components: { VAvatar, VBadge, VButton },
    setup: () => ({ t }),
    template: `
      <div style="display: flex; gap: 24px; align-items: center">
        <VBadge overlay tone="danger" :count="8">
          <VAvatar name="Xavier Darmet" />
        </VBadge>
        <VBadge overlay dot tone="success" bordered>
          <VAvatar name="Xavier Darmet" />
        </VBadge>
        <VBadge overlay icon="priority_high" tone="warning" bordered>
          <VAvatar name="Xavier Darmet" />
        </VBadge>
        <VBadge overlay tone="danger" :count="120">
          <VButton variant="outline" tone="neutral">{{ t.notifications }}</VButton>
        </VBadge>
      </div>
    `,
  }),
}

/**
 * `overlayPosition` chooses the corner: `top` (the default) or `bottom` — a presence
 * dot belongs at the foot of an avatar. The horizontal side stays the reading
 * direction's end.
 */
export const OverlayPosition: Story = {
  render: () => ({
    components: { VAvatar, VBadge },
    setup: () => ({ positions: ['top', 'bottom'] }),
    template: `
      <div style="display: flex; gap: 24px; align-items: center">
        <div v-for="position in positions" :key="position" style="display: flex; flex-direction: column; align-items: center; gap: 8px">
          <VBadge overlay :overlay-position="position" dot tone="success" bordered>
            <VAvatar name="Xavier Darmet" />
          </VBadge>
          <small>{{ position }}</small>
        </div>
        <div v-for="position in positions" :key="'count-' + position" style="display: flex; flex-direction: column; align-items: center; gap: 8px">
          <VBadge overlay :overlay-position="position" tone="danger" :count="8">
            <VAvatar name="Xavier Darmet" />
          </VBadge>
          <small>{{ position }}</small>
        </div>
      </div>
    `,
  }),
}

/**
 * `bordered` draws a 2px ring in the colour of the background behind
 * (`--vectis-color-surface`, overridable locally when the background differs). On a
 * VIconButton, the with/without comparison shows the badge detaching.
 */
export const Bordered: Story = {
  render: () => ({
    components: { VBadge, VIcon, VIconButton },
    setup: () => ({ t }),
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px; align-items: flex-start">
        <div style="display: flex; gap: 24px; align-items: center; padding: 16px; background: var(--vectis-color-accent); border-radius: var(--vectis-radius-surface); --vectis-color-surface: var(--vectis-color-accent)">
          <VBadge overlay tone="danger" :count="3" bordered>
            <VIconButton :label="t.notifications" elevated tone="accent">
              <VIcon name="notifications" />
            </VIconButton>
          </VBadge>
          <VBadge tone="danger" :count="3" bordered />
          <VBadge dot tone="success" bordered />
          <VBadge tone="neutral" :count="5" bordered />
        </div>
      </div>
    `,
  }),
}
