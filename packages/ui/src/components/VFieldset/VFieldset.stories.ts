import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import { storyText } from '../../stories/storyText'
import VButton from '../VButton/VButton.vue'
import VCheckbox from '../VCheckbox/VCheckbox.vue'
import VRadio from '../VRadio/VRadio.vue'
import VFieldset from './VFieldset.vue'

const t = storyText({
  en: {
    plan: 'Plan',
    planHint: 'You can change it at any time.',
    planError: 'Choose a plan to continue.',
    free: 'Free',
    pro: 'Pro',
    team: 'Team',
    notify: 'Notifications',
    email: 'Email',
    sms: 'Text message',
    push: 'Push',
    submit: 'Continue',
  },
  fr: {
    plan: 'Formule',
    planHint: 'Vous pouvez la changer à tout moment.',
    planError: 'Choisissez une formule pour continuer.',
    free: 'Gratuite',
    pro: 'Pro',
    team: 'Équipe',
    notify: 'Notifications',
    email: 'E-mail',
    sms: 'SMS',
    push: 'Push',
    submit: 'Continuer',
  },
})

const meta = {
  title: 'Components/Fieldset',
  component: VFieldset,
  argTypes: {
    legend: { control: 'text' },
    hint: { control: 'text' },
    error: { control: 'text' },
    required: { control: 'boolean' },
    hideLegend: { control: 'boolean' },
    orientation: { control: 'inline-radio', options: ['vertical', 'horizontal'] },
  },
  args: {
    legend: 'Plan',
    hint: 'You can change it at any time.',
    required: false,
    hideLegend: false,
    orientation: 'vertical',
  },
  render: (args) => ({
    components: { VFieldset, VRadio },
    setup: () => ({ args, t, plan: ref('free') }),
    template: `
      <VFieldset v-bind="args" v-slot="{ invalid, required }">
        <VRadio v-for="value in ['free', 'pro', 'team']" :key="value" v-model="plan" name="plan"
          :value="value" :label="t[value]" :invalid="invalid" :required="required" />
      </VFieldset>
    `,
  }),
} satisfies Meta<typeof VFieldset>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** `orientation="horizontal"` lays the controls out in a wrapping row. */
export const Horizontal: Story = {
  render: () => ({
    components: { VCheckbox, VFieldset },
    setup: () => ({ t }),
    template: `
      <VFieldset :legend="t.notify" orientation="horizontal">
        <VCheckbox :label="t.email" />
        <VCheckbox :label="t.sms" />
        <VCheckbox :label="t.push" />
      </VFieldset>
    `,
  }),
}

/**
 * Submitting with no plan raises the error: it describes the group and marks every radio
 * invalid through the slot. Picking one clears it.
 */
export const WithError: Story = {
  render: () => ({
    components: { VButton, VFieldset, VRadio },
    setup: () => {
      const plan = ref<string>()
      const error = ref<string>()
      const submit = () => {
        error.value = plan.value ? undefined : t.value.planError
      }
      const pick = (value: string) => {
        plan.value = value
        error.value = undefined
      }
      return { t, plan, error, submit, pick }
    },
    template: `
      <div style="display: grid; gap: 16px; justify-items: start">
        <VFieldset :legend="t.plan" :hint="t.planHint" :error="error" required v-slot="{ invalid, required }">
          <VRadio v-for="value in ['free', 'pro', 'team']" :key="value" :model-value="plan" name="plan"
            :value="value" :label="t[value]" :invalid="invalid" :required="required"
            @update:model-value="pick(value)" />
        </VFieldset>
        <VButton @click="submit">{{ t.submit }}</VButton>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const group = canvas.getByRole('group', { name: 'Plan' })
    await userEvent.click(canvas.getByRole('button', { name: 'Continue' }))
    await waitFor(() => expect(group).toHaveAccessibleDescription('Choose a plan to continue.'))
    for (const radio of canvas.getAllByRole('radio'))
      await expect(radio).toHaveAttribute('aria-invalid', 'true')

    await userEvent.click(canvas.getByText('Pro'))
    await waitFor(() => expect(canvas.queryByText('Choose a plan to continue.')).toBeNull())
    await expect(canvas.getByText('You can change it at any time.')).toBeVisible()
  },
}

/** `hideLegend` keeps the group named while its purpose is clear from the context. */
export const HiddenLegend: Story = {
  render: () => ({
    components: { VCheckbox, VFieldset },
    setup: () => ({ t }),
    template: `
      <VFieldset :legend="t.notify" hide-legend orientation="horizontal">
        <VCheckbox :label="t.email" />
        <VCheckbox :label="t.sms" />
      </VFieldset>
    `,
  }),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('group', { name: 'Notifications' })).toBeTruthy()
  },
}
