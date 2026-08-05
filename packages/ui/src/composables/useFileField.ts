/**
 * The hidden `<input type="file">` gate shared by VFilePicker and VFileUpload.
 *
 * The JS here is forced by the platform, not chosen: a file dialog opens ONLY from
 * a real click on a file input, and a `FileList` cannot be written from a template.
 * So the visible control can never BE the native input, and the native input can
 * only ever be a SOURCE of files — which is exactly the shape this composable
 * carries. `utils/file.ts` already holds the pure screening; what was left
 * duplicated between the two components was this wrapper around it.
 */
import { computed, ref, type ComputedRef, type Ref } from 'vue'

import { screenFiles, type FileLimits, type FileRejection } from '../utils/file'

/**
 * Attributes that belong to the hidden input rather than to the visible control.
 *
 * The wrapper-root pattern assumes ONE functional element; there are two here, so
 * the split has three buckets: `class`/`style` stay on the root (`useRootAttrs`),
 * these four go to the input — they are what the FORM sees, describing submission
 * and the OS dialog — and everything else goes to what the USER focuses. The
 * buckets are a PARTITION: nothing is applied twice, since a duplicated `id` would
 * break a consumer's `<label for>` and a duplicated `aria-label` would have the
 * field announced twice.
 */
const NATIVE_ONLY = ['name', 'required', 'form', 'capture']

export interface FileFieldOptions {
  /** The component's `File[]` v-model — always a list, `multiple` or not. */
  model: Ref<File[]>
  /** `forwardedAttrs` from `useRootAttrs`, to be split into the two buckets. */
  forwardedAttrs: ComputedRef<Record<string, unknown>>
  /** Read at event time: a component disabled mid-interaction stops accepting. */
  enabled: () => boolean
  multiple: () => boolean
  /** `maxFiles` is the RAW prop: single mode is resolved to 1 here. */
  limits: () => FileLimits
  onReject: (rejection: FileRejection) => void
  onChange: (files: File[]) => void
  /**
   * Attribute keys kept out of the CONTROL bucket as well. VFilePicker pulls
   * `aria-describedby` out because it re-aggregates it, and an explicit binding
   * placed after `v-bind` would silently overwrite the consumer's in `mergeProps`.
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
   * Re-picking the SAME file after a clear or a removal fires no `change` at all —
   * the input's value has not changed — and that file becomes unreachable. Emptying
   * it on every path is what keeps it selectable again.
   */
  function resetNative() {
    if (fileEl.value) fileEl.value.value = ''
  }

  /**
   * The single gate into the model: the native dialog and a drop both land here.
   * An over-limit file is REFUSED — it never enters the model, and each refusal is
   * reported. The screening itself is pure (`utils/file.ts`), which is what keeps
   * the order of the reasons testable without a mount.
   */
  function acceptFiles(incoming: File[]) {
    const multiple = options.multiple()
    const current = multiple ? options.model.value : []
    const limits = options.limits()
    const { accepted, rejected } = screenFiles(incoming, current, {
      ...limits,
      // Single mode is a list capped at one: every extra file is refused with `count`.
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

  /**
   * The one imperative call neither component can avoid. `.click()` and NOT
   * `showPicker()`: both need a transient user activation, but `showPicker()`
   * additionally THROWS without one (and in a cross-origin iframe) where `.click()`
   * is simply inert — for nothing extra on a file input.
   */
  function openPicker() {
    if (!options.enabled()) return
    fileEl.value?.click()
  }

  return { fileEl, nativeAttrs, controlAttrs, acceptFiles, onNativeChange, openPicker, resetNative }
}
