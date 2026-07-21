import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import InputOTP from './InputOTP.vue'

const meta = {
  title: 'Composants/InputOTP',
  component: InputOTP,
  args: { length: 6, numeric: true },
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

    // la saisie avance automatiquement de case en case
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
    setup: () => ({ args, code: ref('') }),
    template: '<InputOTP v-bind="args" v-model="code" disabled />',
  }),
}
