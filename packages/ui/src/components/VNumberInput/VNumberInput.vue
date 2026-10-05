<script setup lang="ts">
// @a11y @core
/**
 * A text field announced as a spinbutton rather than a native number input: only a text field
 * can show a number formatted for its locale (separators, currency, unit, percent), which
 * `type="number"` refuses. The keyboard of a spinbutton, the parsing and the stepping are
 * therefore rebuilt here; the typed value is committed on blur and on Enter, so that a minimum
 * never interrupts the typing of a number that would have reached it.
 */
import { computed, inject, ref, useAttrs, watch } from 'vue'

import VIcon from '../VIcon/VIcon.vue'
import { add as addIcon } from '../VIcon/icons/add'
import { expand_less as expandLessIcon } from '../VIcon/icons/expand_less'
import { expand_more as expandMoreIcon } from '../VIcon/icons/expand_more'
import { remove as removeIcon } from '../VIcon/icons/remove'
import VInput from '../VInput/VInput.vue'
import type { InputSize } from '../VInput/VInput.vue'
import { inputGroupKey } from '../VInput/context'
import VSeparator from '../VSeparator/VSeparator.vue'

import { canClear } from '../../composables/useClearable'
import { useControlShape } from '../../composables/useControlShape'
import { useMessages, useResolvedLocale } from '../../i18n/state'

import { clamp, numberSeparators, parseNumber, scale, stepValue } from './number'

/**
 * Where the step buttons sit: a minus at the start and a plus at the end, both stacked at the
 * end, or none.
 */
export type NumberInputControls = 'split' | 'stacked' | 'none'

interface NumberInputProps {
  /** The smallest value. A typed value below it is raised to it when committed. */
  min?: number
  /** The largest value. A typed value above it is lowered to it when committed. */
  max?: number
  /**
   * How far the arrow keys and the buttons move the value, on a grid that starts at `min`, or at
   * 0 without one. Page Up and Page Down move it ten steps.
   */
  step?: number
  /**
   * How the value is shown while the field is not being edited: the options of
   * `Intl.NumberFormat`, for a currency, a unit, a percentage or a number of decimals. With
   * `style: 'percent'`, the value 0.25 shows and is typed as 25.
   */
  formatOptions?: Intl.NumberFormatOptions
  /** The locale the number is written and read in. It defaults to the design system's. */
  locale?: string
  /** Where the step buttons sit. Whatever their place, they stay out of the tab order. */
  controls?: NumberInputControls
  /** What the plus button does, in words. It falls back to the design system dictionary. */
  incrementLabel?: string
  /** What the minus button does, in words. It falls back to the design system dictionary. */
  decrementLabel?: string
  /** The height of the field: 32, 40 or 48 pixels. */
  size?: InputSize
  /** Takes 4px off the height. */
  compact?: boolean
  /** The label above the field, tied to it. */
  label?: string
  /** A line of help under the field, read out along with the label. */
  hint?: string
  /**
   * A message saying what is wrong with the value, shown in place of the hint. It marks the
   * field invalid and is announced when it appears or changes.
   */
  error?: string
  /** Marks the field as invalid whatever the browser thinks. */
  invalid?: boolean
  /** Makes the field unusable, greyed out through the colour tokens. */
  disabled?: boolean
  /** Shows the value without allowing it to be changed, by typing or by stepping. */
  readonly?: boolean
  /** Offers a cross that empties the field, setting the value to `null`. */
  clearable?: boolean
  /** What the clear button does, in words. It falls back to the design system dictionary. */
  clearLabel?: string
  /** Shows a spinner at the end of the field. */
  loading?: boolean
  /** What screen readers announce while the spinner turns. */
  loadingText?: string
}

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<NumberInputProps>(), {
  min: undefined,
  max: undefined,
  step: 1,
  formatOptions: undefined,
  locale: undefined,
  controls: 'split',
  incrementLabel: undefined,
  decrementLabel: undefined,
  size: 'md',
  compact: false,
  label: undefined,
  hint: undefined,
  error: undefined,
  invalid: false,
  disabled: false,
  readonly: false,
  clearable: false,
  clearLabel: undefined,
  loading: false,
  loadingText: undefined,
})

const emit = defineEmits<{
  /** The clear button was pressed. The value is already `null`. */
  clear: []
}>()

/** The value, `null` while the field is empty. */
const model = defineModel<number | null>({ default: null })

const m = useMessages()
const resolvedLocale = useResolvedLocale(() => props.locale)
const incrementText = computed(() => props.incrementLabel ?? m.value.numberInput.increment)
const decrementText = computed(() => props.decrementLabel ?? m.value.numberInput.decrement)

const group = inject(inputGroupKey, null)
const { disabled: resolvedDisabled } = useControlShape(props, group)

// @a11y
// Everything goes down to VInput, which keeps `class` and `style` on its wrapper; except `name`
// and `form`, which move to a hidden input carrying the bare number: the visible field holds
// formatted text ("1 234,50 €"), which is not what a form should submit.
const attrs = useAttrs()
// Reading both keys even when absent keeps the split in step with the attributes.
const split = computed(() => {
  const { name, form, ...field } = attrs
  return { name: name as string | undefined, form: form as string | undefined, field }
})
const fieldAttrs = computed(() => split.value.field)
const formName = computed(() => split.value.name)
const formOwner = computed(() => split.value.form)

const percent = computed(() => props.formatOptions?.style === 'percent')
const separators = computed(() => numberSeparators(resolvedLocale.value))
const displayFormat = computed(
  () => new Intl.NumberFormat(resolvedLocale.value, props.formatOptions),
)
// The value as it is edited: no grouping, no symbol, every decimal it has.
const editFormat = computed(
  () =>
    new Intl.NumberFormat(resolvedLocale.value, {
      useGrouping: false,
      maximumFractionDigits: 20,
    }),
)

const display = (value: number | null) => (value === null ? '' : displayFormat.value.format(value))
const editable = (value: number | null) =>
  value === null ? '' : editFormat.value.format(percent.value ? scale(value, 100) : value)

/** What was typed, read as a value: `null` when empty, `NaN` when not a number. */
function typedValue(): number | null {
  const value = parseNumber(text.value, separators.value)
  return value === null || Number.isNaN(value) || !percent.value ? value : scale(value, 0.01)
}

const inputRef = ref<InstanceType<typeof VInput> | null>(null)
const hiddenEl = ref<HTMLInputElement | null>(null)
const focused = ref(false)
const text = ref(display(model.value))

function syncText() {
  text.value = focused.value ? editable(model.value) : display(model.value)
}

watch([model, displayFormat, editFormat], syncText)

function setValue(value: number | null) {
  model.value = value
  syncText()
  // @core
  // Enter submits a form as the default action of the very keydown that commits the value,
  // before Vue renders: the hidden input is written now, or the previous number is submitted.
  if (hiddenEl.value) hiddenEl.value.value = value === null ? '' : String(value)
}

/** Commits what was typed: empty is `null`, a number is kept within bounds, text is undone. */
function commit() {
  const value = typedValue()
  if (Number.isNaN(value)) syncText()
  else setValue(value === null ? null : clamp(value, props.min, props.max))
}

const editableField = computed(() => !resolvedDisabled.value && !props.readonly)
/**
 * Whether the field's own controls follow the plus button: the clear cross, which VInput shows by
 * the same rule, or the spinner. A rule then sets the plus apart from them.
 */
const endControls = computed(
  () => props.loading || canClear(props, resolvedDisabled.value, text.value !== ''),
)
const atMin = computed(
  () => model.value !== null && props.min !== undefined && model.value <= props.min,
)
const atMax = computed(
  () => model.value !== null && props.max !== undefined && model.value >= props.max,
)

/**
 * Moves the value by a number of steps, from what is typed when it reads as a number. An empty
 * field starts from 0, or from the nearest bound when 0 is out of range.
 */
function stepBy(steps: number) {
  if (!editableField.value) return
  const typed = focused.value ? typedValue() : model.value
  const current = typed === null || Number.isNaN(typed) ? model.value : typed
  if (current === null) return setValue(clamp(0, props.min, props.max))
  const step = props.step > 0 ? props.step : 1
  setValue(clamp(stepValue(current, steps, step, props.min ?? 0), props.min, props.max))
}

// @keyboard
// The keys of the APG spinbutton. Home and End only take a value when there is a bound to go
// to; otherwise they keep moving the caret, as in any text field.
function onKeydown(event: KeyboardEvent) {
  if (event.altKey || event.ctrlKey || event.metaKey) return
  const steps: Record<string, number> = { ArrowUp: 1, ArrowDown: -1, PageUp: 10, PageDown: -10 }
  if (event.key in steps) {
    event.preventDefault()
    stepBy(steps[event.key]!)
  } else if (event.key === 'Home' && props.min !== undefined && editableField.value) {
    event.preventDefault()
    setValue(props.min)
  } else if (event.key === 'End' && props.max !== undefined && editableField.value) {
    event.preventDefault()
    setValue(props.max)
  } else if (event.key === 'Enter') {
    commit()
  }
}

function onFocus() {
  focused.value = true
  syncText()
}

function onBlur() {
  focused.value = false
  commit()
}

function onClear() {
  setValue(null)
  emit('clear')
}

defineExpose({
  /** Moves the focus to the real input. */
  focus: (options?: FocusOptions) => inputRef.value?.focus(options),
  /** Selects everything in the field. */
  select: () => inputRef.value?.select(),
  /** The real `<input>`. */
  el: computed(() => inputRef.value?.el ?? null),
})
</script>

<template>
  <VInput
    ref="inputRef"
    v-model="text"
    class="v-number-input"
    role="spinbutton"
    inputmode="decimal"
    autocomplete="off"
    :aria-valuenow="model ?? undefined"
    :aria-valuemin="min"
    :aria-valuemax="max"
    :aria-valuetext="model === null ? undefined : display(model)"
    :data-controls="controls"
    v-bind="fieldAttrs"
    :size="size"
    :compact="compact"
    :label="label"
    :hint="hint"
    :error="error"
    :invalid="invalid"
    :disabled="disabled"
    :readonly="readonly"
    :clearable="clearable"
    :clear-label="clearLabel"
    :loading="loading"
    :loading-text="loadingText"
    @focus="onFocus"
    @blur="onBlur"
    @keydown="onKeydown"
    @clear="onClear"
  >
    <!--
      The buttons stay out of the tab order: the arrow keys do what they do, from the field. A
      press does not take the focus either, so the field keeps it while the value moves.
    -->
    <template v-if="controls === 'split'" #start>
      <button
        type="button"
        tabindex="-1"
        class="v-field-action v-number-input-step"
        :aria-label="decrementText"
        :disabled="!editableField || atMin"
        @mousedown.prevent
        @click="stepBy(-1)"
      >
        <VIcon :name="removeIcon" />
      </button>
    </template>
    <template v-if="controls === 'split'" #value-end>
      <button
        type="button"
        tabindex="-1"
        class="v-field-action v-number-input-step"
        :aria-label="incrementText"
        :disabled="!editableField || atMax"
        @mousedown.prevent
        @click="stepBy(1)"
      >
        <VIcon :name="addIcon" />
      </button>
      <VSeparator v-if="endControls" orientation="vertical" class="v-number-input-divider" />
    </template>
    <template v-else-if="controls === 'stacked'" #value-end>
      <span class="v-number-input-stack">
        <button
          type="button"
          tabindex="-1"
          class="v-field-action v-number-input-step"
          :aria-label="incrementText"
          :disabled="!editableField || atMax"
          @mousedown.prevent
          @click="stepBy(1)"
        >
          <VIcon :name="expandLessIcon" />
        </button>
        <button
          type="button"
          tabindex="-1"
          class="v-field-action v-number-input-step"
          :aria-label="decrementText"
          :disabled="!editableField || atMin"
          @mousedown.prevent
          @click="stepBy(-1)"
        >
          <VIcon :name="expandMoreIcon" />
        </button>
      </span>
    </template>
  </VInput>
  <input
    v-if="formName"
    ref="hiddenEl"
    type="hidden"
    :name="formName"
    :form="formOwner"
    :value="model ?? ''"
    :disabled="resolvedDisabled"
  />
</template>

<style>
@layer vectis.components {
  .v-number-input .v-input-control {
    font-variant-numeric: tabular-nums;
  }

  /* Between a minus and a plus, the number reads as the thing they act on. */
  .v-number-input .v-input-control[data-controls='split'] {
    text-align: center;
  }

  /*
   * The rule between the plus button and the field's own controls, as VTimeInput draws after
   * AM/PM: icon height rather than the full height a vertical VSeparator stretches to, which
   * would read as a division of the box rather than a break in the row.
   */
  .v-separator[data-orientation='vertical'].v-number-input-divider {
    align-self: center;
    block-size: var(--control-action-size);
  }

  .v-number-input-step:disabled {
    color: var(--vectis-color-text-subtle);
    cursor: not-allowed;
  }

  /*
   * The stacked pair fills the field's height, set apart from the value by a divider. Each half
   * takes its icon size from the height it has: the field's, less its two 1px borders.
   */
  .v-number-input-stack {
    --vectis-icon-size: calc((var(--control-height) - 2px) / 2);

    display: flex;
    flex-direction: column;
    align-self: stretch;
    border-inline-start: 1px solid var(--vectis-color-border);
  }

  /*
   * Last in the field, the pair reaches over the field's padding to its end edge. Followed by the
   * clear cross or the spinner, it stays in the flow and a second divider sets it apart from them.
   */
  .v-number-input-stack:last-child {
    margin-inline-end: calc(-1 * var(--control-padding-inline-field));
  }

  .v-number-input-stack:not(:last-child) {
    border-inline-end: 1px solid var(--vectis-color-border);
  }

  .v-number-input-stack > .v-number-input-step {
    flex: 1 1 0;
    block-size: auto;
    inline-size: var(--control-action-size);
    margin: 0;
    border-radius: 0;
  }

  .v-number-input-stack > .v-number-input-step + .v-number-input-step {
    border-block-start: 1px solid var(--vectis-color-border);
  }
}
</style>
