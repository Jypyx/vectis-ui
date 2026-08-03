import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { storyText } from '../../stories/storyText'
import VButton from '../VButton/VButton.vue'
import VToaster from './VToaster.vue'
import { dismissToast, toast } from './state'

const PLACEMENTS = [
  'top-left',
  'top-center',
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
] as const

const TONES = ['neutral', 'accent', 'success', 'danger', 'warning'] as const

const t = storyText({
  en: {
    notify: 'Notify',
    changesSaved: 'Changes saved.',
    tonalNotification: 'A notification in the tonal variant.',
    solidNotification: 'A notification in the solid variant.',
    placement: (p: string) => `Placement "${p}".`,
    sendFailed: 'Sending failed',
    serverNotResponding: 'The server is not responding.',
    disappearsIn800: 'Disappears in 800 ms.',
    message: 'Message',
    messageAlone: 'Message alone.',
    title: 'Title',
    titleAndMessage: 'Title and message',
    titleAndMessageNoIcon: 'Title and message, with no icon.',
    iconAndMessage: 'Icon + message',
    iconAndMessageBody: 'Icon and message.',
    iconTitleMessage: 'Icon + title + message',
    exportDone: 'Export finished',
    iconTitleMessageBody: 'Icon, title and message.',
    deploymentStarted: 'Deployment started',
    deploymentBody: 'The release to production is under way.',
    wide: 'Wide (36rem)',
    customWidth: 'Custom width',
    customWidthBody:
      'This toast uses width: 36rem — useful for detailed messages, without ever exceeding the viewport width minus the margins.',
    longText: 'Long text (default)',
    longTextBody:
      'A deliberately long message to check that the default width bounds the text and that wrapping happens cleanly, even with an-especially-interminable-unbreakable-string.',
    stack: 'Stack',
    notification: 'Notification',
  },
  fr: {
    notify: 'Notifier',
    changesSaved: 'Modifications enregistrées.',
    tonalNotification: 'Notification en variant tonal.',
    solidNotification: 'Notification en variant solid.',
    placement: (p: string) => `Placement « ${p} ».`,
    sendFailed: "Échec de l'envoi",
    serverNotResponding: 'Le serveur ne répond pas.',
    disappearsIn800: 'Disparaît en 800 ms.',
    message: 'Message',
    messageAlone: 'Message seul.',
    title: 'Titre',
    titleAndMessage: 'Titre + message',
    titleAndMessageNoIcon: 'Titre et message, sans icône.',
    iconAndMessage: 'Icône + message',
    iconAndMessageBody: 'Icône et message.',
    iconTitleMessage: 'Icône + titre + message',
    exportDone: 'Export terminé',
    iconTitleMessageBody: 'Icône, titre et message.',
    deploymentStarted: 'Déploiement lancé',
    deploymentBody: 'La mise en production est en cours.',
    wide: 'Large (36rem)',
    customWidth: 'Largeur personnalisée',
    customWidthBody:
      'Ce toast utilise width: 36rem — utile pour des messages détaillés, sans jamais dépasser la largeur du viewport moins les marges.',
    longText: 'Texte long (défaut)',
    longTextBody:
      'Un message volontairement long pour vérifier que la largeur par défaut borne le texte et que le retour à la ligne se fait proprement, même avec une-chaîne-insécable-particulièrement-interminable.',
    stack: 'Empiler',
    notification: 'Notification',
  },
})

const meta = {
  title: 'Components/Toast',
  component: VToaster,
  argTypes: {
    placement: { control: 'select', options: [...PLACEMENTS] },
    duration: { control: 'number' },
  },
  args: { placement: 'bottom-right', duration: 5000 },
  // the queue is module state that survives navigation between stories: it is
  // emptied before each render to avoid any pollution
  decorators: [
    (story) => {
      dismissToast()
      return { components: { story }, template: '<story />' }
    },
  ],
  render: (args) => ({
    components: { VToaster, VButton },
    setup: () => ({ args, toast, t }),
    template: `
      <VToaster v-bind="args" />
      <VButton
        variant="outline"
        tone="neutral"
        @click="toast({ tone: 'success', message: t.changesSaved })"
      >
        {{ t.notify }}
      </VButton>
    `,
  }),
} satisfies Meta<typeof VToaster>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const stack = canvasElement.querySelector(
      ".v-toast-stack[data-placement='bottom-right']",
    ) as HTMLElement

    // programmatic trigger: the stack moves to the top layer
    await userEvent.click(canvas.getByRole('button', { name: 'Notify' }))
    await waitFor(() => expect(stack.matches(':popover-open')).toBe(true))
    // waitFor: the toast transitions in from opacity 0 (@starting-style)
    await waitFor(() => expect(within(stack).getByText('Changes saved.')).toBeVisible())
  },
}

export const Tones: Story = {
  render: (args) => ({
    components: { VToaster, VButton },
    setup: () => ({ args, toast, TONES, t }),
    template: `
      <VToaster v-bind="args" />
      <div style="display: flex; gap: 8px; flex-wrap: wrap">
        <VButton
          v-for="tone in TONES"
          :key="tone"
          variant="outline"
          tone="neutral"
          @click="toast({ tone, title: tone, message: t.tonalNotification, duration: 0 })"
        >
          {{ tone }}
        </VButton>
      </div>
    `,
  }),
}

export const Solid: Story = {
  render: (args) => ({
    components: { VToaster, VButton },
    setup: () => ({ args, toast, TONES, t }),
    template: `
      <VToaster v-bind="args" />
      <div style="display: flex; gap: 8px; flex-wrap: wrap">
        <VButton
          v-for="tone in TONES"
          :key="tone"
          variant="outline"
          tone="neutral"
          @click="toast({ tone, variant: 'solid', title: tone, message: t.solidNotification, duration: 0 })"
        >
          {{ tone }}
        </VButton>
      </div>
    `,
  }),
}

export const Placements: Story = {
  render: (args) => ({
    components: { VToaster, VButton },
    setup: () => ({ args, toast, PLACEMENTS, t }),
    template: `
      <VToaster v-bind="args" />
      <div style="display: flex; gap: 8px; flex-wrap: wrap">
        <VButton
          v-for="p in PLACEMENTS"
          :key="p"
          variant="outline"
          tone="neutral"
          @click="toast({ message: t.placement(p), placement: p })"
        >
          {{ p }}
        </VButton>
      </div>
    `,
  }),
}

/** `duration: 0`: the toast stays until dismissed through the cross. */
export const Persistent: Story = {
  render: (args) => ({
    components: { VToaster, VButton },
    setup: () => ({ args, toast, t }),
    template: `
      <VToaster v-bind="args" />
      <VButton
        variant="outline"
        tone="neutral"
        @click="toast({ tone: 'danger', title: t.sendFailed, message: t.serverNotResponding, duration: 0 })"
      >
        {{ t.notify }}
      </VButton>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const stack = canvasElement.querySelector(
      ".v-toast-stack[data-placement='bottom-right']",
    ) as HTMLElement

    await userEvent.click(canvas.getByRole('button', { name: 'Notify' }))
    await waitFor(() => expect(stack.matches(':popover-open')).toBe(true))

    // manual dismissal through the "Close" VIconButton
    await userEvent.click(within(stack).getByRole('button', { name: 'Close' }))
    await waitFor(() => expect(stack.matches(':popover-open')).toBe(false))
  },
}

export const AutoDismiss: Story = {
  render: (args) => ({
    components: { VToaster, VButton },
    setup: () => ({ args, toast, t }),
    template: `
      <VToaster v-bind="args" />
      <VButton
        variant="outline"
        tone="neutral"
        @click="toast({ message: t.disappearsIn800, duration: 800 })"
      >
        {{ t.notify }}
      </VButton>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const stack = canvasElement.querySelector(
      ".v-toast-stack[data-placement='bottom-right']",
    ) as HTMLElement

    await userEvent.click(canvas.getByRole('button', { name: 'Notify' }))
    await waitFor(() => expect(stack.matches(':popover-open')).toBe(true))
    // automatic dismissal after the requested duration
    await waitFor(() => expect(stack.matches(':popover-open')).toBe(false), { timeout: 3000 })
  },
}

/** The four content shapes: the title and the icon are optional. */
export const Contents: Story = {
  render: (args) => ({
    components: { VToaster, VButton },
    setup: () => ({ args, toast, t }),
    template: `
      <VToaster v-bind="args" />
      <div style="display: flex; gap: 8px; flex-wrap: wrap">
        <VButton variant="outline" tone="neutral"
          @click="toast({ message: t.messageAlone, icon: false, duration: 0 })">
          {{ t.message }}
        </VButton>
        <VButton variant="outline" tone="neutral"
          @click="toast({ title: t.title, message: t.titleAndMessageNoIcon, icon: false, duration: 0 })">
          {{ t.titleAndMessage }}
        </VButton>
        <VButton variant="outline" tone="neutral"
          @click="toast({ tone: 'success', message: t.iconAndMessageBody, duration: 0 })">
          {{ t.iconAndMessage }}
        </VButton>
        <VButton variant="outline" tone="neutral"
          @click="toast({ tone: 'success', title: t.exportDone, message: t.iconTitleMessageBody, duration: 0 })">
          {{ t.iconTitleMessage }}
        </VButton>
      </div>
    `,
  }),
}

/** `icon` accepts any Material Symbols name (or an image URL). */
export const CustomIcon: Story = {
  render: (args) => ({
    components: { VToaster, VButton },
    setup: () => ({ args, toast, t }),
    template: `
      <VToaster v-bind="args" />
      <VButton
        variant="outline"
        tone="neutral"
        @click="toast({ tone: 'accent', icon: 'rocket_launch', title: t.deploymentStarted, message: t.deploymentBody, duration: 0 })"
      >
        {{ t.notify }}
      </VButton>
    `,
  }),
}

/** `width` per toast; long texts stay bounded by the viewport. */
export const Width: Story = {
  render: (args) => ({
    components: { VToaster, VButton },
    setup: () => ({ args, toast, t }),
    template: `
      <VToaster v-bind="args" />
      <div style="display: flex; gap: 8px; flex-wrap: wrap">
        <VButton variant="outline" tone="neutral"
          @click="toast({ width: '36rem', title: t.customWidth, message: t.customWidthBody, duration: 0 })">
          {{ t.wide }}
        </VButton>
        <VButton variant="outline" tone="neutral"
          @click="toast({ message: t.longTextBody, duration: 0 })">
          {{ t.longText }}
        </VButton>
      </div>
    `,
  }),
}

export const Stacking: Story = {
  render: (args) => ({
    components: { VToaster, VButton },
    setup: () => ({ args, toast, t }),
    template: `
      <VToaster v-bind="args" />
      <VButton
        variant="outline"
        tone="neutral"
        @click="toast({ tone: 'accent', message: t.notification + ' ' + Date.now() + '.', duration: 0 })"
      >
        {{ t.stack }}
      </VButton>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: 'Stack' })

    await userEvent.click(button)
    await userEvent.click(button)
    await userEvent.click(button)
    // the three toasts coexist in the same stack
    await waitFor(() => expect(canvasElement.querySelectorAll('.v-toast')).toHaveLength(3))
  },
}
