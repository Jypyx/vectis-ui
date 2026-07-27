import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import Button from '../Button/Button.vue'
import type { DateRange } from '../Calendar/Calendar.vue'
import DatePicker from './DatePicker.vue'

const meta = {
  title: 'Composants/DatePicker',
  component: DatePicker,
  args: {
    mode: 'single',
    locale: 'fr-FR',
    label: 'Date',
    size: 'md',
    clearable: true,
  },
} satisfies Meta<typeof DatePicker>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { DatePicker },
    setup: () => ({ args, value: ref('2026-06-10') }),
    template: `
      <div style="width: 280px; display:grid; gap:8px">
        <DatePicker v-bind="args" v-model="value" />
        <output>{{ value ?? '—' }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // getByRole('textbox') : le panneau (role dialog) porte le même aria-label
    // que le champ, getByLabelText matcherait les deux
    const field = canvas.getByRole('textbox', { name: 'Date' })
    // ouverture au clavier (flèche bas), focus déplacé dans la grille
    field.focus()
    await userEvent.keyboard('{ArrowDown}')
    await waitFor(() => expect(canvas.getByRole('dialog')).toBeVisible())
    // Échap referme et redonne le focus au champ
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(field).toHaveFocus())
  },
}

export const Plage: Story = {
  render: (args) => ({
    components: { DatePicker },
    setup: () => ({ args, value: ref<DateRange>({ start: '2026-06-19', end: '2026-06-26' }) }),
    template: `
      <div style="width: 300px">
        <DatePicker v-bind="args" mode="range" label="Période" v-model="value" />
      </div>
    `,
  }),
}

export const Multiple: Story = {
  render: (args) => ({
    components: { DatePicker },
    setup: () => ({ args, value: ref<string[]>(['2026-06-05', '2026-06-12']) }),
    template: `
      <div style="width: 300px">
        <DatePicker v-bind="args" mode="multiple" label="Dates" v-model="value" />
      </div>
    `,
  }),
}

// Footer avec presets qui posent la valeur et ferment le panneau.
export const AvecPresets: Story = {
  render: (args) => ({
    components: { DatePicker, Button },
    setup: () => {
      const value = ref('2026-06-10')
      const fmt = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      const setIn = (n: number, close: () => void) => {
        const d = new Date('2026-06-10T00:00:00')
        d.setDate(d.getDate() + n)
        value.value = fmt(d)
        close()
      }
      return { args, value, setIn }
    },
    template: `
      <div style="width: 280px">
        <DatePicker v-bind="args" v-model="value">
          <template #footer="{ close }">
            <Button variant="ghost" size="sm" @click="setIn(0, close)">Aujourd'hui</Button>
            <Button variant="ghost" size="sm" @click="setIn(1, close)">Demain</Button>
            <Button variant="ghost" size="sm" @click="setIn(3, close)">Dans 3 jours</Button>
          </template>
        </DatePicker>
      </div>
    `,
  }),
}

export const MinMax: Story = {
  render: (args) => ({
    components: { DatePicker },
    setup: () => ({ args, value: ref('2026-06-15') }),
    template: `
      <div style="width: 280px">
        <DatePicker v-bind="args" v-model="value" min="2026-06-05" max="2026-06-24"
          hint="Du 5 au 24 juin uniquement" />
      </div>
    `,
  }),
}

export const Evenements: Story = {
  render: (args) => ({
    components: { DatePicker },
    setup: () => ({
      args,
      value: ref('2026-06-10'),
      events: [
        { date: '2026-06-10', color: 'var(--ds-color-accent)' },
        { date: '2026-06-18', color: 'var(--ds-color-danger)' },
      ],
    }),
    template: `
      <div style="width: 280px">
        <DatePicker v-bind="args" v-model="value" :events="events" />
      </div>
    `,
  }),
}

export const Tailles: Story = {
  render: (args) => ({
    components: { DatePicker },
    setup: () => ({ args, value: ref('2026-06-10') }),
    template: `
      <div style="width: 280px; display:grid; gap:12px">
        <DatePicker v-bind="args" v-model="value" size="sm" label="sm" />
        <DatePicker v-bind="args" v-model="value" size="md" label="md" />
        <DatePicker v-bind="args" v-model="value" size="lg" label="lg" />
      </div>
    `,
  }),
}

export const Desactive: Story = {
  render: (args) => ({
    components: { DatePicker },
    setup: () => ({ args, value: ref('2026-06-10') }),
    template: `
      <div style="width: 280px">
        <DatePicker v-bind="args" v-model="value" disabled />
      </div>
    `,
  }),
}
