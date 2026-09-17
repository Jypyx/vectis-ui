<script setup lang="ts">
// @keyboard @core
/**
 * The row of boxes a one-time code is typed into, one character per box.
 *
 * The platform has no such control, so each box is a real `<input>` and the JS is what makes
 * the row behave as one field: a character moves to the next box, Backspace on an empty one
 * goes back, the arrows walk along, and a code pasted anywhere is spread across them. The
 * first box carries `autocomplete="one-time-code"`, so a code arriving from an SMS or a
 * password manager is spread the same way.
 *
 * `pattern` cuts the row up: every `#` is a box, every other character a decorative literal
 * shown between them and never part of the value. Pasting understands those literals — a
 * code copied formatted, `GT-123`, is consumed with them in place — and `format` filters the
 * rest, forcing capitals outside a numeric code so the value has one canonical form.
 *
 * The value is the filled boxes read in order, so the filled boxes always form a PREFIX:
 * typing or focusing past the first empty box lands in that box, and emptying a box closes
 * the gap. Without that invariant `1 _ 3 _` would be the value `13`, which the next sync
 * would redraw as `1 3 _ _`.
 *
 * A row of boxes is not a form control, so a visually hidden native input carries the code
 * for the form: `name`, `form` and `required` land on it, and a `pattern` of the full
 * length makes a half-typed code invalid.
 */

import { computed, ref, useAttrs, useId, watch } from 'vue'
import VIcon from '../VIcon/VIcon.vue'
import { iconProps } from '../VIcon/iconProps'
import type { IconSource } from '../VIcon/types'
import VTypography from '../VTypography/VTypography.vue'

import { isDev } from '../../utils/env'
import { joinIds } from '../../utils/ids'

import { useAriaLabel } from '../../composables/useAriaLabel'
import { useMessages } from '../../i18n/state'

/** The height of the boxes: 32, 40 or 48 pixels. */
export type InputOTPSize = 'sm' | 'md' | 'lg'

/** Which characters the code is made of. */
export type InputOTPFormat = 'numeric' | 'alpha' | 'alphanumeric'

interface InputOTPProps {
  /** How many boxes the code has. It is ignored as soon as a `pattern` is given. */
  length?: number
  /**
   * Which characters the code is made of. It filters what can be typed or pasted, and
   * decides which keyboard a phone offers.
   */
  format?: InputOTPFormat
  /**
   * The shape of the code: each `#` is a box to fill, and every other character is a
   * separator shown between the boxes without ever being part of the value, as in
   * `'GT-###'` or `'###.###.###'`. It wins over `length`.
   */
  pattern?: string
  /**
   * An icon drawn in place of EVERY separator of the pattern. It suits a template
   * whose separators are purely decorative, `'###-###'`, and should not be used with
   * one carrying meaningful text such as `'GT-###'`, which the icon would erase.
   */
  separatorIcon?: IconSource
  /** The size of the boxes: 32, 40 or 48 pixels. */
  size?: InputOTPSize
  /** Takes 4px off the boxes, leaving the text and the icons as they are. */
  compact?: boolean
  /** Makes every box unusable, greyed out through the colour tokens. */
  disabled?: boolean
  /**
   * Shows the code without letting it be changed. The boxes keep their focus and the code
   * can still be selected and copied, which is what separates it from `disabled`.
   */
  readonly?: boolean
  /** Marks the code as wrong, which colours the boxes and tells assistive technology so. */
  invalid?: boolean
  /**
   * What screen readers announce for the row as a whole. It falls back to the design
   * system dictionary.
   *
   * Unlike the `label` of VInput and the other text fields, NOTHING is rendered from it:
   * a row of boxes carries its own instructions above it, written by the page. Use `hint`
   * for a line the reader can see.
   */
  label?: string
  /**
   * A line of help under the boxes: where the code was sent, how long it lasts. It is
   * tied to the row for assistive technology, so it is read out along with the label.
   */
  hint?: string
}

const props = withDefaults(defineProps<InputOTPProps>(), {
  length: 6,
  format: 'numeric',
  pattern: undefined,
  separatorIcon: undefined,
  size: 'md',
  compact: false,
  disabled: false,
  readonly: false,
  invalid: false,
  label: undefined,
  hint: undefined,
})

const m = useMessages()
const ariaLabel = useAriaLabel(() => props.label ?? m.value.inputOTP.label)

// @a11y
/*
 * The root IS the group, so the consumer's attributes belong on it — but they are bound
 * BEFORE the two the component decides itself. `aria-describedby` is a list, and the hint
 * is appended to whatever the consumer already pointed at instead of replacing it; left
 * to the fallthrough, their value would land last and take the hint out of the
 * announcement with nothing to show for it.
 */
defineOptions({ inheritAttrs: false })

const attrs = useAttrs()

// What the FORM reads goes on the hidden native input, and everything else on the group:
// on the group a `name` submits nothing and `required` validates nothing, silently.
const NATIVE_ONLY = ['name', 'form', 'required']
const groupAttrs = computed(() =>
  Object.fromEntries(Object.entries(attrs).filter(([key]) => !NATIVE_ONLY.includes(key))),
)
const nativeAttrs = computed(() =>
  Object.fromEntries(Object.entries(attrs).filter(([key]) => NATIVE_ONLY.includes(key))),
)
// No `useFieldIds` here: the row is named by `aria-label` and renders no `<label>`, so the
// field id that composable generates would have nothing to point it at.
const hintId = useId()
const describedBy = computed(() =>
  joinIds(attrs['aria-describedby'] as string | undefined, !!props.hint && hintId),
)

/**
 * The code as one string, without the separators: a `GT-###` template still yields three
 * characters. It is empty to begin with, and shorter than the full length while it is being
 * typed.
 */
const model = defineModel<string>({ default: '' })

const emit = defineEmits<{
  /**
   * Emitted the moment the code BECOMES complete, carrying it. Retyping a character of a
   * complete code with the same one does not emit it again.
   */
  complete: [code: string]
}>()

type Cell = { type: 'slot'; slotIndex: number } | { type: 'literal'; char: string }

const cells = computed<Cell[]>(() => {
  if (props.pattern?.includes('#')) {
    let slotIndex = 0
    return [...props.pattern].map((char): Cell =>
      char === '#' ? { type: 'slot', slotIndex: slotIndex++ } : { type: 'literal', char },
    )
  }
  return Array.from({ length: props.length }, (_, i) => ({ type: 'slot', slotIndex: i }))
})
const slotCount = computed(() => cells.value.filter((cell) => cell.type === 'slot').length)

// @devwarn
if (isDev) {
  if (props.pattern && !props.pattern.includes('#'))
    console.warn("[VInputOTP] pattern without '#' — falling back to `length`.")
}

const filters: Record<NonNullable<InputOTPProps['format']>, RegExp> = {
  numeric: /[^0-9]/g,
  alpha: /[^A-Z]/g,
  alphanumeric: /[^A-Z0-9]/g,
}

/**
 * Keeps only what the format allows. Outside a numeric code the text is put in
 * capitals first, so that the value has a single canonical form whichever case the
 * reader typed or pasted.
 */
function sanitize(text: string) {
  const upper = props.format === 'numeric' ? text : text.toUpperCase()
  return upper.replace(filters[props.format], '')
}

const inputs = ref<(HTMLInputElement | null)[]>([])
const rootEl = ref<HTMLElement | null>(null)
const digits = ref<string[]>([])

function syncFromModel(value: string) {
  // A value longer than the row is simply shown cut short, and one holding characters the
  // format refuses is shown filtered — but the model is NOT rewritten to match: writing
  // back here would feed the watcher below and the two would keep correcting each other.
  const clean = sanitize(value)
  digits.value = Array.from({ length: slotCount.value }, (_, i) => clean[i] ?? '')
}
syncFromModel(model.value)
watch([model, slotCount], ([value, count]) => {
  if (value !== digits.value.join('') || digits.value.length !== count) syncFromModel(value)
})

/*
 * TRAP — the list of boxes is trimmed AFTER the render, never before it. A box that
 * disappears calls its function ref with `null` while it is being unmounted, at its OLD
 * position: trimmed in a `pre` watcher, that late assignment would stretch the array back
 * out, and a pattern that shortened would keep its departed boxes as trailing entries.
 */
watch(
  slotCount,
  (count) => {
    inputs.value.length = count
  },
  { flush: 'post' },
)

/** The first empty box, or -1 once the code is complete. Every box before it is filled. */
const firstEmpty = () => digits.value.findIndex((d) => !d)

/** Takes a character out and moves the following ones back, so no gap is left behind. */
function removeAt(slot: number) {
  digits.value.splice(slot, 1)
  digits.value.push('')
}

function focusBox(slot: number) {
  const el = inputs.value[slot]
  el?.focus()
  // Selected, so the next keystroke REPLACES the character: a box that already has the
  // focus receives no focus event to select it.
  el?.select()
}

function commit() {
  const code = digits.value.join('')
  const previous = model.value
  model.value = code
  // Only when the code CHANGES into a full one: retyping a character of a complete code
  // must not submit it a second time for a consumer listening to `complete`.
  if (code.length === slotCount.value && code !== previous) emit('complete', code)
}

// @core
/**
 * Spreads a run of characters across the boxes, starting from the one that received
 * them. It walks the row: a separator swallows the incoming character when the two
 * match, which is what lets a code pasted in its formatted shape line up, and a box
 * takes the next character the format accepts.
 *
 * It returns the last box it filled, so the caller knows where to put the focus, and
 * `null` when nothing in the text was usable.
 */
function distribute(raw: string, startSlot: number): number | null {
  const allCells = cells.value
  let start = allCells.findIndex((cell) => cell.type === 'slot' && cell.slotIndex === startSlot)
  const chars = [...raw]
  // Step back over the separators immediately before that box: pasting the whole
  // string onto the first box means pasting its prefix too, and "GT-" has to be
  // matched rather than treated as characters of the code. Never for ONE character: a
  // `G` typed into the first box of `GT-###` is the code's first character, not the
  // separator, and swallowing it would make such a code impossible to type.
  if (chars.length > 1) while (start > 0 && allCells[start - 1]?.type === 'literal') start--
  let charIndex = 0
  let lastFilled: number | null = null
  for (const cell of allCells.slice(start)) {
    if (charIndex >= chars.length) break
    if (cell.type === 'literal') {
      if (chars[charIndex]?.toUpperCase() === cell.char.toUpperCase()) charIndex++
      continue
    }
    let char = ''
    while (charIndex < chars.length && !char) {
      char = sanitize(chars[charIndex] ?? '')
      charIndex++
    }
    if (!char) break
    digits.value[cell.slotIndex] = char
    lastFilled = cell.slotIndex
  }
  return lastFilled
}

// @keyboard @core — moving the focus forward on its own is what turns a row of
// separate inputs into something that types like one field; spreading the characters
// is the core behaviour underneath it.
function onInput(slotIndex: number, event: Event) {
  const el = event.target as HTMLInputElement
  const empty = firstEmpty()
  const filled = empty === -1 || slotIndex < empty

  // A filled box whose character was not selected receives the new one NEXT to it. What
  // was inserted is what lies just before the caret, and it is what counts.
  const previous = digits.value[slotIndex] ?? ''
  let raw = el.value
  const inserted = raw.length - previous.length
  if (previous && inserted > 0 && el.selectionStart !== null) {
    raw = raw.slice(Math.max(0, el.selectionStart - inserted), el.selectionStart)
  }

  // The same path serves a single keystroke and a pasted code: both are spread from this
  // box onwards — or from the first empty box, when this one lies past it.
  const lastFilled = distribute(raw, filled ? slotIndex : empty)
  if (lastFilled === null) {
    // Either the box was emptied, or nothing typed was valid for this format. A filled box
    // loses its character and the ones after it close the gap.
    if (filled) removeAt(slotIndex)
    el.value = digits.value[slotIndex] ?? ''
    commit()
    return
  }
  // Written by hand: when the characters went to another box, this one's value is still
  // '' in the render, and the patch would leave the typed character on screen.
  el.value = digits.value[slotIndex] ?? ''
  focusBox(Math.min(lastFilled + 1, slotCount.value - 1))
  commit()
}

// @keyboard — the filled boxes form a prefix, so focusing a box past the first empty one
// sends the focus there instead: a pointer landing on box 5 of a two-character code types
// into box 3.
function onFocus(slotIndex: number, event: FocusEvent) {
  const empty = firstEmpty()
  if (empty !== -1 && slotIndex > empty) inputs.value[empty]?.focus()
  else (event.target as HTMLInputElement).select()
}

// @keyboard
function onKeydown(slotIndex: number, event: KeyboardEvent) {
  const empty = firstEmpty()
  // The furthest box the focus may reach: the first empty one, or the last of a full code.
  const reachable = empty === -1 ? slotCount.value - 1 : empty
  let target: number | null = null
  switch (event.key) {
    case 'Backspace':
      // A read-only box refuses its own edits natively, but this erases ANOTHER box, which
      // nothing native guards.
      if (props.readonly || props.disabled || digits.value[slotIndex] || slotIndex === 0) return
      removeAt(slotIndex - 1)
      commit()
      target = slotIndex - 1
      break
    case 'ArrowLeft':
      if (slotIndex > 0) target = slotIndex - 1
      break
    case 'ArrowRight':
      if (slotIndex < reachable) target = slotIndex + 1
      break
    case 'Home':
      target = 0
      break
    case 'End':
      target = reachable
      break
  }
  if (target === null) return
  event.preventDefault()
  focusBox(target)
}

// Function refs are handed to the template ONCE per box: an inline one is a new function
// on every render, which Vue answers with a null-then-element call on every keystroke.
const refSetters = new Map<number, (el: unknown) => void>()
function inputRef(slot: number) {
  let set = refSetters.get(slot)
  if (!set) {
    set = (el) => {
      inputs.value[slot] = el as HTMLInputElement | null
    }
    refSetters.set(slot, set)
  }
  return set
}
/*
 * The same trio every other field of the size scale exposes. `focus` goes to the FIRST
 * EMPTY box rather than to the first box outright, which is where a reader resuming a
 * half-entered code expects to land.
 */
defineExpose({
  /** Moves the focus to the first empty box, or to the last one when the code is complete. */
  focus: (options?: FocusOptions) => {
    const empty = digits.value.findIndex((d) => !d)
    const target = empty === -1 ? slotCount.value - 1 : empty
    inputs.value[target]?.focus(options)
  },
  /** Selects the box the focus is on, as clicking into one already does. */
  select: () => {
    const active = inputs.value.find((el) => el === document.activeElement)
    ;(active ?? inputs.value[0])?.select()
  },
  /** The row itself, for what neither of the two above covers. */
  el: rootEl,
})
</script>

<template>
  <div
    ref="rootEl"
    v-bind="groupAttrs"
    class="v-input-otp v-control"
    role="group"
    :aria-label="ariaLabel"
    :aria-describedby="describedBy"
    :data-invalid="invalid ? '' : undefined"
    :data-size="size"
    :data-compact="compact ? '' : undefined"
    :data-disabled="disabled ? '' : undefined"
    :data-readonly="readonly ? '' : undefined"
  >
    <div class="v-input-otp-boxes">
      <template v-for="(cell, i) in cells" :key="i">
        <input
          v-if="cell.type === 'slot'"
          :ref="inputRef(cell.slotIndex)"
          type="text"
          class="v-input-otp-input"
          :inputmode="format === 'numeric' ? 'numeric' : 'text'"
          :autocomplete="cell.slotIndex === 0 ? 'one-time-code' : 'off'"
          :value="digits[cell.slotIndex]"
          :disabled="disabled"
          :readonly="readonly || undefined"
          :aria-label="m.inputOTP.slot(cell.slotIndex + 1, slotCount)"
          :aria-invalid="invalid || undefined"
          @input="onInput(cell.slotIndex, $event)"
          @keydown="onKeydown(cell.slotIndex, $event)"
          @focus="onFocus(cell.slotIndex, $event)"
        />
        <!-- A separator from the pattern: shown, never focusable, and never part of the
             value. It is hidden from screen readers, each box already announcing its
             own position in the code. -->
        <span v-else class="v-input-otp-literal" aria-hidden="true">
          <VIcon v-if="separatorIcon" v-bind="iconProps(separatorIcon)" />
          <template v-else>{{ cell.char }}</template>
        </span>
      </template>
    </div>

    <!-- What a form reads: the code, under the consumer's name. Out of the tab order and
         hidden from assistive technology, the boxes being the control; a browser focusing
         it to report an invalid code is sent on to the box to fill. -->
    <input
      v-bind="nativeAttrs"
      class="v-input-otp-native v-visually-hidden"
      type="text"
      tabindex="-1"
      aria-hidden="true"
      autocomplete="off"
      :value="model"
      :pattern="`.{${slotCount}}`"
      :disabled="disabled"
      :readonly="readonly || undefined"
      @focus="focusBox(firstEmpty() === -1 ? 0 : firstEmpty())"
    />

    <VTypography v-if="hint" :id="hintId" variant="caption" tone="muted" class="v-input-otp-hint">
      {{ hint }}
    </VTypography>
  </div>
</template>

<style>
@layer vectis.components {
  .v-input-otp {
    /*
     * The heights and the icon context come from the shared v-control class
     * (styles/control-size.css). The type is the one thing kept local, and set one or
     * two steps above the other fields: a single character has a whole square to
     * itself, and at the usual field size it would look lost in it.
     */
    --input-otp-font-size: var(--vectis-font-size-lg);

    /* A column, so the hint sits under the boxes rather than beside them; the row itself
       is the box below. `inline-flex` keeps the component's own width, and the start
       alignment stops the hint from stretching the row to its own length. */
    display: inline-flex;
    flex-direction: column;
    align-items: start;
    gap: var(--vectis-space-1);
  }

  /* A code reads left to right in every language, like the HH:MM of VTimeInput: mirrored
     under `dir="rtl"`, the arrows would walk against the boxes and a `GT-###` pattern would
     be drawn backwards. */
  .v-input-otp-boxes {
    direction: ltr;
    display: flex;
    align-items: center;
    gap: var(--control-gap);
  }

  .v-input-otp-input {
    /* The boxes are square: reading the same variable for both dimensions is what
       makes the size and the density scale them together. */
    width: var(--control-height);
    height: var(--control-height);
    text-align: center;
    background: var(--vectis-color-surface);
    color: var(--vectis-color-text);
    border: 1px solid var(--vectis-color-border-strong);
    border-radius: var(--vectis-radius-interactive);
    font-family: var(--vectis-text-family-code);
    font-size: var(--input-otp-font-size);
    transition:
      border-color var(--vectis-duration-fast) var(--vectis-ease-default),
      box-shadow var(--vectis-duration-fast) var(--vectis-ease-default),
      background-color var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  /* The states follow VInput's, in VInput's order: read-only, hover, focus, invalid,
     disabled. Read-only, focus, invalid and disabled all weigh (0,2,0), so the source order
     arbitrates between them and read-only has to come FIRST, or it would repaint the focus
     and error borders grey.

     A read-only row takes the sunken background and the lighter border of a read-only
     VInput, and the state is read from [data-readonly] rather than from `:read-only`, which
     the browser also matches on a disabled box. */
  .v-input-otp[data-readonly] .v-input-otp-input {
    background: var(--vectis-color-surface-sunken);
    border-color: var(--vectis-color-border);
  }

  /* The hover weighs (0,5,0) and keeps itself off a focused, invalid or disabled box
     through its own `:not()`, as VInput's does. */
  .v-input-otp:not([data-invalid]) .v-input-otp-input:hover:not(:focus, :disabled) {
    border-color: color-mix(
      in oklab,
      var(--vectis-color-border-strong),
      var(--vectis-color-text) 15%
    );
  }

  /* The focused box appears to have a two-pixel border, exactly as in VInput and
     VTextarea: its own 1px border plus a 1px shadow of the same colour just outside
     it. `:focus` rather than `:focus-visible`, like any text field, which shows its focus
     when clicked into too. The transparent outline is the safety net for Windows forced
     colours, which drop box-shadows entirely. */
  .v-input-otp-input:focus {
    border-color: var(--vectis-color-accent);
    box-shadow: 0 0 0 1px var(--vectis-color-accent);
    outline: var(--vectis-focus-ring-width) solid transparent;
  }

  .v-input-otp[data-invalid] .v-input-otp-input {
    border-color: var(--vectis-color-danger);
  }

  .v-input-otp[data-invalid] .v-input-otp-input:focus {
    box-shadow: 0 0 0 1px var(--vectis-color-danger);
  }

  .v-input-otp-literal {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--vectis-color-text-muted);
    font-family: var(--vectis-text-family-code);
    font-size: var(--input-otp-font-size);
    user-select: none;
  }

  /* A disabled row greys out through the colour tokens and never through opacity, the
     same treatment as VInput — `text-muted` inside the box, where `text-subtle` would fall
     under 4.5:1 against `surface-muted`, and `text-subtle` for what sits on the page. */
  .v-input-otp[data-disabled] .v-input-otp-input {
    background: var(--vectis-color-surface-muted);
    color: var(--vectis-color-text-muted);
    border-color: var(--vectis-color-border);
    cursor: not-allowed;
  }

  .v-input-otp[data-disabled] .v-input-otp-literal,
  .v-input-otp[data-disabled] .v-input-otp-hint {
    color: var(--vectis-color-text-subtle);
  }

  /* Of the whole size scale, only the raised type is restated here; the dimensions
     themselves come from v-control. */
  .v-input-otp[data-size='sm'] {
    --input-otp-font-size: var(--vectis-font-size-md);
  }

  .v-input-otp[data-size='lg'] {
    --input-otp-font-size: var(--vectis-font-size-xl);
  }

  @media (prefers-reduced-motion: reduce) {
    .v-input-otp-input {
      transition: none;
    }
  }
}
</style>
