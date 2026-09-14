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
 *
 * Everything the two components did identically lives here, so the two cannot drift: the
 * attributes of the hidden input, the screening of what comes in, the removal of one file and
 * the emptying of all of them, and the development warnings both of them owe the integrator.
 */
import { computed, getCurrentInstance, ref, watchEffect, type ComputedRef, type Ref } from 'vue'

import { isDev } from '../utils/env'
import { screenFiles, type FileRejection } from '../utils/file'

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

/** The props both components declare under the same names, read at the moment they matter. */
export interface FileFieldProps {
  multiple: boolean
  accept?: string
  maxSize?: number
  maxFiles?: number
  maxTotalSize?: number
  disabled: boolean
  readonly: boolean
}

/** The events both components declare under the same names and with the same payloads. */
export interface FileFieldEmit {
  (event: 'change', files: File[]): void
  (event: 'reject', rejection: FileRejection): void
  (event: 'remove', file: File, index: number): void
}

export interface FileFieldOptions {
  /** The component's value — always a list of files, whether one or several are allowed. */
  model: Ref<File[]>
  props: FileFieldProps
  emit: FileFieldEmit
  /** The attributes the consumer wrote, minus styling, still to be split in two. */
  forwardedAttrs: ComputedRef<Record<string, unknown>>
  /**
   * Whether the component is disabled, the row it sits in taken into account. Left out, the
   * `disabled` prop answers alone.
   */
  disabled?: Ref<boolean>
  /**
   * Attributes to withhold from the visible control too. VFileInput withholds
   * `aria-describedby`, which it re-aggregates itself: a binding written after the spread
   * would replace the consumer's rather than merge with it.
   */
  excludeFromControl?: readonly string[]
  /** Called once the selection has been emptied by `clear`, before `change` is emitted. */
  onClear?: () => void
  /**
   * The component's own development warnings, one message per condition that holds. They
   * follow the same rule as the shared ones: each is given once per instance.
   */
  warnings?: () => (string | false)[]
}

export function useFileField(options: FileFieldOptions) {
  const { model, props, emit } = options

  const fileEl = ref<HTMLInputElement | null>(null)

  const disabled = () => options.disabled?.value ?? props.disabled

  /** Whether files may come in or go out — no dialog, no drop and no removal otherwise. */
  const enabled = computed(() => !disabled() && !props.readonly)

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
    const current = props.multiple ? model.value : []
    const { accepted, rejected } = screenFiles(incoming, current, {
      accept: props.accept,
      maxSize: props.maxSize,
      // A single-file field is a list capped at one, so extra files are refused for the
      // same reason as anywhere else: too many.
      maxFiles: props.multiple ? props.maxFiles : 1,
      maxTotalSize: props.maxTotalSize,
    })

    for (const rejection of rejected) emit('reject', rejection)

    resetNative()
    if (accepted.length === 0) return

    model.value = [...current, ...accepted]
    emit('change', model.value)
  }

  function onNativeChange(event: Event) {
    acceptFiles([...((event.target as HTMLInputElement).files ?? [])])
  }

  /**
   * Everything the hidden input is bound with, the consumer's form attributes included. It
   * is taken out of the tab order and hidden from screen readers, which leaves the visible
   * control as the single stop and the single announcement; it stays disabled only when the
   * component is — a read-only one still submits what it holds.
   */
  const nativeInputAttrs = computed(() => ({
    ...Object.fromEntries(
      Object.entries(options.forwardedAttrs.value).filter(([key]) => NATIVE_ONLY.includes(key)),
    ),
    type: 'file',
    tabindex: -1,
    'aria-hidden': 'true' as const,
    accept: props.accept,
    multiple: props.multiple || undefined,
    disabled: disabled() || undefined,
    onChange: onNativeChange,
  }))

  // @fallback
  /**
   * `.click()` and not `showPicker()`. Both need a transient user activation, but
   * `showPicker()` THROWS without one — and inside a cross-origin iframe — where a click is
   * simply inert. On a file input there is nothing to gain in exchange.
   */
  function openPicker() {
    if (!enabled.value) return
    fileEl.value?.click()
  }

  /**
   * Takes ONE file out of the selection, and says which: `remove` with the file and the
   * position it held, then `change` with what is left. It returns the file removed, or
   * `undefined` when nothing was — so the component knows whether it has a focus to catch.
   */
  function removeAt(index: number): File | undefined {
    const file = model.value[index]
    if (!file || !enabled.value) return undefined

    model.value = model.value.filter((_, i) => i !== index)
    resetNative()
    emit('remove', file, index)
    emit('change', model.value)
    return file
  }

  /** Empties the selection, and the hidden input with it. */
  function clear() {
    model.value = []
    resetNative()
    options.onClear?.()
    emit('change', model.value)
  }

  // @devwarn
  /*
   * Both shared guards describe something that fails SILENTLY at runtime. Each message is given
   * once per instance: they sit in an effect, which re-runs on every change of what it reads,
   * and the same sentence repeated at every keystroke is how a warning stops being read.
   */
  if (isDev) {
    // The prefix is the component's own name, read off the instance rather than passed in:
    // this whole block is dropped from a production build, and the name with it.
    const name = getCurrentInstance()?.type.__name
    const warned = new Set<string>()
    const warn = (message: string) => {
      if (warned.has(message)) return
      warned.add(message)
      console.warn(`[${name}] ${message}`)
    }
    watchEffect(() => {
      if (props.maxFiles !== undefined && !props.multiple)
        warn('`maxFiles` ignored without `multiple`: single mode already caps at one file.')
      if (options.forwardedAttrs.value.required !== undefined)
        warn(
          '`required` lands on the hidden file input, which is not focusable: the browser blocks submission with no visible message. Validate the v-model yourself and use the `invalid` prop.',
        )
      for (const message of options.warnings?.() ?? []) if (message) warn(message)
    })
  }

  return {
    fileEl,
    enabled,
    nativeInputAttrs,
    controlAttrs,
    acceptFiles,
    openPicker,
    removeAt,
    clear,
  }
}
