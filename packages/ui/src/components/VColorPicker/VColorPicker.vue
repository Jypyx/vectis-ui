<script setup lang="ts">
// @a11y @keyboard @core
/**
 * A colour picker built from native ranges: the hue and alpha tracks are `<input type="range">`,
 * and the saturation-brightness area holds two hidden ones, one per axis, which assistive
 * technology adjusts on its own. JavaScript adds the pointer on the area and its two-axis arrow
 * keys, which no native control offers.
 */
import { computed, onMounted, ref, useId, watch } from 'vue'

import VIconButton from '../VIconButton/VIconButton.vue'
import VInput from '../VInput/VInput.vue'
import { colorize as colorizeIcon } from '../VIcon/icons/colorize'
import { useAriaLabel } from '../../composables/useAriaLabel'
import { useLocale, useMessages } from '../../i18n/state'
import { clamp } from '../../utils/number'
import { COLOR_FORMATS, formatColor, hsvToRgb, parseColor, rgbToHsv, sameColor } from './color'
import type { ColorFormat, Hsva, Rgba } from './color'

export type { ColorFormat } from './color'

/** A preset colour: the colour alone, or the colour and the words that name it. */
export type ColorSwatch = string | { color: string; label: string }

interface ColorPickerProps {
  /**
   * How the value is written: `#rrggbb`, `rgb()`, `hsl()` or `oklch()`. The text field accepts
   * all four whatever this says.
   */
  format?: ColorFormat
  /** Offers an opacity track, and writes the alpha into the value when it is below 1. */
  alpha?: boolean
  /** Preset colours, offered as a row of swatches under the picker. */
  swatches?: ColorSwatch[]
  /**
   * Hides the text field and its format menu. VColorInput does, its own field playing that
   * part.
   */
  hideInput?: boolean
  /**
   * Hides the eyedropper button, shown otherwise wherever the browser offers the `EyeDropper`
   * API.
   */
  hideEyeDropper?: boolean
  /** Makes the picker unusable. */
  disabled?: boolean
  /** What the picker is called. It falls back to the design system dictionary. */
  label?: string
  /** The name the value is sent under in a form. */
  name?: string
}

const props = withDefaults(defineProps<ColorPickerProps>(), {
  format: 'hex',
  alpha: false,
  swatches: undefined,
  hideInput: false,
  hideEyeDropper: false,
  disabled: false,
  label: undefined,
  name: undefined,
})

/** The colour, written in `format`, or `null` when none has been chosen. */
const model = defineModel<string | null>({ default: null })

const m = useMessages()
const locale = useLocale()
const ariaLabel = useAriaLabel(() => props.label ?? m.value.colorPicker.label)

/** What the picker shows. With no colour yet, it rests on black, which writes nothing. */
const hsva = ref<Hsva>({ h: 0, s: 0, v: 0, a: 1 })
const rgba = computed(() => hsvToRgb(hsva.value))

// @core
// The value last written, so that its echo through the model is not parsed back: hex rounds the
// channels, and a grey has no hue, so reading it back would move the thumbs under the pointer.
let written: string | null = null

watch(
  model,
  (value) => {
    if (value === written) return
    const parsed = parseColor(value)
    if (parsed) hsva.value = rgbToHsv(props.alpha ? parsed : { ...parsed, a: 1 }, hsva.value.h)
  },
  { immediate: true },
)

function write(next: Hsva) {
  hsva.value = next
  written = formatColor(hsvToRgb(next), props.format, props.alpha)
  model.value = written
}

function writeRgba(next: Rgba) {
  write(rgbToHsv(props.alpha ? next : { ...next, a: 1 }, hsva.value.h))
}

const percent = computed(() => new Intl.NumberFormat(locale.value, { style: 'percent' }))
const degrees = computed(
  () =>
    new Intl.NumberFormat(locale.value, { style: 'unit', unit: 'degree', unitDisplay: 'narrow' }),
)

/** Both axes in words: read on either of the area's inputs, whichever one has the focus. */
const areaValueText = computed(() =>
  m.value.colorPicker.areaValue(
    percent.value.format(Math.round(hsva.value.s * 100) / 100),
    percent.value.format(Math.round(hsva.value.v * 100) / 100),
  ),
)

const areaEl = ref<HTMLElement | null>(null)
const saturationEl = ref<HTMLInputElement | null>(null)

function moveTo(event: PointerEvent) {
  const rect = areaEl.value!.getBoundingClientRect()
  write({
    ...hsva.value,
    s: clamp((event.clientX - rect.left) / rect.width, 0, 1),
    v: clamp(1 - (event.clientY - rect.top) / rect.height, 0, 1),
  })
}

/** The pointer dragging the area's thumb, if one is. */
let dragging: number | null = null

function onAreaPointerdown(event: PointerEvent) {
  if (props.disabled || event.button !== 0) return
  // The focus is moved by hand, without the scroll a default focus on mousedown could cause.
  event.preventDefault()
  dragging = event.pointerId
  // @fallback
  // Capture keeps the drag going outside the area; synthetic events may not reference a
  // capturable pointer.
  try {
    areaEl.value!.setPointerCapture(event.pointerId)
  } catch {
    /* Synthetic pointers cannot be captured. */
  }
  saturationEl.value?.focus({ preventScroll: true })
  moveTo(event)
}

function onAreaPointermove(event: PointerEvent) {
  if (event.pointerId === dragging) moveTo(event)
}

function onAreaPointerup(event: PointerEvent) {
  if (event.pointerId === dragging) dragging = null
}

// @keyboard
/**
 * Both inputs of the area answer the same keys: the horizontal arrows and Home/End move the
 * saturation, the vertical arrows and PageUp/PageDown the brightness. Natively each input would
 * move its own axis on every arrow.
 */
function onAreaKeydown(event: KeyboardEvent) {
  const step = event.shiftKey ? 10 : 1
  const moves: Record<string, [axis: 's' | 'v', delta: number]> = {
    ArrowLeft: ['s', -step],
    ArrowRight: ['s', step],
    ArrowDown: ['v', -step],
    ArrowUp: ['v', step],
    PageDown: ['v', -10],
    PageUp: ['v', 10],
    Home: ['s', -100],
    End: ['s', 100],
  }
  const move = moves[event.key]
  if (!move) return
  event.preventDefault()
  const [axis, delta] = move
  write({ ...hsva.value, [axis]: clamp((Math.round(hsva.value[axis] * 100) + delta) / 100, 0, 1) })
}

/** What a native range reports on its own: a drag on a track, or assistive technology. */
function onRangeInput(channel: keyof Hsva, scale: number, event: Event) {
  write({ ...hsva.value, [channel]: Number((event.target as HTMLInputElement).value) / scale })
}

const shownFormat = ref<ColorFormat>(props.format)
watch(
  () => props.format,
  (format) => (shownFormat.value = format),
)

/** The text field's own copy, rewritten whenever the colour changes from elsewhere. */
const fieldText = ref('')
watch(
  [rgba, shownFormat, () => props.alpha, () => model.value === null],
  () => {
    fieldText.value =
      model.value === null ? '' : formatColor(rgba.value, shownFormat.value, props.alpha)
  },
  { immediate: true },
)

/** Takes what was typed, in any of the four formats, or puts the field back as it was. */
function commitField() {
  const text = fieldText.value.trim()
  if (!text) {
    written = null
    model.value = null
    return
  }
  const parsed = parseColor(text)
  if (parsed) writeRgba(parsed)
  else fieldText.value = formatColor(rgba.value, shownFormat.value, props.alpha)
}

function onFieldKeydown(event: KeyboardEvent) {
  if (event.key !== 'Enter') return
  event.preventDefault()
  commitField()
}

const items = computed(() =>
  (props.swatches ?? []).map((swatch) => {
    const color = typeof swatch === 'string' ? swatch : swatch.color
    return {
      color,
      label: typeof swatch === 'string' ? swatch : swatch.label,
      rgba: parseColor(color),
    }
  }),
)

// @core
// The swatches are native radios, so the arrow keys move between them. Their name only groups
// them: they are tied to a form that does not exist so that no enclosing form sends them, the
// picker's value going through its own hidden input.
const swatchGroup = useId()

interface EyeDropperResult {
  sRGBHex: string
}

/** The EyeDropper API, which TypeScript's DOM library does not describe yet. */
type EyeDropperConstructor = new () => { open: () => Promise<EyeDropperResult> }

// @fallback
// Detected once mounted, never on the server: the button simply does not exist elsewhere.
const eyeDropper = ref<EyeDropperConstructor | null>(null)
onMounted(() => {
  eyeDropper.value =
    (window as unknown as { EyeDropper?: EyeDropperConstructor }).EyeDropper ?? null
})

async function pickFromScreen() {
  if (!eyeDropper.value) return
  try {
    const { sRGBHex } = await new eyeDropper.value().open()
    const picked = parseColor(sRGBHex)
    // The screen has no transparency: the opacity already chosen is kept.
    if (picked) writeRgba({ ...picked, a: hsva.value.a })
  } catch {
    // Escape cancels the eyedropper by rejecting the promise: nothing to report.
  }
}

const opaque = computed(() => formatColor({ ...rgba.value, a: 1 }, 'rgb'))

const rootStyle = computed(() => ({
  '--color-picker-hue': String(hsva.value.h),
  '--color-picker-opaque': opaque.value,
  '--color-picker-color': formatColor(rgba.value, 'rgb', props.alpha),
  '--color-picker-s': String(hsva.value.s),
  '--color-picker-v': String(hsva.value.v),
}))

const rootEl = ref<HTMLElement | null>(null)

defineExpose({
  /** Moves the focus to the saturation-brightness area. */
  focus: (options?: FocusOptions) => saturationEl.value?.focus(options),
  /** The root element. */
  el: rootEl,
})
</script>

<template>
  <div
    ref="rootEl"
    class="v-color-picker"
    role="group"
    :aria-label="ariaLabel"
    :data-disabled="disabled ? '' : undefined"
    :style="rootStyle"
  >
    <div
      ref="areaEl"
      class="v-color-picker-area"
      @pointerdown="onAreaPointerdown"
      @pointermove="onAreaPointermove"
      @pointerup="onAreaPointerup"
      @pointercancel="onAreaPointerup"
    >
      <input
        ref="saturationEl"
        type="range"
        class="v-hidden-input"
        min="0"
        max="100"
        :value="Math.round(hsva.s * 100)"
        :aria-label="m.colorPicker.saturation"
        :aria-valuetext="areaValueText"
        :disabled="disabled"
        @input="onRangeInput('s', 100, $event)"
        @keydown="onAreaKeydown"
      />
      <!-- Out of the tab order: one stop for the area, whose arrows move both axes. -->
      <input
        type="range"
        class="v-hidden-input"
        tabindex="-1"
        min="0"
        max="100"
        :value="Math.round(hsva.v * 100)"
        :aria-label="m.colorPicker.brightness"
        :aria-valuetext="areaValueText"
        :disabled="disabled"
        @input="onRangeInput('v', 100, $event)"
        @keydown="onAreaKeydown"
      />
      <span class="v-color-picker-thumb" aria-hidden="true" />
    </div>

    <div class="v-color-picker-controls">
      <VIconButton
        v-if="eyeDropper && !hideEyeDropper"
        class="v-color-picker-eye-dropper"
        :icon="colorizeIcon"
        :label="m.colorPicker.eyeDropper"
        size="sm"
        :disabled="disabled"
        @click="pickFromScreen"
      />
      <span class="v-color-picker-preview" aria-hidden="true" />
      <div class="v-color-picker-tracks">
        <input
          type="range"
          class="v-color-picker-track v-color-picker-hue"
          min="0"
          max="360"
          :value="Math.round(hsva.h)"
          :aria-label="m.colorPicker.hue"
          :aria-valuetext="degrees.format(Math.round(hsva.h))"
          :disabled="disabled"
          @input="onRangeInput('h', 1, $event)"
        />
        <input
          v-if="alpha"
          type="range"
          class="v-color-picker-track v-color-picker-alpha"
          min="0"
          max="100"
          :value="Math.round(hsva.a * 100)"
          :aria-label="m.colorPicker.alpha"
          :aria-valuetext="percent.format(Math.round(hsva.a * 100) / 100)"
          :disabled="disabled"
          @input="onRangeInput('a', 100, $event)"
        />
      </div>
    </div>

    <div v-if="!hideInput" class="v-color-picker-fields">
      <select
        v-model="shownFormat"
        class="v-color-picker-format"
        :aria-label="m.colorPicker.format"
        :disabled="disabled"
      >
        <option v-for="option in COLOR_FORMATS" :key="option" :value="option">
          {{ option.toUpperCase() }}
        </option>
      </select>
      <VInput
        v-model="fieldText"
        class="v-color-picker-value"
        size="sm"
        :aria-label="m.colorPicker.value"
        autocomplete="off"
        spellcheck="false"
        :disabled="disabled"
        @change="commitField"
        @keydown="onFieldKeydown"
      />
    </div>

    <fieldset
      v-if="items.length"
      class="v-color-picker-swatches"
      :aria-label="m.colorPicker.swatches"
      :disabled="disabled"
    >
      <label
        v-for="item in items"
        :key="item.color"
        class="v-color-picker-swatch"
        :style="{ '--color-picker-swatch': item.color }"
      >
        <input
          type="radio"
          class="v-hidden-input"
          :name="swatchGroup"
          :form="`${swatchGroup}-none`"
          :value="item.color"
          :checked="model !== null && sameColor(item.rgba, rgba, alpha)"
          @change="item.rgba && writeRgba(item.rgba)"
        />
        <span class="v-color-picker-chip" />
        <span class="v-visually-hidden">{{ item.label }}</span>
      </label>
    </fieldset>

    <input v-if="name && model" type="hidden" :name="name" :value="model" />
  </div>
</template>

<style>
@layer vectis.components {
  .v-color-picker {
    /*
     * The checkerboard that shows through a translucent colour. It is drawn in the theme's own
     * surface and border colours, so it reads as "transparent" in both themes.
     */
    --color-picker-checker: repeating-conic-gradient(
        var(--vectis-color-border) 0 25%,
        var(--vectis-color-surface) 0 50%
      )
      0 0 / var(--vectis-control-size-color-picker-checker)
      var(--vectis-control-size-color-picker-checker);
    --color-picker-thumb: var(--vectis-control-size-color-picker-thumb);

    display: inline-flex;
    flex-direction: column;
    gap: var(--vectis-space-3);
    inline-size: var(--vectis-control-size-color-picker-width);
    max-inline-size: 100%;
    padding: var(--vectis-space-3);
    color: var(--vectis-color-text);
    font-family: var(--vectis-text-family);
  }

  /*
   * The colour content (area, tracks, preview, swatches) is the value itself, not the theme's
   * paint: it is never mirrored in right-to-left text, and forced colours leave it untouched.
   * Its gradients run between literal black and white, the ends of the colour model.
   */
  .v-color-picker-area,
  .v-color-picker-track,
  .v-color-picker-preview,
  .v-color-picker-chip {
    direction: ltr;
    forced-color-adjust: none;
  }

  .v-color-picker-area {
    position: relative;
    block-size: var(--vectis-control-size-color-picker-area);
    border-radius: var(--vectis-radius-interactive);
    background:
      linear-gradient(to top, black, transparent), linear-gradient(to right, white, transparent),
      hsl(var(--color-picker-hue) 100% 50%);
    cursor: crosshair;
    touch-action: none;
  }

  /*
   * Every thumb carries a light ring and a dark one, whatever the theme: it sits on colours of
   * any lightness, against which a single themed ring would vanish.
   */
  .v-color-picker-thumb {
    position: absolute;
    inset-inline-start: calc(var(--color-picker-s) * 100%);
    inset-block-start: calc((1 - var(--color-picker-v)) * 100%);
    inline-size: var(--color-picker-thumb);
    block-size: var(--color-picker-thumb);
    border: 2px solid white;
    border-radius: var(--vectis-radius-pill);
    background: var(--color-picker-opaque);
    box-shadow:
      0 0 0 1px rgb(0 0 0 / 0.4),
      inset 0 0 0 1px rgb(0 0 0 / 0.4);
    translate: -50% -50%;
    pointer-events: none;
  }

  .v-color-picker-area:has(.v-hidden-input:focus-visible) .v-color-picker-thumb {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: var(--vectis-focus-ring-offset);
  }

  .v-color-picker-controls {
    display: flex;
    align-items: center;
    gap: var(--vectis-space-2);
  }

  .v-color-picker-preview {
    flex: none;
    inline-size: var(--vectis-control-size-color-picker-preview);
    block-size: var(--vectis-control-size-color-picker-preview);
    border-radius: var(--vectis-radius-pill);
    background:
      linear-gradient(var(--color-picker-color), var(--color-picker-color)),
      var(--color-picker-checker);
    box-shadow: inset 0 0 0 1px var(--vectis-color-border);
  }

  .v-color-picker-tracks {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: var(--vectis-space-3);
    min-inline-size: 0;
  }

  .v-color-picker-track {
    display: block;
    inline-size: 100%;
    block-size: var(--vectis-control-size-color-picker-track);
    margin: 0;
    border-radius: var(--vectis-radius-pill);
    appearance: none;
    cursor: pointer;
  }

  .v-color-picker-hue {
    --color-picker-track-thumb: hsl(var(--color-picker-hue) 100% 50%);
    background: linear-gradient(
      to right,
      hsl(0 100% 50%),
      hsl(60 100% 50%),
      hsl(120 100% 50%),
      hsl(180 100% 50%),
      hsl(240 100% 50%),
      hsl(300 100% 50%),
      hsl(360 100% 50%)
    );
  }

  .v-color-picker-alpha {
    --color-picker-track-thumb: var(--color-picker-color);
    background:
      linear-gradient(to right, transparent, var(--color-picker-opaque)),
      var(--color-picker-checker);
  }

  /*
   * The two vendor pseudo-elements stay in two separate rules: a selector list holding one a
   * browser does not know is dropped whole.
   */
  .v-color-picker-track::-webkit-slider-thumb {
    appearance: none;
    inline-size: var(--color-picker-thumb);
    block-size: var(--color-picker-thumb);
    border: 2px solid white;
    border-radius: var(--vectis-radius-pill);
    background:
      linear-gradient(var(--color-picker-track-thumb), var(--color-picker-track-thumb)),
      var(--color-picker-checker);
    box-shadow:
      0 0 0 1px rgb(0 0 0 / 0.4),
      inset 0 0 0 1px rgb(0 0 0 / 0.4);
  }

  .v-color-picker-track::-moz-range-thumb {
    box-sizing: border-box;
    inline-size: var(--color-picker-thumb);
    block-size: var(--color-picker-thumb);
    border: 2px solid white;
    border-radius: var(--vectis-radius-pill);
    background:
      linear-gradient(var(--color-picker-track-thumb), var(--color-picker-track-thumb)),
      var(--color-picker-checker);
    box-shadow:
      0 0 0 1px rgb(0 0 0 / 0.4),
      inset 0 0 0 1px rgb(0 0 0 / 0.4);
  }

  .v-color-picker-track:focus-visible {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: var(--vectis-focus-ring-offset);
  }

  .v-color-picker-fields {
    display: flex;
    gap: var(--vectis-space-2);
  }

  .v-color-picker-format {
    flex: none;
    block-size: var(--vectis-control-height-sm);
    padding-inline: var(--vectis-space-2);
    border: 1px solid var(--vectis-color-border-strong);
    border-radius: var(--vectis-radius-interactive);
    background: var(--vectis-color-surface);
    color: var(--vectis-color-text);
    font-family: var(--vectis-text-family);
    font-size: var(--vectis-text-body-sm-size);
    font-weight: var(--vectis-text-body-sm-weight);
    line-height: var(--vectis-text-body-sm-leading);
    cursor: pointer;
  }

  .v-color-picker-format:focus-visible {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: var(--vectis-focus-ring-offset);
  }

  .v-color-picker-value {
    flex: 1;
    min-inline-size: 0;
  }

  /*
   * A colour is written left to right in every language: in right-to-left text the bidi
   * algorithm would move the `#` of `#f59e0b` to the end. The field keeps its right alignment.
   */
  .v-color-picker-value .v-input-control {
    direction: ltr;
    font-variant-numeric: tabular-nums;
  }

  .v-color-picker-value .v-input-control:dir(rtl) {
    text-align: right;
  }

  .v-color-picker-swatches {
    display: flex;
    flex-wrap: wrap;
    gap: var(--vectis-space-2);
    min-inline-size: 0;
    margin: 0;
    padding: 0;
    border: 0;
  }

  .v-color-picker-swatch {
    position: relative;
    display: inline-flex;
    cursor: pointer;
  }

  .v-color-picker-chip {
    inline-size: var(--vectis-control-size-color-picker-swatch);
    block-size: var(--vectis-control-size-color-picker-swatch);
    border-radius: var(--vectis-radius-interactive);
    background:
      linear-gradient(var(--color-picker-swatch), var(--color-picker-swatch)),
      var(--color-picker-checker);
    box-shadow: inset 0 0 0 1px var(--vectis-color-border);
  }

  /* An outline rather than a shadow marks the chosen swatch: forced colours keep outlines. */
  .v-color-picker-swatch .v-hidden-input:checked + .v-color-picker-chip {
    outline: 2px solid var(--vectis-color-text);
    outline-offset: 1px;
  }

  .v-color-picker-swatch .v-hidden-input:focus-visible + .v-color-picker-chip {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: var(--vectis-focus-ring-offset);
  }

  /* Colour content is media, which may fade; the text controls take the disabled tokens. */
  .v-color-picker[data-disabled]
    :is(
      .v-color-picker-area,
      .v-color-picker-preview,
      .v-color-picker-track,
      .v-color-picker-chip
    ) {
    opacity: 0.5;
  }

  .v-color-picker[data-disabled]
    :is(.v-color-picker-area, .v-color-picker-track, .v-color-picker-swatch) {
    cursor: not-allowed;
  }

  .v-color-picker-format:disabled {
    border-color: var(--vectis-color-border);
    background: var(--vectis-color-surface-muted);
    color: var(--vectis-color-text-subtle);
    cursor: not-allowed;
  }
}
</style>
