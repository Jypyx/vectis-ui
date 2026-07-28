import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import Button from '../Button/Button.vue'
import Calendar from './Calendar.vue'
import type { DateRange } from './Calendar.vue'

const meta = {
  title: 'Composants/Calendar',
  component: Calendar,
  args: {
    mode: 'single',
    locale: 'fr-FR',
    showAdjacentDays: true,
    selectAdjacentDays: false,
  },
} satisfies Meta<typeof Calendar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { Calendar },
    setup: () => ({ args, value: ref('2026-06-10') }),
    template: `
      <div style="display: grid; gap: 12px; justify-items: start">
        <Calendar v-bind="args" v-model="value" />
        <output>{{ value ?? '—' }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const grid = canvas.getByRole('grid')
    // le 10 est la cellule focusable initiale (roving tabindex 0)
    const start = within(grid).getByRole('button', { name: '10' })
    start.focus()
    // flèche droite → 11, Entrée sélectionne
    await userEvent.keyboard('{ArrowRight}{Enter}')
    await waitFor(() => expect(canvas.getByText('2026-06-11')).toBeVisible())
  },
}

export const Plage: Story = {
  render: (args) => ({
    components: { Calendar },
    setup: () => ({ args, value: ref<DateRange>({ start: '2026-06-19', end: '2026-06-26' }) }),
    template: `
      <div style="display: grid; gap: 12px; justify-items: start">
        <Calendar v-bind="args" mode="range" v-model="value" />
        <output>{{ value.start ?? '—' }} → {{ value.end ?? '—' }}</output>
      </div>
    `,
  }),
}

export const Multiple: Story = {
  render: (args) => ({
    components: { Calendar },
    setup: () => ({ args, value: ref<string[]>(['2026-06-05', '2026-06-12', '2026-06-20']) }),
    template: `
      <div style="display: grid; gap: 12px; justify-items: start">
        <Calendar v-bind="args" mode="multiple" v-model="value"/>
        <output>{{ value.join(', ') || '—' }}</output>
      </div>
    `,
  }),
}

export const MinMax: Story = {
  render: (args) => ({
    components: { Calendar },
    setup: () => ({ args, value: ref('2026-06-15') }),
    template: `
      <Calendar v-bind="args" v-model="value" min="2026-06-05" max="2026-06-24" />
    `,
  }),
}

// Week-ends non sélectionnables (barrés) via un prédicat.
export const DatesDesactivees: Story = {
  render: (args) => ({
    components: { Calendar },
    setup: () => {
      const isWeekend = (iso: string) => {
        const d = new Date(iso + 'T00:00:00').getDay()
        return d === 0 || d === 6
      }
      return { args, value: ref('2026-06-10'), isWeekend }
    },
    template: `<Calendar v-bind="args" v-model="value" :disabled-dates="isWeekend" />`,
  }),
}

// Jours des mois adjacents affichés ET cliquables.
export const MoisAdjacents: Story = {
  render: (args) => ({
    components: { Calendar },
    setup: () => ({ args, value: ref('2026-06-10') }),
    template: `
      <Calendar v-bind="args" v-model="value" show-adjacent-days select-adjacent-days />
    `,
  }),
}

// Pastilles d'événements sous les dates.
export const Evenements: Story = {
  render: (args) => ({
    components: { Calendar },
    setup: () => ({
      args,
      value: ref('2026-06-10'),
      events: [
        { date: '2026-06-10', color: 'var(--ds-color-accent)' },
        { date: '2026-06-10', color: 'var(--ds-color-success)' },
        { date: '2026-06-18', color: 'var(--ds-color-danger)', label: 'Échéance' },
        { date: '2026-06-24', color: 'var(--ds-color-warning)' },
      ],
    }),
    template: `<Calendar v-bind="args" v-model="value" :events="events" />`,
  }),
}

// Slot #day : afficher un prix sous le numéro (ex. billets d'avion).
export const SlotJour: Story = {
  render: (args) => ({
    components: { Calendar },
    setup: () => {
      const value = ref('2026-06-10')
      const prices: Record<number, string> = { 10: '89€', 11: '120€', 12: '75€', 15: '99€' }
      return { args, value, prices }
    },
    // --ds-calendar-day-size agrandit les ronds (40×40) ; la ligne prix est
    // TOUJOURS rendue (vide si absente, et sur les jours adjacents auxquels le
    // slot s'applique aussi) pour que tous les numéros s'alignent.
    template: `
      <Calendar v-bind="args" v-model="value" show-adjacent-days style="--ds-calendar-day-size: 48px">
        <template #day="{ day, inMonth, selected }">
          <span style="line-height:1.2">{{ day }}</span>
          <span :style="{ fontSize: '0.625rem', lineHeight: 1.2, minHeight: '0.75rem', color: selected ? 'inherit' : 'var(--ds-color-success-text)' }">
            {{ inMonth ? prices[day] ?? '' : '' }}
          </span>
        </template>
      </Calendar>
    `,
  }),
}

// Zone footer : presets + actions.
export const AvecFooter: Story = {
  render: (args) => ({
    components: { Calendar, Button },
    setup: () => {
      const value = ref('2026-06-10')
      const fmt = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      const inDays = (n: number) => {
        const d = new Date('2026-06-10T00:00:00')
        d.setDate(d.getDate() + n)
        value.value = fmt(d)
      }
      return { args, value, inDays }
    },
    template: `
      <Calendar v-bind="args" v-model="value">
        <template #footer>
          <Button variant="ghost" size="sm" @click="inDays(0)">Aujourd'hui</Button>
          <Button variant="ghost" size="sm" @click="inDays(1)">Demain</Button>
          <Button variant="ghost" size="sm" @click="inDays(3)">Dans 3 jours</Button>
        </template>
      </Calendar>
    `,
  }),
}

export const Localisation: Story = {
  render: (args) => ({
    components: { Calendar },
    setup: () => ({ args, value: ref('2026-06-10') }),
    template: `
      <div style="display:flex; gap:24px; flex-wrap:wrap">
        <Calendar v-bind="args" v-model="value" locale="fr-FR" />
        <Calendar v-bind="args" v-model="value" locale="ar-EG" />
        <Calendar v-bind="args" v-model="value" locale="en-US" />
        <Calendar v-bind="args" v-model="value" locale="ru-RU" />
        <Calendar v-bind="args" v-model="value" locale="el-GR" />
        <Calendar v-bind="args" v-model="value" locale="ja-JP" />
        <Calendar v-bind="args" v-model="value" locale="zh-CN" />
        <Calendar v-bind="args" v-model="value" locale="th-TH" />
      </div>
    `,
  }),
}
