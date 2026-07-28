import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import InputOTP from './InputOTP.vue'

const meta = {
  title: 'Composants/InputOTP',
  component: InputOTP,
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  args: { length: 6, format: 'numeric' },
} satisfies Meta<typeof InputOTP>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { InputOTP },
    setup: () => ({ args, code: ref(''), onComplete: fn() }),
    template: `
      <div style="display: grid; gap: 8px; justify-items: start">
        <InputOTP v-bind="args" v-model="code" @complete="onComplete" />
        <output data-testid="mirror">{{ code }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const first = canvas.getByRole('textbox', { name: 'Caractère 1 sur 6' })

    await userEvent.click(first)
    await userEvent.keyboard('123456')
    await waitFor(() => expect(canvas.getByTestId('mirror')).toHaveTextContent('123456'))
  },
}

export const CollageDistribue: Story = {
  render: (args) => ({
    components: { InputOTP },
    setup: () => ({ args, code: ref('') }),
    template: `
      <div style="display: grid; gap: 8px; justify-items: start">
        <InputOTP v-bind="args" v-model="code" />
        <output data-testid="mirror">{{ code }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('textbox', { name: 'Caractère 1 sur 6' }))
    await userEvent.paste('987654')
    await waitFor(() => expect(canvas.getByTestId('mirror')).toHaveTextContent('987654'))
  },
}

export const QuatreCases: Story = {
  args: { length: 4 },
  render: (args) => ({
    components: { InputOTP },
    setup: () => ({ args, code: ref('') }),
    template: '<InputOTP v-bind="args" v-model="code" />',
  }),
}

export const Tailles: Story = {
  args: { length: 4 },
  render: (args) => ({
    components: { InputOTP },
    setup: () => ({
      args,
      sm: ref(''),
      md: ref(''),
      lg: ref(''),
      compact: ref(''),
    }),
    template: `
      <div style="display: grid; gap: 16px; justify-items: start">
        <InputOTP v-bind="args" v-model="sm" size="sm" label="Code (sm)" />
        <InputOTP v-bind="args" v-model="md" size="md" label="Code (md)" />
        <InputOTP v-bind="args" v-model="lg" size="lg" label="Code (lg)" />
        <InputOTP v-bind="args" v-model="compact" compact label="Code (compact)" />
      </div>
    `,
  }),
}

export const FormatAlphanumerique: Story = {
  args: { format: 'alphanumeric' },
  render: (args) => ({
    components: { InputOTP },
    setup: () => ({ args, code: ref('') }),
    template: `
      <div style="display: grid; gap: 8px; justify-items: start">
        <InputOTP v-bind="args" v-model="code" />
        <output data-testid="mirror">{{ code }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // les minuscules sont converties : le v-model reste canonique
    await userEvent.click(canvas.getByRole('textbox', { name: 'Caractère 1 sur 6' }))
    await userEvent.keyboard('abc123')
    await waitFor(() => expect(canvas.getByTestId('mirror')).toHaveTextContent('ABC123'))
  },
}

export const AvecPattern: Story = {
  args: { pattern: '###.###.###' },
  render: (args) => ({
    components: { InputOTP },
    setup: () => ({ args, code: ref('') }),
    template: `
      <div style="display: grid; gap: 8px; justify-items: start">
        <InputOTP v-bind="args" v-model="code" />
        <output data-testid="mirror">{{ code }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // collage de la chaîne formatée : les séparateurs sont consommés
    await userEvent.click(canvas.getByRole('textbox', { name: 'Caractère 1 sur 9' }))
    await userEvent.paste('123.456.789')
    await waitFor(() => expect(canvas.getByTestId('mirror')).toHaveTextContent('123456789'))
  },
}

export const PatternPrefixe: Story = {
  args: { pattern: 'GT-###', format: 'alphanumeric' },
  render: (args) => ({
    components: { InputOTP },
    setup: () => ({ args, code: ref('') }),
    template: '<InputOTP v-bind="args" v-model="code" />',
  }),
}

export const SeparateurIcone: Story = {
  args: { pattern: '####-####', separatorIcon: 'horizontal_rule', length: 8 },
  render: (args) => ({
    components: { InputOTP },
    setup: () => ({ args, code: ref('') }),
    template: '<InputOTP v-bind="args" v-model="code" />',
  }),
}

export const Invalide: Story = {
  render: (args) => ({
    components: { InputOTP },
    setup: () => ({ args, code: ref('123456') }),
    template: '<InputOTP v-bind="args" v-model="code" invalid />',
  }),
}

export const Disabled: Story = {
  render: (args) => ({
    components: { InputOTP },
    setup: () => ({ args, code: ref('123') }),
    template: '<InputOTP v-bind="args" v-model="code" disabled />',
  }),
}
