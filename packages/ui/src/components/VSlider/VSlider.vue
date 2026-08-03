<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Icon from '../Icon/Icon.vue'
import { iconProps } from '../Icon/iconProps'
import type { IconSource } from '../Icon/types'
import Input from '../Input/Input.vue'

import { isDev } from '../../utils/env'
import { useMessages } from '../../i18n/state'

/**
 * <input type="range"> natif (clavier, ARIA slider, formulaires gratuits). Le
 * JS se limite à empêcher le croisement des valeurs en mode range (deux inputs
 * superposés — il n'existe pas de primitive double curseur), au pont des champs
 * numériques (le natif ne valide pas une saisie libre) et à des dérivations
 * pures pour ticks/labels/tooltips.
 *
 * Les custom properties inline (fractions unitless) sont la seule liaison de
 * style : elles alignent fill/ticks/labels/tooltips sur le CENTRE réel du
 * thumb, qui parcourt [thumb/2, 100% − thumb/2] et non [0, 100%].
 * Vertical : support natif du range vertical Chrome/Edge 129+, Safari 18.1+.
 */
export type SliderLabel = string | { icon: IconSource; label: string }

interface SliderProps {
  min?: number
  max?: number
  step?: number
  /** Deux curseurs — le v-model devient [début, fin]. */
  range?: boolean
  disabled?: boolean
  /** Libellé accessible (suffixé « début »/« fin » en mode range). */
  label?: string
  /** Verticale : min en bas, max en haut. */
  orientation?: 'horizontal' | 'vertical'
  /** Champs numériques d'ajustement précis (un en simple, un par borne en range). */
  inputs?: boolean
  /** Points sur la piste à chaque pas (implicite si `labels` ; non rendu au-delà de 50 pas). */
  ticks?: boolean
  /** Un libellé par pas ; string = texte, objet = icône Material + libellé accessible. */
  labels?: SliderLabel[]
  /** Bulle de valeur suivant le thumb pendant le drag / au focus clavier. */
  tooltip?: boolean
}

const props = withDefaults(defineProps<SliderProps>(), {
  min: 0,
  max: 100,
  step: 1,
  range: false,
  disabled: false,
  label: undefined,
  orientation: 'horizontal',
  inputs: false,
  ticks: false,
  labels: undefined,
  tooltip: false,
})

const model = defineModel<number | [number, number]>({ default: 0 })

const startValue = computed(() => (Array.isArray(model.value) ? model.value[0] : props.min))
const endValue = computed(() =>
  Array.isArray(model.value) ? model.value[1] : (model.value as number),
)

/** Fraction [0, 1] de la course pour une valeur (le `|| 1` évite min === max). */
const frac = (v: number) => Math.min(1, Math.max(0, (v - props.min) / (props.max - props.min || 1)))

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

// --- Ticks & labels : dérivation pure des positions de pas -----------------

/** Nombre de pas entiers réellement atteignables (le natif s'arrête au dernier pas ≤ max). */
const stepCount = computed(() => Math.floor((props.max - props.min) / props.step + 1e-9))

const showTicks = computed(
  () =>
    (props.ticks || props.labels !== undefined) && stepCount.value >= 1 && stepCount.value <= 50,
)

const tickItems = computed(() => {
  if (!showTicks.value) return []
  return Array.from({ length: stepCount.value + 1 }, (_, i) => {
    const value = props.min + i * props.step
    const filled = props.range
      ? value >= startValue.value && value <= endValue.value
      : value <= endValue.value
    return { f: frac(value), filled }
  })
})

const labelFraction = (index: number) => frac(props.min + index * props.step)

/** Libellé textuel du pas correspondant à une valeur (repli : la valeur brute). */
function labelTextAt(value: number): string {
  const item = props.labels?.[Math.round((value - props.min) / props.step)]
  if (item === undefined) return String(value)
  return typeof item === 'string' ? item : item.label
}

/* Noms accessibles des poignées. Aucune prop dédiée : le dictionnaire est le
   seul point de surcharge. Chaque libellé était écrit DEUX fois (champ
   numérique et input range) — le computed supprime la duplication.

   Hors mode range, l'extrémité haute EST la valeur : elle garde le `label`
   du consommateur, et reste sans nom accessible s'il n'en a pas fourni (le
   repli « Valeur » ne vaut que pour le champ numérique, qui a besoin d'un
   nom propre). */
const m = useMessages()
const startLabel = computed(() =>
  props.label ? m.value.slider.rangeStart(props.label) : m.value.slider.start,
)
const endLabel = computed(() =>
  props.label ? m.value.slider.rangeEnd(props.label) : m.value.slider.end,
)
const rangeEndLabel = computed(() => (props.range ? endLabel.value : props.label))
const fieldEndLabel = computed(() =>
  props.range ? endLabel.value : (props.label ?? m.value.slider.value),
)

const startValueText = computed(() => (props.labels ? labelTextAt(startValue.value) : undefined))
const endValueText = computed(() => (props.labels ? labelTextAt(endValue.value) : undefined))

if (isDev) {
  if ((props.ticks || props.labels) && stepCount.value > 50)
    console.warn(`[Slider] ${stepCount.value} pas — ticks/labels non rendus au-delà de 50.`)
  if (props.labels && props.labels.length !== stepCount.value + 1)
    console.warn(
      `[Slider] ${props.labels.length} labels pour ${stepCount.value + 1} pas — un libellé par pas attendu.`,
    )
}

// --- Champs numériques : pont v-model string ↔ number ----------------------

// `string | number` : les champs sont des `<input type="number">`, dont Vue
// caste la valeur en nombre dès qu'elle est parsable — une saisie vide ou
// intermédiaire reste une chaîne. D'où le String() au commit.
const startFieldText = ref<string | number>(String(startValue.value))
const endFieldText = ref<string | number>(String(endValue.value))

// Le drag du slider resynchronise les champs en continu.
watch(startValue, (v) => (startFieldText.value = String(v)))
watch(endValue, (v) => (endFieldText.value = String(v)))

/**
 * Commit au `change` uniquement (blur/Enter) — jamais à la frappe, sinon on
 * clamperait « 1 » pendant la saisie de « 15 ». Vide/NaN = revert silencieux.
 */
function commitField(which: 'start' | 'end') {
  const raw = which === 'start' ? startFieldText.value : endFieldText.value
  // parseFloat (et non Number) : sur une chaîne vide il rend NaN → revert,
  // là où Number('') vaudrait 0 et écraserait la valeur.
  const parsed = Number.parseFloat(String(raw))
  if (Number.isNaN(parsed)) {
    resyncFields()
    return
  }
  const clamped = Math.min(props.max, Math.max(props.min, parsed))
  // Snap au pas ; l'arrondi 1e10 neutralise le bruit flottant des pas décimaux.
  let value = props.min + Math.round((clamped - props.min) / props.step) * props.step
  value = Math.min(props.max, Math.round(value * 1e10) / 1e10)
  if (!props.range) {
    model.value = value
  } else if (which === 'start') {
    model.value = [Math.min(value, endValue.value), endValue.value]
  } else {
    model.value = [startValue.value, Math.max(value, startValue.value)]
  }
  // Resync explicite : un commit sans changement de modèle (ex. re-clamp sur
  // la même valeur) ne déclenche pas les watchers.
  resyncFields()
}

function resyncFields() {
  startFieldText.value = String(startValue.value)
  endFieldText.value = String(endValue.value)
}
</script>

<template>
  <div
    class="v-slider"
    :data-range="range ? '' : undefined"
    :data-disabled="disabled ? '' : undefined"
    :data-orientation="orientation === 'vertical' ? 'vertical' : undefined"
    :style="{
      '--start-fraction': String(frac(startValue)),
      '--end-fraction': String(frac(endValue)),
    }"
  >
    <Input
      v-if="inputs && range"
      v-model="startFieldText"
      class="v-slider-field v-slider-field-start"
      type="number"
      size="sm"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
      :aria-label="startLabel"
      @change="commitField('start')"
    />
    <div class="v-slider-rail">
      <span class="v-slider-control">
        <span class="v-slider-track" aria-hidden="true">
          <span class="v-slider-fill" />
          <span
            v-for="(tick, i) in tickItems"
            :key="i"
            class="v-slider-tick"
            :data-filled="tick.filled ? '' : undefined"
            :style="{ '--fill-fraction': String(tick.f) }"
          />
        </span>
        <input
          v-if="range"
          type="range"
          class="v-slider-input v-slider-input-start"
          :min="min"
          :max="max"
          :step="step"
          :disabled="disabled"
          :value="startValue"
          :aria-label="startLabel"
          :aria-valuetext="startValueText"
          @input="onStartInput"
        />
        <input
          type="range"
          class="v-slider-input v-slider-input-end"
          :min="min"
          :max="max"
          :step="step"
          :disabled="disabled"
          :value="endValue"
          :aria-label="rangeEndLabel"
          :aria-valuetext="endValueText"
          @input="onEndInput"
        />
      </span>
      <span
        v-if="tooltip && range"
        class="v-slider-tooltip v-slider-tooltip-start"
        aria-hidden="true"
        :style="{ '--fill-fraction': String(frac(startValue)) }"
      >
        <span class="v-slider-tooltip-bubble">{{ startValueText ?? startValue }}</span>
      </span>
      <span
        v-if="tooltip"
        class="v-slider-tooltip v-slider-tooltip-end"
        aria-hidden="true"
        :style="{ '--fill-fraction': String(frac(endValue)) }"
      >
        <span class="v-slider-tooltip-bubble">{{ endValueText ?? endValue }}</span>
      </span>
    </div>
    <div v-if="labels" class="v-slider-labels">
      <span
        v-for="(item, i) in labels"
        :key="i"
        class="v-slider-label"
        :style="{ '--fill-fraction': String(labelFraction(i)) }"
      >
        <template v-if="typeof item === 'string'">{{ item }}</template>
        <Icon v-else v-bind="iconProps(item.icon)" :label="item.label" />
      </span>
    </div>
    <Input
      v-if="inputs"
      v-model="endFieldText"
      class="v-slider-field v-slider-field-end"
      type="number"
      size="sm"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
      :aria-label="fieldEndLabel"
      @change="commitField('end')"
    />
  </div>
</template>

<style>
@layer vectis.components {
  .v-slider {
    --slider-thumb: var(--vectis-control-size-slider-thumb);
    --slider-track: var(--vectis-control-size-slider-track);
    /* Position du centre du thumb pour une fraction f (course insetée de ½ thumb). */
    display: grid;
    grid-template-areas: 'rail';
    grid-template-columns: minmax(0, 1fr);
    align-items: center;
    column-gap: var(--vectis-space-2);
    row-gap: var(--vectis-space-1);
    width: 100%;
    font-family: var(--vectis-text-family);
  }

  .v-slider:has(.v-slider-labels) {
    grid-template-areas: 'rail' 'labels';
  }

  .v-slider:has(.v-slider-field-end) {
    grid-template-areas: 'rail field-end';
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .v-slider:has(.v-slider-field-end):has(.v-slider-labels) {
    grid-template-areas: 'rail field-end' 'labels .';
  }

  .v-slider:has(.v-slider-field-start) {
    grid-template-areas: 'field-start rail field-end';
    grid-template-columns: auto minmax(0, 1fr) auto;
  }

  .v-slider:has(.v-slider-field-start):has(.v-slider-labels) {
    grid-template-areas: 'field-start rail field-end' '. labels .';
  }

  .v-slider-rail {
    grid-area: rail;
    position: relative;
    block-size: var(--slider-thumb);
  }

  .v-slider-control {
    position: absolute;
    inset: 0;
  }

  .v-slider-track {
    position: absolute;
    inset-inline: 0;
    inset-block: 0;
    margin-block: auto;
    block-size: var(--slider-track);
    border-radius: var(--vectis-radius-full);
    background: var(--vectis-color-border);
    overflow: hidden;
  }

  .v-slider-fill {
    position: absolute;
    inset-block: 0;
    inset-inline-start: 0;
    inline-size: calc(var(--slider-thumb) / 2 + (100% - var(--slider-thumb)) * var(--end-fraction));
    background: var(--vectis-color-accent);
  }

  .v-slider[data-range] .v-slider-fill {
    inset-inline-start: calc(
      var(--slider-thumb) / 2 + (100% - var(--slider-thumb)) * var(--start-fraction)
    );
    inline-size: calc((100% - var(--slider-thumb)) * (var(--end-fraction) - var(--start-fraction)));
  }

  .v-slider-tick {
    --slider-tick: calc(var(--slider-track) / 3 * 2);
    position: absolute;
    inset-block: 0;
    margin-block: auto;
    inset-inline-start: calc(
      var(--slider-thumb) / 2 + (100% - var(--slider-thumb)) * var(--fill-fraction) -
        var(--slider-tick) / 2
    );
    inline-size: var(--slider-tick);
    block-size: var(--slider-tick);
    border-radius: var(--vectis-radius-full);
    background: var(--vectis-color-border-strong);
  }

  .v-slider-tick[data-filled] {
    background: var(--vectis-color-text-on-accent);
  }

  /* Les inputs se superposent ; seuls leurs pouces captent le pointeur
     (indispensable en mode range pour que les deux restent utilisables). */
  .v-slider-input {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    appearance: none;
    background: transparent;
    pointer-events: none;
  }

  /* En simple, tout l'input capte le pointeur : cliquer la piste déplace la
     valeur nativement (saut + drag immédiat), zéro JS. Effet assumé : le
     hover du thumb se déclenche au survol de toute la piste. */
  .v-slider:not([data-range]) .v-slider-input {
    pointer-events: auto;
    cursor: pointer;
  }

  .v-slider-input::-webkit-slider-thumb {
    appearance: none;
    pointer-events: auto;
    width: var(--slider-thumb);
    height: var(--slider-thumb);
    border-radius: var(--vectis-radius-full);
    background: var(--vectis-color-surface);
    border: var(--vectis-control-border-width) solid var(--vectis-color-accent);
    box-shadow: var(--vectis-shadow-1);
    cursor: pointer;
    transition: background-color var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  .v-slider-input::-moz-range-thumb {
    pointer-events: auto;
    width: var(--slider-thumb);
    height: var(--slider-thumb);
    border-radius: var(--vectis-radius-full);
    background: var(--vectis-color-surface);
    border: var(--vectis-control-border-width) solid var(--vectis-color-accent);
    box-shadow: var(--vectis-shadow-1);
    cursor: pointer;
    transition: background-color var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  /* Hover/drag : fond teinté du thumb. États posés sur l'input host — les
     pseudo-classes chaînées après le pseudo-thumb sont peu fiables. */
  .v-slider-input:hover:not(:disabled)::-webkit-slider-thumb,
  .v-slider-input:active:not(:disabled)::-webkit-slider-thumb {
    background: var(--vectis-color-accent-surface);
  }

  .v-slider-input:hover:not(:disabled)::-moz-range-thumb,
  .v-slider-input:active:not(:disabled)::-moz-range-thumb {
    background: var(--vectis-color-accent-surface);
  }

  .v-slider-input:focus-visible {
    outline: none;
  }

  .v-slider-input:focus-visible::-webkit-slider-thumb {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: var(--vectis-focus-ring-offset);
  }

  .v-slider-input:focus-visible::-moz-range-thumb {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: var(--vectis-focus-ring-offset);
  }

  /* --- Tooltip de valeur : apparence du Tooltip, mais position par fraction —
     le thumb natif est un pseudo-élément, non ancrable en anchor positioning. */
  .v-slider-tooltip {
    position: absolute;
    inset-block-end: calc(100% + var(--vectis-space-2));
    inset-inline-start: calc(
      var(--slider-thumb) / 2 + (100% - var(--slider-thumb)) * var(--fill-fraction)
    );
    inline-size: 0;
    display: flex;
    justify-content: center;
    opacity: 0;
    visibility: hidden;
    transition:
      opacity var(--vectis-duration-fast) var(--vectis-ease-default),
      visibility var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  .v-slider:has(.v-slider-input-start:active) .v-slider-tooltip-start,
  .v-slider:has(.v-slider-input-start:focus-visible) .v-slider-tooltip-start,
  .v-slider:has(.v-slider-input-end:active) .v-slider-tooltip-end,
  .v-slider:has(.v-slider-input-end:focus-visible) .v-slider-tooltip-end {
    opacity: 1;
    visibility: visible;
  }

  .v-slider-tooltip-bubble {
    padding: var(--vectis-space-1) var(--vectis-space-2);
    background: var(--vectis-color-surface-inverse);
    color: var(--vectis-color-text-on-inverse);
    font-size: var(--vectis-text-caption-size);
    line-height: var(--vectis-text-caption-leading);
    border-radius: var(--vectis-radius-sm);
    box-shadow: var(--vectis-shadow-2);
    white-space: nowrap;
  }

  /* --- Labels de pas ------------------------------------------------------ */
  .v-slider-labels {
    grid-area: labels;
    position: relative;
    /* Enfants absolus : réserve la hauteur (couvre texte xs ET icônes md). */
    min-block-size: var(--vectis-icon-size-md);
    --vectis-icon-size: var(--vectis-icon-size-md);
    font-size: var(--vectis-text-caption-size);
    color: var(--vectis-color-text-muted);
  }

  /* Boîte de largeur nulle : le contenu déborde symétriquement, donc centré
     sur le pas — sans transform (physique, casserait en vertical/RTL). */
  .v-slider-label {
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: calc(
      var(--slider-thumb) / 2 + (100% - var(--slider-thumb)) * var(--fill-fraction)
    );
    inline-size: 0;
    display: flex;
    justify-content: center;
    white-space: nowrap;
  }

  /* --- Champs numériques -------------------------------------------------- */
  .v-slider-field.v-input {
    inline-size: var(--vectis-control-size-slider-field);
  }

  .v-slider-field-start {
    grid-area: field-start;
  }

  .v-slider-field-end {
    grid-area: field-end;
  }

  /* --- Vertical : min en bas, max en haut --------------------------------- */
  .v-slider[data-orientation='vertical'] {
    grid-template-areas: 'rail';
    grid-template-columns: none;
    inline-size: fit-content;
    justify-items: center;
  }

  .v-slider[data-orientation='vertical']:has(.v-slider-labels) {
    grid-template-areas: 'rail labels';
    grid-template-columns: auto auto;
  }

  .v-slider[data-orientation='vertical']:has(.v-slider-field-end) {
    grid-template-areas: 'field-end' 'rail';
    grid-template-columns: none;
  }

  .v-slider[data-orientation='vertical']:has(.v-slider-field-end):has(.v-slider-labels) {
    grid-template-areas: 'field-end .' 'rail labels';
    grid-template-columns: auto auto;
  }

  .v-slider[data-orientation='vertical']:has(.v-slider-field-start) {
    grid-template-areas: 'field-end' 'rail' 'field-start';
    grid-template-columns: none;
  }

  .v-slider[data-orientation='vertical']:has(.v-slider-field-start):has(.v-slider-labels) {
    grid-template-areas: 'field-end .' 'rail labels' 'field-start .';
    grid-template-columns: auto auto;
  }

  .v-slider[data-orientation='vertical'] .v-slider-rail {
    inline-size: var(--slider-thumb);
    block-size: var(--vectis-control-size-slider-length);
  }

  /* Le sous-conteneur porte seul le mode d'écriture : la géométrie logique
     (inset-inline-*) de track/fill/ticks bascule sans dupliquer de règles ;
     tooltips et labels restent hors de ce contexte (texte horizontal). */
  .v-slider[data-orientation='vertical'] .v-slider-control {
    writing-mode: vertical-lr;
    direction: rtl;
  }

  .v-slider[data-orientation='vertical'] .v-slider-tooltip {
    inset-block-end: calc(
      var(--slider-thumb) / 2 + (100% - var(--slider-thumb)) * var(--fill-fraction)
    );
    inset-inline-start: auto;
    inset-inline-end: calc(100% + var(--vectis-space-2));
    inline-size: auto;
    block-size: 0;
    align-items: center;
    justify-content: flex-end;
  }

  .v-slider[data-orientation='vertical'] .v-slider-labels {
    align-self: stretch;
    min-block-size: auto;
  }

  .v-slider[data-orientation='vertical'] .v-slider-label {
    inset-block-start: auto;
    inset-block-end: calc(
      var(--slider-thumb) / 2 + (100% - var(--slider-thumb)) * var(--fill-fraction)
    );
    inset-inline-start: 0;
    inline-size: auto;
    block-size: 0;
    align-items: center;
    justify-content: flex-start;
  }

  /* --- Disabled : nuances de gris (tokens Checkbox/Switch), pas d'opacité -- */
  .v-slider[data-disabled] {
    cursor: not-allowed;
  }

  .v-slider[data-disabled] .v-slider-track {
    background: var(--vectis-color-surface-muted);
  }

  .v-slider[data-disabled] .v-slider-fill {
    background: var(--vectis-color-text-subtle);
  }

  .v-slider[data-disabled] .v-slider-tick {
    background: var(--vectis-color-text-subtle);
  }

  /* Sur le fill gris, le tick repasse en clair (la « coche grise » de Checkbox). */
  .v-slider[data-disabled] .v-slider-tick[data-filled] {
    background: var(--vectis-color-surface-muted);
  }

  .v-slider[data-disabled] .v-slider-labels {
    color: var(--vectis-color-text-subtle);
  }

  .v-slider[data-disabled] .v-slider-input {
    cursor: not-allowed;
  }

  .v-slider[data-disabled] .v-slider-input::-webkit-slider-thumb {
    background: var(--vectis-color-surface-muted);
    border-color: var(--vectis-color-text-subtle);
    box-shadow: none;
    cursor: not-allowed;
  }

  .v-slider[data-disabled] .v-slider-input::-moz-range-thumb {
    background: var(--vectis-color-surface-muted);
    border-color: var(--vectis-color-text-subtle);
    box-shadow: none;
    cursor: not-allowed;
  }

  @media (prefers-reduced-motion: reduce) {
    .v-slider-input::-webkit-slider-thumb {
      transition: none;
    }

    .v-slider-input::-moz-range-thumb {
      transition: none;
    }

    .v-slider-tooltip {
      transition: none;
    }
  }
}
</style>
