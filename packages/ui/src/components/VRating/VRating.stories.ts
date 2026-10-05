import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import { storyText } from '../../stories/storyText'
import VTypography from '../VTypography/VTypography.vue'
import VRating from './VRating.vue'

const t = storyText({
  en: {
    quality: 'Quality',
    hint: 'Your overall impression of the product.',
    average: 'Average rating',
    reviews: '128 reviews',
    required: 'Choose a rating before sending.',
    value: 'Value',
    favourite: 'How much do you like it?',
    shipping: 'Shipping',
    custom: 'Custom colour',
  },
  fr: {
    quality: 'Qualité',
    hint: 'Votre impression générale sur le produit.',
    average: 'Note moyenne',
    reviews: '128 avis',
    required: 'Choisissez une note avant d’envoyer.',
    value: 'Valeur',
    favourite: 'À quel point l’aimez-vous ?',
    shipping: 'Livraison',
    custom: 'Couleur personnalisée',
  },
})

/** The icon of a value: what the pointer clicks, the radio itself being hidden. */
const icon = (canvasElement: HTMLElement, name: string) =>
  within(canvasElement).getByRole('radio', { name }).closest('label')!

const meta = {
  title: 'Components/Rating',
  component: VRating,
  argTypes: {
    max: { control: { type: 'number', min: 1, max: 10 } },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    tone: {
      control: 'inline-radio',
      options: ['accent', 'warning', 'danger', 'success', 'neutral'],
    },
    clearable: { control: 'boolean' },
    readonly: { control: 'boolean' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    hideLabel: { control: 'boolean' },
    color: { control: 'color' },
    hint: { control: 'text' },
    error: { control: 'text' },
  },
  args: {
    max: 5,
    size: 'md',
    tone: 'accent',
    clearable: false,
    readonly: false,
    disabled: false,
    required: false,
    hideLabel: false,
  },
  render: (args) => ({
    components: { VRating },
    setup: () => ({ args, t, value: ref<number | null>(3) }),
    template: `<VRating v-bind="args" v-model="value" :label="t.quality" :hint="args.hint ?? t.hint" />`,
  }),
} satisfies Meta<typeof VRating>

export default meta
type Story = StoryObj<typeof meta>

/** Native radios: a click chooses, and the arrows move the rating. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    expect(canvas.getByRole('group', { name: 'Quality' })).toBeInTheDocument()
    expect(canvas.getByRole('radio', { name: '3 out of 5' })).toBeChecked()
    await userEvent.click(icon(canvasElement, '5 out of 5'))
    await waitFor(() => expect(canvas.getByRole('radio', { name: '5 out of 5' })).toBeChecked())
    await userEvent.keyboard('{ArrowLeft}')
    await waitFor(() => expect(canvas.getByRole('radio', { name: '4 out of 5' })).toBeChecked())
    expect(canvas.getByRole('radio', { name: '4 out of 5' })).toHaveFocus()
  },
}

/**
 * `clearable` lets the rating go back to none: click the current value again, or reach "No
 * rating" with the arrows.
 */
export const Clearable: Story = {
  args: { clearable: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(icon(canvasElement, '3 out of 5'))
    await waitFor(() => expect(canvas.getByRole('radio', { name: 'No rating' })).toBeChecked())
    await userEvent.click(icon(canvasElement, '1 out of 5'))
    await waitFor(() => expect(canvas.getByRole('radio', { name: '1 out of 5' })).toBeChecked())
    await userEvent.keyboard('{ArrowLeft}')
    await waitFor(() => expect(canvas.getByRole('radio', { name: 'No rating' })).toBeChecked())
    expect(canvas.getByRole('radio', { name: 'No rating' })).toHaveFocus()
  },
}

/** Read-only, the icons are one image, and a fractional value fills part of an icon. */
export const Readonly: Story = {
  render: () => ({
    components: { VRating, VTypography },
    setup: () => ({ t }),
    template: `
      <div style="display: flex; align-items: center; gap: 8px">
        <VRating :model-value="3.7" readonly size="sm" tone="warning" :label="t.average" hide-label />
        <VTypography variant="body-sm" tone="muted">3.7 · {{ t.reviews }}</VTypography>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    expect(canvas.getByRole('img', { name: '3.7 out of 5' })).toBeInTheDocument()
    expect(canvas.queryAllByRole('radio')).toHaveLength(0)
    // The fourth icon is filled at 70 %.
    const fourth = canvasElement.querySelectorAll('.v-rating-filled')[3]!
    expect(getComputedStyle(fourth).clipPath).toMatch(/inset\(0(px)? 30(\.0+\d*)?%/)
  },
}

/** `size` sets the icons to 20, 24 or 32 pixels. */
export const Sizes: Story = {
  render: () => ({
    components: { VRating },
    setup: () => ({ sizes: ['sm', 'md', 'lg'] as const }),
    template: `
      <div style="display: grid; gap: 16px">
        <VRating v-for="size in sizes" :key="size" :size="size" :model-value="4" :label="size" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const icons = [...canvasElement.querySelectorAll('.v-rating')].map(
      (rating) => rating.querySelector('.v-rating-empty')!.getBoundingClientRect().width,
    )
    expect(icons).toEqual([20, 24, 32])
  },
}

/** `tone` colours the filled icons, `color` replaces it with a colour of your own, and `icon` replaces the star. */
export const TonesAndIcons: Story = {
  render: () => ({
    components: { VRating },
    setup: () => ({ t }),
    template: `
      <div style="display: grid; gap: 16px">
        <VRating :model-value="4" tone="warning" :label="t.value" />
        <VRating :model-value="3" tone="danger" icon="favorite" :label="t.favourite" />
        <VRating :model-value="2" tone="neutral" :label="t.shipping" />
        <VRating :model-value="5" color="#e91e63" icon="favorite" :label="t.custom" />
      </div>
    `,
  }),
}

/** The error replaces the hint and is announced; the empty icons turn red. */
export const WithError: Story = {
  render: () => ({
    components: { VRating },
    setup: () => ({ t, value: ref<number | null>(null) }),
    template: `<VRating v-model="value" :label="t.quality" :error="value === null ? t.required : undefined" required />`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const group = canvas.getByRole('group', { name: 'Quality' })
    expect(group).toHaveAccessibleDescription('Choose a rating before sending.')
    expect(canvas.getByRole('radio', { name: '1 out of 5' })).toHaveAttribute(
      'aria-invalid',
      'true',
    )
  },
}

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    expect(within(canvasElement).getByRole('radio', { name: '3 out of 5' })).toBeDisabled()
  },
}
