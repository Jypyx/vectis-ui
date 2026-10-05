import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { computed, ref } from 'vue'

import { storyText } from '../../stories/storyText'
import VButton from '../VButton/VButton.vue'
import VTypography from '../VTypography/VTypography.vue'
import VStepper from './VStepper.vue'
import type { StepperStep } from './VStepper.vue'

const t = storyText({
  en: {
    account: 'Account',
    accountDescription: 'Name and email',
    shipping: 'Shipping',
    shippingDescription: 'Where it goes',
    payment: 'Payment',
    paymentDescription: 'Card or transfer',
    review: 'Review',
    reviewDescription: 'Check and confirm',
    back: 'Back',
    next: 'Next',
    content: (title: string) => `The ${title.toLowerCase()} form goes here.`,
    cardDeclined: 'Card declined',
  },
  fr: {
    account: 'Compte',
    accountDescription: 'Nom et e-mail',
    shipping: 'Livraison',
    shippingDescription: 'Adresse de livraison',
    payment: 'Paiement',
    paymentDescription: 'Carte ou virement',
    review: 'Récapitulatif',
    reviewDescription: 'Vérifier et confirmer',
    back: 'Retour',
    next: 'Suivant',
    content: (title: string) => `Le formulaire « ${title} » s’affiche ici.`,
    cardDeclined: 'Carte refusée',
  },
})

const steps = computed<StepperStep[]>(() => [
  { value: 'account', title: t.value.account, description: t.value.accountDescription },
  { value: 'shipping', title: t.value.shipping, description: t.value.shippingDescription },
  { value: 'payment', title: t.value.payment, description: t.value.paymentDescription },
  { value: 'review', title: t.value.review, description: t.value.reviewDescription },
])

const meta = {
  title: 'Components/Stepper',
  component: VStepper,
  argTypes: {
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    nonLinear: { control: 'boolean' },
    label: { control: 'text' },
  },
  args: { steps: [], orientation: 'horizontal', nonLinear: false },
  render: (args) => ({
    components: { VStepper, VButton, VTypography },
    setup() {
      const current = ref('account')
      const index = computed(() => steps.value.findIndex((step) => step.value === current.value))
      const go = (offset: number) => {
        current.value = steps.value[index.value + offset]!.value as string
      }
      return { args, t, steps, current, index, go }
    },
    template: `
      <div style="display: grid; gap: 24px; max-width: 760px">
        <VStepper v-bind="args" v-model="current" :steps="steps" />
        <VTypography>{{ t.content(steps[index].title) }}</VTypography>
        <div style="display: flex; gap: 8px">
          <VButton variant="outline" tone="neutral" :disabled="index === 0" @click="go(-1)">{{ t.back }}</VButton>
          <VButton :disabled="index === steps.length - 1" @click="go(1)">{{ t.next }}</VButton>
        </div>
      </div>
    `,
  }),
} satisfies Meta<typeof VStepper>

export default meta
type Story = StoryObj<typeof meta>

const currentTitle = (root: HTMLElement) =>
  root.querySelector('[aria-current="step"] .v-stepper-title')?.textContent

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // The circle is centred on the text beside it.
    const centre = (el: Element) => {
      const box = el.getBoundingClientRect()
      return box.top + box.height / 2
    }
    const first = canvasElement.querySelector('.v-stepper-step')!
    expect(
      Math.abs(
        centre(first.querySelector('.v-stepper-indicator')!) -
          centre(first.querySelector('.v-stepper-text')!),
      ),
    ).toBeLessThanOrEqual(1)

    const next = canvas.getByRole('button', { name: 'Next' })
    await userEvent.click(next)
    await userEvent.click(next)
    await waitFor(() => expect(currentTitle(canvasElement)).toBe('Payment'))
    expect(canvas.queryByRole('button', { name: /Review/ })).toBeNull()

    // Back to the start: the steps reached stay buttons.
    await userEvent.click(canvas.getByRole('button', { name: /Account/ }))
    await waitFor(() => expect(currentTitle(canvasElement)).toBe('Account'))
    expect(canvas.getByRole('button', { name: /Payment/ })).toBeVisible()
    await userEvent.click(canvas.getByRole('button', { name: /Shipping/ }))
    await waitFor(() => expect(currentTitle(canvasElement)).toBe('Shipping'))
  },
}

export const Vertical: Story = {
  args: { orientation: 'vertical' },
}

/** `nonLinear` makes every step a button, ahead of the current one too. */
export const NonLinear: Story = {
  args: { nonLinear: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: /Review/ }))
    await waitFor(() => expect(currentTitle(canvasElement)).toBe('Review'))
  },
}

/** `error` marks a step to fix, whatever its place; `completed` overrides the derivation. */
export const States: Story = {
  render: () => ({
    components: { VStepper },
    setup() {
      const current = ref('review')
      const withStates = computed<StepperStep[]>(() => [
        { value: 'account', title: t.value.account },
        { value: 'shipping', title: t.value.shipping, disabled: true },
        {
          value: 'payment',
          title: t.value.payment,
          description: t.value.cardDeclined,
          error: true,
        },
        { value: 'review', title: t.value.review },
      ])
      return { current, withStates }
    },
    template: `
      <div style="display: grid; gap: 32px; max-width: 760px">
        <VStepper v-model="current" :steps="withStates" />
        <VStepper v-model="current" :steps="withStates" orientation="vertical" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    // The circles and the connectors share one line, a description below a title or not.
    const middle = (el: Element) => {
      const box = el.getBoundingClientRect()
      return box.top + box.height / 2
    }
    const payment = canvasElement.querySelectorAll('.v-stepper-step')[2]!
    expect(
      Math.abs(
        middle(payment.querySelector('.v-stepper-indicator')!) -
          middle(payment.querySelector('.v-stepper-connector')!),
      ),
    ).toBeLessThanOrEqual(1)
    const account = canvasElement.querySelector('.v-stepper-step')!
    expect(
      Math.abs(
        middle(account.querySelector('.v-stepper-indicator')!) -
          middle(payment.querySelector('.v-stepper-indicator')!),
      ),
    ).toBeLessThanOrEqual(1)

    const first = canvasElement.querySelector('.v-stepper')!
    const states = [...first.querySelectorAll<HTMLElement>('.v-stepper-step')].map(
      (step) => step.dataset.state,
    )
    expect(states).toEqual(['completed', 'completed', 'error', 'active'])
    expect(within(first as HTMLElement).queryByRole('button', { name: /Shipping/ })).toBeNull()
  },
}

/**
 * Below 36rem, a horizontal stepper keeps the title of the current step only; the others stay
 * readable by assistive technology.
 */
export const Narrow: Story = {
  render: () => ({
    components: { VStepper },
    setup: () => ({ current: ref('shipping'), steps }),
    template: `
      <div style="width: 360px">
        <VStepper v-model="current" :steps="steps" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const titles = [...canvasElement.querySelectorAll<HTMLElement>('.v-stepper-text')]
    expect(titles.map((title) => title.getBoundingClientRect().width > 1)).toEqual([
      false,
      true,
      false,
      false,
    ])
    expect(canvas.getByRole('button', { name: /Account/ })).toBeInTheDocument()
  },
}
