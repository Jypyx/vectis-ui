import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, within } from 'storybook/test'

import IconButton from './IconButton.vue'

const ICON = `
  <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
    <path d="M8 2v12M2 8h12" stroke="currentcolor" stroke-width="1.5" stroke-linecap="round" />
  </svg>
`

const meta = {
  title: 'Composants/IconButton',
  component: IconButton,
  argTypes: {
    variant: { control: 'select', options: ['solid', 'outline', 'ghost'] },
    tone: { control: 'select', options: ['accent', 'neutral', 'danger'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
  args: {
    label: 'Ajouter un élément',
    variant: 'ghost',
    tone: 'neutral',
    size: 'md',
  },
  render: (args) => ({
    components: { IconButton },
    setup: () => ({ args }),
    template: `<IconButton v-bind="args">${ICON}</IconButton>`,
  }),
} satisfies Meta<typeof IconButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    // Le libellé accessible est obligatoire : vérifie qu'il est bien exposé.
    const button = within(canvasElement).getByRole('button', { name: 'Ajouter un élément' })
    await expect(button).toBeVisible()
  },
}

export const Variantes: Story = {
  render: (args) => ({
    components: { IconButton },
    setup: () => ({ args }),
    template: `
      <div style="display: flex; gap: 8px">
        <IconButton v-bind="args" variant="solid" tone="accent">${ICON}</IconButton>
        <IconButton v-bind="args" variant="outline" tone="neutral">${ICON}</IconButton>
        <IconButton v-bind="args" variant="ghost" tone="danger">${ICON}</IconButton>
      </div>
    `,
  }),
}

export const Tailles: Story = {
  render: (args) => ({
    components: { IconButton },
    setup: () => ({ args }),
    template: `
      <div style="display: flex; gap: 8px; align-items: center">
        <IconButton v-bind="args" size="sm">${ICON}</IconButton>
        <IconButton v-bind="args" size="md">${ICON}</IconButton>
        <IconButton v-bind="args" size="lg">${ICON}</IconButton>
      </div>
    `,
  }),
}
