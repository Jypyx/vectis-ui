import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, within } from 'storybook/test'
import { ref } from 'vue'

import Textarea from './Textarea.vue'

const meta = {
  title: 'Composants/Textarea',
  component: Textarea,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
  args: {
    size: 'md',
    autoGrow: false,
    invalid: false,
    disabled: false,
  },
  render: (args) => ({
    components: { Textarea },
    setup: () => ({ args, value: ref('') }),
    template:
      '<Textarea v-bind="args" v-model="value" placeholder="Votre message…" aria-label="Message" style="width: 320px" />',
  }),
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const AutoGrow: Story = {
  args: { autoGrow: true },
  render: (args) => ({
    components: { Textarea },
    setup: () => ({ args, value: ref('La hauteur suit le contenu.\nAjoutez des lignes…') }),
    template:
      '<Textarea v-bind="args" v-model="value" aria-label="Message auto-grow" style="width: 320px" />',
  }),
}

export const Tailles: Story = {
  render: () => ({
    components: { Textarea },
    template: `
      <div style="display: grid; gap: 8px; width: 320px">
        <Textarea size="sm" placeholder="Small" aria-label="Small" />
        <Textarea size="md" placeholder="Medium" aria-label="Medium" />
        <Textarea size="lg" placeholder="Large" aria-label="Large" />
      </div>
    `,
  }),
}

export const Invalide: Story = {
  args: { invalid: true },
  play: async ({ canvasElement }) => {
    const textarea = within(canvasElement).getByRole('textbox')
    await expect(textarea).toHaveAttribute('aria-invalid', 'true')
  },
}

export const Disabled: Story = {
  args: { disabled: true },
}

export const VModel: Story = {
  render: () => ({
    components: { Textarea },
    setup: () => ({ value: ref('') }),
    template: `
      <div style="display: grid; gap: 8px; width: 320px">
        <Textarea v-model="value" aria-label="Démo v-model" />
        <output data-testid="mirror">{{ value }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(canvas.getByRole('textbox'), 'Bonjour')
    await expect(canvas.getByTestId('mirror')).toHaveTextContent('Bonjour')
  },
}
