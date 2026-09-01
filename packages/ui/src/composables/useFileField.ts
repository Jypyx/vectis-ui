// @core
/**
 * The hidden `<input type="file">` gate of VFileInput and VFilePicker.
 *
 * The JS here is imposed by the platform, not chosen: a dialog opens ONLY from a real click
 * on a file input, and a `FileList` cannot be written from a template. So what the reader
 * clicks can never BE the file input, and the file input can only ever be a SOURCE of files.
 *
 * Hence `.click()` and not `showPicker()` — both need a transient user activation, but
 * `showPicker()` THROWS without one where `.click()` is merely inert — and hence
 * `resetNative()` on every path: without it, re-picking the SAME file after a clear fires no
 * `change` at all and that file becomes unreachable.
 */
import { computed, ref, type ComputedRef, type Ref } from 'vue'

import { screenFiles, type FileLimits, type FileRejection } from '../utils/file'

// @a11y
/**
 * The attributes belonging on the hidden file input rather than on the visible control.
 *
 * The wrapper-root pattern assumes ONE functional element and there are two here, so the
 * attrs split in three: `class`/`style` on the root, these four on the input because they
 * are what the FORM reads, everything else on the element the READER focuses. The buckets
 * must not overlap — a duplicated `id` breaks a consumer's `<label for>`, a duplicated
 * `name` gets the field announced twice.
 */
const NATIVE_ONLY = ['name', 'required', 'form', 'capture']

export interface FileFieldOptions {
  /** The component's value — always a list of files, whether one or several are allowed. */
  model: Ref<File[]>
  /** The attributes the consumer wrote, minus styling, still to be split in two. */
  forwardedAttrs: ComputedRef<Record<string, unknown>>
  /** Read at the moment of the event, so a component turned off mid-way stops accepting. */
  enabled: () => boolean
  multiple: () => boolean
  /** The limits as the consumer set them: capping a single-file field at one happens here. */
  limits: () => FileLimits
  onReject: (rejection: FileRejection) => void
  onChange: (files: File[]) => void
  /**
   * Attributes to withhold from the visible control too. VFileInput withholds
   * `aria-describedby`, which it re-aggregates itself: a binding written after the spread
   * would replace the consumer's rather than merge with it.
   */
  excludeFromControl?: readonly string[]
}

export function useFileField(options: FileFieldOptions) {
  const fileEl = ref<HTMLInputElement | null>(null)

  const nativeAttrs = computed(() =>
    Object.fromEntries(
      Object.entries(options.forwardedAttrs.value).filter(([key]) => NATIVE_ONLY.includes(key)),
    ),
  )

  const controlAttrs = computed(() => {
    const excluded = options.excludeFromControl ?? []
    return Object.fromEntries(
      Object.entries(options.forwardedAttrs.value).filter(
        ([key]) => !NATIVE_ONLY.includes(key) && !excluded.includes(key),
      ),
    )
  })

  /**
   * TRAP — picking the SAME file again after a clear or a removal fires no `change` at all:
   * as far as the input is concerned its value never changed, and that file becomes
   * unreachable with nothing to show for it. Emptying it on every path is what keeps it
   * selectable.
   */
  function resetNative() {
    if (fileEl.value) fileEl.value.value = ''
  }

  /**
   * The single entry into the model: the dialog and a drop both arrive here.
   *
   * A refused file never enters the model at all, and every refusal is reported so the
   * component can say why. The screening is a pure function in `utils/file`, which is what
   * makes the ORDER of the reasons testable without a mount.
   */
  function acceptFiles(incoming: File[]) {
    const multiple = options.multiple()
    const current = multiple ? options.model.value : []
    const limits = options.limits()
    const { accepted, rejected } = screenFiles(incoming, current, {
      ...limits,
      // A single-file field is a list capped at one, so extra files are refused for the
      // same reason as anywhere else: too many.
      maxFiles: multiple ? limits.maxFiles : 1,
    })

    for (const rejection of rejected) options.onReject(rejection)

    resetNative()
    if (accepted.length === 0) return

    options.model.value = [...current, ...accepted]
    options.onChange(options.model.value)
  }

  function onNativeChange(event: Event) {
    acceptFiles([...((event.target as HTMLInputElement).files ?? [])])
  }

  // @fallback
  /**
   * `.click()` and not `showPicker()`. Both need a transient user activation, but
   * `showPicker()` THROWS without one — and inside a cross-origin iframe — where a click is
   * simply inert. On a file input there is nothing to gain in exchange.
   */
  function openPicker() {
    if (!options.enabled()) return
    fileEl.value?.click()
  }

  return { fileEl, nativeAttrs, controlAttrs, acceptFiles, onNativeChange, openPicker, resetNative }
}
