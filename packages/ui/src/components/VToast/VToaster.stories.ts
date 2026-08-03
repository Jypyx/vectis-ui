import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import Button from '../VButton/VButton.vue'
import Toaster from './VToaster.vue'
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

const meta = {
  title: 'Composants/Toast',
  component: Toaster,
  argTypes: {
    placement: { control: 'select', options: [...PLACEMENTS] },
    duration: { control: 'number' },
  },
  args: { placement: 'bottom-right', duration: 5000 },
  // la file est un état de module qui survit à la navigation entre stories :
  // on la vide avant chaque rendu pour éviter toute pollution
  decorators: [
    (story) => {
      dismissToast()
      return { components: { story }, template: '<story />' }
    },
  ],
  render: (args) => ({
    components: { Toaster, Button },
    setup: () => ({ args, toast }),
    template: `
      <Toaster v-bind="args" />
      <Button
        variant="outline"
        tone="neutral"
        @click="toast({ tone: 'success', message: 'Modifications enregistrées.' })"
      >
        Notifier
      </Button>
    `,
  }),
} satisfies Meta<typeof Toaster>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const stack = canvasElement.querySelector(
      ".v-toast-stack[data-placement='bottom-right']",
    ) as HTMLElement

    // déclenchement programmatique : la pile passe en top-layer
    await userEvent.click(canvas.getByRole('button', { name: 'Notifier' }))
    await waitFor(() => expect(stack.matches(':popover-open')).toBe(true))
    // waitFor : le toast entre en transition depuis opacity 0 (@starting-style)
    await waitFor(() =>
      expect(within(stack).getByText('Modifications enregistrées.')).toBeVisible(),
    )
  },
}

export const Tones: Story = {
  render: (args) => ({
    components: { Toaster, Button },
    setup: () => ({ args, toast, TONES }),
    template: `
      <Toaster v-bind="args" />
      <div style="display: flex; gap: 8px; flex-wrap: wrap">
        <Button
          v-for="tone in TONES"
          :key="tone"
          variant="outline"
          tone="neutral"
          @click="toast({ tone, title: tone, message: 'Notification en variant tonal.', duration: 0 })"
        >
          {{ tone }}
        </Button>
      </div>
    `,
  }),
}

export const Solid: Story = {
  render: (args) => ({
    components: { Toaster, Button },
    setup: () => ({ args, toast, TONES }),
    template: `
      <Toaster v-bind="args" />
      <div style="display: flex; gap: 8px; flex-wrap: wrap">
        <Button
          v-for="tone in TONES"
          :key="tone"
          variant="outline"
          tone="neutral"
          @click="toast({ tone, variant: 'solid', title: tone, message: 'Notification en variant solid.', duration: 0 })"
        >
          {{ tone }}
        </Button>
      </div>
    `,
  }),
}

export const Placements: Story = {
  render: (args) => ({
    components: { Toaster, Button },
    setup: () => ({ args, toast, PLACEMENTS }),
    template: `
      <Toaster v-bind="args" />
      <div style="display: flex; gap: 8px; flex-wrap: wrap">
        <Button
          v-for="p in PLACEMENTS"
          :key="p"
          variant="outline"
          tone="neutral"
          @click="toast({ message: 'Placement « ' + p + ' ».', placement: p })"
        >
          {{ p }}
        </Button>
      </div>
    `,
  }),
}

/** `duration: 0` : le toast reste affiché jusqu'à fermeture par la croix. */
export const Persistant: Story = {
  render: (args) => ({
    components: { Toaster, Button },
    setup: () => ({ args, toast }),
    template: `
      <Toaster v-bind="args" />
      <Button
        variant="outline"
        tone="neutral"
        @click="toast({ tone: 'danger', title: 'Échec de l\\'envoi', message: 'Le serveur ne répond pas.', duration: 0 })"
      >
        Notifier
      </Button>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const stack = canvasElement.querySelector(
      ".v-toast-stack[data-placement='bottom-right']",
    ) as HTMLElement

    await userEvent.click(canvas.getByRole('button', { name: 'Notifier' }))
    await waitFor(() => expect(stack.matches(':popover-open')).toBe(true))

    // fermeture manuelle via l'IconButton « Fermer »
    await userEvent.click(within(stack).getByRole('button', { name: 'Fermer' }))
    await waitFor(() => expect(stack.matches(':popover-open')).toBe(false))
  },
}

export const AutoFermeture: Story = {
  render: (args) => ({
    components: { Toaster, Button },
    setup: () => ({ args, toast }),
    template: `
      <Toaster v-bind="args" />
      <Button
        variant="outline"
        tone="neutral"
        @click="toast({ message: 'Disparaît en 800 ms.', duration: 800 })"
      >
        Notifier
      </Button>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const stack = canvasElement.querySelector(
      ".v-toast-stack[data-placement='bottom-right']",
    ) as HTMLElement

    await userEvent.click(canvas.getByRole('button', { name: 'Notifier' }))
    await waitFor(() => expect(stack.matches(':popover-open')).toBe(true))
    // fermeture automatique après la durée demandée
    await waitFor(() => expect(stack.matches(':popover-open')).toBe(false), { timeout: 3000 })
  },
}

/** Les quatre formes de contenu : le titre et l'icône sont optionnels. */
export const Contenus: Story = {
  render: (args) => ({
    components: { Toaster, Button },
    setup: () => ({ args, toast }),
    template: `
      <Toaster v-bind="args" />
      <div style="display: flex; gap: 8px; flex-wrap: wrap">
        <Button variant="outline" tone="neutral"
          @click="toast({ message: 'Message seul.', icon: false, duration: 0 })">
          Message
        </Button>
        <Button variant="outline" tone="neutral"
          @click="toast({ title: 'Titre', message: 'Titre et message, sans icône.', icon: false, duration: 0 })">
          Titre + message
        </Button>
        <Button variant="outline" tone="neutral"
          @click="toast({ tone: 'success', message: 'Icône et message.', duration: 0 })">
          Icône + message
        </Button>
        <Button variant="outline" tone="neutral"
          @click="toast({ tone: 'success', title: 'Export terminé', message: 'Icône, titre et message.', duration: 0 })">
          Icône + titre + message
        </Button>
      </div>
    `,
  }),
}

/** `icon` accepte tout nom Material Symbols (ou une URL d'image). */
export const IconePersonnalisee: Story = {
  render: (args) => ({
    components: { Toaster, Button },
    setup: () => ({ args, toast }),
    template: `
      <Toaster v-bind="args" />
      <Button
        variant="outline"
        tone="neutral"
        @click="toast({ tone: 'accent', icon: 'rocket_launch', title: 'Déploiement lancé', message: 'La mise en production est en cours.', duration: 0 })"
      >
        Notifier
      </Button>
    `,
  }),
}

/** `width` par toast ; les textes longs restent bornés au viewport. */
export const Largeur: Story = {
  render: (args) => ({
    components: { Toaster, Button },
    setup: () => ({ args, toast }),
    template: `
      <Toaster v-bind="args" />
      <div style="display: flex; gap: 8px; flex-wrap: wrap">
        <Button variant="outline" tone="neutral"
          @click="toast({ width: '36rem', title: 'Largeur personnalisée', message: 'Ce toast utilise width: 36rem — utile pour des messages détaillés, sans jamais dépasser la largeur du viewport moins les marges.', duration: 0 })">
          Large (36rem)
        </Button>
        <Button variant="outline" tone="neutral"
          @click="toast({ message: 'Un message volontairement long pour vérifier que la largeur par défaut borne le texte et que le retour à la ligne se fait proprement, même avec une-chaîne-insécable-particulièrement-interminable.', duration: 0 })">
          Texte long (défaut)
        </Button>
      </div>
    `,
  }),
}

export const Empilement: Story = {
  render: (args) => ({
    components: { Toaster, Button },
    setup: () => ({ args, toast }),
    template: `
      <Toaster v-bind="args" />
      <Button
        variant="outline"
        tone="neutral"
        @click="toast({ tone: 'accent', message: 'Notification ' + Date.now() + '.', duration: 0 })"
      >
        Empiler
      </Button>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: 'Empiler' })

    await userEvent.click(button)
    await userEvent.click(button)
    await userEvent.click(button)
    // les trois toasts cohabitent dans la même pile
    await waitFor(() => expect(canvasElement.querySelectorAll('.v-toast')).toHaveLength(3))
  },
}
