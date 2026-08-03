import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import VTextarea from './VTextarea.vue'

const meta = {
  title: 'Composants/Textarea',
  component: VTextarea,
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  args: {
    size: 'md',
    autoGrow: false,
    invalid: false,
    disabled: false,
  },
  render: (args) => ({
    components: { VTextarea },
    setup: () => ({ args, value: ref('') }),
    template:
      '<VTextarea v-bind="args" v-model="value" placeholder="Votre message…" aria-label="Message" style="width: 320px" />',
  }),
} satisfies Meta<typeof VTextarea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const AutoGrow: Story = {
  args: { autoGrow: true },
  render: (args) => ({
    components: { VTextarea },
    setup: () => ({ args, value: ref('La hauteur suit le contenu.\nAjoutez des lignes…') }),
    template:
      '<VTextarea v-bind="args" v-model="value" aria-label="Message auto-grow" style="width: 320px" />',
  }),
}

export const Tailles: Story = {
  render: () => ({
    components: { VTextarea },
    template: `
      <div style="display: grid; gap: 8px; width: 320px">
        <VTextarea size="sm" placeholder="Small" aria-label="Small" />
        <VTextarea size="md" placeholder="Medium" aria-label="Medium" />
        <VTextarea size="lg" placeholder="Large" aria-label="Large" />
      </div>
    `,
  }),
}

/** Hauteur minimale réduite de 4px, padding/typo/icônes inchangés (comme VButton). */
export const Compact: Story = {
  render: () => ({
    components: { VTextarea },
    template: `
      <div style="display: grid; gap: 8px; width: 320px">
        <VTextarea placeholder="Normal" aria-label="Normal" />
        <VTextarea compact placeholder="Compact" aria-label="Compact" />
      </div>
    `,
  }),
}

/** Compteur sous le champ à droite, sur la même ligne que le hint. */
export const LabelHintCompteur: Story = {
  args: {
    label: 'Bio',
    hint: 'Présentez-vous en quelques mots.',
    counter: true,
    maxlength: 200,
  },
  render: (args) => ({
    components: { VTextarea },
    setup: () => ({ args, value: ref('Développeuse Vue à Lyon.') }),
    template: '<VTextarea v-bind="args" v-model="value" style="width: 320px" />',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const textarea = canvas.getByLabelText('Bio')
    const hint = canvas.getByText('Présentez-vous en quelques mots.')
    await expect(textarea.getAttribute('aria-describedby')).toContain(hint.id)
    await expect(canvas.getByText('24/200')).toBeInTheDocument()
  },
}

/**
 * Limite souple : la saisie dépasse, le champ passe en erreur via la
 * validation native (setCustomValidity → `:user-invalid` après interaction).
 */
export const CompteurSoft: Story = {
  args: { counter: true, maxlength: 10, softLimit: true, label: 'Titre' },
  render: (args) => ({
    components: { VTextarea },
    setup: () => ({ args, value: ref('') }),
    template: '<VTextarea v-bind="args" v-model="value" style="width: 320px" />',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const textarea = canvas.getByLabelText('Titre') as HTMLTextAreaElement
    await userEvent.type(textarea, 'beaucoup trop long')
    await waitFor(() => expect(textarea.value).toBe('beaucoup trop long'))
    await expect(canvas.getByText('18/10')).toHaveAttribute('data-over')
    // validité native : setCustomValidity a invalidé le champ (on ne peut pas
    // asserter :user-invalid, qui exige une interaction *trusted*)
    await waitFor(() => expect(textarea.validity.customError).toBe(true))
    await expect(textarea.matches(':invalid')).toBe(true)
  },
}

export const Clearable: Story = {
  args: { clearable: true, label: 'Message' },
  render: (args) => ({
    components: { VTextarea },
    setup: () => ({ args, value: ref('') }),
    template: '<VTextarea v-bind="args" v-model="value" style="width: 320px" />',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const textarea = canvas.getByLabelText('Message') as HTMLTextAreaElement
    await userEvent.type(textarea, 'brouillon')
    const clear = await canvas.findByRole('button', { name: 'Effacer' })
    await userEvent.click(clear)
    await waitFor(() => expect(textarea.value).toBe(''))
    await expect(textarea).toHaveFocus()
  },
}

export const Loading: Story = {
  args: { loading: true, iconEnd: 'edit', label: 'Génération' },
  render: (args) => ({
    components: { VTextarea },
    setup: () => ({ args, value: ref('Rédaction en cours…') }),
    template: '<VTextarea v-bind="args" v-model="value" style="width: 320px" />',
  }),
  play: async ({ canvasElement }) => {
    // le spinner remplace l'icône end
    await expect(within(canvasElement).getByRole('status')).toBeInTheDocument()
  },
}

export const Invalide: Story = {
  args: { invalid: true },
  play: async ({ canvasElement }) => {
    const textarea = within(canvasElement).getByRole('textbox')
    await expect(textarea).toHaveAttribute('aria-invalid', 'true')
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    label: 'Message',
    hint: 'Champ désactivé',
    iconStart: 'chat',
  },
  render: (args) => ({
    components: { VTextarea },
    setup: () => ({ args, value: ref('Tout passe en gris, sans opacité.') }),
    template: '<VTextarea v-bind="args" v-model="value" style="width: 320px" />',
  }),
}

export const Readonly: Story = {
  args: { readonly: true, label: 'Conditions', clearable: true },
  render: (args) => ({
    components: { VTextarea },
    setup: () => ({ args, value: ref('Contenu en lecture seule, non modifiable.') }),
    template: '<VTextarea v-bind="args" v-model="value" style="width: 320px" />',
  }),
}

export const VModel: Story = {
  render: () => ({
    components: { VTextarea },
    setup: () => ({ value: ref('') }),
    template: `
      <div style="display: grid; gap: 8px; width: 320px">
        <VTextarea v-model="value" aria-label="Démo v-model" />
        <output data-testid="mirror">{{ value }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(canvas.getByRole('textbox'), 'Bonjour')
    await expect(canvas.getByTestId('mirror')).toHaveTextContent('Bonjour')
  },
}

/** Vitrine : combinaisons de props pour voir toutes les possibilités d'un coup. */
export const Showcase: Story = {
  render: () => ({
    components: { VTextarea },
    setup: () => ({
      bio: ref('Développeuse Vue à Lyon.'),
      titre: ref('Un titre qui dépasse la limite autorisée'),
      note: ref(''),
      journal: ref('Entrée du 22 juillet : tout va bien.'),
    }),
    template: `
      <div style="display: grid; gap: 24px; width: 360px">
        <VTextarea
          v-model="bio"
          label="Bio"
          hint="Présentez-vous en quelques mots."
          counter
          :maxlength="200"
          icon-start="person"
          clearable
        />
        <VTextarea
          v-model="titre"
          label="Titre"
          hint="La limite est souple : le dépassement passe le champ en erreur."
          counter
          :maxlength="20"
          soft-limit
        />
        <VTextarea
          v-model="note"
          size="sm"
          label="Note auto-grow"
          hint="La hauteur suit le contenu."
          auto-grow
          placeholder="Écrivez, le champ grandit…"
        />
        <VTextarea v-model="journal" label="Génération" icon-end="edit" loading />
        <VTextarea v-model="journal" label="Archive" readonly />
        <VTextarea
          v-model="journal"
          label="Désactivé"
          hint="Tout passe en gris, sans opacité."
          icon-start="lock"
          disabled
        />
      </div>
    `,
  }),
}
