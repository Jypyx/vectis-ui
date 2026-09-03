import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import { storyText } from '../../stories/storyText'
import VButton from '../VButton/VButton.vue'
import VTypography from '../VTypography/VTypography.vue'
import VDialog from './VDialog.vue'

const t = storyText({
  en: {
    shareDocument: 'Share the document',
    shareSubtitle: 'Choose who can access this file.',
    openModal: 'Open the modal',
    shareBody:
      'Anyone with the link will be able to view the document. You can revoke access at any time from the sharing settings.',
    cancel: 'Cancel',
    share: 'Share',
    modal: (width: string) => `${width} modal`,
    widthSubtitle: 'The width is driven by the width prop.',
    widthBody: (width: string) => `Content of the modal at width ${width}.`,
    close: 'Close',
    terms: 'Terms of use',
    scrollToRead: 'Scroll to read it all.',
    readTerms: 'Read the terms',
    decline: 'Decline',
    accept: 'Accept',
    newVersionAvailable: 'A new version is available',
    customHeader: 'Custom header',
    newVersion: 'New version',
    versionBody: 'Version 2.0 is ready to install.',
    later: 'Later',
    preview: 'Preview',
    openPreview: 'Open the preview',
    download: 'Download',
    fullScreen: 'Full screen',
    previewArea: 'Document preview area.',
    openWithoutCross: 'Open without a cross',
    noCrossBody: 'No cross: use the actions below.',
    confirm: 'Confirm',
  },
  fr: {
    shareDocument: 'Partager le document',
    shareSubtitle: 'Choisissez qui peut accéder à ce fichier.',
    openModal: 'Ouvrir la modale',
    shareBody:
      "Toute personne disposant du lien pourra consulter le document. Vous pouvez révoquer l'accès à tout moment depuis les paramètres de partage.",
    cancel: 'Annuler',
    share: 'Partager',
    modal: (width: string) => `Modale ${width}`,
    widthSubtitle: 'Largeur pilotée par la prop width.',
    widthBody: (width: string) => `Contenu de la modale en largeur ${width}.`,
    close: 'Fermer',
    terms: "Conditions d'utilisation",
    scrollToRead: 'Faites défiler pour tout lire.',
    readTerms: 'Lire les conditions',
    decline: 'Refuser',
    accept: 'Accepter',
    newVersionAvailable: 'Nouvelle version disponible',
    customHeader: 'Header personnalisé',
    newVersion: 'Nouvelle version',
    versionBody: 'La version 2.0 est prête à être installée.',
    later: 'Plus tard',
    preview: 'Aperçu',
    openPreview: "Ouvrir l'aperçu",
    download: 'Télécharger',
    fullScreen: 'Plein écran',
    previewArea: "Zone d'aperçu du document.",
    openWithoutCross: 'Ouvrir sans croix',
    noCrossBody: 'Pas de croix : utilisez les actions ci-dessous.',
    confirm: 'Valider',
  },
})

const meta = {
  title: 'Components/Dialog',
  component: VDialog,
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    width: { control: 'text' },
    hideClose: { control: 'boolean' },
    persistentBackdrop: { control: 'boolean' },
    persistentEscape: { control: 'boolean' },
    closeLabel: { control: 'text' },
  },
  args: {
    width: '400px',
  },
  render: (args) => ({
    components: { VDialog, VButton, VTypography },
    setup() {
      const open = ref(false)
      return { args, t, open }
    },
    template: `
      <VDialog v-bind="args" v-model:open="open" :title="t.shareDocument" :subtitle="t.shareSubtitle">
        <template #trigger="{ triggerProps }">
          <VButton v-bind="triggerProps">{{ t.openModal }}</VButton>
        </template>
        <VTypography>{{ t.shareBody }}</VTypography>
        <template #footer>
          <VButton variant="ghost" tone="neutral" @click="open = false">{{ t.cancel }}</VButton>
          <VButton @click="open = false">{{ t.share }}</VButton>
        </template>
      </VDialog>
    `,
  }),
} satisfies Meta<typeof VDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // opening through the trigger (the #trigger slot): the modal moves to the top layer.
    // Lazy mounting: the <dialog> only exists in the DOM once open, so it can only be
    // queried after the click.
    await userEvent.click(canvas.getByRole('button', { name: 'Open the modal' }))
    const dialog = await waitFor(() => {
      const el = canvasElement.querySelector('.v-dialog') as HTMLDialogElement | null
      expect(el?.open).toBe(true)
      return el!
    })

    // closing through the cross: the <dialog> is entirely unmounted
    await userEvent.click(within(dialog).getByRole('button', { name: 'Close' }))
    await waitFor(() => expect(canvasElement.querySelector('.v-dialog')).toBeNull())
  },
}

/**
 * The `width` prop accepts any CSS unit and stays bounded to 100% of the viewport
 * (shrink the window and the modal retracts).
 */
export const Width: Story = {
  render: (args) => ({
    components: { VDialog, VButton, VTypography },
    setup() {
      const opened = ref<string | null>(null)
      const widths = ['320px', '480px', '640px'] as const
      return { args, t, opened, widths }
    },
    template: `
      <div style="display: flex; gap: 8px; flex-wrap: wrap">
        <VButton v-for="w in widths" :key="w" variant="outline" tone="neutral" @click="opened = w">
          {{ w }}
        </VButton>
      </div>
      <VDialog
        v-for="w in widths"
        :key="w"
        :width="w"
        :title="t.modal(w)"
        :subtitle="t.widthSubtitle"
        :open="opened === w"
        @update:open="(v) => { if (!v) opened = null }"
      >
        <VTypography>{{ t.widthBody(w) }}</VTypography>
        <template #footer>
          <VButton @click="opened = null">{{ t.close }}</VButton>
        </template>
      </VDialog>
    `,
  }),
}

/**
 * Overflowing content: the body becomes scrollable while the header and the footer stay
 * put. The separators only appear when content passes under the header or under the
 * footer (scroll-state container queries, Chrome 133+).
 */
export const LongContent: Story = {
  render: (args) => ({
    components: { VDialog, VButton, VTypography },
    setup() {
      const open = ref(false)
      const paragraphs = Array.from({ length: 12 }, (_, i) => i + 1)
      return { args, t, open, paragraphs }
    },
    template: `
      <VDialog :title="t.terms" :subtitle="t.scrollToRead" v-model:open="open">
        <template #trigger="{ triggerProps }">
          <VButton v-bind="triggerProps">{{ t.readTerms }}</VButton>
        </template>
        <p v-for="n in paragraphs" :key="n" style="margin: 0 0 12px">
          {{ n }}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
          nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </p>
        <template #footer>
          <VButton variant="ghost" tone="neutral" @click="open = false">{{ t.decline }}</VButton>
          <VButton @click="open = false">{{ t.accept }}</VButton>
        </template>
      </VDialog>
    `,
  }),
}

/** The `#header` slot entirely replaces the title/subtitle block. */
export const CustomHeader: Story = {
  render: (args) => ({
    components: { VDialog, VButton, VTypography },
    setup() {
      const open = ref(false)
      return { args, t, open }
    },
    template: `
      <VDialog v-model:open="open" :aria-label="t.newVersionAvailable">
        <template #trigger="{ triggerProps }">
          <VButton v-bind="triggerProps">{{ t.customHeader }}</VButton>
        </template>
        <template #header>
          <div style="display: flex; align-items: center; gap: 12px">
            <span
              style="display: grid; place-items: center; width: 40px; height: 40px; border-radius: 999px; background: var(--vectis-color-accent-surface); color: var(--vectis-color-accent-text)"
            >
              ✦
            </span>
            <VTypography variant="heading-3" as="strong">{{ t.newVersion }}</VTypography>
          </div>
        </template>
        <VTypography>{{ t.versionBody }}</VTypography>
        <template #footer>
          <VButton @click="open = false">{{ t.later }}</VButton>
        </template>
      </VDialog>
    `,
  }),
}

/** The `#headerActions` slot adds controls just to the left of the cross. */
export const HeaderActions: Story = {
  render: (args) => ({
    components: { VDialog, VButton, VTypography },
    setup() {
      const open = ref(false)
      return { args, t, open }
    },
    template: `
      <VDialog :title="t.preview" subtitle="document.pdf" v-model:open="open">
        <template #trigger="{ triggerProps }">
          <VButton v-bind="triggerProps">{{ t.openPreview }}</VButton>
        </template>
        <template #headerActions>
          <VButton variant="ghost" tone="neutral" size="sm" iconStart="download" :aria-label="t.download" />
          <VButton variant="ghost" tone="neutral" size="sm" iconStart="open_in_full" :aria-label="t.fullScreen" />
        </template>
        <VTypography>{{ t.previewArea }}</VTypography>
      </VDialog>
    `,
  }),
}

/** `hideClose` removes the cross: closing then goes through the footer or Escape. */
export const WithoutCross: Story = {
  args: { hideClose: true },
  render: (args) => ({
    components: { VDialog, VButton, VTypography },
    setup() {
      const open = ref(false)
      return { args, t, open }
    },
    template: `
      <VDialog v-bind="args" v-model:open="open" :title="t.shareDocument">
        <template #trigger="{ triggerProps }">
          <VButton v-bind="triggerProps">{{ t.openWithoutCross }}</VButton>
        </template>
        <VTypography>{{ t.noCrossBody }}</VTypography>
        <template #footer>
          <VButton variant="ghost" tone="neutral" @click="open = false">{{ t.cancel }}</VButton>
          <VButton @click="open = false">{{ t.confirm }}</VButton>
        </template>
      </VDialog>
    `,
  }),
}

/** Escape closes the modal, unless `persistentEscape` says otherwise. */
export const EscapeDismiss: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // lazy mounting: the <dialog> is only queryable once open
    await userEvent.click(canvas.getByRole('button', { name: 'Open the modal' }))
    const dialog = await waitFor(() => {
      const el = canvasElement.querySelector('.v-dialog') as HTMLDialogElement | null
      expect(el?.open).toBe(true)
      return el!
    })

    // Escape goes through the native CloseWatcher (closedby), which requires a *trusted*
    // keystroke — impossible to synthesize in a play function. The same native route is
    // taken (close() → the 'close' event) to check OUR bridge: the v-model resync then
    // the complete unmount.
    dialog.close()
    await waitFor(() => expect(canvasElement.querySelector('.v-dialog')).toBeNull())
  },
}
