<script setup lang="ts">
// @keyboard @core
/**
 * Coordinate character inputs because HTML has no segmented code field. JavaScript filters
 * values, distributes paste and moves focus; pattern literals stay outside the model.
 */

import { computed, ref, useAttrs, useId, watch } from 'vue'
import VFieldAnnouncer from '../VField/VFieldAnnouncer.vue'
import VIcon from '../VIcon/VIcon.vue'
import { iconProps } from '../VIcon/iconProps'
import type { IconSource } from '../VIcon/types'
import VTypography from '../VTypography/VTypography.vue'

import { partitionAttrs } from '../../utils/attrs'
import { isDev } from '../../utils/env'
import { joinIds } from '../../utils/ids'

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
   * The shape of the code: each `#` is a box to fill, and every other character is a separator
   * shown between the boxes without ever being part of the value, as in `'GT-###'` or
   * `'###.###.###'`.
   */
  pattern?: string
  /** An icon drawn in place of every separator of the pattern. */
  separatorIcon?: IconSource
  /** The size of the boxes: 32, 40 or 48 pixels. */
  size?: InputOTPSize
  /** Takes 4px off the boxes, leaving the text and the icons as they are. */
  compact?: boolean
  /** Makes every box unusable, greyed out through the colour tokens. */
  disabled?: boolean
  /**
   * Shows the code without letting it be changed. The boxes keep their focus and the code can
   * still be selected and copied, which separates it from `disabled`.
   */
  readonly?: boolean
  /** Marks the code as wrong, which colours the boxes and tells assistive technology so. */
  invalid?: boolean
  /**
   * The label above the boxes, which names the row. Without it, the row is named by its
   * `aria-label` or by the design system dictionary.
   */
  label?: string
  /**
   * A line of help under the boxes: where the code was sent, how long it lasts. It is
   * tied to the row for assistive technology, so it is read out along with the label.
   */
  hint?: string
  /**
   * A message saying what is wrong with the value, shown in place of the hint so that the field
   * does not grow. It marks the field invalid, is read along with it, and is announced when it
   * appears or changes.
   */
  error?: string
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
  error: undefined,
})

const m = useMessages()

// @a11y
/*
 * `aria-describedby` is a list, and the hint is appended to whatever the consumer already
 * pointed at instead of replacing it; left to the fallthrough, their value would land last and
 * take the hint out of the announcement with nothing to show for it.
 */
defineOptions({ inheritAttrs: false })

const attrs = useAttrs()

// What the FORM reads goes on the hidden native input, and everything else on the group:
// on the group a `name` submits nothing and `required` validates nothing, silently.
const NATIVE_ONLY = ['name', 'form', 'required']
const split = computed(() => partitionAttrs(attrs, NATIVE_ONLY))
const groupAttrs = computed(() => split.value.rest)
const nativeAttrs = computed(() => split.value.picked)
// @a11y
// A `<label for>` names one control, and this names a row of them, so the visible label names
// the group through `aria-labelledby`. A consumer's `aria-labelledby` or `aria-label` wins; with
// neither and no label, the dictionary names the row.
const labelId = useId()
const labelledBy = computed(() => {
  const own = attrs['aria-labelledby'] as string | undefined
  if (own !== undefined) return own
  return props.label && attrs['aria-label'] === undefined ? labelId : undefined
})
const ariaLabel = computed(() =>
  labelledBy.value
    ? undefined
    : ((attrs['aria-label'] as string | undefined) ?? m.value.inputOTP.label),
)

// No `useFieldIds` here: its field id would have no single control to point at.
const hintId = useId()
const errorId = useId()
const describedBy = computed(() =>
  joinIds(
    attrs['aria-describedby'] as string | undefined,
    !!props.error && errorId,
    !!props.hint && !props.error && hintId,
  ),
)
const isInvalid = computed(() => props.invalid || !!props.error)

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

const filters: Record<InputOTPFormat, RegExp> = {
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

const rootEl = ref<HTMLElement | null>(null)
const digits = ref<string[]>([])

// @keyboard
// Read the rendered order on demand; changing a pattern can move or replace its input cells.
function inputAt(slot: number) {
  return rootEl.value?.querySelectorAll<HTMLInputElement>('.v-input-otp-input')[slot]
}

function syncFromModel(value: string) {
  // A value longer than the row is simply shown cut short, and one holding characters the
  // format refuses is shown filtered; but the model is not rewritten to match: writing back
  // here would feed the watcher below and the two would keep correcting each other.
  const clean = sanitize(value)
  digits.value = Array.from({ length: slotCount.value }, (_, i) => clean[i] ?? '')
}
syncFromModel(model.value)
watch([model, slotCount], ([value, count]) => {
  if (value !== digits.value.join('') || digits.value.length !== count) syncFromModel(value)
})

/** The first empty box, or -1 once the code is complete. Every box before it is filled. */
const firstEmpty = () => digits.value.findIndex((d) => !d)

/** The furthest box the focus may reach: the first empty one, or the last of a full code. */
function reachable() {
  const empty = firstEmpty()
  return empty === -1 ? slotCount.value - 1 : empty
}

/** Takes a character out and moves the following ones back, so no gap is left behind. */
function removeAt(slot: number) {
  digits.value.splice(slot, 1)
  digits.value.push('')
}

function focusBox(slot: number) {
  const el = inputAt(slot)
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
 * Spreads a run of characters across the boxes, starting from the one that received them. It
 * returns the last box it filled, so the caller knows where to put the focus, and `null` when
 * nothing in the text was usable.
 */
function distribute(raw: string, startSlot: number): number | null {
  const allCells = cells.value
  let start = allCells.findIndex((cell) => cell.type === 'slot' && cell.slotIndex === startSlot)
  const chars = [...raw]
  // Never for ONE character: a `G` typed into the first box of `GT-###` is the code's first
  // character, not the separator, and swallowing it would make such a code impossible to type.
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

// @keyboard @core
// Separate inputs into something that types like one field; spreading the characters is the
// core behaviour underneath it.
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

  // The same path serves a single keystroke and a pasted code: both are spread from this box
  // onwards; or from the first empty box, when this one lies past it.
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

// @keyboard
// Sends the focus there instead: a pointer landing on box 5 of a two-character code types into
// box 3.
function onFocus(slotIndex: number, event: FocusEvent) {
  const empty = firstEmpty()
  if (empty !== -1 && slotIndex > empty) inputAt(empty)?.focus()
  else (event.target as HTMLInputElement).select()
}

// @keyboard
function onKeydown(slotIndex: number, event: KeyboardEvent) {
  const last = reachable()
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
      if (slotIndex < last) target = slotIndex + 1
      break
    case 'Home':
      target = 0
      break
    case 'End':
      target = last
      break
  }
  if (target === null) return
  event.preventDefault()
  focusBox(target)
}

defineExpose({
  /** Moves the focus to the first empty box, or to the last one when the code is complete. */
  focus: (options?: FocusOptions) => inputAt(reachable())?.focus(options),
  /** Selects the box the focus is on, as clicking into one already does. */
  select: () => {
    const active = rootEl.value?.querySelector<HTMLInputElement>('.v-input-otp-input:focus')
    ;(active ?? inputAt(0))?.select()
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
    :aria-labelledby="labelledBy"
    :aria-describedby="describedBy"
    :data-invalid="isInvalid ? '' : undefined"
    :data-size="size"
    :data-compact="compact ? '' : undefined"
    :data-disabled="disabled ? '' : undefined"
    :data-readonly="readonly ? '' : undefined"
  >
    <VTypography v-if="label" :id="labelId" as="span" variant="label" class="v-input-otp-label">
      {{ label }}
    </VTypography>

    <div class="v-input-otp-boxes">
      <template v-for="(cell, i) in cells" :key="i">
        <input
          v-if="cell.type === 'slot'"
          type="text"
          class="v-input-otp-input"
          :inputmode="format === 'numeric' ? 'numeric' : 'text'"
          :autocomplete="cell.slotIndex === 0 ? 'one-time-code' : 'off'"
          :value="digits[cell.slotIndex]"
          :disabled="disabled"
          :readonly="readonly || undefined"
          :aria-label="m.inputOTP.slot(cell.slotIndex + 1, slotCount)"
          :aria-invalid="isInvalid || undefined"
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

    <!--
      Out of the tab order and hidden from assistive technology, the boxes being the control; a
      browser focusing it to report an invalid code is sent on to the box to fill.
    -->
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
      @focus="focusBox(reachable())"
    />

    <span v-if="error" :id="errorId" class="v-field-error v-input-otp-error">{{ error }}</span>
    <VTypography
      v-else-if="hint"
      :id="hintId"
      variant="caption"
      tone="muted"
      class="v-input-otp-hint"
    >
      {{ hint }}
    </VTypography>
    <VFieldAnnouncer :text="error" />
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

    /* A column: label, boxes, then hint. `inline-flex` keeps the component's own width, and
       the start alignment stops the label or the hint from stretching the row to its length. */
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

  /*
   * The states follow VInput's, in VInput's order: read-only, hover, focus, invalid, disabled.
   * Read-only, focus, invalid and disabled all weigh (0,2,0), so the source order arbitrates
   * between them and read-only has to come first, or it would repaint the focus and error
   * borders grey.
   */
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

  /*
   * `:focus` rather than `:focus-visible`, like any text field, which shows its focus when
   * clicked into too. The transparent outline is the safety net for Windows forced colours,
   * which drop box-shadows entirely.
   */
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

  /*
   * A disabled row greys out through the colour tokens and never through opacity, the same
   * treatment as VInput; `text-muted` inside the box, where `text-subtle` would fall under
   * 4.5:1 against `surface-muted`, and `text-subtle` for what sits on the page.
   */
  .v-input-otp[data-disabled] .v-input-otp-input {
    background: var(--vectis-color-surface-muted);
    color: var(--vectis-color-text-muted);
    border-color: var(--vectis-color-border);
    cursor: not-allowed;
  }

  .v-input-otp[data-disabled] .v-input-otp-literal,
  .v-input-otp[data-disabled] .v-input-otp-label,
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
