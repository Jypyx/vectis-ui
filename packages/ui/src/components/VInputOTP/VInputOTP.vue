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
 */

import { computed, ref, watch } from 'vue'
import VIcon from '../VIcon/VIcon.vue'
import { iconProps } from '../VIcon/iconProps'
import type { IconSource } from '../VIcon/types'

import { isDev } from '../../utils/env'

import { useAriaLabel } from '../../composables/useAriaLabel'
import { useMessages } from '../../i18n/state'

interface InputOTPProps {
  /** How many boxes the code has. It is ignored as soon as a `pattern` is given. */
  length?: number
  /**
   * Which characters the code is made of. It filters what can be typed or pasted, and
   * decides which keyboard a phone offers.
   */
  format?: 'numeric' | 'alpha' | 'alphanumeric'
  /**
   * The shape of the code: each `#` is a box to fill, and every other character is a
   * separator shown between the boxes without ever being part of the value —
   * `'GT-###'`, `'###.###.###'`. It wins over `length`.
   */
  pattern?: string
  /**
   * An icon drawn in place of EVERY separator of the pattern. It suits a template
   * whose separators are purely decorative, `'###-###'`, and should not be used with
   * one carrying meaningful text such as `'GT-###'`, which the icon would erase.
   */
  separatorIcon?: IconSource
  /** The size of the boxes: 32, 40 or 48 pixels. */
  size?: 'sm' | 'md' | 'lg'
  /** Takes 4px off the boxes, leaving the text and the icons as they are. */
  compact?: boolean
  /** Makes every box unusable, greyed out through the colour tokens. */
  disabled?: boolean
  /** Marks the code as wrong, which colours the boxes and tells assistive technology so. */
  invalid?: boolean
  /**
   * What screen readers announce for the row as a whole. It falls back to the design
   * system dictionary.
   */
  label?: string
}

const props = withDefaults(defineProps<InputOTPProps>(), {
  length: 6,
  format: 'numeric',
  pattern: undefined,
  separatorIcon: undefined,
  size: 'md',
  compact: false,
  disabled: false,
  invalid: false,
  label: undefined,
})

const m = useMessages()
const ariaLabel = useAriaLabel(() => props.label ?? m.value.inputOTP.label)

/**
 * The code as one string, without the separators: a `GT-###` template still yields three
 * characters. It is empty to begin with, and shorter than the full length while it is being
 * typed.
 */
const model = defineModel<string>({ default: '' })

const emit = defineEmits<{
  /** Emitted the moment every box is filled, carrying the complete code. */
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
const digits = ref<string[]>([])

function syncFromModel(value: string) {
  // A value longer than the row is simply shown cut short, and the model is NOT
  // rewritten to match: writing back here would feed the watcher below and the two
  // would keep correcting each other.
  digits.value = Array.from({ length: slotCount.value }, (_, i) => value[i] ?? '')
}
syncFromModel(model.value)
watch([model, slotCount], ([value, count]) => {
  if (value !== digits.value.join('') || digits.value.length !== count) syncFromModel(value)
})

function commit() {
  const code = digits.value.join('')
  model.value = code
  if (code.length === slotCount.value) emit('complete', code)
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
  // Step back over the separators immediately before that box: pasting the whole
  // string onto the first box means pasting its prefix too, and "GT-" has to be
  // matched rather than treated as characters of the code.
  while (start > 0 && allCells[start - 1]?.type === 'literal') start--
  const chars = [...raw]
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
  // The same path serves a single keystroke and a pasted code: both are spread from
  // this box onwards.
  const lastFilled = distribute(el.value, slotIndex)
  if (lastFilled === null) {
    // Either the box was emptied, or nothing typed was valid for this format.
    digits.value[slotIndex] = ''
    el.value = ''
    commit()
    return
  }
  el.value = digits.value[slotIndex] ?? ''
  inputs.value[Math.min(lastFilled + 1, slotCount.value - 1)]?.focus()
  commit()
}

// @keyboard
function onKeydown(slotIndex: number, event: KeyboardEvent) {
  if (event.key === 'Backspace' && !digits.value[slotIndex] && slotIndex > 0) {
    event.preventDefault()
    digits.value[slotIndex - 1] = ''
    commit()
    inputs.value[slotIndex - 1]?.focus()
  } else if (event.key === 'ArrowLeft' && slotIndex > 0) {
    event.preventDefault()
    inputs.value[slotIndex - 1]?.focus()
  } else if (event.key === 'ArrowRight' && slotIndex < slotCount.value - 1) {
    event.preventDefault()
    inputs.value[slotIndex + 1]?.focus()
  }
}
</script>

<template>
  <div
    class="v-otp v-control"
    role="group"
    :aria-label="ariaLabel"
    :data-invalid="invalid ? '' : undefined"
    :data-size="size"
    :data-compact="compact ? '' : undefined"
    :data-disabled="disabled ? '' : undefined"
  >
    <template v-for="(cell, i) in cells" :key="i">
      <input
        v-if="cell.type === 'slot'"
        :ref="
          (el) => {
            inputs[cell.slotIndex] = el as HTMLInputElement | null
          }
        "
        type="text"
        class="v-otp-input"
        :inputmode="format === 'numeric' ? 'numeric' : 'text'"
        :autocomplete="cell.slotIndex === 0 ? 'one-time-code' : 'off'"
        :value="digits[cell.slotIndex]"
        :disabled="disabled"
        :aria-label="m.inputOTP.slot(cell.slotIndex + 1, slotCount)"
        :aria-invalid="invalid || undefined"
        @input="onInput(cell.slotIndex, $event)"
        @keydown="onKeydown(cell.slotIndex, $event)"
        @focus="($event.target as HTMLInputElement).select()"
      />
      <!-- A separator from the pattern: shown, never focusable, and never part of the
           value. It is hidden from screen readers, each box already announcing its
           own position in the code. -->
      <span v-else class="v-otp-literal" aria-hidden="true">
        <VIcon v-if="separatorIcon" v-bind="iconProps(separatorIcon)" />
        <template v-else>{{ cell.char }}</template>
      </span>
    </template>
  </div>
</template>

<style>
@layer vectis.components {
  .v-otp {
    /*
     * The heights and the icon context come from the shared v-control class
     * (styles/control-size.css). The type is the one thing kept local, and set one or
     * two steps above the other fields: a single character has a whole square to
     * itself, and at the usual field size it would look lost in it.
     */
    --otp-font-size: var(--vectis-font-size-lg);

    display: inline-flex;
    align-items: center;
    gap: var(--control-gap);
  }

  .v-otp-input {
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
    font-size: var(--otp-font-size);
    transition: border-color var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  /* The focused box appears to have a two-pixel border, exactly as in VInput and
     VTextarea: its own 1px border plus a 1px shadow of the same colour just outside
     it. The transparent outline is the safety net for Windows forced colours, which
     drop box-shadows entirely. */
  .v-otp-input:focus-visible {
    border-color: var(--vectis-color-accent);
    box-shadow: 0 0 0 1px var(--vectis-color-accent);
    outline: var(--vectis-focus-ring-width) solid transparent;
  }

  .v-otp[data-invalid] .v-otp-input {
    border-color: var(--vectis-color-danger);
  }

  .v-otp[data-invalid] .v-otp-input:focus-visible {
    box-shadow: 0 0 0 1px var(--vectis-color-danger);
  }

  .v-otp-literal {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--vectis-color-text-muted);
    font-family: var(--vectis-text-family-code);
    font-size: var(--otp-font-size);
    user-select: none;
  }

  /* A disabled row greys out through the colour tokens and never through opacity, the
     same treatment as VInput. */
  .v-otp[data-disabled] .v-otp-input {
    background: var(--vectis-color-surface-muted);
    color: var(--vectis-color-text-subtle);
    border-color: var(--vectis-color-border);
    cursor: not-allowed;
  }

  .v-otp[data-disabled] .v-otp-literal {
    color: var(--vectis-color-text-subtle);
  }

  /* Of the whole size scale, only the raised type is restated here; the dimensions
     themselves come from v-control. */
  .v-otp[data-size='sm'] {
    --otp-font-size: var(--vectis-font-size-md);
  }

  .v-otp[data-size='lg'] {
    --otp-font-size: var(--vectis-font-size-xl);
  }

  @media (prefers-reduced-motion: reduce) {
    .v-otp-input {
      transition: none;
    }
  }
}
</style>
