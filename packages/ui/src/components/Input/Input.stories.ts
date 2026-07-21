import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, within } from 'storybook/test'
import { ref } from 'vue'

import Button from '../Button/Button.vue'
import Input from './Input.vue'

const meta = {
  title: 'Composants/Input',
  component: Input,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
  args: {
    size: 'md',
    invalid: false,
    disabled: false,
  },
  render: (args) => ({
    components: { Input },
    setup: () => ({ args, value: ref('') }),
    template:
      '<Input v-bind="args" v-model="value" placeholder="votre@email.fr" aria-label="Email" />',
  }),
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Tailles: Story = {
  render: () => ({
    components: { Input },
    template: `
      <div style="display: grid; gap: 8px; width: 260px">
        <Input size="sm" placeholder="Small" aria-label="Small" />
        <Input size="md" placeholder="Medium" aria-label="Medium" />
        <Input size="lg" placeholder="Large" aria-label="Large" />
      </div>
    `,
  }),
}

export const Invalide: Story = {
  args: { invalid: true },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('textbox')
    await expect(input).toHaveAttribute('aria-invalid', 'true')
  },
}

export const Disabled: Story = {
  args: { disabled: true },
}

export const PlaceholderLong: Story = {
  render: () => ({
    components: { Input },
    template: `
      <div style="width: 200px">
        <Input
          placeholder="Un placeholder anormalement long qui doit être tronqué proprement"
          aria-label="Démo placeholder long"
        />
      </div>
    `,
  }),
}

/**
 * Validation native : `required` + soumission → le style d'erreur vient de
 * `:user-invalid`, sans le moindre JS de validation.
 */
export const ValidationNative: Story = {
  render: () => ({
    components: { Input, Button },
    setup: () => ({ email: ref('') }),
    template: `
      <form novalidate="false" style="display: flex; gap: 8px; align-items: start" @submit.prevent>
        <Input v-model="email" type="email" required placeholder="votre@email.fr" aria-label="Email" />
        <Button type="submit">S'abonner</Button>
      </form>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('textbox') as HTMLInputElement
    // saisir une valeur invalide puis tenter de soumettre déclenche :user-invalid
    await userEvent.type(input, 'pas-un-email')
    await userEvent.click(canvas.getByRole('button', { name: "S'abonner" }))
    await expect(input.validity.valid).toBe(false)
    await expect(input.matches(':user-invalid')).toBe(true)
  },
}

export const VModel: Story = {
  render: () => ({
    components: { Input },
    setup: () => ({ value: ref('') }),
    template: `
      <div style="display: grid; gap: 8px; width: 260px">
        <Input v-model="value" placeholder="Tapez ici" aria-label="Démo v-model" />
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
