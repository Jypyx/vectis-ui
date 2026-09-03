import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import { CHIP_NAME_MAX, truncateMiddle } from './truncate'
import VFileInput from './VFileInput.vue'

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
 * jsdom derives the `value` GETTER from its internal file list, which our
 * `files` override does not touch — so reading it back proves nothing.
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

/**
 * Names of the files in the last `update:modelValue` payload. `emitted()` types
 * its payloads as `{}` (the VDataTable idiom), so the cast happens once here
 * rather than at every assertion.
 */
function pickedNames(events: unknown[]): string[] {
  const [files] = events.at(-1) as unknown as [File[]]
  return files.map((file) => file.name)
}

function renderPicker(props: Record<string, unknown> = {}) {
  const utils = render(VFileInput, { props, attrs: { 'aria-label': 'Attachments' } })
  const native = utils.container.querySelector<HTMLInputElement>('input[type="file"]')!
  return { ...utils, native }
}

describe('VFileInput', () => {
  it('renders a hidden file input out of the accessibility tree, and one visible read-only field', () => {
    const { native, getByRole } = renderPicker()

    expect(native.getAttribute('tabindex')).toBe('-1')
    expect(native.getAttribute('aria-hidden')).toBe('true')

    const field = getByRole('textbox', { name: 'Attachments' })
    expect((field as HTMLInputElement).readOnly).toBe(true)
    // The hidden input must not be a second textbox in the tree.
    expect(field).not.toBe(native)
  })

  it('splits $attrs: the form attributes on the file input, everything else on the field', () => {
    const { container } = render(VFileInput, {
      attrs: { name: 'attachments', form: 'profile', 'aria-label': 'Attachments', id: 'files' },
    })
    const file = container.querySelector<HTMLInputElement>('input[type="file"]')!
    const field = container.querySelector<HTMLInputElement>('.v-input-control')!

    expect(file.getAttribute('name')).toBe('attachments')
    expect(file.getAttribute('form')).toBe('profile')
    expect(file.getAttribute('aria-label')).toBeNull()
    expect(file.getAttribute('id')).toBeNull()

    expect(field.getAttribute('aria-label')).toBe('Attachments')
    expect(field.getAttribute('id')).toBe('files')
    expect(field.getAttribute('name')).toBeNull()
  })

  it('aggregates aria-describedby: the consumer, then the hint, then the counter', async () => {
    const { container } = render(VFileInput, {
      props: { hint: 'PDF only', counter: true },
      attrs: { 'aria-label': 'Attachments', 'aria-describedby': 'outside' },
    })
    const field = container.querySelector<HTMLInputElement>('.v-input-control')!
    const ids = field.getAttribute('aria-describedby')!.split(' ')

    expect(ids[0]).toBe('outside')
    expect(ids).toHaveLength(3)
    expect(container.querySelector(`#${ids[1]}`)!.textContent).toContain('PDF only')
    expect(container.querySelector(`#${ids[2]}`)!.textContent).toContain('0 files')
  })

  it('a selection feeds the model, emits change and shows the joined names', async () => {
    const { native, container, emitted } = renderPicker({ multiple: true })

    await pick(native, [fileOf('report.pdf'), fileOf('photo.jpg')])

    expect(pickedNames(emitted('update:modelValue'))).toEqual(['report.pdf', 'photo.jpg'])
    expect(emitted('change')).toHaveLength(1)
    expect(container.querySelector<HTMLInputElement>('.v-input-control')!.value).toBe(
      'report.pdf, photo.jpg',
    )
  })

  it('single mode keeps one file and refuses the rest with "count"', async () => {
    const { native, emitted } = renderPicker()

    await pick(native, [fileOf('a.pdf'), fileOf('b.pdf')])

    expect(pickedNames(emitted('update:modelValue'))).toEqual(['a.pdf'])
    expect(emitted('reject')).toEqual([[{ file: expect.anything(), reason: 'count' }]])
  })

  it('a second selection replaces in single mode and appends in multiple', async () => {
    const single = renderPicker()
    await pick(single.native, [fileOf('a.pdf')])
    await pick(single.native, [fileOf('b.pdf')])
    expect(pickedNames(single.emitted('update:modelValue'))).toEqual(['b.pdf'])

    const multiple = renderPicker({ multiple: true })
    await pick(multiple.native, [fileOf('a.pdf')])
    await pick(multiple.native, [fileOf('b.pdf')])
    expect(pickedNames(multiple.emitted('update:modelValue'))).toEqual(['a.pdf', 'b.pdf'])
  })

  it.each([
    ['type', { accept: '.pdf' }, [fileOf('photo.jpg', 10, 'image/jpeg')]],
    ['size', { maxSize: 100 }, [fileOf('big.pdf', 500)]],
    ['count', { multiple: true, maxFiles: 1 }, [fileOf('a.pdf'), fileOf('b.pdf')]],
    [
      'total-size',
      { multiple: true, maxTotalSize: 100 },
      [fileOf('a.pdf', 60), fileOf('b.pdf', 60)],
    ],
  ])('refuses an out-of-bounds file with the reason "%s"', async (reason, props, files) => {
    const { native, emitted } = renderPicker(props)

    await pick(native, files)

    expect(emitted('reject').at(-1)).toMatchObject([{ reason }])
  })

  it('a refused file never enters the model', async () => {
    const { native, emitted } = renderPicker({ maxSize: 100 })

    await pick(native, [fileOf('big.pdf', 500)])

    expect(emitted('update:modelValue')).toBeUndefined()
    expect(emitted('change')).toBeUndefined()
  })

  it('resets the native input on every path — selection, refusal, removal, clear', async () => {
    const { native, container, getByRole, rerender } = renderPicker({
      multiple: true,
      display: 'chip',
      maxSize: 100,
      clearable: true,
    })
    const writes = trackReset(native)

    await pick(native, [fileOf('a.pdf', 10)])
    expect(writes).toEqual([''])

    // A batch refused in full resets too: a file refused once must stay
    // re-pickable.
    await pick(native, [fileOf('big.pdf', 500)])
    expect(writes).toHaveLength(2)

    await rerender({ modelValue: [fileOf('a.pdf', 10)], multiple: true, display: 'chip' })
    await fireEvent.click(getByRole('button', { name: 'Remove a.pdf' }))
    expect(writes).toHaveLength(3)

    await rerender({ modelValue: [fileOf('a.pdf', 10)], multiple: true, display: 'chip' })
    await fireEvent.click(container.querySelector('.v-input-clear')!)
    expect(writes).toHaveLength(4)
  })

  it('display="chip": one chip per file, a named remove button, an empty field value', async () => {
    const { container, getByRole } = renderPicker({
      multiple: true,
      display: 'chip',
      modelValue: [fileOf('report.pdf'), fileOf('photo.jpg')],
    })

    expect(container.querySelectorAll('.v-chip')).toHaveLength(2)
    expect(container.querySelector<HTMLInputElement>('.v-input-control')!.value).toBe('')
    expect(getByRole('button', { name: 'Remove report.pdf' })).toBeTruthy()
  })

  it('a chip cuts a long name in the middle but never loses it', async () => {
    const long = 'annual_report_2026_final_v3.jpg'
    const { container, getByRole, getByTitle } = renderPicker({
      multiple: true,
      display: 'chip',
      modelValue: [fileOf(long), fileOf('short.pdf')],
    })

    const labels = [...container.querySelectorAll('.v-chip-action')].map((el) => el.textContent)
    expect(labels).toEqual(['annual_rep…al_v3.jpg', 'short.pdf'])

    // The full name stays reachable: on the title, and as the removal button's
    // accessible name.
    expect(getByTitle(long)).toBeTruthy()
    expect(getByRole('button', { name: `Remove ${long}` })).toBeTruthy()
    // A name that was not cut carries no redundant title.
    expect(container.querySelectorAll('[title]')).toHaveLength(1)
  })

  it('a removal shrinks the model and emits change', async () => {
    const { getByRole, emitted } = renderPicker({
      multiple: true,
      display: 'chip',
      modelValue: [fileOf('a.pdf'), fileOf('b.pdf')],
    })

    await fireEvent.click(getByRole('button', { name: 'Remove a.pdf' }))

    expect(pickedNames(emitted('update:modelValue'))).toEqual(['b.pdf'])
    expect(emitted('change')).toHaveLength(1)
  })

  it('the cross empties everything, and only shows when asked for and there is something to clear', async () => {
    // The cross is opt-in, like every other field's.
    const off = renderPicker({ modelValue: [fileOf('a.pdf')] })
    expect(off.container.querySelector('.v-input-clear')).toBeNull()

    const empty = renderPicker({ clearable: true })
    expect(empty.container.querySelector('.v-input-clear')).toBeNull()

    const readonly = renderPicker({
      clearable: true,
      readonly: true,
      modelValue: [fileOf('a.pdf')],
    })
    expect(readonly.container.querySelector('.v-input-clear')).toBeNull()

    const { container, emitted } = renderPicker({ clearable: true, modelValue: [fileOf('a.pdf')] })
    await fireEvent.click(container.querySelector('.v-input-clear')!)

    expect(emitted('update:modelValue').at(-1)).toEqual([[]])
    expect(emitted('clear')).toHaveLength(1)
  })

  it('the counter states the count alone when empty, and the total size otherwise', async () => {
    const empty = renderPicker({ counter: true })
    expect(empty.container.querySelector('.v-file-input-counter')!.textContent!.trim()).toBe(
      '0 files',
    )

    const { container } = renderPicker({
      counter: true,
      multiple: true,
      modelValue: [fileOf('a.pdf', 600_000), fileOf('b.pdf', 600_000)],
    })
    expect(container.querySelector('.v-file-input-counter')!.textContent!.trim()).toBe(
      '2 files (1.2 MB)',
    )
  })

  it('the attach icon disappears when readonly, and opens the dialog otherwise', async () => {
    const readonly = renderPicker({ readonly: true })
    expect(readonly.container.querySelector('.v-input-action')).toBeNull()

    const { container, native } = renderPicker()
    native.click = vi.fn()
    await fireEvent.click(container.querySelector('.v-input-action')!)

    expect(native.click).toHaveBeenCalledOnce()
  })

  it('a click on the field opens the dialog — but never a click on one of its buttons', async () => {
    const { container, native } = renderPicker({ clearable: true, modelValue: [fileOf('a.pdf')] })
    native.click = vi.fn()

    await fireEvent.click(container.querySelector('.v-file-input-control')!)
    expect(native.click).toHaveBeenCalledOnce()

    // The cross empties the field; without the `closest('button')` guard the
    // click would bubble and reopen the dialog straight away.
    await fireEvent.click(container.querySelector('.v-input-clear')!)
    expect(native.click).toHaveBeenCalledOnce()
  })

  it('Enter and Space open the dialog and cancel the implicit submission', async () => {
    const { container, native } = renderPicker()
    native.click = vi.fn()
    const field = container.querySelector('.v-input-control')!

    // Dispatched by hand: `fireEvent` swallows the dispatch result, and
    // `defaultPrevented` is exactly what is under test — a read-only text field
    // is still a submit trigger.
    for (const key of ['Enter', ' ']) {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
      field.dispatchEvent(event)
      expect(event.defaultPrevented).toBe(true)
    }
    expect(native.click).toHaveBeenCalledTimes(2)

    await fireEvent.keyDown(field, { key: 'a' })
    expect(native.click).toHaveBeenCalledTimes(2)
  })

  it('disabled and readonly make the dialog inert', async () => {
    for (const props of [{ disabled: true }, { readonly: true }]) {
      const { container, native } = renderPicker(props)
      native.click = vi.fn()
      await fireEvent.click(container.querySelector('.v-file-input-control')!)
      expect(native.click).not.toHaveBeenCalled()
    }
  })
})

// Drag & drop
describe('VFileInput drag & drop', () => {
  const root = (container: Element) => container.querySelector('.v-file-input')!

  it('counts the enter/leave pairs instead of toggling a boolean', async () => {
    const { container } = renderPicker()
    const el = root(container)

    await fireEvent.dragEnter(el)
    await fireEvent.dragEnter(el)
    expect(el.hasAttribute('data-dragging')).toBe(true)

    // The first leave is the pointer crossing into a child: still dragging.
    await fireEvent.dragLeave(el)
    expect(el.hasAttribute('data-dragging')).toBe(true)

    await fireEvent.dragLeave(el)
    expect(el.hasAttribute('data-dragging')).toBe(false)
  })

  it('dragover is cancelled (without it the browser navigates to the file), and drop clears the state', async () => {
    const { container } = renderPicker()
    const el = root(container)

    const over = new Event('dragover', { bubbles: true, cancelable: true })
    el.dispatchEvent(over)
    expect(over.defaultPrevented).toBe(true)

    await fireEvent.dragEnter(el)
    await fireEvent.dragEnter(el)
    await fireEvent.drop(el, { dataTransfer: { files: [fileOf('a.pdf')] } })
    expect(el.hasAttribute('data-dragging')).toBe(false)
  })

  it('a drop goes through the same acceptance pipeline — accept included, which the attribute cannot enforce', async () => {
    const { container, emitted } = renderPicker({ accept: '.pdf', multiple: true })
    const el = root(container)

    await fireEvent.drop(el, {
      dataTransfer: { files: [fileOf('a.pdf'), fileOf('photo.jpg', 10, 'image/jpeg')] },
    })

    expect(pickedNames(emitted('update:modelValue'))).toEqual(['a.pdf'])
    expect(emitted('reject').at(-1)).toMatchObject([{ reason: 'type' }])
  })

  it.each([{ disabled: true }, { readonly: true }, { droppable: false }])(
    'is inert under %o',
    async (props) => {
      const { container, emitted } = renderPicker(props)
      const el = root(container)

      await fireEvent.dragEnter(el)
      expect(el.hasAttribute('data-dragging')).toBe(false)

      await fireEvent.drop(el, { dataTransfer: { files: [fileOf('a.pdf')] } })
      expect(emitted('update:modelValue')).toBeUndefined()
    },
  )
})

// Dev guards — they address the integrator, so they are never translated.
describe('VFileInput dev warnings', () => {
  it.each([
    ['display="chip" without multiple', { display: 'chip' }, /display="chip" ignored/],
    ['maxFiles without multiple', { maxFiles: 3 }, /`maxFiles` ignored/],
  ])('warns on %s', async (_label, props, pattern) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    renderPicker(props)
    expect(warn).toHaveBeenCalledWith(expect.stringMatching(pattern))
    warn.mockRestore()
  })

  it('warns on `required`, which cannot work on a non-focusable control', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(VFileInput, { attrs: { required: true, 'aria-label': 'Attachments' } })
    expect(warn).toHaveBeenCalledWith(expect.stringMatching(/`required` lands on the hidden/))
    warn.mockRestore()
  })

  it('display="chip" without multiple falls back to text rather than breaking', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { container } = renderPicker({ display: 'chip', modelValue: [fileOf('a.pdf')] })

    expect(container.querySelector('.v-file-input')!.getAttribute('data-display')).toBe('text')
    expect(container.querySelector<HTMLInputElement>('.v-input-control')!.value).toBe('a.pdf')
    vi.restoreAllMocks()
  })
})

describe('truncateMiddle', () => {
  it('leaves a name that fits exactly as it is', () => {
    expect(truncateMiddle('short.pdf')).toBe('short.pdf')
    expect(truncateMiddle('a'.repeat(CHIP_NAME_MAX))).toHaveLength(CHIP_NAME_MAX)
  })

  it('cuts in the middle and keeps the extension', () => {
    expect(truncateMiddle('annual_report_2026_final_v3.jpg')).toBe('annual_rep…al_v3.jpg')
  })

  it('produces exactly `max` characters, the odd one going to the head', () => {
    const cut = truncateMiddle('abcdefghijklmnopqrstuvwxyz', 10)
    expect(cut).toBe('abcde…wxyz')
    expect(cut).toHaveLength(10)
  })

  // Counted in code points: a UTF-16 slice would cut the emoji in half and
  // render a replacement character.
  it('never splits a surrogate pair', () => {
    expect(truncateMiddle('🎉🎉🎉🎉🎉🎉', 5)).toBe('🎉🎉…🎉🎉')
  })
})
