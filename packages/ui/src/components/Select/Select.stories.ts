import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, within } from 'storybook/test'
import { ref } from 'vue'

import Button from '../Button/Button.vue'
import Select from './Select.vue'

const OPTIONS = `
  <option value="" disabled>Choisir un pays…</option>
  <option value="fr">France</option>
  <option value="be">Belgique</option>
  <option value="ch">Suisse</option>
  <option value="ca">Canada</option>
`

const meta = {
  title: 'Composants/Select',
  component: Select,
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    compact: { control: 'boolean' },
  },
  args: {
    size: 'md',
    compact: false,
    invalid: false,
    disabled: false,
  },
  render: (args) => ({
    components: { Select },
    setup: () => ({ args, value: ref('') }),
    template: `
      <div style="width: 260px">
        <Select v-bind="args" v-model="value" aria-label="Pays">${OPTIONS}</Select>
      </div>
    `,
  }),
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Tailles: Story = {
  render: () => ({
    components: { Select },
    template: `
      <div style="display: grid; gap: 8px; width: 260px">
        <Select size="xs" aria-label="XSmall">${OPTIONS}</Select>
        <Select size="sm" aria-label="Small">${OPTIONS}</Select>
        <Select size="md" aria-label="Medium">${OPTIONS}</Select>
        <Select size="lg" aria-label="Large">${OPTIONS}</Select>
        <Select size="xl" aria-label="XLarge">${OPTIONS}</Select>
        <Select compact aria-label="Compact">${OPTIONS}</Select>
      </div>
    `,
  }),
}

export const Disabled: Story = {
  args: { disabled: true },
}

export const OptionLongue: Story = {
  render: () => ({
    components: { Select },
    setup: () => ({ value: ref('long') }),
    template: `
      <div style="width: 200px">
        <Select v-model="value" aria-label="Libellé long">
          <option value="long">Une option au libellé anormalement long qui doit être tronquée</option>
        </Select>
      </div>
    `,
  }),
}

export const Selection: Story = {
  render: () => ({
    components: { Select },
    setup: () => ({ value: ref('') }),
    template: `
      <div style="display: grid; gap: 8px; width: 260px">
        <Select v-model="value" aria-label="Pays">${OPTIONS}</Select>
        <output data-testid="mirror">{{ value }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.selectOptions(canvas.getByRole('combobox'), 'be')
    await expect(canvas.getByTestId('mirror')).toHaveTextContent('be')
  },
}

/** `required` + option vide : l'état d'erreur vient de `:user-invalid`, zéro JS. */
export const ValidationNative: Story = {
  render: () => ({
    components: { Select, Button },
    setup: () => ({ value: ref('') }),
    template: `
      <form style="display: flex; gap: 8px; width: 320px" @submit.prevent>
        <Select v-model="value" required aria-label="Pays">${OPTIONS}</Select>
        <Button type="submit">Valider</Button>
      </form>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const select = canvas.getByRole('combobox') as HTMLSelectElement
    await userEvent.click(canvas.getByRole('button', { name: 'Valider' }))
    await expect(select.validity.valid).toBe(false)
  },
}
