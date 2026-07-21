<script setup lang="ts">
import { computed } from 'vue'

/**
 * <input type="range"> natif (clavier, ARIA slider, formulaires gratuits).
 * La version range superpose DEUX inputs natifs — il n'existe pas de
 * primitive double curseur ; le JS se limite à empêcher le croisement des
 * valeurs. La piste de remplissage est dessinée via custom properties (%),
 * seule liaison de style inline autorisée.
 */
interface SliderProps {
  min?: number
  max?: number
  step?: number
  /** Deux curseurs — le v-model devient [début, fin]. */
  range?: boolean
  disabled?: boolean
  /** Libellé accessible (suffixé « début »/« fin » en mode range). */
  label?: string
}

const props = withDefaults(defineProps<SliderProps>(), {
  min: 0,
  max: 100,
  step: 1,
  range: false,
  disabled: false,
  label: undefined,
})

const model = defineModel<number | [number, number]>({ default: 0 })

const startValue = computed(() => (Array.isArray(model.value) ? model.value[0] : props.min))
const endValue = computed(() =>
  Array.isArray(model.value) ? model.value[1] : (model.value as number),
)

const pct = (v: number) => ((v - props.min) / (props.max - props.min || 1)) * 100

function onStartInput(event: Event) {
  const el = event.target as HTMLInputElement
  const clamped = Math.min(Number(el.value), endValue.value)
  el.value = String(clamped)
  model.value = [clamped, endValue.value]
}

function onEndInput(event: Event) {
  const el = event.target as HTMLInputElement
  if (!props.range) {
    model.value = Number(el.value)
    return
  }
  const clamped = Math.max(Number(el.value), startValue.value)
  el.value = String(clamped)
  model.value = [startValue.value, clamped]
}
</script>

<template>
  <div
    class="ds-slider"
    :data-range="range ? '' : undefined"
    :data-disabled="disabled ? '' : undefined"
    :style="{
      '--_start': pct(range ? startValue : min) + '%',
      '--_end': pct(endValue) + '%',
    }"
  >
    <span class="ds-slider-track" aria-hidden="true">
      <span class="ds-slider-fill" />
    </span>
    <input
      v-if="range"
      type="range"
      class="ds-slider-input"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
      :value="startValue"
      :aria-label="label ? `${label} (début)` : 'Début'"
      @input="onStartInput"
    />
    <input
      type="range"
      class="ds-slider-input"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
      :value="endValue"
      :aria-label="range ? (label ? `${label} (fin)` : 'Fin') : label"
      @input="onEndInput"
    />
  </div>
</template>

<style>
@layer ds.components {
  .ds-slider {
    --_thumb: var(--ds-space-5);
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
    height: var(--_thumb);
  }

  .ds-slider-track {
    position: absolute;
    inset-inline: 0;
    height: var(--ds-space-1);
    border-radius: var(--ds-radius-full);
    background: var(--ds-color-border);
    overflow: hidden;
  }

  .ds-slider-fill {
    position: absolute;
    inset-block: 0;
    inset-inline-start: var(--_start);
    width: calc(var(--_end) - var(--_start));
    background: var(--ds-color-accent);
  }

  /* Les inputs se superposent ; seuls leurs pouces captent le pointeur
     (indispensable en mode range pour que les deux restent utilisables). */
  .ds-slider-input {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    appearance: none;
    background: transparent;
    pointer-events: none;
  }

  .ds-slider-input::-webkit-slider-thumb {
    appearance: none;
    pointer-events: auto;
    width: var(--_thumb);
    height: var(--_thumb);
    border-radius: var(--ds-radius-full);
    background: var(--ds-color-surface);
    border: 2px solid var(--ds-color-accent);
    box-shadow: var(--ds-shadow-1);
    cursor: pointer;
  }

  .ds-slider-input::-moz-range-thumb {
    pointer-events: auto;
    width: var(--_thumb);
    height: var(--_thumb);
    border-radius: var(--ds-radius-full);
    background: var(--ds-color-surface);
    border: 2px solid var(--ds-color-accent);
    box-shadow: var(--ds-shadow-1);
    cursor: pointer;
  }

  .ds-slider-input:focus-visible {
    outline: none;
  }

  .ds-slider-input:focus-visible::-webkit-slider-thumb {
    outline: var(--ds-focus-ring-width) solid var(--ds-focus-ring-color);
    outline-offset: var(--ds-focus-ring-offset);
  }

  .ds-slider-input:focus-visible::-moz-range-thumb {
    outline: var(--ds-focus-ring-width) solid var(--ds-focus-ring-color);
    outline-offset: var(--ds-focus-ring-offset);
  }

  .ds-slider[data-disabled] {
    opacity: 0.5;
  }

  .ds-slider[data-disabled] .ds-slider-input::-webkit-slider-thumb {
    cursor: not-allowed;
  }

  .ds-slider[data-disabled] .ds-slider-input::-moz-range-thumb {
    cursor: not-allowed;
  }
}
</style>
