import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'

import DatePicker from './DatePicker.vue'

const meta = {
  title: 'Composants/DatePicker',
  component: DatePicker,
  argTypes: {
    type: { control: 'select', options: ['date', 'datetime-local', 'time', 'month', 'week'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
  args: { type: 'date', size: 'md' },
  render: (args) => ({
    components: { DatePicker },
    setup: () => ({ args, value: ref('2026-07-21') }),
    template: `
      <div style="display: grid; gap: 8px; width: 260px">
        <DatePicker v-bind="args" v-model="value" aria-label="Date de début" />
        <output>{{ value }}</output>
      </div>
    `,
  }),
} satisfies Meta<typeof DatePicker>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const AvecBornes: Story = {
  render: () => ({
    components: { DatePicker },
    setup: () => ({ value: ref('2026-07-21') }),
    template: `
      <!-- min/max natifs par fallthrough : la validation vient du navigateur -->
      <div style="width: 260px">
        <DatePicker v-model="value" min="2026-07-01" max="2026-07-31" aria-label="Date en juillet" />
      </div>
    `,
  }),
}

export const HeureEtDateTime: Story = {
  render: () => ({
    components: { DatePicker },
    setup: () => ({ time: ref('14:30'), dt: ref('2026-07-21T14:30') }),
    template: `
      <div style="display: grid; gap: 8px; width: 260px">
        <DatePicker v-model="time" type="time" aria-label="Heure" />
        <DatePicker v-model="dt" type="datetime-local" aria-label="Date et heure" />
      </div>
    `,
  }),
}

export const Invalide: Story = {
  args: { invalid: true },
}

export const Disabled: Story = {
  args: { disabled: true },
}
