import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import { storyText } from '../../stories/storyText'
import VButton from '../VButton/VButton.vue'
import VInput from './VInput.vue'

const t = storyText({
  en: {
    emailLabel: 'Email address',
    emailHint: 'Used only for order confirmation.',
    emailPlaceholder: 'you@example.com',
    showPassword: 'Show the password',
    password: 'Password',
    nickname: 'Nickname',
    title: 'Title',
    postcode: 'Postcode',
    fiveDigits: '5 digits',
    searchLabel: 'Search',
    metro: 'metro',
    socks: 'socks',
    disabledField: 'Disabled field',
    reference: 'Reference',
    longPlaceholder: 'An abnormally long placeholder that must be truncated cleanly',
    longPlaceholderDemo: 'Long placeholder demo',
    subscribe: 'Subscribe',
    notAnEmail: 'not-an-email',
    typeHere: 'Type here',
    vModelDemo: 'v-model demo',
    hello: 'Hello',
    searchHint: 'Press Enter to run the search.',
    searchPlaceholder: 'What are you looking for?',
    nicknameHint: 'Visible to other members.',
    softHint: 'The limit is soft: exceeding it puts the field into error.',
    loading: 'Loading',
    searching: 'Searching…',
    compact: 'Compact',
    reducedHeight: 'Height reduced by 4px',
    disabled: 'Disabled',
    greyHint: 'Everything goes grey, with no opacity.',
    overLimit: 'A sentence that goes over the limit',
    tooLong: 'far too long a value',
    readonlyOnly: 'Read-only',
    invalidOnly: 'In error',
    readonlyInvalid: 'Read-only and in error',
    unknownReference: 'This reference no longer exists.',
  },
  fr: {
    emailLabel: 'Adresse email',
    emailHint: 'Utilisée uniquement pour la confirmation de commande.',
    emailPlaceholder: 'votre@email.fr',
    showPassword: 'Afficher le mot de passe',
    password: 'Mot de passe',
    nickname: 'Pseudo',
    title: 'Titre',
    postcode: 'Code postal',
    fiveDigits: '5 chiffres',
    searchLabel: 'Recherche',
    metro: 'métro',
    socks: 'chaussettes',
    disabledField: 'Champ désactivé',
    reference: 'Référence',
    longPlaceholder: 'Un placeholder anormalement long qui doit être tronqué proprement',
    longPlaceholderDemo: 'Démo placeholder long',
    subscribe: "S'abonner",
    notAnEmail: 'pas-un-email',
    typeHere: 'Tapez ici',
    vModelDemo: 'Démo v-model',
    hello: 'Bonjour',
    searchHint: 'Appuyez sur Entrée pour lancer la recherche.',
    searchPlaceholder: 'Que cherchez-vous ?',
    nicknameHint: 'Visible par les autres membres.',
    softHint: 'La limite est souple : le dépassement passe le champ en erreur.',
    loading: 'Chargement',
    searching: 'Recherche en cours…',
    compact: 'Compact',
    reducedHeight: 'Hauteur réduite de 4px',
    disabled: 'Désactivé',
    greyHint: 'Tout passe en gris, sans opacité.',
    overLimit: 'Une phrase qui dépasse la limite',
    tooLong: 'beaucoup trop long',
    readonlyOnly: 'Lecture seule',
    invalidOnly: 'En erreur',
    readonlyInvalid: 'Lecture seule et en erreur',
    unknownReference: "Cette référence n'existe plus.",
  },
})

const meta = {
  title: 'Components/Input',
  component: VInput,
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
    components: { VInput },
    setup: () => ({ args, value: ref('') }),
    template:
      '<VInput v-bind="args" v-model="value" placeholder="votre@email.fr" aria-label="Email" />',
  }),
} satisfies Meta<typeof VInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Sizes: Story = {
  render: () => ({
    components: { VInput },
    template: `
      <div style="display: grid; gap: 8px; width: 260px">
        <VInput size="sm" placeholder="Small" aria-label="Small" />
        <VInput size="md" placeholder="Medium" aria-label="Medium" />
        <VInput size="lg" placeholder="Large" aria-label="Large" />
      </div>
    `,
  }),
}

/** Height reduced by 4px, padding/type/icons unchanged (as in VButton). */
export const Compact: Story = {
  render: () => ({
    components: { VInput },
    template: `
      <div style="display: grid; gap: 8px; width: 260px">
        <VInput placeholder="Normal" aria-label="Normal" />
        <VInput compact placeholder="Compact" aria-label="Compact" />
        <VInput compact size="lg" placeholder="Large compact" aria-label="Large compact" />
      </div>
    `,
  }),
}

export const LabelAndHint: Story = {
  args: {
    label: 'Email address',
    hint: 'Used only for order confirmation.',
  },
  render: (args) => ({
    components: { VInput },
    setup: () => ({ args, value: ref(''), t }),
    template: '<VInput v-bind="args" v-model="value" :placeholder="t.emailPlaceholder" />',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // the for/id association makes the field queryable by its label
    const input = canvas.getByLabelText('Email address')
    const hint = canvas.getByText('Used only for order confirmation.')
    await expect(input.getAttribute('aria-describedby')).toContain(hint.id)
  },
}

export const Icons: Story = {
  args: { iconStart: 'search', iconEnd: 'tune' },
  play: async ({ canvasElement }) => {
    // decorative icons: no button inside the field
    await expect(within(canvasElement).queryByRole('button')).toBeNull()
  },
}

export const ClickableIcons: Story = {
  args: {
    iconEnd: 'visibility',
    iconEndLabel: 'Show the password',
    'onClick:icon-end': fn(),
  },
  render: (args) => ({
    components: { VInput },
    setup: () => ({ args, value: ref(''), t }),
    template: '<VInput v-bind="args" v-model="value" type="password" :aria-label="t.password" />',
  }),
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button', {
      name: 'Show the password',
    })
    await userEvent.click(button)
    await expect(args['onClick:icon-end']).toHaveBeenCalled()
  },
}

export const Counter: Story = {
  args: { counter: true, maxlength: 20, label: 'Nickname' },
  render: (args) => ({
    components: { VInput },
    setup: () => ({ args, value: ref('') }),
    template: '<VInput v-bind="args" v-model="value" />',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByLabelText('Nickname') as HTMLInputElement
    // native maxlength: input is truncated at 20
    await userEvent.type(input, 'abcdefghijklmnopqrstuvwxy')
    await waitFor(() => expect(input.value).toHaveLength(20))
    await expect(canvas.getByText('20/20')).toBeInTheDocument()
  },
}

/**
 * Soft limit: input goes over and the field enters error through native validation
 * (setCustomValidity → `:user-invalid` after interaction).
 */
export const SoftCounter: Story = {
  args: { counter: true, maxlength: 10, softLimit: true, label: 'Title' },
  render: (args) => ({
    components: { VInput },
    setup: () => ({ args, value: ref('') }),
    template: '<VInput v-bind="args" v-model="value" />',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByLabelText('Title') as HTMLInputElement
    await userEvent.type(input, 'far too long a value')
    // the input is not truncated, the counter goes into overflow
    await waitFor(() => expect(input.value).toBe('far too long a value'))
    await expect(canvas.getByText('20/10')).toHaveAttribute('data-over')
    // the overflow invalidates the field through setCustomValidity. Assert on
    // native validity, not on :user-invalid: that pseudo-state requires a
    // *trusted* interaction, which synthetic events do not provide.
    await waitFor(() => expect(input.validity.customError).toBe(true))
    await expect(input.matches(':invalid')).toBe(true)
  },
}

/** `pattern` stays the native attribute through fallthrough — zero JS. */
export const Pattern: Story = {
  render: () => ({
    components: { VInput },
    setup: () => ({ value: ref(''), t }),
    template: `
      <VInput
        v-model="value"
        :label="t.postcode"
        :hint="t.fiveDigits"
        pattern="[0-9]{5}"
      />
    `,
  }),
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByLabelText('Postcode') as HTMLInputElement
    await userEvent.type(input, 'abc')
    // native validity: patternMismatch (:user-invalid cannot be asserted, as it
    // requires a *trusted* interaction — see SoftCounter)
    await waitFor(() => expect(input.validity.patternMismatch).toBe(true))
    await expect(input.matches(':invalid')).toBe(true)
  },
}

export const Loading: Story = {
  args: { loading: true, iconEnd: 'search', label: 'Search' },
  render: (args) => ({
    components: { VInput },
    setup: () => ({ args, value: ref('metro') }),
    template: '<VInput v-bind="args" v-model="value" />',
  }),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('status')).toBeInTheDocument()
  },
}

export const Clearable: Story = {
  args: { clearable: true, label: 'Search' },
  render: (args) => ({
    components: { VInput },
    setup: () => ({ args, value: ref('') }),
    template: '<VInput v-bind="args" v-model="value" />',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByLabelText('Search') as HTMLInputElement
    await userEvent.type(input, 'socks')
    const clear = await canvas.findByRole('button', { name: 'Clear' })
    await userEvent.click(clear)
    await waitFor(() => expect(input.value).toBe(''))
    // the button disappears and focus returns to the field
    await expect(canvas.queryByRole('button', { name: 'Clear' })).toBeNull()
    await expect(input).toHaveFocus()
  },
}

export const Invalid: Story = {
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
    hint: 'Disabled field',
    iconStart: 'mail',
  },
  render: (args) => ({
    components: { VInput },
    setup: () => ({ args, value: ref('grey@everywhere.com') }),
    template: '<VInput v-bind="args" v-model="value" />',
  }),
}

export const Readonly: Story = {
  args: { readonly: true, label: 'Reference', clearable: true },
  render: (args) => ({
    components: { VInput },
    setup: () => ({ args, value: ref('CMD-2026-0042') }),
    template: '<VInput v-bind="args" v-model="value" />',
  }),
}

/**
 * `readonly` and `invalid` compose: the sunken background and the red border are
 * two independent decisions. On a read-only field the error can only come from
 * the `invalid` prop (`aria-invalid`) — a `<input readonly>` is barred from
 * constraint validation, so `:user-invalid` never applies to it.
 */
export const ReadonlyInvalid: Story = {
  render: () => ({
    components: { VInput },
    setup: () => ({ t }),
    template: `
      <div style="display: grid; gap: 12px; width: 320px">
        <VInput
          readonly
          model-value="CMD-2026-0042"
          :label="t.readonlyOnly"
          data-testid="readonly"
        />
        <VInput invalid model-value="CMD-2026-0042" :label="t.invalidOnly" data-testid="invalid" />
        <VInput
          readonly
          invalid
          model-value="CMD-2026-0042"
          :label="t.readonlyInvalid"
          :hint="t.unknownReference"
          data-testid="both"
        />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    // data-testid lands on the <input> (inheritAttrs: false), hence the closest().
    const border = (id: string) =>
      getComputedStyle(
        canvasElement.querySelector(`[data-testid="${id}"]`)!.closest('.v-input-field')!,
      ).borderColor

    /* Every state block weighs (0,3,0) — :has() takes the specificity of its
       argument — so source order alone decides. Verified red by moving the
       [data-readonly] block back after the invalid one. */
    await expect(border('both')).toBe(border('invalid'))
    await expect(border('both')).not.toBe(border('readonly'))
  },
}

export const LongPlaceholder: Story = {
  render: () => ({
    components: { VInput },
    setup: () => ({ t }),
    template: `
      <div style="width: 200px">
        <VInput
          :placeholder="t.longPlaceholder"
          :aria-label="t.longPlaceholderDemo"
        />
      </div>
    `,
  }),
}

/**
 * Native validation: `required` + submission → the error styling comes from
 * `:user-invalid`, with no validation JS at all.
 */
export const NativeValidation: Story = {
  render: () => ({
    components: { VInput, VButton },
    setup: () => ({ email: ref(''), t }),
    template: `
      <form novalidate="false" style="display: flex; gap: 8px; align-items: start" @submit.prevent>
        <VInput v-model="email" type="email" required :placeholder="t.emailPlaceholder" aria-label="Email" />
        <VButton type="submit">{{ t.subscribe }}</VButton>
      </form>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('textbox') as HTMLInputElement
    // typing an invalid value then attempting to submit triggers :user-invalid
    await userEvent.type(input, 'not-an-email')
    await userEvent.click(canvas.getByRole('button', { name: 'Subscribe' }))
    await expect(input.validity.valid).toBe(false)
    await expect(input.matches(':user-invalid')).toBe(true)
  },
}

export const VModel: Story = {
  render: () => ({
    components: { VInput },
    setup: () => ({ value: ref(''), t }),
    template: `
      <div style="display: grid; gap: 8px; width: 260px">
        <VInput v-model="value" :placeholder="t.typeHere" :aria-label="t.vModelDemo" />
        <output data-testid="mirror">{{ value }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(canvas.getByRole('textbox'), 'Hello')
    await expect(canvas.getByTestId('mirror')).toHaveTextContent('Hello')
  },
}

/** Showcase: prop combinations, to see every possibility at once. */
export const Showcase: Story = {
  render: () => ({
    components: { VInput },
    setup: () => ({
      search: ref(''),
      nickname: ref('Xavier'),
      bio: ref('A sentence that goes over the limit'),
      password: ref('hunter2'),
      ref_: ref('CMD-2026-0042'),
      onSearch: () => {},
      t,
    }),
    template: `
      <div style="display: grid; gap: 24px; width: 340px">
        <VInput
          v-model="search"
          :label="t.searchLabel"
          :hint="t.searchHint"
          icon-start="search"
          clearable
          :placeholder="t.searchPlaceholder"
        />
        <VInput
          v-model="nickname"
          :label="t.nickname"
          :hint="t.nicknameHint"
          counter
          :maxlength="20"
        />
        <VInput
          v-model="bio"
          :label="t.title"
          :hint="t.softHint"
          counter
          :maxlength="20"
          soft-limit
        />
        <VInput
          v-model="password"
          type="password"
          :label="t.password"
          icon-start="lock"
          icon-end="visibility"
          :icon-end-label="t.showPassword"
          @click:icon-end="onSearch"
        />
        <VInput
          v-model="search"
          size="sm"
          :label="t.loading"
          icon-end="search"
          loading
          :placeholder="t.searching"
        />
        <VInput
          v-model="search"
          compact
          :label="t.compact"
          icon-start="search"
          clearable
          :placeholder="t.reducedHeight"
        />
        <VInput v-model="ref_" :label="t.reference" readonly icon-start="tag" />
        <VInput
          v-model="ref_"
          :label="t.disabled"
          :hint="t.greyHint"
          icon-start="lock"
          disabled
        />
      </div>
    `,
  }),
}
