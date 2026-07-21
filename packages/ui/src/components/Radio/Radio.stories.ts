import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, within } from 'storybook/test'
import { ref } from 'vue'

import Radio from './Radio.vue'

const meta = {
  title: 'Composants/Radio',
  component: Radio,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Radio>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Le groupe est natif : même `name` (fallthrough) + même v-model.
 * La navigation aux flèches est fournie par le navigateur, zéro JS.
 */
export const Groupe: Story = {
  args: { value: 'standard' },
  render: () => ({
    components: { Radio },
    setup: () => ({ plan: ref('standard') }),
    template: `
      <fieldset style="border: none; display: grid; gap: 8px">
        <legend style="margin-bottom: 8px">Formule</legend>
        <Radio v-model="plan" name="plan" value="gratuit">Gratuit</Radio>
        <Radio v-model="plan" name="plan" value="standard">Standard</Radio>
        <Radio v-model="plan" name="plan" value="pro">Pro</Radio>
      </fieldset>
      <output data-testid="mirror">{{ plan }}</output>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('radio', { name: 'Standard' })).toBeChecked()
    await userEvent.click(canvas.getByRole('radio', { name: 'Pro' }))
    await expect(canvas.getByTestId('mirror')).toHaveTextContent('pro')
    await expect(canvas.getByRole('radio', { name: 'Standard' })).not.toBeChecked()
  },
}

export const Tailles: Story = {
  args: { value: 'x' },
  render: () => ({
    components: { Radio },
    setup: () => ({ v: ref('md') }),
    template: `
      <div style="display: grid; gap: 8px">
        <Radio v-model="v" name="tailles" value="sm" size="sm">Small</Radio>
        <Radio v-model="v" name="tailles" value="md" size="md">Medium</Radio>
        <Radio v-model="v" name="tailles" value="lg" size="lg">Large</Radio>
      </div>
    `,
  }),
}

export const Disabled: Story = {
  args: { value: 'x' },
  render: () => ({
    components: { Radio },
    setup: () => ({ v: ref('b') }),
    template: `
      <div style="display: grid; gap: 8px">
        <Radio v-model="v" name="disabled-demo" value="a" disabled>Désactivé</Radio>
        <Radio v-model="v" name="disabled-demo" value="b" disabled>Désactivé sélectionné</Radio>
      </div>
    `,
  }),
}
