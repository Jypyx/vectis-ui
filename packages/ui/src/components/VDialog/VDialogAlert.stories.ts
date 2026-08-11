import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import { storyText } from '../../stories/storyText'
import VButton from '../VButton/VButton.vue'
import VTypography from '../VTypography/VTypography.vue'
import VDialogAlert from './VDialogAlert.vue'

const t = storyText({
  en: {
    deleteProject: 'Delete the project?',
    permanent: 'This action is permanent.',
    delete: 'Delete',
    deleteBody: 'The project and all its data will be deleted. This action cannot be undone.',
    cancel: 'Cancel',
    deletePermanently: 'Delete permanently',
    leaveWithoutSaving: 'Leave without saving?',
    changesLost: 'Your changes will be lost.',
    leave: 'Leave',
    draftLost: 'An unsaved draft will be permanently lost.',
    keepEditing: 'Keep editing',
  },
  fr: {
    deleteProject: 'Supprimer le projet ?',
    permanent: 'Cette action est définitive.',
    delete: 'Supprimer',
    deleteBody:
      'Le projet et toutes ses données seront supprimés. Cette action ne peut pas être annulée.',
    cancel: 'Annuler',
    deletePermanently: 'Supprimer définitivement',
    leaveWithoutSaving: 'Quitter sans enregistrer ?',
    changesLost: 'Vos modifications seront perdues.',
    leave: 'Quitter',
    draftLost: 'Un brouillon non enregistré sera définitivement perdu.',
    keepEditing: "Continuer l'édition",
  },
})

const meta = {
  title: 'Components/DialogAlert',
  component: VDialogAlert,
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    width: { control: 'text' },
  },
  args: { width: '400px' },
  render: (args) => ({
    components: { VDialogAlert, VButton, VTypography },
    setup() {
      const open = ref(false)
      return { args, t, open }
    },
    template: `
      <VDialogAlert v-bind="args" v-model:open="open" :title="t.deleteProject" :subtitle="t.permanent">
        <template #trigger="{ triggerProps }">
          <VButton tone="danger" v-bind="triggerProps">{{ t.delete }}</VButton>
        </template>
        <VTypography>{{ t.deleteBody }}</VTypography>
        <template #footer>
          <VButton variant="ghost" tone="neutral" @click="open = false">{{ t.cancel }}</VButton>
          <VButton tone="danger" @click="open = false">{{ t.deletePermanently }}</VButton>
        </template>
      </VDialogAlert>
    `,
  }),
} satisfies Meta<typeof VDialogAlert>

export default meta
type Story = StoryObj<typeof meta>

/**
 * An alert requires an explicit action: no cross, and both the backdrop click AND the
 * Escape key are neutralized. Only the footer buttons close it.
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // lazy mounting: the <dialog> is only queryable once open
    await userEvent.click(canvas.getByRole('button', { name: 'Delete' }))
    const dialog = await waitFor(() => {
      const el = canvasElement.querySelector('.v-dialog') as HTMLDialogElement | null
      expect(el?.open).toBe(true)
      return el!
    })
    expect(dialog.getAttribute('role')).toBe('alertdialog')

    // Escape does not close an alert (closedby="none")
    await userEvent.keyboard('{Escape}')
    await new Promise((r) => setTimeout(r, 100))
    expect(dialog.open).toBe(true)

    // only an explicit action closes it (the <dialog> is then unmounted)
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(canvasElement.querySelector('.v-dialog')).toBeNull())
  },
}

/** A neutral confirmation alert (a non-destructive tone). */
export const Confirmation: Story = {
  render: (args) => ({
    components: { VDialogAlert, VButton, VTypography },
    setup() {
      const open = ref(false)
      return { args, t, open }
    },
    template: `
      <VDialogAlert v-bind="args" v-model:open="open" :title="t.leaveWithoutSaving" :subtitle="t.changesLost">
        <template #trigger="{ triggerProps }">
          <VButton variant="outline" tone="neutral" v-bind="triggerProps">{{ t.leave }}</VButton>
        </template>
        <VTypography>{{ t.draftLost }}</VTypography>
        <template #footer>
          <VButton variant="ghost" tone="neutral" @click="open = false">{{ t.keepEditing }}</VButton>
          <VButton @click="open = false">{{ t.leave }}</VButton>
        </template>
      </VDialogAlert>
    `,
  }),
}
