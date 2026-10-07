import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { computed, ref } from 'vue'

import { builtinIcons as icons } from '../VIcon/icons'
import { storyText } from '../../stories/storyText'
import VInput from '../VInput/VInput.vue'
import VTextarea from '../VTextarea/VTextarea.vue'
import VField from './VField.vue'

const t = storyText({
  en: {
    email: 'Email',
    emailHint: 'We send the receipt to this address.',
    emailError: 'Enter an email address that contains an @.',
    country: 'Country',
    search: 'Search',
    name: 'Full name',
    bio: 'About you',
    bioHint: 'A few lines shown on your profile.',
    france: 'France',
    belgium: 'Belgium',
    canada: 'Canada',
    expiry: 'Expiry date',
    expiryHint: 'As printed on the card.',
    month: 'Month',
    year: 'Year',
  },
  fr: {
    email: 'E-mail',
    emailHint: 'Nous envoyons le reçu à cette adresse.',
    emailError: 'Saisissez une adresse e-mail qui contient un @.',
    country: 'Pays',
    search: 'Rechercher',
    name: 'Nom complet',
    bio: 'À propos de vous',
    bioHint: 'Quelques lignes affichées sur votre profil.',
    france: 'France',
    belgium: 'Belgique',
    canada: 'Canada',
    expiry: 'Date d’expiration',
    expiryHint: 'Telle qu’imprimée sur la carte.',
    month: 'Mois',
    year: 'Année',
  },
})

const meta = {
  title: 'Components/Field',
  component: VField,
  argTypes: {
    label: { control: 'text' },
    hint: { control: 'text' },
    error: { control: 'text' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
    hideLabel: { control: 'boolean' },
    labelPosition: { control: 'inline-radio', options: ['top', 'start'] },
  },
  args: {
    label: 'Email',
    hint: 'We send the receipt to this address.',
    required: false,
    disabled: false,
    hideLabel: false,
    labelPosition: 'top',
  },
  render: (args) => ({
    components: { VField, VInput },
    setup: () => ({ args }),
    template: `
      <VField v-bind="args" v-slot="{ fieldProps }" style="max-width: 360px">
        <VInput v-bind="fieldProps" type="email" />
      </VField>
    `,
  }),
} satisfies Meta<typeof VField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** A native element takes the same slot props as a library control. */
export const NativeControl: Story = {
  render: () => ({
    components: { VField },
    setup: () => ({ t }),
    template: `
      <VField :label="t.country" v-slot="{ fieldProps }" style="max-width: 360px">
        <select v-bind="fieldProps">
          <option>{{ t.france }}</option>
          <option>{{ t.belgium }}</option>
          <option>{{ t.canada }}</option>
        </select>
      </VField>
    `,
  }),
}

/**
 * The error is validated when the field is left, replaces the hint and is announced.
 * Fixing the value clears it.
 */
export const WithError: Story = {
  render: () => ({
    components: { VField, VInput },
    setup: () => {
      const email = ref('')
      const touched = ref(false)
      const error = computed(() =>
        touched.value && !email.value.includes('@') ? t.value.emailError : undefined,
      )
      return { t, email, touched, error }
    },
    template: `
      <VField :label="t.email" :hint="t.emailHint" :error="error" required v-slot="{ fieldProps }" style="max-width: 360px">
        <VInput v-bind="fieldProps" v-model="email" @blur="touched = true" />
      </VField>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('textbox', { name: 'Email' })
    await expect(input).toBeRequired()
    await expect(input).not.toHaveAttribute('aria-invalid')

    await userEvent.type(input, 'reader')
    await userEvent.tab()
    await waitFor(() => expect(input).toHaveAttribute('aria-invalid', 'true'))
    // The error takes the place of the hint, in the description as on screen.
    await expect(input).toHaveAccessibleDescription('Enter an email address that contains an @.')
    // The control renders a live region of its own, empty here: the field's is the one speaking.
    const regions = () => [...canvasElement.querySelectorAll('[aria-live="polite"]')]
    await waitFor(() =>
      expect(
        regions().some((el) => el.textContent === 'Enter an email address that contains an @.'),
      ).toBe(true),
    )

    await userEvent.type(input, '@example.com')
    await waitFor(() => expect(input).not.toHaveAttribute('aria-invalid'))
  },
}

/**
 * `labelPosition="start"` puts the label in a column of its own. Below the width of both, the
 * label moves back above: compare the two widths.
 */
export const LabelStart: Story = {
  render: () => ({
    components: { VField, VInput, VTextarea },
    setup: () => ({ t }),
    template: `
      <div style="display: grid; gap: 32px">
        <div v-for="width in [560, 320]" :key="width" :style="{ display: 'grid', gap: '16px', maxWidth: width + 'px' }">
          <VField :label="t.name" label-position="start" required v-slot="{ fieldProps }">
            <VInput v-bind="fieldProps" />
          </VField>
          <VField :label="t.bio" label-position="start" :hint="t.bioHint" v-slot="{ fieldProps }">
            <VTextarea v-bind="fieldProps" />
          </VField>
        </div>
      </div>
    `,
  }),
}

/** `hideLabel` keeps the name for assistive technology, for a field whose purpose is visible. */
export const HiddenLabel: Story = {
  render: () => ({
    components: { VField, VInput },
    setup: () => ({ t, icons }),
    template: `
      <VField :label="t.search" hide-label v-slot="{ fieldProps }" style="max-width: 360px">
        <VInput v-bind="fieldProps" type="search" :icon-start="icons.search" />
      </VField>
    `,
  }),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('searchbox', { name: 'Search' })).toBeVisible()
  },
}

/** `group` names a row of elements through `aria-labelledby` rather than `<label for>`. */
export const Group: Story = {
  render: () => ({
    components: { VField, VInput },
    setup: () => ({ t }),
    template: `
      <VField :label="t.expiry" :hint="t.expiryHint" group v-slot="{ fieldProps }">
        <div v-bind="fieldProps" role="group" style="display: flex; gap: 8px; max-width: 240px">
          <VInput :aria-label="t.month" inputmode="numeric" />
          <VInput :aria-label="t.year" inputmode="numeric" />
        </div>
      </VField>
    `,
  }),
  play: async ({ canvasElement }) => {
    const group = within(canvasElement).getByRole('group', { name: 'Expiry date' })
    await expect(group).toHaveAccessibleDescription('As printed on the card.')
  },
}

/** The `meta` slot shares the hint's line; its `id` joins the control's description. */
export const WithMeta: Story = {
  render: () => ({
    components: { VField },
    setup: () => ({ t, bio: ref('') }),
    template: `
      <VField :label="t.bio" :hint="t.bioHint" style="max-width: 360px">
        <template #default="{ fieldProps }">
          <textarea v-bind="fieldProps" v-model="bio" maxlength="160" />
        </template>
        <template #meta="{ id }">
          <span :id="id" class="v-field-counter">{{ bio.length }}/160</span>
        </template>
      </VField>
    `,
  }),
  play: async ({ canvasElement }) => {
    const textbox = within(canvasElement).getByRole('textbox', { name: 'About you' })
    await expect(textbox).toHaveAccessibleDescription('A few lines shown on your profile. 0/160')
  },
}
