/**
 * The masked text field of VDatePicker and VTimePicker (`mode="input"`).
 *
 * The panel half of these two components is already shared (`useFieldPanel`); this
 * is the field half. `writeField` was byte-identical between them, JSDoc included,
 * and `commitOrRevert`/`onFieldInput` shared their skeleton AND their trap comments
 * — which is precisely where the two had started to drift.
 *
 * Only the mask's own vocabulary is injected: how many digits it holds, how digits
 * become text, where the caret lands, and how text becomes a canonical value. The
 * date separator is derived from the locale where the time one is a universal `:`,
 * so the two `caret` implementations differ — the composable does not care, it only
 * tells them whether the edit was an INSERTION.
 */
import { computed, ref, watch, type Ref, type WritableComputedRef } from 'vue'

import { digitsOf } from '../utils/text'

export interface MaskedFieldOptions<T extends string> {
  /** The native `<input>` of the VInput — written directly, see `writeField`. */
  fieldEl: Ref<HTMLInputElement | null>
  /** The field accepts typing; `false` freezes everything here. */
  typing: () => boolean
  /** What the field shows when NOT typing (the value through `Intl`). */
  displayText: () => string
  /** The canonical value, already narrowed (`null` when there is none to mask). */
  readValue: () => T | null
  writeValue: (value: T | null) => void
  /** How many digits the mask holds — 8 for a date, 4 for a time. */
  maxDigits: () => number
  /** Digits → masked text. */
  format: (digits: string) => string
  /**
   * Caret position after `digitsBefore` digits of `text`. `inserting` is false on a
   * deletion, where the caret must stay IN FRONT of the separator — otherwise the
   * key never makes progress.
   */
  caret: (text: string, digitsBefore: number, inserting: boolean) => number
  /**
   * Masked text → canonical value, or `null`. `final` is true on the leave commit
   * alone: VDatePicker expands a 2-digit year only there, since "…/26" must not
   * commit 2026 while the user is still typing the year.
   */
  parse: (text: string, final: boolean) => T | null
  /** Canonical value → masked text; `''` for `null`. */
  toMask: (value: T | null) => string
  /** Extra acceptance on commit (bounds, disabled dates). Default: everything. */
  acceptable?: (value: T) => boolean
}

export interface MaskedField {
  draft: Ref<string>
  /**
   * To be bound with **`v-model`** on the VInput, never `:model-value`: without an
   * `onUpdate:modelValue` listener `useModel` keeps an internal copy of the RAW
   * typed text and rewrites it on the next patch, erasing the mask as soon as the
   * mask itself does not change (a rejected character, the digit past the last).
   * Covered by a test in both components.
   */
  fieldModel: WritableComputedRef<string | number>
  /** Writes the draft AND the DOM: Vue does not re-patch an unchanged masked text. */
  writeField: (text: string, caret?: number) => void
  /** Commits as soon as the value is complete and acceptable — the panel follows. */
  commitLive: () => void
  /** Leave handler (`change` then `blur`, hence the idempotence). */
  commitOrRevert: () => void
  onFieldInput: (event: Event) => void
}

export function useMaskedField<T extends string>(options: MaskedFieldOptions<T>): MaskedField {
  const draft = ref('')
  const acceptable = options.acceptable ?? (() => true)

  /*
   * The masked form of the current value. Being a computed, it tracks whatever
   * `toMask` reads — the resolved locale mask, the 12/24 h format — so the two
   * components no longer have to list those dependencies in a `watch` source.
   */
  const maskedValue = computed(() => options.toMask(options.readValue()))

  watch(
    maskedValue,
    (next) => {
      // An anti-loop guard: a commit made while typing rewrites the value, which comes
      // back through here — without this test the draft and the caret would be
      // overwritten with an identical text.
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
   * Normalizes, or REVERTS SILENTLY. An incomplete, impossible (31/02), out-of-bounds
   * or disabled entry disappears in favour of the current value — no home-made error
   * state to compete with the `invalid` prop.
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
      writeField(options.toMask(value)) // "5/6/26" → "05/06/2026"
      return
    }
    writeField(options.toMask(options.readValue()))
  }

  /**
   * The mask as you type. Invariant: the number of digits to the LEFT of the caret is
   * preserved by the reformatting — absolute positions jump as soon as a separator
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
