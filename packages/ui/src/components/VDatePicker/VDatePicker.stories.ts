import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import VButton from '../VButton/VButton.vue'
import type { DateRange } from '../VCalendar/VCalendar.vue'
import VDatePicker from './VDatePicker.vue'

const meta = {
  title: 'Composants/DatePicker',
  component: VDatePicker,
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    selection: { control: 'inline-radio', options: ['single', 'range', 'multiple'] },
    mode: { control: 'inline-radio', options: ['readonly', 'input'] },
    showCalendar: { control: 'boolean' },
  },
  // Ni `mode` ni `selection` : les épingler ferait mentir le panneau Controls,
  // qui afficherait une valeur courante différente du défaut du composant.
  args: {
    locale: 'fr-FR',
    label: 'Date',
    size: 'md',
    clearable: true,
  },
} satisfies Meta<typeof VDatePicker>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Par défaut le champ se tape au clavier et pose les séparateurs tout seul,
 * sans calendrier : le champ reste nu tant qu'aucune date n'est saisie, puis
 * affiche la croix d'effacement.
 */
export const Default: Story = {
  args: { hint: 'Format jj/mm/aaaa' },
  render: (args) => ({
    components: { VDatePicker },
    setup: () => ({ args, value: ref<string | null>(null) }),
    template: `
      <div style="width: 280px; display:grid; gap:8px">
        <VDatePicker v-bind="args" v-model="value" />
        <output>{{ value ?? '—' }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // getByRole('textbox') : le panneau (role dialog) porterait le même
    // aria-label que le champ, getByLabelText matcherait les deux
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
 * `mode="readonly"` : la date ne se choisit qu'au calendrier, qui devient dès
 * lors le seul chemin — `showCalendar` y est sans objet.
 */
export const LectureSeule: Story = {
  args: { mode: 'readonly' },
  render: (args) => ({
    components: { VDatePicker },
    setup: () => ({ args, value: ref('2026-06-10') }),
    template: `
      <div style="width: 280px; display:grid; gap:8px">
        <VDatePicker v-bind="args" v-model="value" />
        <output>{{ value ?? '—' }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
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
  args: { selection: 'range' },
  render: (args) => ({
    components: { VDatePicker },
    setup: () => ({ args, value: ref<DateRange>({ start: '2026-06-19', end: '2026-06-26' }) }),
    template: `
      <div style="width: 300px">
        <VDatePicker v-bind="args" label="Période" v-model="value" />
      </div>
    `,
  }),
}

export const Multiple: Story = {
  args: { selection: 'multiple' },
  render: (args) => ({
    components: { VDatePicker },
    setup: () => ({ args, value: ref<string[]>(['2026-06-05', '2026-06-12']) }),
    template: `
      <div style="width: 300px">
        <VDatePicker v-bind="args" label="Dates" v-model="value" />
      </div>
    `,
  }),
}

// Footer avec presets qui posent la valeur et ferment le panneau.
export const AvecPresets: Story = {
  args: { mode: 'readonly' },
  render: (args) => ({
    components: { VDatePicker, VButton },
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
        <VDatePicker v-bind="args" v-model="value">
          <template #footer="{ close }">
            <VButton variant="ghost" size="sm" @click="setIn(0, close)">Aujourd'hui</VButton>
            <VButton variant="ghost" size="sm" @click="setIn(1, close)">Demain</VButton>
            <VButton variant="ghost" size="sm" @click="setIn(3, close)">Dans 3 jours</VButton>
          </template>
        </VDatePicker>
      </div>
    `,
  }),
}

export const MinMax: Story = {
  args: { mode: 'readonly' },
  render: (args) => ({
    components: { VDatePicker },
    setup: () => ({ args, value: ref('2026-06-15') }),
    template: `
      <div style="width: 280px">
        <VDatePicker v-bind="args" v-model="value" min="2026-06-05" max="2026-06-24"
          hint="Du 5 au 24 juin uniquement" />
      </div>
    `,
  }),
}

export const Evenements: Story = {
  args: { mode: 'readonly' },
  render: (args) => ({
    components: { VDatePicker },
    setup: () => ({
      args,
      value: ref('2026-06-10'),
      events: [
        { date: '2026-06-10', color: 'var(--vectis-color-accent)' },
        { date: '2026-06-18', color: 'var(--vectis-color-danger)' },
      ],
    }),
    template: `
      <div style="width: 280px">
        <VDatePicker v-bind="args" v-model="value" :events="events" />
      </div>
    `,
  }),
}

export const Tailles: Story = {
  render: (args) => ({
    components: { VDatePicker },
    setup: () => ({ args, value: ref('2026-06-10') }),
    template: `
      <div style="width: 280px; display:grid; gap:12px">
        <VDatePicker v-bind="args" v-model="value" size="sm" label="sm" />
        <VDatePicker v-bind="args" v-model="value" size="md" label="md" />
        <VDatePicker v-bind="args" v-model="value" size="lg" label="lg" />
      </div>
    `,
  }),
}

export const Desactive: Story = {
  render: (args) => ({
    components: { VDatePicker },
    setup: () => ({ args, value: ref('2026-06-10') }),
    template: `
      <div style="width: 280px">
        <VDatePicker v-bind="args" v-model="value" disabled />
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
  args: { mode: 'readonly' },
  render: (args) => ({
    components: { VDatePicker },
    setup: () => ({ args, value: ref('2026-06-10') }),
    template: `
      <div style="width: 280px">
        <VDatePicker v-bind="args" v-model="value" />
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
 * `showCalendar` rend le calendrier accessible depuis un champ de saisie : icône
 * cliquable en fin de champ, et panneau ouvert au focus — sans happer le
 * curseur, la frappe continue dans le champ.
 */
export const SaisieAvecCalendrier: Story = {
  args: { showCalendar: true, hint: 'Format jj/mm/aaaa' },
  render: (args) => ({
    components: { VDatePicker },
    setup: () => ({ args, value: ref<string | null>(null) }),
    template: `
      <div style="width: 280px; display:grid; gap:8px">
        <VDatePicker v-bind="args" v-model="value" />
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
  render: (args) => ({
    components: { VDatePicker },
    setup: () => ({ args, value: ref<string | null>(null) }),
    template: `
      <div style="width: 280px; display:grid; gap:8px">
        <VDatePicker v-bind="args" v-model="value" />
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
  render: (args) => ({
    components: { VDatePicker },
    setup: () => ({ args, value: ref('2026-06-10') }),
    template: `
      <div style="width: 280px; display:grid; gap:12px">
        <VDatePicker v-bind="args" v-model="value" locale="fr-FR" label="fr-FR" />
        <VDatePicker v-bind="args" v-model="value" locale="en-US" label="en-US" />
        <VDatePicker v-bind="args" v-model="value" locale="de-DE" label="de-DE" />
        <VDatePicker v-bind="args" v-model="value" locale="ja-JP" label="ja-JP" />
      </div>
    `,
  }),
}

/**
 * Bornes et dates désactivées valent aussi pour la saisie : une date refusée
 * revient silencieusement à la valeur courante à la sortie du champ.
 */
export const SaisieBornee: Story = {
  render: (args) => ({
    components: { VDatePicker },
    setup: () => ({
      args,
      value: ref('2026-06-10'),
      weekends: (iso: string) => [0, 6].includes(new Date(`${iso}T00:00:00`).getDay()),
    }),
    template: `
      <div style="width: 280px; display:grid; gap:8px">
        <VDatePicker v-bind="args" v-model="value" min="2026-06-01" max="2026-06-30"
          :disabled-dates="weekends" hint="Juin 2026, jours ouvrés" />
        <output>{{ value ?? '—' }}</output>
      </div>
    `,
  }),
}
