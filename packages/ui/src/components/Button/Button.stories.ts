import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, fn, userEvent, within } from 'storybook/test'

import Button from './Button.vue'

const meta = {
  title: 'Composants/Button',
  component: Button,
  argTypes: {
    variant: { control: 'select', options: ['solid', 'outline', 'ghost'] },
    tone: { control: 'select', options: ['accent', 'neutral', 'danger'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
  args: {
    variant: 'solid',
    tone: 'accent',
    size: 'md',
    disabled: false,
    loading: false,
  },
  render: (args) => ({
    components: { Button },
    setup: () => ({ args }),
    template: '<Button v-bind="args">Enregistrer</Button>',
  }),
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Variantes: Story = {
  render: () => ({
    components: { Button },
    template: `
      <div style="display: grid; gap: 12px">
        <div v-for="tone in ['accent', 'neutral', 'danger']" :key="tone" style="display: flex; gap: 8px">
          <Button v-for="variant in ['solid', 'outline', 'ghost']" :key="variant" :tone="tone" :variant="variant">
            {{ tone }} / {{ variant }}
          </Button>
        </div>
      </div>
    `,
  }),
}

export const Tailles: Story = {
  render: () => ({
    components: { Button },
    template: `
      <div style="display: flex; gap: 8px; align-items: center">
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </div>
    `,
  }),
}

export const AvecIcones: Story = {
  render: () => ({
    components: { Button },
    template: `
      <Button>
        <template #start>
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            <path d="M8 2v12M2 8h12" stroke="currentcolor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </template>
        Ajouter
      </Button>
    `,
  }),
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
  args: { disabled: true },
}

export const DisabledNeCliquePas: Story = {
  args: { disabled: true },
  render: (args) => ({
    components: { Button },
    setup: () => ({ args, onClick: fn() }),
    template: '<Button v-bind="args" @click="onClick">Désactivé</Button>',
  }),
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button')
    await userEvent.click(button).catch(() => {
      // pointer-events refusés sur un bouton disabled : c'est le comportement attendu
    })
    await expect(button).toBeDisabled()
  },
}

export const TexteLong: Story = {
  render: () => ({
    components: { Button },
    template: `
      <div style="max-width: 200px">
        <Button>Un libellé anormalement long qui ne devrait pas casser la mise en page</Button>
      </div>
    `,
  }),
}
