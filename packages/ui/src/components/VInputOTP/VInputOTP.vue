<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import VIcon from '../VIcon/VIcon.vue'
import { iconProps } from '../VIcon/iconProps'
import type { IconSource } from '../VIcon/types'

import { isDev } from '../../utils/env'

import { useAriaLabel } from '../../composables/useAriaLabel'
import { useMessages } from '../../i18n/state'

/**
 * A one-time code (OTP). There is no "N-character code" primitive: each cell stays a
 * native <input>, and the JS orchestrates the keyboard and pasting (justified) —
 * auto-advance, backspace, a paste distributed across the cells, arrows.
 * `autocomplete="one-time-code"` on the first cell: automatic filling (SMS/password
 * manager) is distributed.
 *
 * `pattern` cuts the template into cells: the '#' become cells, the other characters
 * become displayed literals (outside the v-model). Pasting is "pattern-aware": the
 * literals present in the pasted text ("GT-123", "123.456.789") are consumed
 * positionally, and the rest is filtered by `format` (capitals forced outside
 * numeric: a canonical v-model).
 */
interface InputOTPProps {
  /** Number of cells. Ignored when `pattern` is supplied. */
  length?: number
  /** Accepted character set: it filters typing/pasting + the inputmode. */
  format?: 'numeric' | 'alpha' | 'alphanumeric'
  /**
   * Template: '#' = an editable cell, any other character = a displayed literal
   * (outside the v-model). Wins over `length`. E.g. 'GT-###', '###.###.###'.
   */
  pattern?: string
  /**
   * A Material Symbols name replacing EVERY literal of the pattern — meant for purely
   * separator templates ('###-###'); do not supply it with a textual prefix
   * ('GT-###').
   */
  separatorIcon?: IconSource
  /** Side of the cells: sm 32px, md 40px (the default), lg 48px. */
  size?: 'sm' | 'md' | 'lg'
  /** Height reduced by 4px; type and icons unchanged (as in VButton/VInput). */
  compact?: boolean
  disabled?: boolean
  invalid?: boolean
  /** Accessible name of the group. Default: the DS dictionary. */
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

const model = defineModel<string>({ default: '' })

const emit = defineEmits<{
  /** Emitted when every cell is filled. */
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

if (isDev) {
  if (props.pattern && !props.pattern.includes('#'))
    console.warn("[VInputOTP] pattern without '#' — falling back to `length`.")
}

const filters: Record<NonNullable<InputOTPProps['format']>, RegExp> = {
  numeric: /[^0-9]/g,
  alpha: /[^A-Z]/g,
  alphanumeric: /[^A-Z0-9]/g,
}

/** Capitals forced outside numeric (a canonical v-model), then the format filter. */
function sanitize(text: string) {
  const upper = props.format === 'numeric' ? text : text.toUpperCase()
  return upper.replace(filters[props.format], '')
}

const inputs = ref<(HTMLInputElement | null)[]>([])
const digits = ref<string[]>([])

function syncFromModel(value: string) {
  // a model longer than the cells: truncated visually, without rewriting the model
  // spontaneously (no model → digits → model loop)
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

/**
 * Pattern-aware distribution: it walks the cells from the target one — a literal
 * consumes the pasted character when it equals it (pasting the formatted string), a
 * cell consumes the next valid character. Returns the last slot filled, or null when
 * nothing is usable.
 */
function distribute(raw: string, startSlot: number): number | null {
  const allCells = cells.value
  let start = allCells.findIndex((cell) => cell.type === 'slot' && cell.slotIndex === startSlot)
  // walk back up the run of contiguous literals preceding the cell: pasting the whole
  // string ("GT-123" onto slot 0) includes them
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

function onInput(slotIndex: number, event: Event) {
  const el = event.target as HTMLInputElement
  // a single keystroke OR a multi-character paste: distributed from this cell on
  const lastFilled = distribute(el.value, slotIndex)
  if (lastFilled === null) {
    // an erase, or no character valid for the format
    digits.value[slotIndex] = ''
    el.value = ''
    commit()
    return
  }
  el.value = digits.value[slotIndex] ?? ''
  inputs.value[Math.min(lastFilled + 1, slotCount.value - 1)]?.focus()
  commit()
}

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
      <!-- a decorative literal of the template: never focusable, outside the v-model -->
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
     * Height/icons: the shared v-control class (styles/control-size.css). The
     * typography keeps a scale of its own, bumped one or two notches compared with the
     * other fields: the digits fill the square cells.
     */
    --otp-font-size: var(--vectis-font-size-lg);

    display: inline-flex;
    align-items: center;
    gap: var(--control-gap);
  }

  .v-otp-input {
    /* Square cells: size/compact scale both dimensions at once */
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

  /* The "2px border" focus: a 1px border + a 1px outer shadow in the same colour
     (aligned on VInput/VTextarea); the transparent outline is the forced-colors line
     (Windows High Contrast removes box-shadows) */
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

  /* Disabled: greys through tokens, with no opacity (aligned on VInput) */
  .v-otp[data-disabled] .v-otp-input {
    background: var(--vectis-color-surface-muted);
    color: var(--vectis-color-text-subtle);
    border-color: var(--vectis-color-border);
    cursor: not-allowed;
  }

  .v-otp[data-disabled] .v-otp-literal {
    color: var(--vectis-color-text-subtle);
  }

  /* Sizes: only the bumped typography stays local, the rest comes from v-control */
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
