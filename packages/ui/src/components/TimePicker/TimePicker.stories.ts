import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import TimePicker from './TimePicker.vue'

const meta = {
  title: 'Composants/TimePicker',
  component: TimePicker,
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    mode: { control: 'inline-radio', options: ['readonly', 'input', 'list'] },
  },
  // Pas de `mode` : l'épingler ferait mentir le panneau Controls, qui
  // afficherait une valeur courante différente du défaut du composant.
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

/**
 * Par défaut le champ est masqué : l'utilisateur ne tape que des chiffres et le
 * deux-points est posé tout seul, sans aucun cadran.
 */
export const Default: Story = {
  args: { format: '24h', hint: 'Format hh:mm' },
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
    const field = canvas.getByRole('textbox', { name: 'Heure' }) as HTMLInputElement

    // sans cadran, le champ n'annonce aucun popup et n'en ouvre aucun
    await expect(field).not.toHaveAttribute('aria-haspopup')
    await userEvent.click(field)
    await expect(canvas.queryByRole('dialog')).toBeNull()

    await userEvent.keyboard('09')
    await expect(field).toHaveValue('09:')
    // le caret a franchi le deux-points, la frappe continue dans les minutes
    await expect(field.selectionStart).toBe(3)
    await userEvent.keyboard('30')
    await expect(field).toHaveValue('09:30')
    await waitFor(() => expect(canvas.getByTestId('valeur')).toHaveTextContent('09:30'))

    // les deux chiffres des minutes partent, le caret se pose DEVANT le
    // deux-points (à la suppression il ne le franchit pas)…
    await userEvent.keyboard('{Backspace}{Backspace}')
    await expect(field).toHaveValue('09:')
    await expect(field.selectionStart).toBe(2)
    // …et le Retour arrière suivant efface le chiffre, pas le séparateur
    await userEvent.keyboard('{Backspace}')
    await expect(field).toHaveValue('0')

    // sortie du champ : la saisie incomplète revient silencieusement à la valeur
    await userEvent.tab()
    await waitFor(() => expect(field).toHaveValue('09:30'))
  },
}

/**
 * `mode="readonly"` : l'heure ne se choisit qu'au cadran, qui devient dès lors
 * le seul chemin — `showDial` y est sans objet.
 */
export const LectureSeule: Story = {
  args: { mode: 'readonly' },
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
    // ouverture au clavier (flèche bas), focus déplacé dans le panneau
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
  args: { mode: 'readonly', format: '24h' },
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
  args: { mode: 'readonly', format: '24h' },
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

/**
 * `showDial` rend le cadran accessible depuis un champ de saisie : icône
 * cliquable en fin de champ, et panneau ouvert au focus — sans happer le
 * curseur, la frappe continue dans le champ.
 */
export const SaisieAvecCadran: Story = {
  args: { showDial: true, format: '24h' },
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
    const field = canvas.getByRole('textbox', { name: 'Heure' })

    // le clic ouvre le panneau SANS happer le curseur : la frappe continue
    await userEvent.click(field)
    const panel = await waitFor(() => canvas.getByRole('dialog'))
    await expect(field).toHaveFocus()
    await userEvent.keyboard('0930')
    await expect(field).toHaveValue('09:30')
    await expect(field).toHaveFocus()

    // la flèche bas est le chemin explicite vers le cadran, Échap en revient
    await userEvent.keyboard('{ArrowDown}')
    await waitFor(() => expect(panel.contains(document.activeElement)).toBe(true))
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(field).toHaveFocus())
    await expect(panel.matches(':popover-open')).toBe(false)
  },
}

/**
 * Mode liste : les heures disponibles par pas de `minuteStep`. À l'ouverture, la
 * valeur courante a le focus et la liste est défilée dessus ; choisir une heure
 * commite immédiatement (ni brouillon, ni bouton OK).
 */
export const ListeDHeures: Story = {
  args: { mode: 'list', minuteStep: 30, format: '12h' },
  render: (args) => ({
    components: { TimePicker },
    setup: () => ({ args, value: ref('14:30') }),
    template: `
      <div style="width: 280px; display:grid; gap:8px">
        <TimePicker v-bind="args" v-model="value" />
        <output data-testid="valeur">{{ value ?? '—' }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const field = canvas.getByRole('textbox', { name: 'Heure' })
    await userEvent.click(field)
    const panel = await waitFor(() => canvas.getByRole('listbox'))

    // la rangée sélectionnée a le focus ET la liste a défilé jusqu'à elle
    await waitFor(() => expect(document.activeElement).toHaveAttribute('data-value', '14:30'))
    await expect(panel.scrollTop).toBeGreaterThan(0)

    // clic sur une rangée : commit immédiat, fermeture, focus rendu au champ
    await userEvent.click(canvas.getByRole('option', { name: '9:00' }))
    await waitFor(() => expect(canvas.getByTestId('valeur')).toHaveTextContent('09:00'))
    await expect(panel.matches(':popover-open')).toBe(false)
    await expect(field).toHaveFocus()
  },
}

/** Clavier dans la liste : flèches, Home/End, et Entrée qui commite. */
export const ListeClavier: Story = {
  args: { mode: 'list', minuteStep: 30, format: '24h' },
  render: (args) => ({
    components: { TimePicker },
    setup: () => ({ args, value: ref('00:00') }),
    template: `
      <div style="width: 280px; display:grid; gap:8px">
        <TimePicker v-bind="args" v-model="value" />
        <output data-testid="valeur">{{ value }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const field = canvas.getByRole('textbox', { name: 'Heure' })
    field.focus()
    await userEvent.keyboard('{ArrowDown}')
    const panel = await waitFor(() => canvas.getByRole('listbox'))
    await waitFor(() => expect(panel.contains(document.activeElement)).toBe(true))

    // l'ouverture a posé le focus sur la valeur courante (00:00) : deux crans
    // plus bas au pas de 30 minutes, on est à 01:00
    await userEvent.keyboard('{ArrowDown}{ArrowDown}')
    await expect(document.activeElement).toHaveAttribute('data-value', '01:00')
    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(canvas.getByTestId('valeur')).toHaveTextContent('01:00'))
    // l'Entrée ne rouvre pas le panneau qu'elle vient de fermer
    await expect(panel.matches(':popover-open')).toBe(false)
  },
}

// Le v-model reste en 24 h canonique : 7 h + PM → '19:00'. Le Toggle vit à côté
// du champ, hors du panneau : aucune ouverture ni validation nécessaire.
export const DouzeHeures: Story = {
  args: { locale: 'en-US', label: 'Time' },
  render: (args) => ({
    components: { TimePicker },
    setup: () => ({ args, value: ref('07:00') }),
    template: `
      <div style="width: 320px; display:grid; gap:8px">
        <TimePicker v-bind="args" v-model="value" />
        <output data-testid="valeur">{{ value }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'PM' }))
    await waitFor(() => expect(canvas.getByTestId('valeur')).toHaveTextContent('19:00'))
  },
}

// Annuler abandonne le brouillon : la valeur ne bouge pas.
export const Annulation: Story = {
  args: { mode: 'readonly', format: '24h' },
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
  args: { mode: 'readonly', format: '24h', minuteStep: 5, hint: 'Minutes par pas de 5' },
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

/** En 12 h, le Toggle AM/PM s'aligne sur le CHAMP, pas sur le bloc : sa position
    est compensée par la hauteur du label et du hint. */
export const MeridienAligne: Story = {
  args: { locale: 'en-US', label: 'Time' },
  render: (args) => ({
    components: { TimePicker },
    setup: () => ({ args, value: ref('07:00') }),
    template: `
      <div style="width: 320px; display:grid; gap:12px">
        <TimePicker v-bind="args" v-model="value" :label="undefined" />
        <TimePicker v-bind="args" v-model="value" />
        <TimePicker v-bind="args" v-model="value" hint="Heure de rendez-vous" />
        <TimePicker v-bind="args" v-model="value" :label="undefined" hint="Sans étiquette" />
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

/**
 * Cliquer dans une zone vide du panneau (son padding, la gouttière entre le
 * cadran et le pied) ne doit RIEN fermer — et surtout rien abandonner : la
 * fermeture par sortie de focus vaut ici annulation du brouillon.
 *
 * Sans le `mousedown` neutralisé de `useFieldPanel`, le navigateur rendrait le
 * focus au `<body>` et le `focusout` de la racine fermerait le panneau. Invisible
 * en jsdom, qui ne simule pas le focus au clic.
 */
export const ClicDansLeVide: Story = {
  args: { mode: 'readonly', format: '24h' },
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
    const panel = await waitFor(() => canvas.getByRole('dialog'))
    // le focus est déplacé dans le panneau sous rAF
    await waitFor(() => expect(panel.contains(document.activeElement)).toBe(true))

    // brouillon en cours : 10 h choisi au cadran, pas encore commité
    const face = canvasElement.querySelector('.ds-timepicker-dial-face') as HTMLElement
    tapDial(face, 10 / 12)
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Sélectionner l’heure' })).toHaveTextContent('10'),
    )

    // clic sur le panneau LUI-MÊME et non sur un de ses contrôles : userEvent
    // dispatche sur l'élément passé, sans hit-testing — c'est fidèlement le clic
    // qui tombe dans son padding, là où rien n'est focusable
    await userEvent.click(panel)
    await expect(panel.matches(':popover-open')).toBe(true)
    // le brouillon a survécu : une fermeture ici l'aurait abandonné
    await expect(canvas.getByRole('button', { name: 'Sélectionner l’heure' })).toHaveTextContent(
      '10',
    )

    // OK commite normalement
    await userEvent.click(canvas.getByRole('button', { name: 'OK' }))
    await waitFor(() => expect(canvas.getByTestId('valeur')).toHaveTextContent('10:15'))
  },
}
