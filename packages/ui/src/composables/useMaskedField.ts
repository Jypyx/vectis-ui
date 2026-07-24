// @core — module-wide: mask, caret and commit are the field's own behaviour.
/**
 * A field one types a date or a time into: the reader enters digits, and the separators
 * appear as they go.
 *
 * It is the FIELD half of the date and time pickers, the panel half being shared already.
 * What is injected here is only the vocabulary of the mask itself: how many digits it
 * holds, how those digits become text, where the caret should land, and how the text
 * becomes a value.
 *
 * The two differ in one respect worth knowing: a date's separator depends on the reader's
 * language while a time's is the same everywhere, so they work out the caret differently.
 * Nothing here cares — it only tells them whether the edit was an INSERTION, which is what
 * decides whether the caret steps over a separator.
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
   * TRAP — bind this with `v-model` on the field and NEVER as a one-way value. Without a
   * listener for its updates, the field keeps an internal copy of the RAW text typed and
   * writes it back on the next patch — which erases the mask precisely when the masked
   * text did NOT change: a rejected character, or a digit past the last. Both components
   * have a test locking it.
   */
  fieldModel: WritableComputedRef<string | number>
  /**
   * Writes the text into both the draft and the input itself. Both are needed: Vue does
   * not patch an element whose text it believes is unchanged, and after a reformat it
   * often is.
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
   * The current value, written as masked text. Being derived, it also tracks whatever the
   * conversion reads — the language's own mask, the choice of clock — so neither component
   * has to list those dependencies itself.
   */
  const maskedValue = computed(() => options.toMask(options.readValue()))

  watch(
    maskedValue,
    (next) => {
      // TRAP — this guard is what stops the field and the value chasing each other. A
      // commit made while typing writes the value, which comes straight back here; without
      // the test, the text being typed and the caret with it would be overwritten by text
      // identical to what is already there.
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
   * Tidies up what was typed, or SILENTLY puts back what was there before.
   *
   * An entry that is incomplete, impossible — the 31st of February — outside the allowed
   * bounds or excluded simply disappears in favour of the current value. There is
   * deliberately no error state of our own competing with the `invalid` prop a consumer
   * controls.
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
