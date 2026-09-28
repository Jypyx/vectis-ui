// @core
/**
 * Bridge native file selection, screening and form state for both file components. Synchronize
 * the accepted File[] through DataTransfer where supported.
 */
import {
  computed,
  getCurrentInstance,
  ref,
  watch,
  watchEffect,
  type ComputedRef,
  type Ref,
} from 'vue'

import { isDev } from '../utils/env'
import { screenFiles, type FileRejection } from '../utils/file'

// @a11y
/** The attributes belonging on the hidden file input rather than on the visible control. */
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
  /** The component's value: always a list of files, whether one or several are allowed. */
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
  /** Attributes to withhold from the visible control too. */
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

  /** Whether files may come in or go out; no dialog, no drop and no removal otherwise. */
  const enabled = computed(() => !disabled() && !props.readonly)

  const controlAttrs = computed(() => {
    const excluded = options.excludeFromControl ?? []
    return Object.fromEntries(
      Object.entries(options.forwardedAttrs.value).filter(
        ([key]) => !NATIVE_ONLY.includes(key) && !excluded.includes(key),
      ),
    )
  })

  // @core
  /**
   * It also keeps every file that LEFT the selection pickable again. The input holds exactly
   * the selection, so choosing a file that was cleared, removed or refused differs from what it
   * holds and fires `change`; left holding it, the dialog would answer the same file with no
   * event at all.
   */
  function syncNative() {
    const el = fileEl.value
    if (!el) return
    // @fallback
    // An environment without `DataTransfer` (jsdom) can only empty the input,
    // which keeps a file pickable again and leaves the form without it.
    if (typeof DataTransfer === 'undefined') {
      el.value = ''
      return
    }
    const transfer = new DataTransfer()
    for (const file of model.value) transfer.items.add(file)
    el.files = transfer.files
  }

  // A value set from outside, a consumer emptying the list after an upload, reaches the
  // input the same way.
  watch(model, syncNative, { flush: 'post' })

  /** The single entry into the model: the dialog and a drop both arrive here. */
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

    syncNative()
    if (accepted.length === 0) return

    // A single file replaced by another has left the selection as surely as one taken out
    // by its cross, and `remove` is how an upload already under way for it is cancelled.
    const replaced = props.multiple ? undefined : model.value[0]
    model.value = [...current, ...accepted]
    if (replaced && replaced !== model.value[0]) emit('remove', replaced, 0)
    emit('change', model.value)
  }

  function onNativeChange(event: Event) {
    acceptFiles([...((event.target as HTMLInputElement).files ?? [])])
  }

  /**
   * Everything the hidden input is bound with, the consumer's form attributes included. It
   * is taken out of the tab order and hidden from screen readers, which leaves the visible
   * control as the single stop and the single announcement; it stays disabled only when the
   * component is, since a read-only one still submits what it holds (`syncNative`).
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
  /** `.click()` and not `showPicker()`. */
  function openPicker() {
    if (!enabled.value) return
    fileEl.value?.click()
  }

  /**
   * Takes ONE file out of the selection, and says which: `remove` with the file and the
   * position it held, then `change` with what is left. It returns the file removed, or
   * `undefined` when nothing was; so the component knows whether it has a focus to catch.
   */
  function removeAt(index: number): File | undefined {
    const file = model.value[index]
    if (!file || !enabled.value) return undefined

    model.value = model.value.filter((_, i) => i !== index)
    syncNative()
    emit('remove', file, index)
    emit('change', model.value)
    return file
  }

  /**
   * Empties the selection, and the hidden input with it. Refused where `removeAt` is, and
   * silent when there is nothing to empty: no `change` for a selection that did not change.
   */
  function clear() {
    if (!enabled.value || model.value.length === 0) return
    model.value = []
    syncNative()
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
          '`required` lands on the hidden file input: the browser does block an empty submission, but its message points at an input nobody can see. Validate the v-model yourself and use the `invalid` prop.',
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
