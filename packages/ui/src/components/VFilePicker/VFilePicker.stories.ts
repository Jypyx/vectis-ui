import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, fireEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import { storyText } from '../../stories/storyText'
import VChip from '../VChip/VChip.vue'
import type { FilePickerRejection } from './VFilePicker.vue'
import VFilePicker from './VFilePicker.vue'

const t = storyText({
  en: {
    attachment: 'Attachment',
    attachments: 'Attachments',
    invoices: 'Invoices',
    photos: 'Photos',
    pdfOnly: 'PDF only, 2 MB max per file',
    imagesOnly: 'Images and PDF — drop them here too',
    upTo: 'Up to 3 files, 5 MB in total',
    dropHere: 'Drop your files on the field, or click it',
    selection: 'Selection reported to the parent',
    nothing: 'Nothing selected yet',
    refused: 'Refused',
    reasons: {
      type: 'wrong type',
      size: 'file too big',
      count: 'too many files',
      'total-size': 'total size exceeded',
    } as Record<string, string>,
  },
  fr: {
    attachment: 'Pièce jointe',
    attachments: 'Pièces jointes',
    invoices: 'Factures',
    photos: 'Photos',
    pdfOnly: 'PDF uniquement, 2 Mo maximum par fichier',
    imagesOnly: 'Images et PDF — déposez-les ici aussi',
    upTo: 'Jusqu’à 3 fichiers, 5 Mo au total',
    dropHere: 'Déposez vos fichiers sur le champ, ou cliquez-le',
    selection: 'Sélection remontée au parent',
    nothing: 'Aucun fichier pour le moment',
    refused: 'Refusé',
    reasons: {
      type: 'mauvais type',
      size: 'fichier trop lourd',
      count: 'trop de fichiers',
      'total-size': 'poids total dépassé',
    } as Record<string, string>,
  },
})

const meta = {
  title: 'Components/FilePicker',
  component: VFilePicker,
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    display: { control: 'inline-radio', options: ['text', 'chip'] },
  },
  // Neither `display` nor `multiple`: pinning them would make the Controls panel
  // lie, showing a current value different from the component's default.
  args: {
    counter: true,
  },
} satisfies Meta<typeof VFilePicker>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Builds a real `DataTransfer` and drops it on the component.
 *
 * A play function must NEVER click the field or press Enter on it: that opens a
 * genuine OS dialog, which no automation can close — the run would hang. A drop
 * exercises the same acceptance pipeline, and is precisely what jsdom cannot do
 * (it ships neither `DataTransfer` nor `DragEvent`).
 *
 * Dispatched by hand rather than through `fireEvent.drop`: in a real browser the
 * helper REBUILDS a fresh `DataTransfer` and copies only the OWN property names
 * of the one it is given — a genuine `DataTransfer` has none of them (everything
 * sits on the prototype), so the files would silently vanish and every assertion
 * below would fail on an empty selection.
 */
function drop(canvasElement: HTMLElement, files: File[]) {
  const dataTransfer = new DataTransfer()
  for (const file of files) dataTransfer.items.add(file)
  canvasElement
    .querySelector('.v-file-picker')!
    .dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer }))
}

const fileOf = (name: string, size: number, type: string) =>
  new File([new Uint8Array(size)], name, { type })

/**
 * A single file. The field is read-only — its value comes from the dialog or
 * from a drop, never from typing — and the paperclip on the right opens the
 * system picker, with the clear cross appearing to its left as soon as there is
 * something to erase.
 */
export const Default: Story = {
  render: (args) => ({
    components: { VFilePicker },
    setup: () => ({ args, t, files: ref<File[]>([]) }),
    template: `
      <div style="width: 340px; display: grid; gap: 8px">
        <VFilePicker v-bind="args" v-model="files" :label="t.attachment" :hint="t.dropHere" />
        <output>{{ files.map((f) => f.name).join(', ') || '—' }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const field = canvas.getByRole('textbox', { name: 'Attachment' })

    await expect(field).toHaveAttribute('readonly')
    await expect(canvas.queryByRole('button', { name: 'Clear files' })).toBeNull()

    drop(canvasElement, [fileOf('report.pdf', 1200, 'application/pdf')])

    await waitFor(() => expect(field).toHaveValue('report.pdf'))
    await expect(canvas.getByText('1 file (1.2 kB)')).toBeInTheDocument()

    // The cross empties everything and must not reopen the dialog behind itself.
    await fireEvent.click(canvas.getByRole('button', { name: 'Clear files' }))
    await waitFor(() => expect(field).toHaveValue(''))
  },
}

/**
 * `multiple` accepts a whole batch. In the default `text` rendering the names are
 * joined with commas and the line is truncated when it overflows — the counter
 * under the field is what keeps the total readable.
 */
export const Multiple: Story = {
  args: { multiple: true },
  render: (args) => ({
    components: { VFilePicker },
    setup: () => ({ args, t, files: ref<File[]>([]) }),
    template: `
      <div style="width: 340px">
        <VFilePicker v-bind="args" v-model="files" :label="t.attachments" :hint="t.dropHere" />
      </div>
    `,
  }),
}

/**
 * `display="chip"` gives each file its own removable chip. The field then grows
 * with the rows, while the paperclip and the cross stay pinned to its end.
 */
export const Chips: Story = {
  args: { multiple: true, display: 'chip' },
  render: (args) => ({
    components: { VFilePicker },
    setup: () => ({ args, t, files: ref<File[]>([]) }),
    template: `
      <div style="width: 340px">
        <VFilePicker v-bind="args" v-model="files" :label="t.attachments" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    drop(canvasElement, [
      fileOf('report.pdf', 1000, 'application/pdf'),
      fileOf('photo.jpg', 2000, 'image/jpeg'),
    ])

    await waitFor(() => expect(canvasElement.querySelectorAll('.v-chip')).toHaveLength(2))
    await expect(canvas.getByText('2 files (3 kB)')).toBeInTheDocument()

    await fireEvent.click(canvas.getByRole('button', { name: 'Remove report.pdf' }))
    await waitFor(() => expect(canvasElement.querySelectorAll('.v-chip')).toHaveLength(1))
    await expect(canvas.getByText('1 file (2 kB)')).toBeInTheDocument()
  },
}

/**
 * `maxSize`, `maxTotalSize` and `maxFiles` are limits, not warnings: an
 * out-of-bounds file never enters the model. Each refusal is reported through
 * `reject`, one event per file — the message is yours to write.
 */
export const Limits: Story = {
  args: { multiple: true, maxFiles: 3, maxSize: 2_000_000, maxTotalSize: 5_000_000 },
  render: (args) => ({
    components: { VFilePicker },
    setup: () => ({ args, t, files: ref<File[]>([]), refused: ref<FilePickerRejection[]>([]) }),
    template: `
      <div style="width: 340px; display: grid; gap: 8px">
        <VFilePicker
          v-bind="args"
          v-model="files"
          :label="t.invoices"
          :hint="t.upTo"
          @reject="refused.unshift($event)"
        />
        <output v-if="refused.length">
          {{ t.refused }}: {{ refused.map((r) => r.file.name + ' — ' + t.reasons[r.reason]).join(' · ') }}
        </output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    drop(canvasElement, [
      fileOf('invoice.pdf', 1000, 'application/pdf'),
      fileOf('huge.pdf', 3_000_000, 'application/pdf'),
    ])

    await waitFor(() => expect(canvas.getByText('1 file (1 kB)')).toBeInTheDocument())
    await expect(canvas.getByText(/huge\.pdf/)).toBeInTheDocument()
  },
}

/**
 * `accept` filters the system dialog through the native attribute — and a drop
 * through the component's own matching, since the attribute has no say there.
 * Spell extensions alongside the MIME families: a file whose type the OS did not
 * guess arrives with an empty `type`.
 */
export const Accept: Story = {
  args: { multiple: true, accept: 'image/*,.pdf' },
  render: (args) => ({
    components: { VFilePicker },
    setup: () => ({ args, t, files: ref<File[]>([]), refused: ref<FilePickerRejection[]>([]) }),
    template: `
      <div style="width: 340px; display: grid; gap: 8px">
        <VFilePicker
          v-bind="args"
          v-model="files"
          :label="t.photos"
          :hint="t.imagesOnly"
          @reject="refused.unshift($event)"
        />
        <output v-if="refused.length">{{ t.refused }}: {{ refused[0].file.name }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    drop(canvasElement, [
      fileOf('photo.jpg', 500, 'image/jpeg'),
      fileOf('notes.txt', 500, 'text/plain'),
    ])

    await waitFor(() => expect(canvas.getByText('1 file (500 byte)')).toBeInTheDocument())
    await expect(canvas.getByText(/notes\.txt/)).toBeInTheDocument()
  },
}

/**
 * Dragging over the component highlights the field by redefining the very
 * variable that carries its border colour, so the drag state and the focus state
 * can never disagree. `droppable: false` opts out.
 */
export const DragAndDrop: Story = {
  args: { multiple: true },
  render: (args) => ({
    components: { VFilePicker },
    setup: () => ({ args, t, files: ref<File[]>([]) }),
    template: `
      <div style="width: 340px">
        <VFilePicker v-bind="args" v-model="files" :label="t.attachments" :hint="t.dropHere" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector('.v-file-picker')!
    const field = canvasElement.querySelector('.v-input-field')!

    await fireEvent.dragEnter(root)
    await waitFor(() => expect(root).toHaveAttribute('data-dragging'))

    // Crossing into a child fires `dragleave` on the root: the depth counter is
    // what keeps the highlight from flickering off under the cursor.
    await fireEvent.dragEnter(field)
    await fireEvent.dragLeave(root)
    await expect(root).toHaveAttribute('data-dragging')

    drop(canvasElement, [fileOf('a.pdf', 100, 'application/pdf')])
    await waitFor(() => expect(root).not.toHaveAttribute('data-dragging'))
  },
}

/**
 * The whole point of the `File[]` model: the component displays, the parent
 * previews. Nothing is uploaded, nothing is read for you — `File` objects come
 * out exactly as the browser handed them over.
 */
export const Preview: Story = {
  args: { multiple: true, display: 'chip' },
  render: (args) => ({
    components: { VFilePicker },
    setup: () => ({ args, t, files: ref<File[]>([]) }),
    template: `
      <div style="width: 360px; display: grid; gap: 12px">
        <VFilePicker v-bind="args" v-model="files" :label="t.attachments" />
        <div>
          <strong>{{ t.selection }}</strong>
          <p v-if="!files.length">{{ t.nothing }}</p>
          <ul v-else style="margin: 4px 0 0; padding-inline-start: 20px">
            <li v-for="file in files" :key="file.name">
              {{ file.name }} — {{ file.type || '?' }} — {{ file.size }} B
            </li>
          </ul>
        </div>
      </div>
    `,
  }),
}

/** The three field heights, plus the -4px `compact` variant. */
export const Sizes: Story = {
  args: { multiple: true, display: 'chip' },
  render: (args) => ({
    components: { VFilePicker },
    setup: () => ({ args, sizes: ['sm', 'md', 'lg'] as const }),
    template: `
      <div style="width: 340px; display: grid; gap: 16px">
        <VFilePicker v-for="size in sizes" :key="size" v-bind="args" :size="size" :label="size" />
        <VFilePicker v-bind="args" compact label="md compact" />
      </div>
    `,
  }),
}

/**
 * `readonly` displays a selection that can no longer change: no dialog, no drop,
 * no cross — and the paperclip disappears with the affordance it stood for.
 */
export const States: Story = {
  render: (args) => ({
    components: { VFilePicker },
    setup: () => ({ args, t, picked: ref([new File(['x'], 'contract.pdf')]) }),
    template: `
      <div style="width: 340px; display: grid; gap: 16px">
        <VFilePicker v-bind="args" disabled :label="t.attachment" :model-value="picked" />
        <VFilePicker v-bind="args" readonly :label="t.attachment" :model-value="picked" />
        <VFilePicker v-bind="args" invalid :label="t.attachment" :hint="t.pdfOnly" />
      </div>
    `,
  }),
}

/**
 * `#chip` replaces a file's chip, `#counter` its summary line. The chip slot
 * hands you `remove` — without it the file could no longer be taken out — plus
 * the `size`/`compact` computed to fit inside the field.
 */
export const CustomSlots: Story = {
  args: { multiple: true, display: 'chip', counter: true },
  render: (args) => ({
    components: { VFilePicker, VChip },
    setup: () => ({
      args,
      t,
      files: ref([new File(['x'], 'report.pdf'), new File(['x'], 'photo.jpg')]),
    }),
    template: `
      <div style="width: 340px">
        <VFilePicker v-bind="args" v-model="files" :label="t.attachments">
          <template #chip="{ file, remove, size, compact }">
            <VChip
              variant="outline"
              shape="pill"
              icon-start="attach_file"
              :size="size"
              :compact="compact"
              dismissible
              :dismiss-label="'Remove ' + file.name"
              @dismiss="remove()"
              >{{ file.name }}</VChip
            >
          </template>
          <template #counter="{ count }">{{ count }} / 5</template>
        </VFilePicker>
      </div>
    `,
  }),
}
