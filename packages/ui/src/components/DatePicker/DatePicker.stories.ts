import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import Button from '../Button/Button.vue'
import type { DateRange } from '../Calendar/Calendar.vue'
import DatePicker from './DatePicker.vue'

const meta = {
  title: 'Composants/DatePicker',
  component: DatePicker,
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    entry: { control: 'inline-radio', options: ['readonly', 'input'] },
    showCalendar: { control: 'boolean' },
  },
  args: {
    mode: 'single',
    locale: 'fr-FR',
    label: 'Date',
    size: 'md',
    clearable: true,
    entry: 'readonly',
    showCalendar: false,
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

/**
 * Cliquer dans une zone vide du panneau (padding, gouttière entre les cellules)
 * ne doit RIEN fermer : sans le `mousedown` neutralisé de `useFieldPanel`, le
 * navigateur rendrait le focus au `<body>` et le `focusout` de la racine
 * fermerait un panneau sur lequel on vient de cliquer.
 *
 * Invisible en jsdom, qui ne simule pas le focus au clic — d'où cette play.
 */
export const ClicDansLeVide: Story = {
  render: (args) => ({
    components: { DatePicker },
    setup: () => ({ args, value: ref('2026-06-10') }),
    template: `
      <div style="width: 280px">
        <DatePicker v-bind="args" v-model="value" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const field = canvas.getByRole('textbox', { name: 'Date' })
    field.focus()
    await userEvent.keyboard('{ArrowDown}')
    const panel = await waitFor(() => canvas.getByRole('dialog'))
    // le focus est déplacé dans la grille (le panneau `manual` ne le fait pas
    // seul) — sous rAF, d'où le waitFor
    await waitFor(() => expect(panel.contains(document.activeElement)).toBe(true))

    // clic sur la grille ELLE-MÊME et non sur une cellule : userEvent dispatche
    // sur l'élément passé, sans hit-testing — c'est fidèlement le clic qui tombe
    // dans le padding ou une gouttière, là où rien n'est focusable
    await userEvent.click(canvas.getByRole('grid'))
    await expect(panel.matches(':popover-open')).toBe(true)
    // et le focus n'a pas été rendu au body
    await expect(document.body).not.toHaveFocus()

    // un clic sur un vrai jour, lui, garde le comportement natif (focus + choix)
    await userEvent.click(canvas.getByRole('button', { name: '15' }))
    await waitFor(() => expect(panel.matches(':popover-open')).toBe(false))
    await expect(field).toHaveValue('15 juin 2026')
  },
}

/**
 * Mode saisie : le champ est éditable et pose les séparateurs tout seul —
 * l'utilisateur ne tape que des chiffres. Par défaut, aucun calendrier : le
 * champ reste nu tant qu'aucune date n'est saisie, puis affiche la croix
 * d'effacement.
 */
export const Saisie: Story = {
  args: { entry: 'input', hint: 'Format jj/mm/aaaa' },
  render: (args) => ({
    components: { DatePicker },
    setup: () => ({ args, value: ref<string | null>(null) }),
    template: `
      <div style="width: 280px; display:grid; gap:8px">
        <DatePicker v-bind="args" v-model="value" />
        <output>{{ value ?? '—' }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const field = canvas.getByRole('textbox', { name: 'Date' })

    // sans calendrier, le champ n'annonce aucun popup et n'en ouvre aucun
    await expect(field).not.toHaveAttribute('aria-haspopup')
    await userEvent.click(field)
    await expect(canvas.queryByRole('dialog')).toBeNull()

    // seuls les chiffres sont tapés, le masque pose les « / »
    await userEvent.keyboard('10')
    await expect(field).toHaveValue('10/')
    await userEvent.keyboard('062026')
    await expect(field).toHaveValue('10/06/2026')
    await expect(field).toHaveFocus()
    await waitFor(() => expect(canvas.getByText('2026-06-10')).toBeVisible())

    // la croix d'effacement, elle, reste disponible (clearable)
    await expect(canvas.getByRole('button', { name: 'Effacer la date' })).toBeVisible()

    // le Retour arrière sur le séparateur efface le chiffre qui le précède
    await userEvent.keyboard('{Backspace}{Backspace}{Backspace}{Backspace}{Backspace}')
    await expect(field).toHaveValue('10/0')

    // sortie du champ : la saisie incomplète revient silencieusement à la valeur
    await userEvent.tab()
    await waitFor(() => expect(field).toHaveValue('10/06/2026'))
  },
}

/**
 * `showCalendar` rend le calendrier accessible depuis un champ de saisie : icône
 * cliquable en fin de champ, et panneau ouvert au focus — sans happer le
 * curseur, la frappe continue dans le champ.
 */
export const SaisieAvecCalendrier: Story = {
  args: { entry: 'input', showCalendar: true, hint: 'Format jj/mm/aaaa' },
  render: (args) => ({
    components: { DatePicker },
    setup: () => ({ args, value: ref<string | null>(null) }),
    template: `
      <div style="width: 280px; display:grid; gap:8px">
        <DatePicker v-bind="args" v-model="value" />
        <output>{{ value ?? '—' }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const field = canvas.getByRole('textbox', { name: 'Date' })

    // le clic ouvre le panneau SANS happer le curseur : la frappe continue
    await userEvent.click(field)
    await waitFor(() => expect(canvas.getByRole('dialog')).toBeVisible())
    await expect(field).toHaveFocus()
    await userEvent.keyboard('10062026')
    await expect(field).toHaveValue('10/06/2026')
    await expect(field).toHaveFocus()

    // la flèche bas est le chemin explicite vers la grille, Échap en revient
    await userEvent.keyboard('{ArrowDown}')
    const panel = canvas.getByRole('dialog')
    await waitFor(() => expect(panel.contains(document.activeElement)).toBe(true))
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(field).toHaveFocus())
    // Échap n'a pas rouvert le panneau via le focus rendu au champ
    await expect(panel.matches(':popover-open')).toBe(false)
  },
}

/**
 * Le collage d'une date déjà écrite (ISO, ou masquée dans une autre locale) est
 * reconnu : sans cela, coller « 2026-06-10 » dans un masque jj/mm/aaaa donnerait
 * « 20/26/0610 ».
 */
export const SaisieCollage: Story = {
  args: { entry: 'input' },
  render: (args) => ({
    components: { DatePicker },
    setup: () => ({ args, value: ref<string | null>(null) }),
    template: `
      <div style="width: 280px; display:grid; gap:8px">
        <DatePicker v-bind="args" v-model="value" />
        <output>{{ value ?? '—' }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const field = canvas.getByRole('textbox', { name: 'Date' })
    await userEvent.click(field)
    await userEvent.paste('2026-06-10')
    await expect(field).toHaveValue('10/06/2026')
    await waitFor(() => expect(canvas.getByText('2026-06-10')).toBeVisible())
  },
}

/**
 * L'ordre des champs et le séparateur sont dérivés de la locale : rien n'est
 * codé en dur, et le gabarit du placeholder suit les noms de champs localisés.
 */
export const SaisieLocales: Story = {
  args: { entry: 'input' },
  render: (args) => ({
    components: { DatePicker },
    setup: () => ({ args, value: ref('2026-06-10') }),
    template: `
      <div style="width: 280px; display:grid; gap:12px">
        <DatePicker v-bind="args" v-model="value" locale="fr-FR" label="fr-FR" />
        <DatePicker v-bind="args" v-model="value" locale="en-US" label="en-US" />
        <DatePicker v-bind="args" v-model="value" locale="de-DE" label="de-DE" />
        <DatePicker v-bind="args" v-model="value" locale="ja-JP" label="ja-JP" />
      </div>
    `,
  }),
}

/**
 * Bornes et dates désactivées valent aussi pour la saisie : une date refusée
 * revient silencieusement à la valeur courante à la sortie du champ.
 */
export const SaisieBornee: Story = {
  args: { entry: 'input' },
  render: (args) => ({
    components: { DatePicker },
    setup: () => ({
      args,
      value: ref('2026-06-10'),
      weekends: (iso: string) => [0, 6].includes(new Date(`${iso}T00:00:00`).getDay()),
    }),
    template: `
      <div style="width: 280px; display:grid; gap:8px">
        <DatePicker v-bind="args" v-model="value" min="2026-06-01" max="2026-06-30"
          :disabled-dates="weekends" hint="Juin 2026, jours ouvrés" />
        <output>{{ value ?? '—' }}</output>
      </div>
    `,
  }),
}
