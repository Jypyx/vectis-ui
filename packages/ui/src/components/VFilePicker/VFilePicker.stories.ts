import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, fireEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import { builtinIcons as icons } from '../VIcon/icons'
import { storyText } from '../../stories/storyText'
import VButton from '../VButton/VButton.vue'
import VIcon from '../VIcon/VIcon.vue'
import type { FilePickerRejection } from './VFilePicker.vue'
import VFilePicker from './VFilePicker.vue'

const t = storyText({
  en: {
    title: 'Drag your files here',
    subtitle: 'PDF, PNG or JPG — 5 MB max per file',
    pdfOnly: 'PDF only',
    imagesOnly: 'Images only, 2 MB max',
    upTo: 'Up to 2 files',
    dropOnly: 'Drop your files here',
    dropOnlyHint: 'The zone itself opens the dialog',
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
    title: 'Glissez vos fichiers ici',
    subtitle: 'PDF, PNG ou JPG — 5 Mo maximum par fichier',
    pdfOnly: 'PDF uniquement',
    imagesOnly: 'Images uniquement, 2 Mo maximum',
    upTo: 'Jusqu’à 2 fichiers',
    dropOnly: 'Déposez vos fichiers ici',
    dropOnlyHint: 'La zone elle-même ouvre la boîte de dialogue',
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
    preview: { control: 'inline-radio', options: [false, 'bottom', 'end'] },
  },
  // `title` is required, so it has to be pinned (the VIconButton `label`
  // precedent) — in English, matching what the templates render under the default
  // locale. Neither `preview` nor `multiple` is: pinning them would make the
  // Controls panel lie, showing a current value different from the default.
  args: {
    title: 'Drag your files here',
  },
} satisfies Meta<typeof VFilePicker>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Builds a real `DataTransfer` and drops it on the component.
 *
 * A play function must NEVER click the browse button, nor the zone once it is the
 * control: both open a genuine OS dialog, which no automation can close — the run
 * would hang. A drop exercises the same screening pipeline, and is precisely what
 * jsdom cannot do (it ships neither `DataTransfer` nor `DragEvent`).
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
 * A real 1×1 PNG. The bytes have to be decodable: a `Uint8Array` of zeroes would
 * make the `<img>` fire `error`, and the component would rightly fall back to the
 * type icon — the thumbnail assertion would then never see a `blob:` source.
 */
const PNG_1PX =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

const pngOf = (name: string) =>
  new File([Uint8Array.from(atob(PNG_1PX), (c) => c.charCodeAt(0))], name, { type: 'image/png' })

const body = (canvasElement: HTMLElement) =>
  canvasElement.querySelector<HTMLElement>('.v-file-picker-body')!

/**
 * The complete zone: a large icon, a required title, an optional subtitle, then
 * the "or" separator and the button that opens the system dialog. `preview`
 * lists what has been loaded, each row carrying a thumbnail or a type icon, the
 * name, the size and a remove button.
 */
export const Default: Story = {
  args: { preview: 'bottom', multiple: true },
  render: (args) => ({
    components: { VFilePicker },
    setup: () => ({ args, t, files: ref<File[]>([]) }),
    template: `
      <div style="width: 420px; display: grid; gap: 12px">
        <VFilePicker v-bind="args" v-model="files" :title="t.title" :subtitle="t.subtitle" />
        <output>{{ files.map((f) => f.name).join(', ') || t.nothing }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByRole('button', { name: 'Browse files' })).toBeInTheDocument()
    await expect(canvas.queryByRole('list')).toBeNull()

    drop(canvasElement, [
      fileOf('report.pdf', 1200, 'application/pdf'),
      fileOf('track.mp3', 3400, 'audio/mpeg'),
    ])

    await waitFor(() => expect(canvas.getAllByRole('listitem')).toHaveLength(2))
    await expect(canvas.getByText('1.2 kB')).toBeInTheDocument()
    await expect(canvas.getByRole('list', { name: 'Selected files' })).toBeInTheDocument()

    // The button vanishes with its row, so focus would fall back to <body>: it
    // has to land on the row that takes its place.
    await fireEvent.click(canvas.getByRole('button', { name: 'Remove report.pdf' }))
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Remove track.mp3' })).toHaveFocus(),
    )
    // Ends with the list on screen, so axe audits it.
  },
}

/**
 * `hideBrowse` keeps the top half alone. Drag & drop is not reachable from
 * a keyboard, so the zone then becomes the control ITSELF — a real `<button>`,
 * which brings Enter, Space, focus and the disabled state along for free. It is
 * exactly because a button may not contain a button that the preview list is
 * always rendered outside the zone.
 */
export const WithoutBrowse: Story = {
  args: { hideBrowse: true, preview: 'bottom', multiple: true },
  render: (args) => ({
    components: { VFilePicker },
    setup: () => ({ args, t, files: ref<File[]>([]) }),
    template: `
      <div style="width: 420px">
        <VFilePicker v-bind="args" v-model="files" :title="t.dropOnly" :subtitle="t.dropOnlyHint" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const zone = canvasElement.querySelector<HTMLElement>('.v-file-picker-zone')!

    // Never clicked, never Entered: that would open a real OS dialog.
    await expect(zone.tagName).toBe('BUTTON')
    await expect(zone.tabIndex).toBe(0)

    drop(canvasElement, [fileOf('report.pdf', 1200, 'application/pdf')])

    await waitFor(() => expect(within(canvasElement).getAllByRole('listitem')).toHaveLength(1))
    // The invariant axe checks right after this: no nested interactive element.
    await expect(zone.querySelectorAll('button, a, [tabindex]')).toHaveLength(0)
  },
}

/**
 * `preview="end"` puts the list beside the zone. The fold-back is a **container
 * query**, not a media query: the component follows the width it is given, so it
 * behaves the same in a page, in a dialog or in a narrow sidebar.
 */
export const PreviewEnd: Story = {
  args: { preview: 'end', multiple: true },
  render: (args) => ({
    components: { VFilePicker },
    setup: () => ({ args, t, files: ref<File[]>([fileOf('report.pdf', 1200, 'application/pdf')]) }),
    template: `
      <div style="width: 720px">
        <VFilePicker v-bind="args" v-model="files" :title="t.title" :subtitle="t.subtitle" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    await expect(getComputedStyle(body(canvasElement)).flexDirection).toBe('row')
  },
}

/**
 * The same story in a 380px container: below the threshold the list moves back
 * under the zone. This is the only place the container query can be exercised —
 * jsdom evaluates no style at all.
 */
export const PreviewEndNarrow: Story = {
  args: { preview: 'end', multiple: true },
  render: (args) => ({
    components: { VFilePicker },
    setup: () => ({ args, t, files: ref<File[]>([fileOf('report.pdf', 1200, 'application/pdf')]) }),
    template: `
      <div style="width: 380px">
        <VFilePicker v-bind="args" v-model="files" :title="t.title" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    await expect(getComputedStyle(body(canvasElement)).flexDirection).toBe('column')
  },
}

/**
 * An image gets a real thumbnail: an object URL created on the client only, and
 * revoked as soon as the file leaves the model or the component unmounts.
 * Everything else falls back to the icon of its kind — PDF, audio, video,
 * archive, spreadsheet, code, or the generic document.
 */
export const Thumbnails: Story = {
  args: { preview: 'bottom', multiple: true, accept: 'image/*,.pdf,.zip' },
  render: (args) => ({
    components: { VFilePicker },
    setup: () => ({ args, t, files: ref<File[]>([]) }),
    template: `
      <div style="width: 420px">
        <VFilePicker v-bind="args" v-model="files" :title="t.title" :subtitle="t.imagesOnly" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    drop(canvasElement, [
      pngOf('holiday.png'),
      fileOf('invoice.pdf', 900, 'application/pdf'),
      fileOf('backup.zip', 4200, 'application/zip'),
    ])

    await waitFor(() => expect(canvas.getAllByRole('listitem')).toHaveLength(3))

    const image = canvasElement.querySelector<HTMLImageElement>('.v-file-picker-image')!
    await expect(image.src.startsWith('blob:')).toBe(true)
    await expect(canvasElement.querySelectorAll('[data-icon="picture_as_pdf"]')).toHaveLength(1)
    await expect(canvasElement.querySelectorAll('[data-icon="folder_zip"]')).toHaveLength(1)
  },
}

/**
 * The zone reacts to a drag as a whole. The state is held by a depth COUNTER and
 * not a boolean: `dragleave` fires every time the pointer crosses into a child,
 * so a boolean would flicker off under the cursor.
 */
export const DragAndDrop: Story = {
  args: { preview: 'bottom' },
  render: (args) => ({
    components: { VFilePicker },
    setup: () => ({ args, t, files: ref<File[]>([]) }),
    template: `
      <div style="width: 420px">
        <VFilePicker v-bind="args" v-model="files" :title="t.title" :subtitle="t.subtitle" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector('.v-file-picker')!
    const zone = canvasElement.querySelector('.v-file-picker-zone')!

    await fireEvent.dragEnter(root)
    await expect(root).toHaveAttribute('data-dragging')

    // Entering a child then leaving the root: still dragging, because the pairs
    // are counted.
    await fireEvent.dragEnter(zone)
    await fireEvent.dragLeave(root)
    await expect(root).toHaveAttribute('data-dragging')

    await fireEvent.dragLeave(zone)
    await expect(root).not.toHaveAttribute('data-dragging')
  },
}

/**
 * `accept`, `maxSize`, `maxTotalSize` and `maxFiles` screen every file, from the
 * dialog AND from a drop — the `accept` attribute has no say over a drop, which
 * is why the rule exists a second time in JS. A refused file never enters the
 * model; it is reported through `reject`, one event per file.
 */
export const Limits: Story = {
  args: { preview: 'bottom', multiple: true, accept: '.pdf', maxSize: 2000, maxFiles: 2 },
  render: (args) => ({
    components: { VFilePicker },
    setup: () => ({ args, t, files: ref<File[]>([]), refused: ref<FilePickerRejection[]>([]) }),
    template: `
      <div style="width: 420px; display: grid; gap: 12px">
        <VFilePicker
          v-bind="args"
          v-model="files"
          :title="t.title"
          :subtitle="t.pdfOnly + ' — ' + t.upTo"
          @reject="refused.push($event)"
        />
        <output>
          {{ refused.map((r) => t.refused + ': ' + r.file.name + ' (' + t.reasons[r.reason] + ')').join(' · ') || '—' }}
        </output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    drop(canvasElement, [
      fileOf('photo.jpg', 100, 'image/jpeg'),
      fileOf('huge.pdf', 5000, 'application/pdf'),
      fileOf('a.pdf', 100, 'application/pdf'),
    ])

    await waitFor(() => expect(canvas.getAllByRole('listitem')).toHaveLength(1))
    await expect(canvas.getByText(/wrong type/)).toBeInTheDocument()
    await expect(canvas.getByText(/file too big/)).toBeInTheDocument()
  },
}

/**
 * Every visible part is a slot. `#browse` receives `open`, without which a custom
 * button could no longer open the dialog; `#remove` receives `remove` and a
 * ready-made `label` carrying the file name — dropping it would leave an unnamed
 * button, which axe fails.
 */
export const CustomSlots: Story = {
  args: { preview: 'bottom', multiple: true },
  render: (args) => ({
    components: { VFilePicker, VButton, VIcon },
    setup: () => ({
      icons,
      args,
      t,
      files: ref<File[]>([fileOf('report.pdf', 1200, 'application/pdf')]),
    }),
    template: `
      <div style="width: 420px">
        <VFilePicker v-bind="args" v-model="files" :title="t.title">
          <template #icon><VIcon :name="icons.attach_file" /></template>
          <template #browse="{ open, disabled }">
            <VButton variant="soft" tone="accent" :disabled="disabled" @click="open">
              {{ t.selection }}
            </VButton>
          </template>
          <template #remove="{ remove, label }">
            <VButton variant="ghost" tone="danger" size="sm" :aria-label="label" @click="remove">
              ✕
            </VButton>
          </template>
        </VFilePicker>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByRole('button', { name: 'Remove report.pdf' })).toBeInTheDocument()
    await expect(canvasElement.querySelector('[data-icon="attach_file"]')).toBeInTheDocument()
  },
}

/**
 * `disabled` greys the zone through tokens and makes dialog and drop inert;
 * `readonly` keeps the selection on screen but takes every way of changing it
 * away — no dialog, no drop, no removal.
 */
export const States: Story = {
  render: (args) => ({
    components: { VFilePicker },
    setup: () => ({
      args,
      t,
      files: ref<File[]>([fileOf('report.pdf', 1200, 'application/pdf')]),
    }),
    template: `
      <div style="width: 420px; display: grid; gap: 20px">
        <VFilePicker v-bind="args" disabled :title="t.title" :subtitle="t.subtitle" />
        <VFilePicker
          v-bind="args"
          readonly
          preview="bottom"
          v-model="files"
          :title="t.title"
          :subtitle="t.subtitle"
        />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getAllByRole('button', { name: 'Browse files' })[0]).toBeDisabled()
    // Readonly keeps the row but not the removal.
    await expect(canvas.getByRole('button', { name: 'Remove report.pdf' })).toBeDisabled()
  },
}
