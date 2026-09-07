import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import { storyText } from '../../stories/storyText'
import VInputOTP from './VInputOTP.vue'

const t = storyText({
  en: {
    code: (size: string) => `Code (${size})`,
    hint: 'Sent to +33 6 12 34 56 78, valid for 10 minutes.',
  },
  fr: {
    code: (size: string) => `Code (${size})`,
    hint: 'Envoyé au +33 6 12 34 56 78, valable 10 minutes.',
  },
})

const meta = {
  title: 'Components/InputOTP',
  component: VInputOTP,
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  args: { length: 6, format: 'numeric' },
} satisfies Meta<typeof VInputOTP>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { VInputOTP },
    setup: () => ({ args, code: ref(''), onComplete: fn() }),
    template: `
      <div style="display: grid; gap: 8px; justify-items: start">
        <VInputOTP v-bind="args" v-model="code" @complete="onComplete" />
        <output data-testid="mirror">{{ code }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const first = canvas.getByRole('textbox', { name: 'Character 1 of 6' })

    await userEvent.click(first)
    await userEvent.keyboard('123456')
    await waitFor(() => expect(canvas.getByTestId('mirror')).toHaveTextContent('123456'))
  },
}

export const DistributedPaste: Story = {
  render: (args) => ({
    components: { VInputOTP },
    setup: () => ({ args, code: ref('') }),
    template: `
      <div style="display: grid; gap: 8px; justify-items: start">
        <VInputOTP v-bind="args" v-model="code" />
        <output data-testid="mirror">{{ code }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('textbox', { name: 'Character 1 of 6' }))
    await userEvent.paste('987654')
    await waitFor(() => expect(canvas.getByTestId('mirror')).toHaveTextContent('987654'))
  },
}

export const FourCells: Story = {
  args: { length: 4 },
  render: (args) => ({
    components: { VInputOTP },
    setup: () => ({ args, code: ref('') }),
    template: '<VInputOTP v-bind="args" v-model="code" />',
  }),
}

export const Sizes: Story = {
  args: { length: 4 },
  render: (args) => ({
    components: { VInputOTP },
    setup: () => ({
      args,
      t,
      sm: ref(''),
      md: ref(''),
      lg: ref(''),
      compact: ref(''),
    }),
    template: `
      <div style="display: grid; gap: 16px; justify-items: start">
        <VInputOTP v-bind="args" v-model="sm" size="sm" :label="t.code('sm')" />
        <VInputOTP v-bind="args" v-model="md" size="md" :label="t.code('md')" />
        <VInputOTP v-bind="args" v-model="lg" size="lg" :label="t.code('lg')" />
        <VInputOTP v-bind="args" v-model="compact" compact :label="t.code('compact')" />
      </div>
    `,
  }),
}

export const AlphanumericFormat: Story = {
  args: { format: 'alphanumeric' },
  render: (args) => ({
    components: { VInputOTP },
    setup: () => ({ args, code: ref('') }),
    template: `
      <div style="display: grid; gap: 8px; justify-items: start">
        <VInputOTP v-bind="args" v-model="code" />
        <output data-testid="mirror">{{ code }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // lowercase is converted: the v-model stays canonical
    await userEvent.click(canvas.getByRole('textbox', { name: 'Character 1 of 6' }))
    await userEvent.keyboard('abc123')
    await waitFor(() => expect(canvas.getByTestId('mirror')).toHaveTextContent('ABC123'))
  },
}

export const WithPattern: Story = {
  args: { pattern: '###.###.###' },
  render: (args) => ({
    components: { VInputOTP },
    setup: () => ({ args, code: ref('') }),
    template: `
      <div style="display: grid; gap: 8px; justify-items: start">
        <VInputOTP v-bind="args" v-model="code" />
        <output data-testid="mirror">{{ code }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // pasting the formatted string: the separators are consumed
    await userEvent.click(canvas.getByRole('textbox', { name: 'Character 1 of 9' }))
    await userEvent.paste('123.456.789')
    await waitFor(() => expect(canvas.getByTestId('mirror')).toHaveTextContent('123456789'))
  },
}

export const PrefixedPattern: Story = {
  args: { pattern: 'GT-###', format: 'alphanumeric' },
  render: (args) => ({
    components: { VInputOTP },
    setup: () => ({ args, code: ref('') }),
    template: '<VInputOTP v-bind="args" v-model="code" />',
  }),
}

export const IconSeparator: Story = {
  args: { pattern: '####-####', separatorIcon: 'horizontal_rule', length: 8 },
  render: (args) => ({
    components: { VInputOTP },
    setup: () => ({ args, code: ref('') }),
    template: '<VInputOTP v-bind="args" v-model="code" />',
  }),
}

export const Invalid: Story = {
  render: (args) => ({
    components: { VInputOTP },
    setup: () => ({ args, code: ref('123456') }),
    template: '<VInputOTP v-bind="args" v-model="code" invalid />',
  }),
}

export const Disabled: Story = {
  render: (args) => ({
    components: { VInputOTP },
    setup: () => ({ args, code: ref('123') }),
    template: '<VInputOTP v-bind="args" v-model="code" disabled />',
  }),
}

/**
 * `hint` puts a line of help under the boxes and ties it to the row for assistive
 * technology, exactly as on any other field. `label` is a different thing here: it names
 * the row for a screen reader and renders nothing, the instructions above the boxes
 * belonging to the page.
 */
export const Hint: Story = {
  render: (args) => ({
    components: { VInputOTP },
    setup: () => ({ args, t, code: ref('') }),
    template: `
      <VInputOTP v-bind="args" v-model="code" :hint="t.hint" />
    `,
  }),
  play: async ({ canvasElement }) => {
    const group = canvasElement.querySelector('[role="group"]')!
    const hint = canvasElement.querySelector('.v-otp-hint')!
    // The row points at the hint, so it is announced along with the row's own name.
    await expect(group).toHaveAttribute('aria-describedby', hint.id)
  },
}
