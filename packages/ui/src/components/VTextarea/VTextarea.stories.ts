import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import { storyText } from '../../stories/storyText'
import VTextarea from './VTextarea.vue'

const t = storyText({
  en: {
    yourMessage: 'Your message…',
    heightFollows: 'The height follows the content.\nAdd some lines…',
    autoGrowMessage: 'Auto-grow message',
    bioHint: 'Introduce yourself in a few words.',
    bioValue: 'Vue developer in Lyon.',
    tooLong: 'far too long a value',
    draft: 'draft',
    generation: 'Generation',
    writing: 'Writing…',
    disabledField: 'Disabled field',
    allGrey: 'Everything goes grey, with no opacity.',
    terms: 'Terms',
    readOnlyContent: 'Read-only content, not editable.',
    vModelDemo: 'v-model demo',
    hello: 'Hello',
    overLimit: 'A title that goes over the allowed limit',
    journalEntry: 'Entry of 22 July: all is well.',
    softHint: 'The limit is soft: exceeding it puts the field into error.',
    autoGrowNote: 'Auto-grow note',
    writeAndGrow: 'Write, and the field grows…',
    archive: 'Archive',
    disabled: 'Disabled',
    title: 'Title',
    readonlyOnly: 'Read-only',
    invalidOnly: 'In error',
    readonlyInvalid: 'Read-only and in error',
    rejectedTerms: 'These terms have been rejected.',
  },
  fr: {
    yourMessage: 'Votre message…',
    heightFollows: 'La hauteur suit le contenu.\nAjoutez des lignes…',
    autoGrowMessage: 'Message auto-grow',
    bioHint: 'Présentez-vous en quelques mots.',
    bioValue: 'Développeuse Vue à Lyon.',
    tooLong: 'beaucoup trop long',
    draft: 'brouillon',
    generation: 'Génération',
    writing: 'Rédaction en cours…',
    disabledField: 'Champ désactivé',
    allGrey: 'Tout passe en gris, sans opacité.',
    terms: 'Conditions',
    readOnlyContent: 'Contenu en lecture seule, non modifiable.',
    vModelDemo: 'Démo v-model',
    hello: 'Bonjour',
    overLimit: 'Un titre qui dépasse la limite autorisée',
    journalEntry: 'Entrée du 22 juillet : tout va bien.',
    softHint: 'La limite est souple : le dépassement passe le champ en erreur.',
    autoGrowNote: 'Note auto-grow',
    writeAndGrow: 'Écrivez, le champ grandit…',
    archive: 'Archive',
    disabled: 'Désactivé',
    title: 'Titre',
    readonlyOnly: 'Lecture seule',
    invalidOnly: 'En erreur',
    readonlyInvalid: 'Lecture seule et en erreur',
    rejectedTerms: 'Ces conditions ont été refusées.',
  },
})

const meta = {
  title: 'Components/Textarea',
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
    setup: () => ({ args, value: ref(''), t }),
    template:
      '<VTextarea v-bind="args" v-model="value" :placeholder="t.yourMessage" aria-label="Message" style="width: 320px" />',
  }),
} satisfies Meta<typeof VTextarea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const AutoGrow: Story = {
  args: { autoGrow: true },
  render: (args) => ({
    components: { VTextarea },
    setup: () => ({ args, value: ref(t.value.heightFollows), t }),
    template:
      '<VTextarea v-bind="args" v-model="value" :aria-label="t.autoGrowMessage" style="width: 320px" />',
  }),
}

export const Sizes: Story = {
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

/** Minimum height reduced by 4px, padding/type/icons unchanged (as in VButton). */
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

/** Counter under the field on the right, on the same line as the hint. */
export const LabelHintCounter: Story = {
  args: {
    label: 'Bio',
    hint: 'Introduce yourself in a few words.',
    counter: true,
    maxlength: 200,
  },
  render: (args) => ({
    components: { VTextarea },
    setup: () => ({ args, value: ref('Vue developer in Lyon.') }),
    template: '<VTextarea v-bind="args" v-model="value" style="width: 320px" />',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const textarea = canvas.getByLabelText('Bio')
    const hint = canvas.getByText('Introduce yourself in a few words.')
    await expect(textarea.getAttribute('aria-describedby')).toContain(hint.id)
    await expect(canvas.getByText('22/200')).toBeInTheDocument()
  },
}

/**
 * Soft limit: input goes over and the field enters error through native validation
 * (setCustomValidity → `:user-invalid` after interaction).
 */
export const SoftCounter: Story = {
  args: { counter: true, maxlength: 10, softLimit: true, label: 'Title' },
  render: (args) => ({
    components: { VTextarea },
    setup: () => ({ args, value: ref('') }),
    template: '<VTextarea v-bind="args" v-model="value" style="width: 320px" />',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const textarea = canvas.getByLabelText('Title') as HTMLTextAreaElement
    await userEvent.type(textarea, 'far too long a value')
    await waitFor(() => expect(textarea.value).toBe('far too long a value'))
    await expect(canvas.getByText('20/10')).toHaveAttribute('data-over')
    // native validity: setCustomValidity invalidated the field (:user-invalid
    // cannot be asserted, as it requires a *trusted* interaction)
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
    await userEvent.type(textarea, 'draft')
    const clear = await canvas.findByRole('button', { name: 'Clear' })
    await userEvent.click(clear)
    await waitFor(() => expect(textarea.value).toBe(''))
    await expect(textarea).toHaveFocus()
  },
}

export const Loading: Story = {
  args: { loading: true, iconEnd: 'edit', label: 'Generation' },
  render: (args) => ({
    components: { VTextarea },
    setup: () => ({ args, value: ref('Writing…') }),
    template: '<VTextarea v-bind="args" v-model="value" style="width: 320px" />',
  }),
  play: async ({ canvasElement }) => {
    // the spinner replaces the end icon
    await expect(within(canvasElement).getByRole('status')).toBeInTheDocument()
  },
}

export const Invalid: Story = {
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
    hint: 'Disabled field',
    iconStart: 'chat',
  },
  render: (args) => ({
    components: { VTextarea },
    setup: () => ({ args, value: ref('Everything goes grey, with no opacity.') }),
    template: '<VTextarea v-bind="args" v-model="value" style="width: 320px" />',
  }),
}

export const Readonly: Story = {
  args: { readonly: true, label: 'Terms', clearable: true },
  render: (args) => ({
    components: { VTextarea },
    setup: () => ({ args, value: ref('Read-only content, not editable.') }),
    template: '<VTextarea v-bind="args" v-model="value" style="width: 320px" />',
  }),
}

/**
 * `readonly` and `invalid` compose: the sunken background and the red border are
 * two independent decisions. On a read-only field the error can only come from
 * the `invalid` prop (`aria-invalid`) — a `<textarea readonly>` is barred from
 * constraint validation, so `:user-invalid` never applies to it.
 */
export const ReadonlyInvalid: Story = {
  render: () => ({
    components: { VTextarea },
    setup: () => ({ t }),
    template: `
      <div style="display: grid; gap: 12px; width: 320px">
        <VTextarea
          readonly
          :model-value="t.readOnlyContent"
          :label="t.readonlyOnly"
          data-testid="readonly"
        />
        <VTextarea
          invalid
          :model-value="t.readOnlyContent"
          :label="t.invalidOnly"
          data-testid="invalid"
        />
        <VTextarea
          readonly
          invalid
          :model-value="t.readOnlyContent"
          :label="t.readonlyInvalid"
          :hint="t.rejectedTerms"
          data-testid="both"
        />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    // data-testid lands on the <textarea> (inheritAttrs: false), hence the closest().
    const border = (id: string) =>
      getComputedStyle(
        canvasElement.querySelector(`[data-testid="${id}"]`)!.closest('.v-textarea-field')!,
      ).borderColor

    /* Every state block weighs (0,3,0) — :has() takes the specificity of its
       argument — so source order alone decides. Verified red by moving the
       [data-readonly] block back after the invalid one. */
    await expect(border('both')).toBe(border('invalid'))
    await expect(border('both')).not.toBe(border('readonly'))
  },
}

export const VModel: Story = {
  render: () => ({
    components: { VTextarea },
    setup: () => ({ value: ref(''), t }),
    template: `
      <div style="display: grid; gap: 8px; width: 320px">
        <VTextarea v-model="value" :aria-label="t.vModelDemo" />
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
    components: { VTextarea },
    setup: () => ({
      bio: ref('Vue developer in Lyon.'),
      heading: ref('A title that goes over the allowed limit'),
      note: ref(''),
      journal: ref('Entry of 22 July: all is well.'),
      t,
    }),
    template: `
      <div style="display: grid; gap: 24px; width: 360px">
        <VTextarea
          v-model="bio"
          label="Bio"
          :hint="t.bioHint"
          counter
          :maxlength="200"
          icon-start="person"
          clearable
        />
        <VTextarea
          v-model="heading"
          :label="t.title"
          :hint="t.softHint"
          counter
          :maxlength="20"
          soft-limit
        />
        <VTextarea
          v-model="note"
          size="sm"
          :label="t.autoGrowNote"
          hint="The height follows the content."
          auto-grow
          :placeholder="t.writeAndGrow"
        />
        <VTextarea v-model="journal" :label="t.generation" icon-end="edit" loading />
        <VTextarea v-model="journal" :label="t.archive" readonly />
        <VTextarea
          v-model="journal"
          :label="t.disabled"
          :hint="t.allGrey"
          icon-start="lock"
          disabled
        />
      </div>
    `,
  }),
}
