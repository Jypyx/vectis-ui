import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import TimePicker from './TimePicker.vue'

const meta = {
  title: 'Composants/TimePicker',
  component: TimePicker,
  args: {
    locale: 'fr-FR',
    label: 'Heure',
    size: 'md',
    clearable: true,
  },
} satisfies Meta<typeof TimePicker>

export default meta
type Story = StoryObj<typeof meta>

/** Point du cadran à une fraction de tour (0 = midi, sens horaire) et de rayon. */
function pointOnDial(face: HTMLElement, turn: number, radiusFraction: number) {
  const rect = face.getBoundingClientRect()
  const r = (rect.width / 2) * radiusFraction
  const angle = turn * 2 * Math.PI
  return {
    clientX: rect.left + rect.width / 2 + r * Math.sin(angle),
    clientY: rect.top + rect.height / 2 - r * Math.cos(angle),
  }
}

/** Clic pointer sur le cadran (le hit-testing à coordonnées d'userEvent est
    trop fragile : on dispatch les PointerEvent directement). */
function tapDial(face: HTMLElement, turn: number, radiusFraction = 0.8) {
  const { clientX, clientY } = pointOnDial(face, turn, radiusFraction)
  face.dispatchEvent(new PointerEvent('pointerdown', { clientX, clientY, bubbles: true }))
  face.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))
}

export const Default: Story = {
  render: (args) => ({
    components: { TimePicker },
    setup: () => ({ args, value: ref('09:15') }),
    template: `
      <div style="width: 280px; display:grid; gap:8px">
        <TimePicker v-bind="args" v-model="value" />
        <output>{{ value ?? '—' }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const field = canvas.getByRole('textbox', { name: 'Heure' })
    // ouverture au clavier (flèche bas), focus déplacé sur la cellule heure
    field.focus()
    await userEvent.keyboard('{ArrowDown}')
    await waitFor(() => expect(canvas.getByRole('dialog')).toBeVisible())
    // Échap annule, referme et redonne le focus au champ
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(field).toHaveFocus())
  },
}

// Sélection complète au pointeur : heure 3 (anneau extérieur), passage
// automatique aux minutes, minute 30, OK.
export const SelectionAuCadran: Story = {
  args: { format: '24h' },
  render: (args) => ({
    components: { TimePicker },
    setup: () => ({ args, value: ref('09:15') }),
    template: `
      <div style="width: 280px; display:grid; gap:8px">
        <TimePicker v-bind="args" v-model="value" />
        <output data-testid="valeur">{{ value }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('textbox', { name: 'Heure' }))
    await waitFor(() => expect(canvas.getByRole('dialog')).toBeVisible())
    const face = canvasElement.querySelector('.ds-timepicker-dial-face') as HTMLElement

    // heure 3 = quart de tour ; le relâcher passe à l'étape minutes
    tapDial(face, 3 / 12)
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Sélectionner l’heure' })).toHaveTextContent('03'),
    )
    await waitFor(() => expect(canvas.getByRole('slider')).toHaveAccessibleName('Minutes'))

    // minute 30 = demi-tour, puis OK commite
    tapDial(face, 30 / 60)
    await userEvent.click(canvas.getByRole('button', { name: 'OK' }))
    await waitFor(() => expect(canvas.getByTestId('valeur')).toHaveTextContent('03:30'))
  },
}

// Cadran 24 h : l'anneau intérieur porte 00 et 13–23.
export const AnneauInterieur: Story = {
  args: { format: '24h' },
  render: (args) => ({
    components: { TimePicker },
    setup: () => ({ args, value: ref('09:15') }),
    template: `
      <div style="width: 280px">
        <TimePicker v-bind="args" v-model="value" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('textbox', { name: 'Heure' }))
    await waitFor(() => expect(canvas.getByRole('dialog')).toBeVisible())
    const face = canvasElement.querySelector('.ds-timepicker-dial-face') as HTMLElement
    const hourCell = () => canvas.getByRole('button', { name: 'Sélectionner l’heure' })

    // minuit : position de midi, anneau intérieur (mi-rayon)
    tapDial(face, 0, 0.44)
    await waitFor(() => expect(hourCell()).toHaveTextContent('00'))
    // retour à l'étape heure (le relâcher a avancé aux minutes)
    await userEvent.click(hourCell())
    // 13 h : position de 1 h, anneau intérieur
    tapDial(face, 1 / 12, 0.44)
    await waitFor(() => expect(hourCell()).toHaveTextContent('13'))
  },
}

export const ModeSaisie: Story = {
  args: { mode: 'input', format: '24h' },
  render: (args) => ({
    components: { TimePicker },
    setup: () => ({ args, value: ref(null) }),
    template: `
      <div style="width: 280px; display:grid; gap:8px">
        <TimePicker v-bind="args" v-model="value" />
        <output data-testid="valeur">{{ value ?? '—' }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('textbox', { name: 'Heure' }))
    await waitFor(() => expect(canvas.getByRole('dialog')).toBeVisible())
    // le focus arrive sur le champ heure ; « 09 » avance automatiquement aux minutes
    const fields = canvasElement.querySelectorAll<HTMLInputElement>('.ds-timepicker-field')
    const hourField = fields[0]!
    const minuteField = fields[1]!
    await waitFor(() => expect(hourField).toHaveFocus())
    // clear() avant la frappe : userEvent bute sur maxlength=2 quand le champ
    // est pré-rempli (l'heure courante) — la sélection posée au focus n'est pas
    // prise en compte dans son calcul de dépassement
    await userEvent.clear(hourField)
    await userEvent.type(hourField, '09')
    await waitFor(() => expect(minuteField).toHaveFocus())
    await userEvent.clear(minuteField)
    await userEvent.type(minuteField, '30')
    await userEvent.click(canvas.getByRole('button', { name: 'OK' }))
    await waitFor(() => expect(canvas.getByTestId('valeur')).toHaveTextContent('09:30'))
  },
}

// Le v-model reste en 24 h canonique : 7 h + PM → '19:00'.
export const DouzeHeures: Story = {
  args: { locale: 'en-US', label: 'Time' },
  render: (args) => ({
    components: { TimePicker },
    setup: () => ({ args, value: ref('07:00') }),
    template: `
      <div style="width: 280px; display:grid; gap:8px">
        <TimePicker v-bind="args" v-model="value" />
        <output data-testid="valeur">{{ value }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('textbox', { name: 'Time' }))
    await waitFor(() => expect(canvas.getByRole('dialog')).toBeVisible())
    await userEvent.click(canvas.getByRole('button', { name: 'PM' }))
    await userEvent.click(canvas.getByRole('button', { name: 'OK' }))
    await waitFor(() => expect(canvas.getByTestId('valeur')).toHaveTextContent('19:00'))
  },
}

// Annuler abandonne le brouillon : la valeur ne bouge pas.
export const Annulation: Story = {
  args: { format: '24h' },
  render: (args) => ({
    components: { TimePicker },
    setup: () => ({ args, value: ref('09:15') }),
    template: `
      <div style="width: 280px; display:grid; gap:8px">
        <TimePicker v-bind="args" v-model="value" />
        <output data-testid="valeur">{{ value }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('textbox', { name: 'Heure' }))
    await waitFor(() => expect(canvas.getByRole('dialog')).toBeVisible())
    const face = canvasElement.querySelector('.ds-timepicker-dial-face') as HTMLElement
    tapDial(face, 10 / 12)
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Sélectionner l’heure' })).toHaveTextContent('10'),
    )
    await userEvent.click(canvas.getByRole('button', { name: 'Annuler' }))
    await waitFor(() => expect(canvas.getByTestId('valeur')).toHaveTextContent('09:15'))
  },
}

export const PasDeCinqMinutes: Story = {
  args: { format: '24h', minuteStep: 5, hint: 'Minutes par pas de 5' },
  render: (args) => ({
    components: { TimePicker },
    setup: () => ({ args, value: ref('14:35') }),
    template: `
      <div style="width: 280px">
        <TimePicker v-bind="args" v-model="value" />
      </div>
    `,
  }),
}

export const SaisieVerrouillee: Story = {
  args: { mode: 'input', lockMode: true, hint: 'Saisie clavier uniquement' },
  render: (args) => ({
    components: { TimePicker },
    setup: () => ({ args, value: ref('09:15') }),
    template: `
      <div style="width: 280px">
        <TimePicker v-bind="args" v-model="value" />
      </div>
    `,
  }),
}

export const Tailles: Story = {
  render: (args) => ({
    components: { TimePicker },
    setup: () => ({ args, value: ref('09:15') }),
    template: `
      <div style="width: 280px; display:grid; gap:12px">
        <TimePicker v-bind="args" v-model="value" size="sm" label="sm" />
        <TimePicker v-bind="args" v-model="value" size="md" label="md" />
        <TimePicker v-bind="args" v-model="value" size="lg" label="lg" />
      </div>
    `,
  }),
}

export const Desactive: Story = {
  render: (args) => ({
    components: { TimePicker },
    setup: () => ({ args, value: ref('09:15') }),
    template: `
      <div style="width: 280px">
        <TimePicker v-bind="args" v-model="value" disabled />
      </div>
    `,
  }),
}
