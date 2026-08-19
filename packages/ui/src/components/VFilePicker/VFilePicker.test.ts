import { fireEvent, render } from '@testing-library/vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import { fileKind } from './fileKind'
import VFilePicker from './VFilePicker.vue'

/**
 * A `File` of an arbitrary size, without allocating it: `size` is a getter on
 * `Blob.prototype`, so an own property on the instance shadows it.
 */
function fileOf(name: string, size = 10, type = ''): File {
  const file = new File(['x'], name, { type })
  Object.defineProperty(file, 'size', { value: size })
  return file
}

/** jsdom has no `FileList` constructor: an iterable array with `item()` is enough
    for the only thing the component does with it (a spread). */
const fileListOf = (files: File[]) =>
  Object.assign(files.slice(), { item: (i: number) => files[i] ?? null }) as unknown as FileList

/** Simulates a dialog: the input's `files` are forced, then `change` is fired. */
async function pick(input: HTMLInputElement, files: File[]) {
  Object.defineProperty(input, 'files', { value: fileListOf(files), configurable: true })
  await fireEvent.change(input)
}

/**
 * Records the writes to `input.value`. A spy is the only way to check the reset:
 * jsdom derives the `value` GETTER from its internal file list, which our `files`
 * override does not touch — so reading it back proves nothing.
 */
function trackReset(input: HTMLInputElement) {
  const writes: string[] = []
  Object.defineProperty(input, 'value', {
    configurable: true,
    get: () => '',
    set: (v: string) => writes.push(v),
  })
  return writes
}

/** Names of the files in the last `update:modelValue` payload. `emitted()` types
    its payloads as `{}`, so the cast happens once here. */
function pickedNames(events: unknown[]): string[] {
  const [files] = events.at(-1) as unknown as [File[]]
  return files.map((file) => file.name)
}

function renderUpload(props: Record<string, unknown> = {}, attrs: Record<string, unknown> = {}) {
  const utils = render(VFilePicker, { props: { title: 'Drop your files', ...props }, attrs })
  const native = utils.container.querySelector<HTMLInputElement>('input[type="file"]')!
  const zone = utils.container.querySelector<HTMLElement>('.v-file-picker-zone')!
  return { ...utils, native, zone }
}

describe('VFilePicker', () => {
  it('renders a hidden file input, out of the accessibility tree and out of the tab order', () => {
    const { native } = renderUpload()

    expect(native.getAttribute('tabindex')).toBe('-1')
    expect(native.getAttribute('aria-hidden')).toBe('true')
  })

  /*
   * The whole shape of the component hangs on this switch: a button inside a
   * button is invalid markup AND an axe `nested-interactive` violation, so the
   * zone may only become a control once there is no button left inside it.
   */
  it('is a plain container while the browse button is shown', () => {
    const { zone, getAllByRole } = renderUpload()

    expect(zone.tagName).toBe('DIV')
    expect(zone.hasAttribute('tabindex')).toBe(false)
    expect(getAllByRole('button')).toHaveLength(1)
  })

  it('becomes the control itself — a real <button> — once the browse button is hidden', () => {
    const { zone } = renderUpload({ showBrowse: false })

    expect(zone.tagName).toBe('BUTTON')
    expect(zone.getAttribute('type')).toBe('button')
    // The invariant that keeps axe green: no nested interactive element.
    expect(zone.querySelectorAll('button, a, input:not([type="file"])')).toHaveLength(0)
  })

  // No JS: `disabled` on a real <button> is what makes it inert, unfocusable and
  // silent on click, all at once.
  it.each([{ disabled: true }, { readonly: true }])(
    'disables the zone-as-control natively under %o',
    (props) => {
      const { zone } = renderUpload({ showBrowse: false, ...props })
      expect((zone as HTMLButtonElement).disabled).toBe(true)
    },
  )

  it('splits $attrs: the form attributes on the file input, everything else on the zone', () => {
    const { native, zone, container } = renderUpload(
      {},
      { name: 'attachments', form: 'profile', id: 'dropzone', 'data-test': 'x', class: 'mine' },
    )

    expect(native.getAttribute('name')).toBe('attachments')
    expect(native.getAttribute('form')).toBe('profile')
    expect(native.getAttribute('id')).toBeNull()

    expect(zone.getAttribute('id')).toBe('dropzone')
    expect(zone.getAttribute('data-test')).toBe('x')
    expect(zone.getAttribute('name')).toBeNull()

    // class/style stay on the root — the wrapper-root pattern.
    expect(container.querySelector('.v-file-picker')!.classList.contains('mine')).toBe(true)
    expect(zone.classList.contains('mine')).toBe(false)
  })

  it('a selection feeds the model and emits change', async () => {
    const { native, emitted } = renderUpload({ multiple: true })

    await pick(native, [fileOf('report.pdf'), fileOf('photo.jpg')])

    expect(pickedNames(emitted('update:modelValue'))).toEqual(['report.pdf', 'photo.jpg'])
    expect(emitted('change')).toHaveLength(1)
  })

  it('single mode keeps one file and refuses the rest with "count"', async () => {
    const { native, emitted } = renderUpload()

    await pick(native, [fileOf('a.pdf'), fileOf('b.pdf')])

    expect(pickedNames(emitted('update:modelValue'))).toEqual(['a.pdf'])
    expect(emitted('reject')).toEqual([[{ file: expect.anything(), reason: 'count' }]])
  })

  it('a batch refused in full never touches the model', async () => {
    const { native, emitted } = renderUpload({ maxSize: 100 })

    await pick(native, [fileOf('big.pdf', 500)])

    expect(emitted('update:modelValue')).toBeUndefined()
    expect(emitted('change')).toBeUndefined()
    expect(emitted('reject')).toHaveLength(1)
  })

  it('resets the native input on every path — selection, refusal, removal', async () => {
    const { native, getByRole } = renderUpload({
      multiple: true,
      maxSize: 100,
      preview: 'bottom',
      modelValue: [fileOf('a.pdf', 10)],
    })
    const writes = trackReset(native)

    await pick(native, [fileOf('b.pdf', 10)])
    expect(writes).toEqual([''])

    // A batch refused in full resets too: a file refused once must stay
    // re-pickable.
    await pick(native, [fileOf('big.pdf', 500)])
    expect(writes).toHaveLength(2)

    await fireEvent.click(getByRole('button', { name: 'Remove a.pdf' }))
    expect(writes).toHaveLength(3)
  })

  it('a click on the zone opens the dialog — but never a click on the browse button', async () => {
    const { zone, native, getByRole } = renderUpload()
    native.click = vi.fn()

    await fireEvent.click(zone)
    expect(native.click).toHaveBeenCalledOnce()

    // Without the `closest('button')` guard the click would bubble from the
    // button to the zone and open the dialog twice.
    await fireEvent.click(getByRole('button', { name: 'Browse files' }))
    expect(native.click).toHaveBeenCalledTimes(2)
  })

  it.each([{ disabled: true }, { readonly: true }])('is inert under %o', async (props) => {
    const { zone, native } = renderUpload(props)
    native.click = vi.fn()

    await fireEvent.click(zone)

    expect(native.click).not.toHaveBeenCalled()
  })
})

describe('VFilePicker preview list', () => {
  const files = [fileOf('report.pdf', 1200, 'application/pdf'), fileOf('song.mp3', 3000)]

  it('renders nothing without `preview`, and nothing while the model is empty', () => {
    expect(renderUpload({ modelValue: files }).queryByRole('list')).toBeNull()
    expect(renderUpload({ preview: 'bottom' }).queryByRole('list')).toBeNull()
  })

  it('is a named list of rows, each with a name, a formatted size and a named remove button', () => {
    const { getByRole, getAllByRole, container } = renderUpload({
      preview: 'bottom',
      multiple: true,
      modelValue: files,
    })

    expect(getByRole('list', { name: 'Selected files' })).toBeTruthy()
    expect(getAllByRole('listitem')).toHaveLength(2)
    expect(container.querySelector('.v-file-picker-size')!.textContent).toBe('1.2 kB')
    expect(getByRole('button', { name: 'Remove report.pdf' })).toBeTruthy()
  })

  /* The list is rendered OUTSIDE the zone in every mode: inside a zone that has
     become a <button>, its remove buttons would be nested interactive elements. */
  it('never renders inside the zone, not even when the zone is a button', () => {
    const { zone } = renderUpload({
      preview: 'bottom',
      showBrowse: false,
      multiple: true,
      modelValue: files,
    })

    expect(zone.querySelector('.v-file-picker-list')).toBeNull()
  })

  it('falls back to the type icon, and honours a typeIcons override', () => {
    const { container } = renderUpload({
      preview: 'bottom',
      multiple: true,
      modelValue: files,
      typeIcons: { audio: 'notifications' },
    })
    const icons = [...container.querySelectorAll('.v-file-picker-thumb [data-icon]')]

    expect(icons.map((el) => el.getAttribute('data-icon'))).toEqual([
      'picture_as_pdf',
      'notifications',
    ])
  })

  it('a removal shrinks the model, emits remove AND change, and hands focus to the next row', async () => {
    const { getByRole, emitted, container } = renderUpload({
      preview: 'bottom',
      multiple: true,
      modelValue: files,
    })

    await fireEvent.click(getByRole('button', { name: 'Remove report.pdf' }))
    await nextTick()

    expect(pickedNames(emitted('update:modelValue'))).toEqual(['song.mp3'])
    expect(emitted('remove')).toHaveLength(1)
    expect(emitted('change')).toHaveLength(1)
    expect(document.activeElement).toBe(
      container.querySelector('.v-file-picker-item .v-file-picker-remove'),
    )
  })

  it('hands focus back to the browse button once the list empties', async () => {
    const { getByRole } = renderUpload({ preview: 'bottom', modelValue: [files[0]!] })

    await fireEvent.click(getByRole('button', { name: 'Remove report.pdf' }))
    await nextTick()

    expect(document.activeElement).toBe(getByRole('button', { name: 'Browse files' }))
  })

  it('readonly keeps the list but takes the removal away', async () => {
    const { getByRole, emitted } = renderUpload({
      preview: 'bottom',
      readonly: true,
      modelValue: [files[0]!],
    })

    await fireEvent.click(getByRole('button', { name: 'Remove report.pdf' }))

    expect(emitted('remove')).toBeUndefined()
  })
})

describe('VFilePicker thumbnails', () => {
  /*
   * jsdom implements neither `createObjectURL` nor `revokeObjectURL`. Stubbed
   * HERE and not in `vitest.setup.ts`: the global file carries the gaps SEVERAL
   * components depend on (the Popover API, <dialog>); this one has one consumer.
   */
  beforeEach(() => {
    URL.createObjectURL = vi.fn((blob: Blob) => `blob:${(blob as File).name}`)
    URL.revokeObjectURL = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const png = () => fileOf('photo.png', 100, 'image/png')

  it('renders an <img> for an image and the type icon for anything else', async () => {
    const { container } = renderUpload({
      preview: 'bottom',
      multiple: true,
      modelValue: [png(), fileOf('a.pdf', 10, 'application/pdf')],
    })
    await nextTick()

    const [first, second] = container.querySelectorAll('.v-file-picker-thumb')
    expect(first!.querySelector('img')!.getAttribute('src')).toBe('blob:photo.png')
    expect(second!.querySelector('[data-icon]')!.getAttribute('data-icon')).toBe('picture_as_pdf')
  })

  it('creates no object URL at all when `thumbnails` is off', async () => {
    renderUpload({ preview: 'bottom', thumbnails: false, modelValue: [png()] })
    await nextTick()

    expect(URL.createObjectURL).not.toHaveBeenCalled()
  })

  it('revokes the URL of the file that left, and only that one', async () => {
    const [kept, gone] = [png(), fileOf('other.png', 100, 'image/png')]
    const { rerender } = renderUpload({
      preview: 'bottom',
      multiple: true,
      modelValue: [kept, gone],
    })
    await nextTick()

    await rerender({ title: 'Drop your files', preview: 'bottom', modelValue: [kept] })

    expect(URL.revokeObjectURL).toHaveBeenCalledExactlyOnceWith('blob:other.png')
  })

  // Replacing the model wholesale is a first-class case, not an edge one: the
  // reconciliation revokes the leavers and creates the arrivals in ONE pass.
  it('reconciles a wholesale replacement of the model in one pass', async () => {
    const { rerender } = renderUpload({ preview: 'bottom', modelValue: [png()] })
    await nextTick()
    vi.mocked(URL.createObjectURL).mockClear()

    await rerender({
      title: 'Drop your files',
      preview: 'bottom',
      modelValue: [fileOf('new.png', 100, 'image/png')],
    })

    expect(URL.revokeObjectURL).toHaveBeenCalledExactlyOnceWith('blob:photo.png')
    expect(URL.createObjectURL).toHaveBeenCalledOnce()
  })

  it('revokes everything on unmount', async () => {
    const { unmount } = renderUpload({ preview: 'bottom', modelValue: [png()] })
    await nextTick()

    unmount()

    expect(URL.revokeObjectURL).toHaveBeenCalledExactlyOnceWith('blob:photo.png')
  })

  // A decoding failure (HEIC, a corrupt file, a lying MIME) must not leave an
  // empty square: the URL goes and the type icon takes over.
  it('falls back to the icon when the image cannot be decoded', async () => {
    const { container } = renderUpload({ preview: 'bottom', modelValue: [png()] })
    await nextTick()

    await fireEvent.error(container.querySelector('img')!)

    expect(container.querySelector('img')).toBeNull()
    expect(container.querySelector('.v-file-picker-thumb [data-icon]')).toBeTruthy()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:photo.png')
  })
})

describe('VFilePicker drag & drop', () => {
  const root = (container: Element) => container.querySelector('.v-file-picker')!

  it('counts the enter/leave pairs instead of toggling a boolean', async () => {
    const el = root(renderUpload().container)

    await fireEvent.dragEnter(el)
    await fireEvent.dragEnter(el)
    expect(el.hasAttribute('data-dragging')).toBe(true)

    // The first leave is the pointer crossing into a child: still dragging.
    await fireEvent.dragLeave(el)
    expect(el.hasAttribute('data-dragging')).toBe(true)

    await fireEvent.dragLeave(el)
    expect(el.hasAttribute('data-dragging')).toBe(false)
  })

  it('cancels dragover (without it the browser navigates to the file) and clears on drop', async () => {
    const el = root(renderUpload().container)

    const over = new Event('dragover', { bubbles: true, cancelable: true })
    el.dispatchEvent(over)
    expect(over.defaultPrevented).toBe(true)

    await fireEvent.dragEnter(el)
    await fireEvent.drop(el, { dataTransfer: { files: [fileOf('a.pdf')] } })
    expect(el.hasAttribute('data-dragging')).toBe(false)
  })

  it('a drop goes through the same screening — accept included, which the attribute cannot enforce', async () => {
    const { container, emitted } = renderUpload({ accept: '.pdf', multiple: true })

    await fireEvent.drop(root(container), {
      dataTransfer: { files: [fileOf('a.pdf'), fileOf('photo.jpg', 10, 'image/jpeg')] },
    })

    expect(pickedNames(emitted('update:modelValue'))).toEqual(['a.pdf'])
    expect(emitted('reject').at(-1)).toMatchObject([{ reason: 'type' }])
  })

  it.each([{ disabled: true }, { readonly: true }])('is inert under %o', async (props) => {
    const { container, emitted } = renderUpload(props)
    const el = root(container)

    await fireEvent.dragEnter(el)
    expect(el.hasAttribute('data-dragging')).toBe(false)

    await fireEvent.drop(el, { dataTransfer: { files: [fileOf('a.pdf')] } })
    expect(emitted('update:modelValue')).toBeUndefined()
  })
})

// Dev guards — they address the integrator, so they are never translated.
describe('VFilePicker dev warnings', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('warns on `maxFiles` without `multiple`', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    renderUpload({ maxFiles: 3 })
    expect(warn).toHaveBeenCalledWith(expect.stringMatching(/`maxFiles` ignored/))
  })

  it('warns on `required`, which cannot work on a non-focusable control', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    renderUpload({}, { required: true })
    expect(warn).toHaveBeenCalledWith(expect.stringMatching(/`required` lands on the hidden/))
  })

  /* axe reports `aria-prohibited-attr` on a generic <div>, and the attribute is
     inert there anyway — the guard is what keeps the suite from failing on a
     consumer's well-meant label. */
  it('warns on an aria-label that lands on the zone while it is a plain container', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    renderUpload({}, { 'aria-label': 'Attachments' })
    expect(warn).toHaveBeenCalledWith(expect.stringMatching(/aria-prohibited-attr/))
  })

  it('stays silent once the zone is the control, where the label is legitimate', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    renderUpload({ showBrowse: false }, { 'aria-label': 'Attachments' })
    expect(warn).not.toHaveBeenCalled()
  })
})

describe('fileKind', () => {
  it.each([
    ['image/avif', 'a.bin', 'image'],
    ['audio/ogg', 'a.bin', 'audio'],
    ['video/quicktime', 'a.bin', 'video'],
    ['application/pdf', 'a.bin', 'pdf'],
    ['application/zip', 'a.bin', 'archive'],
    ['text/csv', 'a.bin', 'spreadsheet'],
    ['application/json', 'a.bin', 'code'],
    ['application/octet-stream', 'a.bin', 'file'],
  ])('resolves the MIME type %s to "%s"', (type, name, expected) => {
    expect(fileKind({ name, type })).toBe(expected)
  })

  // `file.type` is the browser's GUESS and is empty far more often than one
  // expects — the extension is the fallback, never the other way round.
  it.each([
    ['photo.HEIC', 'image'],
    ['track.mp3', 'audio'],
    ['clip.mkv', 'video'],
    ['disk.iso', 'archive'],
    ['sheet.xlsx', 'spreadsheet'],
    ['main.rs', 'code'],
    ['notes.txt', 'file'],
    // No extension: a dotfile has a NAME that starts with a dot.
    ['.gitignore', 'file'],
    ['README', 'file'],
  ])('falls back to the extension of %s → "%s"', (name, expected) => {
    expect(fileKind({ name, type: '' })).toBe(expected)
  })

  it('lets the MIME type win over a misleading extension', () => {
    expect(fileKind({ name: 'archive.zip', type: 'image/png' })).toBe('image')
  })
})
