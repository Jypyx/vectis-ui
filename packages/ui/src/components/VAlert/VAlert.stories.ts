import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import { builtinIcons as icons } from '../VIcon/icons'
import { storyText } from '../../stories/storyText'
import VButton from '../VButton/VButton.vue'
import VAlert from './VAlert.vue'

const t = storyText({
  en: {
    title: 'Scheduled maintenance',
    message: 'The service will be unavailable on Sunday from 2:00 to 4:00.',
    saved: 'Your changes are saved.',
    paymentTitle: 'Payment failed',
    failed: 'Check the card details and try again.',
    quota: 'You have used 90% of your storage.',
    tip: 'Drag a file onto the page to upload it.',
    retry: 'Retry',
    details: 'View details',
    send: 'Send the form',
    reopen: 'Show the alert again',
    sent: 'The form was sent.',
  },
  fr: {
    title: 'Maintenance planifiée',
    message: 'Le service sera indisponible dimanche de 2 h à 4 h.',
    saved: 'Vos modifications sont enregistrées.',
    paymentTitle: 'Échec du paiement',
    failed: 'Vérifiez les informations de la carte et réessayez.',
    quota: 'Vous avez utilisé 90 % de votre espace de stockage.',
    tip: 'Déposez un fichier sur la page pour l’envoyer.',
    retry: 'Réessayer',
    details: 'Voir le détail',
    send: 'Envoyer le formulaire',
    reopen: 'Réafficher l’alerte',
    sent: 'Le formulaire a été envoyé.',
  },
})

const meta = {
  title: 'Components/Alert',
  component: VAlert,
  argTypes: {
    variant: { control: 'inline-radio', options: ['soft', 'outline'] },
    tone: { control: 'select', options: ['neutral', 'accent', 'danger', 'success', 'warning'] },
    title: { control: 'text' },
    icon: { control: 'text' },
    hideIcon: { control: 'boolean' },
    closable: { control: 'boolean' },
    closeLabel: { control: 'text' },
    live: { control: 'boolean' },
  },
  args: {
    variant: 'soft',
    tone: 'accent',
    title: 'Scheduled maintenance',
    hideIcon: false,
    closable: false,
    live: false,
  },
  render: (args) => ({
    components: { VAlert },
    setup: () => ({ args, t }),
    template: '<VAlert v-bind="args" style="max-width: 480px">{{ t.message }}</VAlert>',
  }),
} satisfies Meta<typeof VAlert>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** The five tones in both variants, soft then outline; check `neutral` in both themes. */
export const Tones: Story = {
  render: () => ({
    components: { VAlert },
    setup: () => ({
      t,
      tones: ['neutral', 'accent', 'success', 'warning', 'danger'],
      variants: ['soft', 'outline'],
    }),
    template: `
      <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 360px)); gap: 12px">
        <template v-for="tone in tones" :key="tone">
          <VAlert v-for="variant in variants" :key="variant" :variant="variant" :tone="tone" :title="tone">
            {{ t.message }}
          </VAlert>
        </template>
      </div>
    `,
  }),
}

/** A message alone, without a title, is the most common alert. */
export const MessageOnly: Story = {
  render: () => ({
    components: { VAlert },
    setup: () => ({ t }),
    template: `
      <div style="display: grid; gap: 12px; max-width: 480px">
        <VAlert tone="success">{{ t.saved }}</VAlert>
        <VAlert tone="warning" variant="outline">{{ t.quota }}</VAlert>
      </div>
    `,
  }),
}

/** `icon` replaces the tone's icon; `hideIcon` removes it. */
export const Icons: Story = {
  render: () => ({
    components: { VAlert },
    setup: () => ({ t, icons }),
    template: `
      <div style="display: grid; gap: 12px; max-width: 480px">
        <VAlert tone="neutral" :icon="icons.cloud_upload">{{ t.tip }}</VAlert>
        <VAlert tone="neutral" hide-icon>{{ t.tip }}</VAlert>
      </div>
    `,
  }),
}

/** The `#actions` slot sits under the message. */
export const WithActions: Story = {
  render: () => ({
    components: { VAlert, VButton },
    setup: () => ({ t }),
    template: `
      <VAlert tone="danger" :title="t.paymentTitle" style="max-width: 480px">
        {{ t.failed }}
        <template #actions>
          <VButton size="sm" tone="danger">{{ t.retry }}</VButton>
          <VButton size="sm" variant="ghost" tone="neutral">{{ t.details }}</VButton>
        </template>
      </VAlert>
    `,
  }),
}

/** `closable` adds the cross; `v-model:open` brings the alert back. */
export const Closable: Story = {
  render: () => ({
    components: { VAlert, VButton },
    setup: () => ({ t, open: ref(true) }),
    template: `
      <div style="display: grid; gap: 12px; justify-items: start; max-width: 480px">
        <VAlert v-model:open="open" closable :title="t.title">{{ t.message }}</VAlert>
        <VButton v-if="!open" variant="outline" tone="neutral" @click="open = true">{{ t.reopen }}</VButton>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Scheduled maintenance')).toBeVisible()

    await userEvent.click(canvas.getByRole('button', { name: 'Close' }))
    await waitFor(() => expect(canvas.queryByText('Scheduled maintenance')).toBeNull())

    await userEvent.click(canvas.getByRole('button', { name: 'Show the alert again' }))
    await waitFor(() => expect(canvas.getByText('Scheduled maintenance')).toBeVisible())
  },
}

/** `live` announces an alert that appears in answer to an action. */
export const Live: Story = {
  render: () => ({
    components: { VAlert, VButton },
    setup: () => ({ t, sent: ref(false) }),
    template: `
      <div style="display: grid; gap: 12px; justify-items: start; max-width: 480px">
        <VButton @click="sent = true">{{ t.send }}</VButton>
        <VAlert v-if="sent" live tone="success">{{ t.sent }}</VAlert>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.queryByRole('status')).toBeNull()

    await userEvent.click(canvas.getByRole('button', { name: 'Send the form' }))
    await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent('The form was sent.'))
  },
}
