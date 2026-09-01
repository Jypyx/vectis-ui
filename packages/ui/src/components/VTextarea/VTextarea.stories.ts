import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import { storyText } from '../../stories/storyText'
import VInput from '../VInput/VInput.vue'
import VTextarea from './VTextarea.vue'

const t = storyText({
  en: {
    yourMessage: 'Your message…',
    forComparison: 'A VInput, for comparison',
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
    forComparison: 'Un VInput, pour comparer',
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

/**
 * `rows` is the number of lines the field shows, and it is what gives the field its
 * height — there is no CSS floor underneath. At `rows="1"` it is exactly a VInput of
 * the same size, and every further row adds one line box.
 */
export const Rows: Story = {
  render: () => ({
    components: { VTextarea, VInput },
    setup: () => ({ t }),
    template: `
      <div style="display: grid; gap: 8px; width: 320px">
        <VInput aria-label="Input" data-testid="input" :placeholder="t.forComparison" />
        <VTextarea :rows="1" aria-label="One row" data-testid="rows-1" placeholder="rows=1" />
        <VTextarea :rows="2" aria-label="Two rows" data-testid="rows-2" placeholder="rows=2" />
        <VTextarea aria-label="Five rows" data-testid="rows-5" placeholder="rows=5 (default)" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    /* Two claims a browser alone can settle, jsdom laying nothing out.

       One: `rows="1"` is a VInput to the pixel. That is the whole reason the padding is
       derived from the control height, and it only holds because the icon and button
       offsets are SYMMETRIC — an asymmetric one leaves the clear cross taller than the
       line box and the field 1.5px over.

       Two: a row costs exactly one line box, so the height is affine in `rows`. A
       `min-height` on the field breaks it, pinning every count to the same height. */
    const boxOf = (id: string, field: string) =>
      canvasElement
        .querySelector(`[data-testid="${id}"]`)!
        .closest(field)!
        .querySelector(`${field}-field`)!
        .getBoundingClientRect().height

    const input = boxOf('input', '.v-input')
    const one = boxOf('rows-1', '.v-textarea')
    const two = boxOf('rows-2', '.v-textarea')
    const five = boxOf('rows-5', '.v-textarea')

    await expect(Math.abs(one - input)).toBeLessThan(0.5)
    const line = two - one
    await expect(line).toBeGreaterThan(0)
    await expect(Math.abs(five - (one + 4 * line))).toBeLessThan(0.5)
  },
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

/**
 * 4px off the field, taken from the padding — the only lever left now that the height
 * comes from `rows`. The number of lines, the type and the icons are unchanged.
 */
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
  args: { clearable: true, label: 'Message', iconStart: 'person' },
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

    /* The decorative icon and the clear cross are offset onto the SAME first line box,
       so they read as one row alongside the text — VInput's alignment, on a field whose
       height varies. Nothing but a browser can see this: jsdom lays nothing out.

       The offsets must NOT be written as `1lh`: the browser resolves that against each
       element's OWN font, and an icon carries a 20px one against the field's 14px, which
       sits it 4.5px below the cross. */
    const middleOf = (el: Element) => {
      const rect = el.getBoundingClientRect()
      return rect.top + rect.height / 2
    }
    const icon = canvasElement.querySelector('.v-textarea-field > .v-icon')!
    await expect(Math.abs(middleOf(icon) - middleOf(clear))).toBeLessThan(1)

    // …and that row is the FIRST line, not the middle of a field two lines tall: this
    // is what would go red if the alignment were "fixed" with `align-items: center`.
    const field = canvasElement.querySelector('.v-textarea-field')!.getBoundingClientRect()
    await expect(middleOf(icon) - field.top).toBeLessThan(field.height / 2)

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
