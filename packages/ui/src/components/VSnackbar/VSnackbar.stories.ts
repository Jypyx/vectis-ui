import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { storyText } from '../../stories/storyText'
import VButton from '../VButton/VButton.vue'
import VSnackbar from './VSnackbar.vue'
import { dismissSnackbar, snackbar } from './state'

const PLACEMENTS = ['bottom-left', 'bottom-center', 'bottom-right'] as const

const t = storyText({
  en: {
    delete: 'Delete',
    messageDeleted: 'Message deleted.',
    save: 'Save',
    settingsSaved: 'Settings saved.',
    failing: 'Failing action',
    saveFailed: 'Could not save your changes.',
    retry: 'Retry',
    archive: 'Archive',
    conversationArchived: 'Conversation archived.',
    placement: (p: string) => `Raised at "${p}".`,
    raiseAt: (p: string) => `Raise at ${p}`,
    persistent: 'Persistent',
    staysUntilReplaced: 'This one stays until it is replaced.',
    quick: 'Disappears in 1.5 s',
    disappearsIn1500: 'Gone in 1500 ms.',
    replace: 'Replace it',
    first: 'First confirmation.',
    second: 'Second confirmation — the first is gone.',
    withIcon: 'With an icon',
    fileRemoved: 'File removed from the library.',
    longText: 'Long message',
    longTextBody:
      'A deliberately long confirmation, to check that the bar bounds its text between its minimum and maximum widths and that wrapping leaves the action centred against the whole bar.',
  },
  fr: {
    delete: 'Supprimer',
    messageDeleted: 'Message supprimé.',
    save: 'Enregistrer',
    settingsSaved: 'Réglages enregistrés.',
    failing: 'Action en échec',
    saveFailed: "Vos modifications n'ont pas pu être enregistrées.",
    retry: 'Réessayer',
    archive: 'Archiver',
    conversationArchived: 'Conversation archivée.',
    placement: (p: string) => `Affiché en « ${p} ».`,
    raiseAt: (p: string) => `Afficher en ${p}`,
    persistent: 'Persistant',
    staysUntilReplaced: "Celui-ci reste jusqu'à ce qu'il soit remplacé.",
    quick: 'Disparaît en 1,5 s',
    disappearsIn1500: 'Parti au bout de 1500 ms.',
    replace: 'Le remplacer',
    first: 'Première confirmation.',
    second: 'Deuxième confirmation — la première a disparu.',
    withIcon: 'Avec une icône',
    fileRemoved: 'Fichier retiré de la bibliothèque.',
    longText: 'Message long',
    longTextBody:
      "Une confirmation volontairement longue, pour vérifier que la barre borne son texte entre ses largeurs minimale et maximale et que le retour à la ligne laisse l'action centrée sur toute la hauteur de la barre.",
  },
})

const meta = {
  title: 'Components/Snackbar',
  component: VSnackbar,
  argTypes: {
    placement: { control: 'select', options: [...PLACEMENTS] },
    duration: { control: 'number' },
  },
  args: { placement: 'bottom-center', duration: 4000 },
  // the bar is module state that survives navigation between stories: it is cleared
  // before each render to avoid any pollution
  decorators: [
    (story) => {
      dismissSnackbar()
      return { components: { story }, template: '<story />' }
    },
  ],
  render: (args) => ({
    components: { VSnackbar, VButton },
    setup: () => ({ args, snackbar, t }),
    template: `
      <VSnackbar v-bind="args" />
      <VButton
        variant="outline"
        tone="neutral"
        @click="snackbar({ message: t.messageDeleted, action: () => {} })"
      >
        {{ t.delete }}
      </VButton>
    `,
  }),
} satisfies Meta<typeof VSnackbar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const host = canvasElement.querySelector('.v-snackbar-host') as HTMLElement

    // programmatic trigger: the container moves to the top layer
    await userEvent.click(canvas.getByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(host.matches(':popover-open')).toBe(true))
    // waitFor: the bar transitions in from opacity 0 (@starting-style)
    await waitFor(() => expect(within(host).getByText('Message deleted.')).toBeVisible())
    await waitFor(() => expect(within(host).getByRole('button', { name: 'Undo' })).toBeVisible())
  },
}

/**
 * The two tones, both painted solid. `neutral` is the design system's canonical
 * text/surface inversion — dark on a light theme, light on a dark one — and `danger` is
 * the only other one a confirmation ever needs.
 *
 * The play function ends with a bar OPEN on purpose: axe only audits what is on screen,
 * and without a click no confirmation exists at all. It is the only contrast check this
 * new colour surface gets, in either theme.
 */
export const Tones: Story = {
  args: { duration: 0 },
  render: (args) => ({
    components: { VSnackbar, VButton },
    setup: () => ({ args, snackbar, t }),
    template: `
      <VSnackbar v-bind="args" />
      <div style="display: flex; gap: 0.5rem">
        <VButton
          variant="outline"
          tone="neutral"
          @click="snackbar({ message: t.conversationArchived, action: () => {} })"
        >
          {{ t.archive }}
        </VButton>
        <VButton
          variant="outline"
          tone="danger"
          @click="snackbar({ tone: 'danger', message: t.saveFailed, action: () => {}, actionLabel: t.retry })"
        >
          {{ t.failing }}
        </VButton>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const host = canvasElement.querySelector('.v-snackbar-host') as HTMLElement

    await userEvent.click(canvas.getByRole('button', { name: 'Archive' }))
    await waitFor(() => expect(within(host).getByText('Conversation archived.')).toBeVisible())
    await waitFor(() => expect(within(host).getByRole('button', { name: 'Undo' })).toBeVisible())

    // The danger bar replaces the neutral one, and stays on screen for axe to judge.
    await userEvent.click(canvas.getByRole('button', { name: 'Failing action' }))
    await waitFor(() =>
      expect(within(host).getByText('Could not save your changes.')).toBeVisible(),
    )
    await waitFor(() => expect(within(host).getByRole('button', { name: 'Retry' })).toBeVisible())
  },
}

/** Without an action, the bar is a plain confirmation and carries no button at all. */
export const WithoutAction: Story = {
  args: { duration: 0 },
  render: (args) => ({
    components: { VSnackbar, VButton },
    setup: () => ({ args, snackbar, t }),
    template: `
      <VSnackbar v-bind="args" />
      <VButton variant="outline" tone="neutral" @click="snackbar({ message: t.settingsSaved })">
        {{ t.save }}
      </VButton>
    `,
  }),
}

/** An icon is opt-in: none is deduced from the tone. */
export const WithIcon: Story = {
  args: { duration: 0 },
  render: (args) => ({
    components: { VSnackbar, VButton },
    setup: () => ({ args, snackbar, t }),
    template: `
      <VSnackbar v-bind="args" />
      <VButton
        variant="outline"
        tone="neutral"
        @click="snackbar({ message: t.fileRemoved, icon: 'delete', action: () => {} })"
      >
        {{ t.withIcon }}
      </VButton>
    `,
  }),
}

/** Along the bottom edge only, and never anywhere else. */
export const Placements: Story = {
  args: { duration: 0 },
  render: (args) => ({
    components: { VSnackbar, VButton },
    setup: () => ({ args, snackbar, t, PLACEMENTS }),
    template: `
      <VSnackbar v-bind="args" />
      <div style="display: flex; flex-wrap: wrap; gap: 0.5rem">
        <VButton
          v-for="p in PLACEMENTS"
          :key="p"
          variant="outline"
          tone="neutral"
          @click="snackbar({ placement: p, message: t.placement(p), action: () => {} })"
        >
          {{ t.raiseAt(p) }}
        </VButton>
      </div>
    `,
  }),
}

/**
 * Only one confirmation exists at a time: raising a new one replaces the one showing and
 * restarts its countdown from the top.
 */
export const Replacement: Story = {
  render: (args) => ({
    components: { VSnackbar, VButton },
    setup: () => ({ args, snackbar, t }),
    template: `
      <VSnackbar v-bind="args" />
      <div style="display: flex; gap: 0.5rem">
        <VButton
          variant="outline"
          tone="neutral"
          @click="snackbar({ message: t.first, duration: 0, action: () => {} })"
        >
          {{ t.delete }}
        </VButton>
        <VButton
          variant="outline"
          tone="neutral"
          @click="snackbar({ message: t.second, duration: 0, action: () => {} })"
        >
          {{ t.replace }}
        </VButton>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const host = canvasElement.querySelector('.v-snackbar-host') as HTMLElement

    await userEvent.click(canvas.getByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(within(host).getByText('First confirmation.')).toBeVisible())

    await userEvent.click(canvas.getByRole('button', { name: 'Replace it' }))
    await waitFor(() =>
      expect(within(host).getByText('Second confirmation — the first is gone.')).toBeVisible(),
    )
    expect(within(host).queryByText('First confirmation.')).toBeNull()
  },
}

/** `duration: 0` keeps the bar until something replaces it. */
export const Persistent: Story = {
  render: (args) => ({
    components: { VSnackbar, VButton },
    setup: () => ({ args, snackbar, t }),
    template: `
      <VSnackbar v-bind="args" />
      <VButton
        variant="outline"
        tone="neutral"
        @click="snackbar({ message: t.staysUntilReplaced, duration: 0, action: () => {} })"
      >
        {{ t.persistent }}
      </VButton>
    `,
  }),
}

/** The countdown holds while the pointer rests on the bar, or while the keyboard is in it. */
export const AutoDismiss: Story = {
  render: (args) => ({
    components: { VSnackbar, VButton },
    setup: () => ({ args, snackbar, t }),
    template: `
      <VSnackbar v-bind="args" />
      <VButton
        variant="outline"
        tone="neutral"
        @click="snackbar({ message: t.disappearsIn1500, duration: 1500, action: () => {} })"
      >
        {{ t.quick }}
      </VButton>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const host = canvasElement.querySelector('.v-snackbar-host') as HTMLElement

    await userEvent.click(canvas.getByRole('button', { name: 'Disappears in 1.5 s' }))
    await waitFor(() => expect(within(host).getByText('Gone in 1500 ms.')).toBeVisible())
    await waitFor(() => expect(host.matches(':popover-open')).toBe(false), { timeout: 4000 })
  },
}

/**
 * The bar bounds its text, and the action stays CENTRED on a message that wraps — where a
 * notification would hook it to the first line.
 */
export const LongText: Story = {
  args: { duration: 0 },
  render: (args) => ({
    components: { VSnackbar, VButton },
    setup: () => ({ args, snackbar, t }),
    template: `
      <VSnackbar v-bind="args" />
      <VButton
        variant="outline"
        tone="neutral"
        @click="snackbar({ message: t.longTextBody, action: () => {} })"
      >
        {{ t.longText }}
      </VButton>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const host = canvasElement.querySelector('.v-snackbar-host') as HTMLElement

    await userEvent.click(canvas.getByRole('button', { name: 'Long message' }))
    const bar = await waitFor(() => host.querySelector('.v-snackbar') as HTMLElement)
    const action = within(host).getByRole('button', { name: 'Undo' })
    await waitFor(() => expect(action).toBeVisible())

    const barBox = bar.getBoundingClientRect()
    const actionBox = action.getBoundingClientRect()

    // The message really does wrap here — without that the assertion below would hold
    // under `align-items: flex-start` too, and prove nothing.
    expect(barBox.height).toBeGreaterThan(actionBox.height * 2)

    // Centred against the WHOLE bar, not hooked to its first line. Verified red with
    // `align-items: flex-start`, which parks the button in the top corner. The tolerance
    // absorbs sub-pixel layout, nothing more.
    const barCentre = barBox.top + barBox.height / 2
    const actionCentre = actionBox.top + actionBox.height / 2
    expect(Math.abs(actionCentre - barCentre)).toBeLessThan(1.5)
  },
}
