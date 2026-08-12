// @core
/**
 * The hidden file control both file components are built around — the one that actually
 * opens the operating system's file dialog.
 *
 * The code here is imposed by the browser rather than chosen. A file dialog opens ONLY
 * from a genuine click on a file control, and the list of chosen files cannot be handed
 * to that control from a template the way any other value would be. So the thing the
 * reader sees and clicks can never BE the file control, and the file control can only
 * ever be a SOURCE of files. That is exactly the shape of what follows.
 *
 * The rules deciding which files are acceptable live apart from this, on their own; what
 * was left duplicated between the two components was the wiring around them.
 */
import { computed, ref, type ComputedRef, type Ref } from 'vue'

import { screenFiles, type FileLimits, type FileRejection } from '../utils/file'

// @a11y
/**
 * The attributes that belong on the hidden file control rather than on the visible one.
 *
 * The usual split assumes a single element that does the work, and there are two here, so
 * the attributes go into three piles instead of two: styling stays on the outermost
 * element, these four go to the hidden control because they are what the FORM reads —
 * the field's name, whether it is mandatory, which form it belongs to, and whether the
 * camera should open — and everything else goes to the element the READER focuses.
 *
 * The three piles never overlap, and that matters: an identifier applied twice would
 * break a label the consumer wrote for the field, and a name applied twice would have it
 * announced twice.
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
   * Attributes to withhold from the visible control as well.
   *
   * The file field withholds the link to its descriptive text because it puts that list
   * together itself, and a binding written after the spread would silently replace the
   * consumer's rather than being merged with it.
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
   * TRAP — choosing the SAME file again, after clearing the field or removing that file
   * from the list, reports nothing at all: as far as the hidden control is concerned its
   * value never changed. The file then becomes impossible to pick, with nothing to show
   * for it. Emptying the control on every path out is what keeps it selectable.
   */
  function resetNative() {
    if (fileEl.value) fileEl.value.value = ''
  }

  /**
   * The one way files get into the value: the operating system's dialog and a drop onto
   * the component both arrive here.
   *
   * A file the limits refuse is REFUSED outright — it never enters the value at all — and
   * every refusal is reported so the component can say why. The screening itself is a
   * plain function elsewhere, which is what makes the ORDER of the reasons testable
   * without putting a component on screen.
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
   * The one call to the browser neither component can do without: opening the dialog.
   *
   * It clicks the hidden control rather than using the newer, more explicit request to
   * open a picker. Both require the reader to have just done something, but the explicit
   * one THROWS when they have not — and in an embedded page from another site — where a
   * click simply does nothing. On a file control there is nothing to gain in exchange.
   */
  function openPicker() {
    if (!options.enabled()) return
    fileEl.value?.click()
  }

  return { fileEl, nativeAttrs, controlAttrs, acceptFiles, onNativeChange, openPicker, resetNative }
}
