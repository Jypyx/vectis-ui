import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, within } from 'storybook/test'

import { storyText } from '../../stories/storyText'
import VIcon from '../VIcon/VIcon.vue'
import VIconButton from './VIconButton.vue'

const ICON = `
  <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
    <path d="M8 2v12M2 8h12" stroke="currentcolor" stroke-width="1.5" stroke-linecap="round" />
  </svg>
`

const t = storyText({
  en: {
    settings: 'Settings',
    add: 'Add',
    profile: 'Profile',
    iconPropHint: '(icon prop: outline / filled)',
  },
  fr: {
    settings: 'Paramètres',
    add: 'Ajouter',
    profile: 'Profil',
    iconPropHint: '(prop icon : contour / plein)',
  },
})

const meta = {
  title: 'Components/IconButton',
  component: VIconButton,
  argTypes: {
    variant: { control: 'select', options: ['solid', 'outline', 'ghost', 'soft'] },
    tone: { control: 'select', options: ['accent', 'neutral', 'danger'] },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    elevated: { control: 'boolean' },
    compact: { control: 'boolean' },
    icon: { control: 'text' },
    iconFilled: { control: 'boolean' },
  },
  args: {
    label: 'Add an item',
    variant: 'ghost',
    tone: 'neutral',
    size: 'md',
    elevated: false,
    compact: false,
    disabled: false,
    loading: false,
  },
  render: (args) => ({
    components: { VIconButton, VIcon },
    setup: () => ({ args }),
    template: '<VIconButton v-bind="args"><VIcon name="add" /></VIconButton>',
  }),
} satisfies Meta<typeof VIconButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    // The accessible label is mandatory: check that it is actually exposed.
    const button = within(canvasElement).getByRole('button', { name: 'Add an item' })
    await expect(button).toBeVisible()
  },
}

export const Variants: Story = {
  render: (args) => ({
    components: { VIconButton, VIcon },
    setup: () => ({ args }),
    template: `
      <div style="display: grid; gap: 12px">
        <div v-for="tone in ['accent', 'neutral', 'danger']" :key="tone" style="display: flex; gap: 8px; flex-wrap: wrap">
          <VIconButton
            v-for="variant in ['solid', 'outline', 'ghost', 'soft']"
            :key="variant"
            :label="args.label"
            :tone="tone"
            :variant="variant"
          >
            <VIcon name="favorite" />
          </VIconButton>
        </div>
      </div>
    `,
  }),
}

/* Same reading as VButton/Elevated: one group per tone, the plain row above the
   raised one. */
export const Elevated: Story = {
  render: (args) => ({
    components: { VIconButton, VIcon },
    setup: () => ({ args }),
    template: `
      <div style="display: grid; gap: 20px">
        <div v-for="tone in ['accent', 'neutral', 'danger']" :key="tone" style="display: grid; gap: 8px">
          <div v-for="raised in [false, true]" :key="String(raised)" style="display: flex; gap: 8px; flex-wrap: wrap">
            <VIconButton
              v-for="variant in ['solid', 'outline', 'ghost', 'soft']"
              :key="variant"
              :label="args.label"
              :tone="tone"
              :variant="variant"
              :elevated="raised"
            >
              <VIcon name="favorite" />
            </VIconButton>
          </div>
        </div>
      </div>
    `,
  }),
}

export const Sizes: Story = {
  render: (args) => ({
    components: { VIconButton, VIcon },
    setup: () => ({ args }),
    template: `
      <div style="display: grid; gap: 12px">
        <div style="display: flex; gap: 8px; align-items: center">
          <VIconButton v-bind="args" size="xs"><VIcon name="add" /></VIconButton>
          <VIconButton v-bind="args" size="sm"><VIcon name="add" /></VIconButton>
          <VIconButton v-bind="args" size="md"><VIcon name="add" /></VIconButton>
          <VIconButton v-bind="args" size="lg"><VIcon name="add" /></VIconButton>
          <VIconButton v-bind="args" size="xl"><VIcon name="add" /></VIconButton>
        </div>
        <div style="display: flex; gap: 8px; align-items: center">
          <VIconButton v-bind="args" size="xs" compact><VIcon name="add" /></VIconButton>
          <VIconButton v-bind="args" size="sm" compact><VIcon name="add" /></VIconButton>
          <VIconButton v-bind="args" size="md" compact><VIcon name="add" /></VIconButton>
          <VIconButton v-bind="args" size="lg" compact><VIcon name="add" /></VIconButton>
          <VIconButton v-bind="args" size="xl" compact><VIcon name="add" /></VIconButton>
        </div>
      </div>
    `,
  }),
}

export const IconsTypes: Story = {
  render: (args) => ({
    components: { VIconButton, VIcon },
    setup: () => ({ args, t }),
    template: `
      <div style="display: flex; gap: 8px; align-items: center">
        <VIconButton :label="t.settings"><VIcon name="settings" /></VIconButton>

        <VIconButton :label="t.add">${ICON}</VIconButton>

        <VIconButton :label="t.profile" variant="outline">
          <VIcon src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='10' fill='%236366f1'/%3E%3C/svg%3E" />
        </VIconButton>
      </div>
    `,
  }),
}

export const IconProp: Story = {
  render: (args) => ({
    components: { VIconButton },
    setup: () => ({ args, t }),
    template: `
      <div style="display: flex; gap: 8px; align-items: center">
        <VIconButton :label="args.label" icon="favorite" />
        <VIconButton :label="args.label" icon="favorite" icon-filled />
        <span>{{ t.iconPropHint }}</span>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const icons = canvasElement.querySelectorAll('.v-icon')
    await expect(icons[0]).not.toHaveAttribute('data-filled')
    await expect(icons[1]).toHaveAttribute('data-filled')
  },
}

export const Loading: Story = {
  args: { loading: true },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button')
    await expect(button).toBeDisabled()
    await expect(button).toHaveAttribute('aria-busy', 'true')
  },
}

export const Disabled: Story = {
  render: (args) => ({
    components: { VIconButton, VIcon },
    setup: () => ({ args }),
    template: `
      <div style="display: flex; gap: 8px; flex-wrap: wrap">
        <VIconButton
          v-for="variant in ['solid', 'outline', 'ghost', 'soft']"
          :key="variant"
          :label="args.label"
          :variant="variant"
          disabled
        >
          <VIcon name="favorite" />
        </VIconButton>
      </div>
    `,
  }),
}
