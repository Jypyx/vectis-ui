// @core
/**
 * Share digit masking, caret preservation and commit logic between date and time fields; each
 * component supplies its format and parser.
 */
import { computed, ref, watch, type Ref, type WritableComputedRef } from 'vue'

import { digitsOf } from '../utils/text'

export interface MaskedFieldOptions<T extends string> {
  /** The real input, which is written to directly: see below. */
  fieldEl: Ref<HTMLInputElement | null>
  /** Whether the field can be typed into at all. Everything here is inert when it cannot. */
  typing: () => boolean
  /** What the field shows when it is not being typed into: the value, written out in full. */
  displayText: () => string
  /** The current value, or nothing. */
  readValue: () => T | null
  /** Writes a new value. */
  writeValue: (value: T | null) => void
  /** How many digits the mask holds: eight for a date, four for a time. */
  maxDigits: () => number
  /** Lays a run of digits out as masked text. */
  format: (digits: string) => string
  /**
   * Where the caret goes so as to sit after a given number of digits. The flag says whether
   * something was INSERTED rather than deleted, and it matters: on a deletion the caret must
   * stay in FRONT of the separator, or the next press of the key would step over it instead of
   * erasing, and the key would appear to do nothing.
   */
  caret: (text: string, digitsBefore: number, inserting: boolean) => number
  /** Reads masked text back into a value, or nothing when it is not one yet. */
  parse: (text: string, final: boolean) => T | null
  /** Writes a value as masked text, and nothing at all for no value. */
  toMask: (value: T | null) => string
  /**
   * Whether a value the reader has finished typing may be taken: within the bounds, not
   * one of the excluded days. Everything is acceptable by default.
   */
  acceptable?: (value: T) => boolean
}

/** What a component adds to the mask's own keys. */
export interface MaskedKeyHooks {
  /** A key that is not a digit was typed: a separator, most often. */
  onSeparator: (el: HTMLInputElement) => void
  /**
   * The down arrow, which a component with a panel turns into the way into it. It answers
   * whether it handled the press: only then is the default cancelled, and a press left
   * alone travels on to whatever opens the panel.
   */
  onArrowDown?: () => boolean
  /** Runs once Enter has committed or reverted what was typed: closing a panel, say. */
  onEnter?: () => void
}

export interface MaskedField<T extends string> {
  /** The text currently in the field while it is being typed into. */
  draft: Ref<string>
  /**
   * Bind with `v-model` and never `:model-value`. Without an `onUpdate:modelValue` listener,
   * `useModel` keeps an internal copy of the RAW typed text and rewrites it on the next patch,
   * erasing the mask exactly when the masked text did not change: a rejected character, or a
   * digit past the last.
   */
  fieldModel: WritableComputedRef<string | number>
  /**
   * Writes into both the draft and the input. Both are needed: Vue does not patch an element
   * whose value it believes unchanged, and after a reformat it often is.
   */
  writeField: (text: string, caret?: number) => void
  /** Takes the value as soon as what has been typed is complete and acceptable. */
  commitLive: () => void
  /** Called as the reader leaves the field. It is safe to call twice. */
  commitOrRevert: () => void
  /** The handler to bind to the field's input event. */
  onFieldInput: (event: Event) => void
  /** The handler for the field's keydown event, with what the component adds to it. */
  onKeydown: (event: KeyboardEvent, hooks: MaskedKeyHooks) => void
  /** The handler for the field's paste event. */
  onPaste: (event: ClipboardEvent, recognize: (pasted: string) => T | null) => void
}

export function useMaskedField<T extends string>(options: MaskedFieldOptions<T>): MaskedField<T> {
  const draft = ref('')
  const acceptable = options.acceptable ?? (() => true)

  /*
   * The value as masked text. Being a computed it also tracks what the conversion reads; the
   * locale's mask, the hour cycle; so neither component lists those dependencies.
   */
  const maskedValue = computed(() => options.toMask(options.readValue()))

  watch(
    maskedValue,
    (next) => {
      // The anti-loop guard. A commit made while typing writes the value, which comes straight
      // back here; without the test, the text being typed and its caret would be overwritten by
      // text identical to what is already there.
      if (next !== draft.value) draft.value = next
    },
    { immediate: true },
  )

  const fieldModel = computed<string | number>({
    get: () => (options.typing() ? draft.value : options.displayText()),
    set: (value) => {
      if (options.typing()) draft.value = String(value ?? '')
    },
  })

  function writeField(text: string, caret?: number) {
    draft.value = text
    const el = options.fieldEl.value
    if (!el) return
    if (el.value !== text) el.value = text
    if (caret !== undefined) el.setSelectionRange(caret, caret)
  }

  function commitLive() {
    const value = options.parse(draft.value, false)
    if (value && acceptable(value) && value !== options.readValue()) options.writeValue(value)
  }

  /** Commits what was typed, or SILENTLY reverts to the current value. */
  function commitOrRevert() {
    if (!options.typing()) return
    if (!digitsOf(draft.value)) {
      if (options.readValue() !== null) options.writeValue(null)
      writeField('')
      return
    }
    const value = options.parse(draft.value, true)
    if (value && acceptable(value)) {
      if (value !== options.readValue()) options.writeValue(value)
      writeField(options.toMask(value))
      return
    }
    writeField(options.toMask(options.readValue()))
  }

  /**
   * Reformats the field on every keystroke. Restoring an absolute position instead would
   * misplace the caret on exactly the keystrokes that matter: a position jumps by one the
   * moment a separator appears or disappears.
   */
  function onFieldInput(event: Event) {
    if (!options.typing()) return
    const el = event.target as HTMLInputElement
    const raw = el.value
    const caret = el.selectionStart ?? raw.length
    const before = digitsOf(raw.slice(0, caret)).length
    const digits = digitsOf(raw).slice(0, options.maxDigits())
    const inserting = !String((event as InputEvent).inputType ?? '').startsWith('delete')
    const text = options.format(digits)
    writeField(text, options.caret(text, Math.min(before, digits.length), inserting))
    commitLive()
  }

  /*
   * A separator is placed by the mask and never typed, so erasing one has to erase the DIGIT
   * before it, which the reader believes they are erasing. Left alone, the mask writes the
   * separator straight back and the key looks dead.
   */
  function backspaceOverSeparator(el: HTMLInputElement) {
    const start = el.selectionStart
    if (
      start === null ||
      start !== el.selectionEnd ||
      start === 0 ||
      /\d/.test(el.value[start - 1] ?? '')
    ) {
      return false
    }
    const before = digitsOf(el.value.slice(0, start)).length
    const digits = digitsOf(el.value)
    const text = options.format(digits.slice(0, before - 1) + digits.slice(before))
    writeField(text, options.caret(text, before - 1, false))
    commitLive()
    return true
  }

  /**
   * Splices a pasted run of digits into the one already in the field, at the selection, and
   * puts the caret after what was inserted.
   */
  function pasteDigits(el: HTMLInputElement, pasted: string) {
    const start = el.selectionStart ?? el.value.length
    const end = el.selectionEnd ?? start
    const digits = digitsOf(el.value)
    const from = digitsOf(el.value.slice(0, start)).length
    const to = digitsOf(el.value.slice(0, end)).length
    const inserted = digitsOf(pasted)
    const next = (digits.slice(0, from) + inserted + digits.slice(to)).slice(0, options.maxDigits())
    const text = options.format(next)
    writeField(text, options.caret(text, Math.min(from + inserted.length, next.length), true))
    commitLive()
  }

  // @keyboard
  function onKeydown(event: KeyboardEvent, hooks: MaskedKeyHooks) {
    if (!options.typing()) return
    const el = options.fieldEl.value
    if (!el) return

    if (event.key === 'Enter') {
      // Cancelling the default does two things at once: it stops the surrounding form from
      // being submitted, and it stops a panel this keystroke closes from being reopened as
      // the event travels up to the component's root.
      event.preventDefault()
      commitOrRevert()
      hooks.onEnter?.()
      return
    }
    if (event.key === 'ArrowDown') {
      if (hooks.onArrowDown?.()) event.preventDefault()
      return
    }
    if (event.key === 'Backspace') {
      if (backspaceOverSeparator(el)) event.preventDefault()
      return
    }
    if (
      event.key.length === 1 &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey &&
      !/\d/.test(event.key)
    ) {
      event.preventDefault()
      hooks.onSeparator(el)
    }
  }

  /**
   * Pasting. Without the whole-value path, pasting "2026-06-10" into a field expecting day,
   * month, year would produce "20/26/0610": the digits would be taken in order and the
   * separators ignored.
   */
  function onPaste(event: ClipboardEvent, recognize: (pasted: string) => T | null) {
    if (!options.typing()) return
    const el = options.fieldEl.value
    if (!el) return
    event.preventDefault()
    const pasted = (event.clipboardData?.getData('text') ?? '').trim()
    const whole = recognize(pasted)
    if (whole) {
      const text = options.toMask(whole)
      writeField(text, text.length)
      if (acceptable(whole) && whole !== options.readValue()) options.writeValue(whole)
      return
    }
    pasteDigits(el, pasted)
  }

  return {
    draft,
    fieldModel,
    writeField,
    commitLive,
    commitOrRevert,
    onFieldInput,
    onKeydown,
    onPaste,
  }
}
