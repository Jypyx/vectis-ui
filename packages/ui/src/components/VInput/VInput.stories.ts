import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import Button from '../VButton/VButton.vue'
import Input from './VInput.vue'

const meta = {
  title: 'Composants/Input',
  component: Input,
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    type: {
      control: 'select',
      options: ['text', 'email', 'number', 'password', 'search', 'tel', 'url'],
    },
  },
  args: {
    size: 'md',
    type: 'text',
    invalid: false,
    disabled: false,
  },
  render: (args) => ({
    components: { Input },
    setup: () => ({ args, value: ref('') }),
    template:
      '<Input v-bind="args" v-model="value" placeholder="votre@email.fr" aria-label="Email" />',
  }),
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Tailles: Story = {
  render: () => ({
    components: { Input },
    template: `
      <div style="display: grid; gap: 8px; width: 260px">
        <Input size="sm" placeholder="Small" aria-label="Small" />
        <Input size="md" placeholder="Medium" aria-label="Medium" />
        <Input size="lg" placeholder="Large" aria-label="Large" />
      </div>
    `,
  }),
}

/** Hauteur réduite de 4px, padding/typo/icônes inchangés (comme Button). */
export const Compact: Story = {
  render: () => ({
    components: { Input },
    template: `
      <div style="display: grid; gap: 8px; width: 260px">
        <Input placeholder="Normal" aria-label="Normal" />
        <Input compact placeholder="Compact" aria-label="Compact" />
        <Input compact size="lg" placeholder="Large compact" aria-label="Large compact" />
      </div>
    `,
  }),
}

export const LabelEtHint: Story = {
  args: {
    label: 'Adresse email',
    hint: 'Utilisée uniquement pour la confirmation de commande.',
  },
  render: (args) => ({
    components: { Input },
    setup: () => ({ args, value: ref('') }),
    template: '<Input v-bind="args" v-model="value" placeholder="votre@email.fr" />',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // l'association for/id rend le champ requêtable par son label
    const input = canvas.getByLabelText('Adresse email')
    const hint = canvas.getByText('Utilisée uniquement pour la confirmation de commande.')
    await expect(input.getAttribute('aria-describedby')).toContain(hint.id)
  },
}

export const Icones: Story = {
  args: { iconStart: 'search', iconEnd: 'tune' },
  play: async ({ canvasElement }) => {
    // icônes décoratives : aucun bouton dans le champ
    await expect(within(canvasElement).queryByRole('button')).toBeNull()
  },
}

export const IconesCliquables: Story = {
  args: {
    iconEnd: 'visibility',
    iconEndLabel: 'Afficher le mot de passe',
    'onClick:icon-end': fn(),
  },
  render: (args) => ({
    components: { Input },
    setup: () => ({ args, value: ref('') }),
    template: '<Input v-bind="args" v-model="value" type="password" aria-label="Mot de passe" />',
  }),
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button', {
      name: 'Afficher le mot de passe',
    })
    await userEvent.click(button)
    await expect(args['onClick:icon-end']).toHaveBeenCalled()
  },
}

export const Compteur: Story = {
  args: { counter: true, maxlength: 20, label: 'Pseudo' },
  render: (args) => ({
    components: { Input },
    setup: () => ({ args, value: ref('') }),
    template: '<Input v-bind="args" v-model="value" />',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByLabelText('Pseudo') as HTMLInputElement
    // maxlength natif : la saisie est tronquée à 20
    await userEvent.type(input, 'abcdefghijklmnopqrstuvwxy')
    await waitFor(() => expect(input.value).toHaveLength(20))
    await expect(canvas.getByText('20/20')).toBeInTheDocument()
  },
}

/**
 * Limite souple : la saisie dépasse, le champ passe en erreur via la
 * validation native (setCustomValidity → `:user-invalid` après interaction).
 */
export const CompteurSoft: Story = {
  args: { counter: true, maxlength: 10, softLimit: true, label: 'Titre' },
  render: (args) => ({
    components: { Input },
    setup: () => ({ args, value: ref('') }),
    template: '<Input v-bind="args" v-model="value" />',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByLabelText('Titre') as HTMLInputElement
    await userEvent.type(input, 'beaucoup trop long')
    // la saisie n'est pas tronquée, le compteur passe en dépassement
    await waitFor(() => expect(input.value).toBe('beaucoup trop long'))
    await expect(canvas.getByText('18/10')).toHaveAttribute('data-over')
    // le dépassement invalide le champ via setCustomValidity. On asserte sur la
    // validité native, pas sur :user-invalid : ce pseudo-état exige une
    // interaction *trusted* que les événements synthétiques ne fournissent pas.
    await waitFor(() => expect(input.validity.customError).toBe(true))
    await expect(input.matches(':invalid')).toBe(true)
  },
}

/** Le `pattern` reste l'attribut natif en fallthrough — zéro JS. */
export const Pattern: Story = {
  render: () => ({
    components: { Input },
    setup: () => ({ value: ref('') }),
    template: `
      <Input
        v-model="value"
        label="Code postal"
        hint="5 chiffres"
        pattern="[0-9]{5}"
      />
    `,
  }),
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByLabelText('Code postal') as HTMLInputElement
    await userEvent.type(input, 'abc')
    // validité native : patternMismatch (on ne peut pas asserter :user-invalid,
    // qui exige une interaction *trusted* — cf. CompteurSoft)
    await waitFor(() => expect(input.validity.patternMismatch).toBe(true))
    await expect(input.matches(':invalid')).toBe(true)
  },
}

export const Loading: Story = {
  args: { loading: true, iconEnd: 'search', label: 'Recherche' },
  render: (args) => ({
    components: { Input },
    setup: () => ({ args, value: ref('métro') }),
    template: '<Input v-bind="args" v-model="value" />',
  }),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('status')).toBeInTheDocument()
  },
}

export const Clearable: Story = {
  args: { clearable: true, label: 'Recherche' },
  render: (args) => ({
    components: { Input },
    setup: () => ({ args, value: ref('') }),
    template: '<Input v-bind="args" v-model="value" />',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByLabelText('Recherche') as HTMLInputElement
    await userEvent.type(input, 'chaussettes')
    const clear = await canvas.findByRole('button', { name: 'Effacer' })
    await userEvent.click(clear)
    await waitFor(() => expect(input.value).toBe(''))
    // le bouton disparaît et le focus revient au champ
    await expect(canvas.queryByRole('button', { name: 'Effacer' })).toBeNull()
    await expect(input).toHaveFocus()
  },
}

export const Invalide: Story = {
  args: { invalid: true },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('textbox')
    await expect(input).toHaveAttribute('aria-invalid', 'true')
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    label: 'Email',
    hint: 'Champ désactivé',
    iconStart: 'mail',
  },
  render: (args) => ({
    components: { Input },
    setup: () => ({ args, value: ref('gris@partout.fr') }),
    template: '<Input v-bind="args" v-model="value" />',
  }),
}

export const Readonly: Story = {
  args: { readonly: true, label: 'Référence', clearable: true },
  render: (args) => ({
    components: { Input },
    setup: () => ({ args, value: ref('CMD-2026-0042') }),
    template: '<Input v-bind="args" v-model="value" />',
  }),
}

export const PlaceholderLong: Story = {
  render: () => ({
    components: { Input },
    template: `
      <div style="width: 200px">
        <Input
          placeholder="Un placeholder anormalement long qui doit être tronqué proprement"
          aria-label="Démo placeholder long"
        />
      </div>
    `,
  }),
}

/**
 * Validation native : `required` + soumission → le style d'erreur vient de
 * `:user-invalid`, sans le moindre JS de validation.
 */
export const ValidationNative: Story = {
  render: () => ({
    components: { Input, Button },
    setup: () => ({ email: ref('') }),
    template: `
      <form novalidate="false" style="display: flex; gap: 8px; align-items: start" @submit.prevent>
        <Input v-model="email" type="email" required placeholder="votre@email.fr" aria-label="Email" />
        <Button type="submit">S'abonner</Button>
      </form>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('textbox') as HTMLInputElement
    // saisir une valeur invalide puis tenter de soumettre déclenche :user-invalid
    await userEvent.type(input, 'pas-un-email')
    await userEvent.click(canvas.getByRole('button', { name: "S'abonner" }))
    await expect(input.validity.valid).toBe(false)
    await expect(input.matches(':user-invalid')).toBe(true)
  },
}

export const VModel: Story = {
  render: () => ({
    components: { Input },
    setup: () => ({ value: ref('') }),
    template: `
      <div style="display: grid; gap: 8px; width: 260px">
        <Input v-model="value" placeholder="Tapez ici" aria-label="Démo v-model" />
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
    components: { Input },
    setup: () => ({
      search: ref(''),
      pseudo: ref('Xavier'),
      bio: ref('Une phrase qui dépasse la limite'),
      password: ref('hunter2'),
      ref_: ref('CMD-2026-0042'),
      onSearch: () => {},
    }),
    template: `
      <div style="display: grid; gap: 24px; width: 340px">
        <Input
          v-model="search"
          label="Recherche"
          hint="Appuyez sur Entrée pour lancer la recherche."
          icon-start="search"
          clearable
          placeholder="Que cherchez-vous ?"
        />
        <Input
          v-model="pseudo"
          label="Pseudo"
          hint="Visible par les autres membres."
          counter
          :maxlength="20"
        />
        <Input
          v-model="bio"
          label="Titre"
          hint="La limite est souple : le dépassement passe le champ en erreur."
          counter
          :maxlength="20"
          soft-limit
        />
        <Input
          v-model="password"
          type="password"
          label="Mot de passe"
          icon-start="lock"
          icon-end="visibility"
          icon-end-label="Afficher le mot de passe"
          @click:icon-end="onSearch"
        />
        <Input
          v-model="search"
          size="sm"
          label="Chargement"
          icon-end="search"
          loading
          placeholder="Recherche en cours…"
        />
        <Input
          v-model="search"
          compact
          label="Compact"
          icon-start="search"
          clearable
          placeholder="Hauteur réduite de 4px"
        />
        <Input v-model="ref_" label="Référence" readonly icon-start="tag" />
        <Input
          v-model="ref_"
          label="Désactivé"
          hint="Tout passe en gris, sans opacité."
          icon-start="lock"
          disabled
        />
      </div>
    `,
  }),
}
