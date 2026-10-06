<script setup lang="ts">
// @a11y @core
/**
 * Compose VInput with VColorPicker. The colour is typed into the field in any format, and the
 * swatch at its start opens the picker in a panel; a text input cannot use popovertarget, so the
 * manual panel bridge handles opening, dismissal and focus transfer into the picker.
 */
import { computed, inject, ref, watch } from 'vue'

import VColorPicker from '../VColorPicker/VColorPicker.vue'
import type { ColorFormat, ColorSwatch } from '../VColorPicker/VColorPicker.vue'
import { formatColor, parseColor } from '../VColorPicker/color'
import VInput from '../VInput/VInput.vue'
import { inputGroupKey } from '../VInput/context'
import VPopover from '../VPopover/VPopover.vue'
import { canClear } from '../../composables/useClearable'
import { useControlShape } from '../../composables/useControlShape'
import { useFieldPanel } from '../../composables/useFieldPanel'
import { useRootAttrs } from '../../composables/useRootAttrs'
import { useMessages } from '../../i18n/state'

/** The height of the field: 32, 40 or 48 pixels. */
export type ColorInputSize = 'sm' | 'md' | 'lg'

/** Where the picker opens relative to the field. */
export type ColorInputPlacement =
  'bottom' | 'bottom-start' | 'bottom-end' | 'top' | 'top-start' | 'top-end'

interface ColorInputProps {
  /**
   * How the value is written: `#rrggbb`, `rgb()`, `hsl()` or `oklch()`. The field accepts all
   * four, and rewrites what was typed in this one when the reader leaves it.
   */
  format?: ColorFormat
  /** Offers an opacity track, and writes the alpha into the value when it is below 1. */
  alpha?: boolean
  /** Preset colours, offered as swatches in the picker. */
  swatches?: ColorSwatch[]
  /** Hides the picker's eyedropper button. */
  hideEyeDropper?: boolean
  /** The label above the field. */
  label?: string
  /** A line of help under the field. */
  hint?: string
  /**
   * A message saying what is wrong with the value, shown in place of the hint. It marks the
   * field invalid, is read along with it, and is announced when it appears or changes.
   */
  error?: string
  /** What the field says while empty. */
  placeholder?: string
  /** The height of the field: 32, 40 or 48 pixels. */
  size?: ColorInputSize
  /** Takes 4px off the height. */
  compact?: boolean
  /** Makes the field unusable. */
  disabled?: boolean
  /** Shows the colour without letting it change: nothing can be typed, and there is no picker. */
  readonly?: boolean
  /** Marks the field as invalid, for a rule of your own. */
  invalid?: boolean
  /** Offers a cross that empties the value. */
  clearable?: boolean
  /** What that cross does, in words. It falls back to the design system dictionary. */
  clearLabel?: string
  /**
   * What the swatch at the start of the field does, in words. It falls back to the design
   * system dictionary.
   */
  pickerButtonLabel?: string
  /** Where the picker opens relative to the field. */
  placement?: ColorInputPlacement
}

const props = withDefaults(defineProps<ColorInputProps>(), {
  format: 'hex',
  alpha: false,
  swatches: undefined,
  hideEyeDropper: false,
  label: undefined,
  hint: undefined,
  error: undefined,
  placeholder: undefined,
  size: 'md',
  compact: false,
  disabled: false,
  readonly: false,
  invalid: false,
  clearable: false,
  clearLabel: undefined,
  pickerButtonLabel: undefined,
  placement: 'bottom-start',
})

/** The colour, written in `format`, or `null` when the field is empty. */
const model = defineModel<string | null>({ default: null })

const emit = defineEmits<{
  /** The clear cross emptied the field. The value has already been reset. */
  clear: []
}>()

defineSlots<{
  /** Controls of your own inside the field, placed before the clear cross. */
  'value-end'?(): unknown
}>()

// `class` and `style` stay on the wrapper; everything else goes down to the text field, which a
// consumer's label points at and what assistive technology deals with.
defineOptions({ inheritAttrs: false })
const { rootClass, rootStyle, forwardedAttrs } = useRootAttrs()

const m = useMessages()

const rootEl = ref<HTMLElement | null>(null)
const panelRef = ref<InstanceType<typeof VPopover> | null>(null)
const inputRef = ref<InstanceType<typeof VInput> | null>(null)
const pickerRef = ref<InstanceType<typeof VColorPicker> | null>(null)

// A VInputGroup joins several controls into one object, so the shape of this field is the
// row's decision rather than its own (VInput/context.ts).
const group = inject(inputGroupKey, null)
const {
  size: resolvedSize,
  compact: resolvedCompact,
  disabled: resolvedDisabled,
} = useControlShape(props, group)

const hasPanel = computed(() => !props.readonly)

const {
  open,
  panelId,
  closeAndFocus,
  focusField,
  toggleFromIcon,
  onFocusout,
  onKeydown,
  onPanelMousedown,
} = useFieldPanel({
  rootEl,
  panelRef,
  field: inputRef,
  disabled: () => resolvedDisabled.value || !hasPanel.value,
  focusInPanel: () => pickerRef.value?.focus(),
})

// @a11y
// The popup wiring is spread over the forwarded attributes rather than bound after them, so a
// field with no panel carries no key at all and leaves the consumer's own `role` alone.
const inputAttrs = computed(() =>
  hasPanel.value
    ? {
        ...forwardedAttrs.value,
        role: 'combobox',
        'aria-haspopup': 'dialog',
        'aria-expanded': open.value,
        'aria-controls': panelId,
      }
    : forwardedAttrs.value,
)

/** What the field shows: the value, or what is being typed until the reader leaves. */
const fieldText = ref('')
watch(model, (value) => (fieldText.value = value ?? ''), { immediate: true })

const parsed = computed(() => parseColor(model.value))

/** The colour the swatch shows, with the opacity it has. */
const swatchColor = computed(() =>
  parsed.value ? formatColor(parsed.value, 'rgb', props.alpha) : undefined,
)

/**
 * Takes what was typed, in any of the four formats, and rewrites it in `format`. Anything that
 * is not a colour puts the field back as it was.
 */
function commitField() {
  const text = fieldText.value.trim()
  if (!text) {
    model.value = null
    return
  }
  const color = parseColor(text)
  if (!color) {
    fieldText.value = model.value ?? ''
    return
  }
  const next = formatColor(color, props.format, props.alpha)
  model.value = next
  // The same value written again changes nothing, so the watcher would leave the text as typed.
  fieldText.value = next
}

// @keyboard
// Enter takes the value and stays in the field; without it, the panel bridge would open the
// picker. The down arrow remains the way into the picker.
function onFieldKeydown(event: KeyboardEvent) {
  if (event.key !== 'Enter') return
  event.preventDefault()
  commitField()
}

// @keyboard
// Enter on a track or a swatch is done with choosing: the panel closes and the focus returns to
// the field. A button's Enter is left alone, being its click.
function onPickerKeydown(event: KeyboardEvent) {
  if (event.key !== 'Enter' || !(event.target as HTMLElement).matches('input')) return
  event.preventDefault()
  closeAndFocus()
}

const clearVisible = computed(() =>
  canClear(props, resolvedDisabled.value, !!model.value || !!fieldText.value),
)

function clearValue() {
  model.value = null
  fieldText.value = ''
  focusField()
  emit('clear')
}

defineExpose({
  /** Moves the focus to the text field. */
  focus: (options?: FocusOptions) => inputRef.value?.focus(options),
  /** Selects what the field is showing. */
  select: () => inputRef.value?.select(),
  /** The real `<input>` behind the field. */
  el: computed(() => inputRef.value?.el ?? null),
})
</script>

<template>
  <div
    ref="rootEl"
    class="v-color-input"
    :class="rootClass"
    :style="rootStyle"
    :data-open="open ? '' : undefined"
    :data-disabled="resolvedDisabled ? '' : undefined"
    @focusout="onFocusout"
    @keydown="onKeydown"
  >
    <VInput
      ref="inputRef"
      v-model="fieldText"
      class="v-color-input-field"
      autocomplete="off"
      spellcheck="false"
      v-bind="inputAttrs"
      :readonly="readonly"
      :label="label"
      :hint="hint"
      :error="error"
      :placeholder="placeholder"
      :size="resolvedSize"
      :compact="resolvedCompact"
      :disabled="resolvedDisabled"
      :invalid="invalid"
      :clearable="clearable"
      :clear-visible="clearVisible"
      :clear-label="clearLabel ?? m.colorInput.clear"
      @clear="clearValue"
      @change="commitField"
      @keydown="onFieldKeydown"
    >
      <template #start>
        <button
          v-if="hasPanel"
          type="button"
          class="v-field-action v-color-input-swatch"
          :aria-label="pickerButtonLabel ?? m.colorInput.openPicker"
          :disabled="resolvedDisabled"
          @click="toggleFromIcon"
        >
          <span class="v-color-input-chip" :style="{ '--color-input-chip': swatchColor }" />
        </button>
        <span v-else class="v-color-input-swatch" aria-hidden="true">
          <span class="v-color-input-chip" :style="{ '--color-input-chip': swatchColor }" />
        </span>
      </template>
      <template v-if="$slots['value-end']" #value-end><slot name="value-end" /></template>
    </VInput>

    <VPopover
      v-if="hasPanel"
      :id="panelId"
      ref="panelRef"
      v-model:open="open"
      mode="manual"
      anchor="--color-input-anchor"
      :placement="placement"
      role="dialog"
      :aria-label="label ?? m.colorInput.pickerLabel"
      class="v-color-input-panel"
      @mousedown="onPanelMousedown"
    >
      <VColorPicker
        ref="pickerRef"
        v-model="model"
        :format="format"
        :alpha="alpha"
        :swatches="swatches"
        :hide-eye-dropper="hideEyeDropper"
        hide-input
        @keydown="onPickerKeydown"
      />
    </VPopover>
  </div>
</template>

<style>
@layer vectis.components {
  .v-color-input {
    anchor-scope: --color-input-anchor;
    display: block;
    inline-size: 100%;
    font-family: var(--vectis-text-family);
  }

  /*
   * Anchored to the field's box rather than the wrapper, which also holds the label and the
   * hint: the panel then covers whichever of the two it lands on.
   */
  .v-color-input .v-input-field {
    anchor-name: --color-input-anchor;
  }

  /* A colour is written left to right in every language, as in VColorPicker's own field. */
  .v-color-input .v-input-control {
    direction: ltr;
    font-variant-numeric: tabular-nums;
  }

  .v-color-input .v-input-control:dir(rtl) {
    text-align: right;
  }

  /* The read-only swatch, which is no button and takes none of `.v-field-action`. */
  span.v-color-input-swatch {
    display: inline-flex;
    flex: none;
  }

  /*
   * The checkerboard shows through a translucent colour, drawn in the theme's own surface and
   * border colours; an empty field shows it alone. Forced colours leave the chip untouched: it
   * is the value, not the theme's paint. As on VColorPicker's swatches, the edge is a
   * translucent border shading the colour that runs under it, the checkerboard stopping inside:
   * an opaque ring left a pale fringe on the antialiased pixels.
   */
  .v-color-input-chip {
    inline-size: var(--vectis-icon-size);
    block-size: var(--vectis-icon-size);
    border: 1px solid var(--vectis-color-border-on-fill);
    border-radius: var(--vectis-radius-interactive);
    background:
      linear-gradient(var(--color-input-chip, transparent), var(--color-input-chip, transparent))
        border-box,
      repeating-conic-gradient(var(--vectis-color-border) 0 25%, var(--vectis-color-surface) 0 50%)
        0 0 / var(--vectis-control-size-color-picker-checker)
        var(--vectis-control-size-color-picker-checker) padding-box;
    forced-color-adjust: none;
  }

  .v-color-input[data-disabled] .v-color-input-chip {
    opacity: 0.5;
  }

  /*
   * `position-anchor` and the chrome come from VPopover; the panel's own padding is cancelled,
   * VColorPicker padding itself as the date and time pickers do.
   */
  .v-popover-panel.v-color-input-panel {
    inline-size: max-content;
    padding: 0;
  }
}
</style>
