// @core — module-wide: mask, caret and commit are the field's own behaviour.
/**
 * The masked field of VDateInput and VTimeInput: the reader types digits, the separators
 * appear as they go. The FIELD half, `useFieldPanel` being the panel half.
 *
 * Only the mask's vocabulary is injected — how many digits, how they become text, where the
 * caret lands, how the text becomes a value. A date's separator is locale-dependent where a
 * time's is universal, so the two compute the caret differently; nothing here cares beyond
 * telling them whether the edit was an INSERTION.
 */
import { computed, ref, watch, type Ref, type WritableComputedRef } from 'vue'

import { digitsOf } from '../utils/text'

export interface MaskedFieldOptions<T extends string> {
  /** The real input, which is written to directly — see below. */
  fieldEl: Ref<HTMLInputElement | null>
  /** Whether the field can be typed into at all. Everything here is inert when it cannot. */
  typing: () => boolean
  /** What the field shows when it is NOT being typed into: the value, written out in full. */
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
   * Where the caret goes so as to sit after a given number of digits.
   *
   * The flag says whether something was INSERTED rather than deleted, and it matters: on
   * a deletion the caret must stay IN FRONT of the separator, or the next press of the key
   * would step over it instead of erasing, and the key would appear to do nothing.
   */
  caret: (text: string, digitsBefore: number, inserting: boolean) => number
  /**
   * Reads masked text back into a value, or nothing when it is not one yet.
   *
   * The flag marks the FINAL reading, when the reader leaves the field. A date expands a
   * two-digit year only there: "26" must not be committed as 2026 while it may still be on
   * its way to becoming it.
   */
  parse: (text: string, final: boolean) => T | null
  /** Writes a value as masked text, and nothing at all for no value. */
  toMask: (value: T | null) => string
  /**
   * Whether a value the reader has finished typing may be taken — within the bounds, not
   * one of the excluded days. Everything is acceptable by default.
   */
  acceptable?: (value: T) => boolean
}

export interface MaskedField {
  /** The text currently in the field while it is being typed into. */
  draft: Ref<string>
  /**
   * TRAP — bind with `v-model` and NEVER `:model-value`. Without an `onUpdate:modelValue`
   * listener, `useModel` keeps an internal copy of the RAW typed text and rewrites it on the
   * next patch, erasing the mask exactly when the masked text did NOT change: a rejected
   * character, or a digit past the last. Both components lock it with a test.
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
}

export function useMaskedField<T extends string>(options: MaskedFieldOptions<T>): MaskedField {
  const draft = ref('')
  const acceptable = options.acceptable ?? (() => true)

  /*
   * The value as masked text. Being a computed it also tracks what the conversion reads —
   * the locale's mask, the hour cycle — so neither component lists those dependencies.
   */
  const maskedValue = computed(() => options.toMask(options.readValue()))

  watch(
    maskedValue,
    (next) => {
      // TRAP — the anti-loop guard. A commit made while typing writes the value, which comes
      // straight back here; without the test, the text being typed and its caret would be
      // overwritten by text identical to what is already there.
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

  /**
   * Commits what was typed, or SILENTLY reverts to the current value.
   *
   * An entry that is incomplete, impossible (31 February), out of bounds or excluded simply
   * disappears. There is deliberately no error state of our own competing with the `invalid`
   * prop the consumer controls.
   */
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
      // Rewritten in full: "5/6/26" becomes "05/06/2026".
      writeField(options.toMask(value))
      return
    }
    writeField(options.toMask(options.readValue()))
  }

  /**
   * Reformats the field on every keystroke.
   *
   * The invariant to keep is that the number of digits to the LEFT of the caret survives
   * the reformatting. Restoring an absolute position instead would misplace the caret on
   * exactly the keystrokes that matter: a position jumps by one the moment a separator
   * appears or disappears.
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

  return { draft, fieldModel, writeField, commitLive, commitOrRevert, onFieldInput }
}
