<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Icon from '../Icon/Icon.vue'
import Input from '../Input/Input.vue'

/**
 * <input type="range"> natif (clavier, ARIA slider, formulaires gratuits).
 * Le JS du composant se limite à :
 * - empêcher le croisement des valeurs en mode range (DEUX inputs natifs
 *   superposés — il n'existe pas de primitive double curseur) ;
 * - le pont des champs numériques (parse/clamp/snap au `change` : le natif
 *   ne valide pas une saisie libre) ;
 * - la dérivation pure de données pour ticks/labels/tooltips (fractions de
 *   pas) — aucun comportement navigateur réimplémenté.
 * Vertical : `writing-mode: vertical-lr` + `direction: rtl` sur le
 * sous-conteneur `.ds-slider-control` — support natif du range vertical :
 * Chrome/Edge 129+, Safari 18.1+ (léger relèvement du plancher Chrome 125
 * assumé, cf. CLAUDE.md).
 * Les custom properties inline (fractions unitless) sont la seule liaison de
 * style : elles alignent fill/ticks/labels/tooltips sur le CENTRE réel du
 * thumb, qui parcourt [thumb/2, 100% − thumb/2] et non [0, 100%].
 */
export type SliderLabel = string | { icon: string; label: string }

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

const startValueText = computed(() => (props.labels ? labelTextAt(startValue.value) : undefined))
const endValueText = computed(() => (props.labels ? labelTextAt(endValue.value) : undefined))

// import.meta.env est spécifique à Vite : typage local prudent, garde-fou
// inerte chez un consommateur non-Vite.
if ((import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV) {
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
    class="ds-slider"
    :data-range="range ? '' : undefined"
    :data-disabled="disabled ? '' : undefined"
    :data-orientation="orientation === 'vertical' ? 'vertical' : undefined"
    :style="{
      '--_start-f': String(frac(startValue)),
      '--_end-f': String(frac(endValue)),
    }"
  >
    <Input
      v-if="inputs && range"
      v-model="startFieldText"
      class="ds-slider-field ds-slider-field-start"
      type="number"
      size="sm"
      compact
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
      :aria-label="label ? `${label} (début)` : 'Début'"
      @change="commitField('start')"
    />
    <div class="ds-slider-rail">
      <span class="ds-slider-control">
        <span class="ds-slider-track" aria-hidden="true">
          <span class="ds-slider-fill" />
          <span
            v-for="(tick, i) in tickItems"
            :key="i"
            class="ds-slider-tick"
            :data-filled="tick.filled ? '' : undefined"
            :style="{ '--_f': String(tick.f) }"
          />
        </span>
        <input
          v-if="range"
          type="range"
          class="ds-slider-input ds-slider-input-start"
          :min="min"
          :max="max"
          :step="step"
          :disabled="disabled"
          :value="startValue"
          :aria-label="label ? `${label} (début)` : 'Début'"
          :aria-valuetext="startValueText"
          @input="onStartInput"
        />
        <input
          type="range"
          class="ds-slider-input ds-slider-input-end"
          :min="min"
          :max="max"
          :step="step"
          :disabled="disabled"
          :value="endValue"
          :aria-label="range ? (label ? `${label} (fin)` : 'Fin') : label"
          :aria-valuetext="endValueText"
          @input="onEndInput"
        />
      </span>
      <span
        v-if="tooltip && range"
        class="ds-slider-tooltip ds-slider-tooltip-start"
        aria-hidden="true"
        :style="{ '--_f': String(frac(startValue)) }"
      >
        <span class="ds-slider-tooltip-bubble">{{ startValueText ?? startValue }}</span>
      </span>
      <span
        v-if="tooltip"
        class="ds-slider-tooltip ds-slider-tooltip-end"
        aria-hidden="true"
        :style="{ '--_f': String(frac(endValue)) }"
      >
        <span class="ds-slider-tooltip-bubble">{{ endValueText ?? endValue }}</span>
      </span>
    </div>
    <div v-if="labels" class="ds-slider-labels">
      <span
        v-for="(item, i) in labels"
        :key="i"
        class="ds-slider-label"
        :style="{ '--_f': String(labelFraction(i)) }"
      >
        <template v-if="typeof item === 'string'">{{ item }}</template>
        <Icon v-else :name="item.icon" :label="item.label" />
      </span>
    </div>
    <Input
      v-if="inputs"
      v-model="endFieldText"
      class="ds-slider-field ds-slider-field-end"
      type="number"
      size="sm"
      compact
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
      :aria-label="range ? (label ? `${label} (fin)` : 'Fin') : (label ?? 'Valeur')"
      @change="commitField('end')"
    />
  </div>
</template>

<style>
@layer ds.components {
  .ds-slider {
    --_thumb: var(--ds-control-size-slider-thumb);
    --_track: var(--ds-control-size-slider-track);
    /* Position du centre du thumb pour une fraction f (course insetée de ½ thumb). */
    display: grid;
    grid-template-areas: 'rail';
    grid-template-columns: minmax(0, 1fr);
    align-items: center;
    column-gap: var(--ds-space-2);
    row-gap: var(--ds-space-1);
    width: 100%;
  }

  .ds-slider:has(.ds-slider-labels) {
    grid-template-areas: 'rail' 'labels';
  }

  .ds-slider:has(.ds-slider-field-end) {
    grid-template-areas: 'rail field-end';
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .ds-slider:has(.ds-slider-field-end):has(.ds-slider-labels) {
    grid-template-areas: 'rail field-end' 'labels .';
  }

  .ds-slider:has(.ds-slider-field-start) {
    grid-template-areas: 'field-start rail field-end';
    grid-template-columns: auto minmax(0, 1fr) auto;
  }

  .ds-slider:has(.ds-slider-field-start):has(.ds-slider-labels) {
    grid-template-areas: 'field-start rail field-end' '. labels .';
  }

  .ds-slider-rail {
    grid-area: rail;
    position: relative;
    block-size: var(--_thumb);
  }

  .ds-slider-control {
    position: absolute;
    inset: 0;
  }

  .ds-slider-track {
    position: absolute;
    inset-inline: 0;
    inset-block: 0;
    margin-block: auto;
    block-size: var(--_track);
    border-radius: var(--ds-radius-full);
    background: var(--ds-color-border);
    overflow: hidden;
  }

  /* En simple, le fill part du bord de la piste (rendu plein à l'origine). */
  .ds-slider-fill {
    position: absolute;
    inset-block: 0;
    inset-inline-start: 0;
    inline-size: calc(var(--_thumb) / 2 + (100% - var(--_thumb)) * var(--_end-f));
    background: var(--ds-color-accent);
  }

  /* En range, il relie les centres des deux thumbs. */
  .ds-slider[data-range] .ds-slider-fill {
    inset-inline-start: calc(var(--_thumb) / 2 + (100% - var(--_thumb)) * var(--_start-f));
    inline-size: calc((100% - var(--_thumb)) * (var(--_end-f) - var(--_start-f)));
  }

  .ds-slider-tick {
    --_tick: calc(var(--_track) / 3 * 2);
    position: absolute;
    inset-block: 0;
    margin-block: auto;
    inset-inline-start: calc(
      var(--_thumb) / 2 + (100% - var(--_thumb)) * var(--_f) - var(--_tick) / 2
    );
    inline-size: var(--_tick);
    block-size: var(--_tick);
    border-radius: var(--ds-radius-full);
    background: var(--ds-color-border-strong);
  }

  .ds-slider-tick[data-filled] {
    background: var(--ds-color-text-on-accent);
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

  /* En simple, tout l'input capte le pointeur : cliquer la piste déplace la
     valeur nativement (saut + drag immédiat), zéro JS. Effet assumé : le
     hover du thumb se déclenche au survol de toute la piste. */
  .ds-slider:not([data-range]) .ds-slider-input {
    pointer-events: auto;
    cursor: pointer;
  }

  .ds-slider-input::-webkit-slider-thumb {
    appearance: none;
    pointer-events: auto;
    width: var(--_thumb);
    height: var(--_thumb);
    border-radius: var(--ds-radius-full);
    background: var(--ds-color-surface);
    border: var(--ds-control-border-width) solid var(--ds-color-accent);
    box-shadow: var(--ds-shadow-1);
    cursor: pointer;
    transition: background-color var(--ds-duration-fast) var(--ds-ease-default);
  }

  .ds-slider-input::-moz-range-thumb {
    pointer-events: auto;
    width: var(--_thumb);
    height: var(--_thumb);
    border-radius: var(--ds-radius-full);
    background: var(--ds-color-surface);
    border: var(--ds-control-border-width) solid var(--ds-color-accent);
    box-shadow: var(--ds-shadow-1);
    cursor: pointer;
    transition: background-color var(--ds-duration-fast) var(--ds-ease-default);
  }

  /* Hover/drag : fond teinté du thumb. États posés sur l'input host — les
     pseudo-classes chaînées après le pseudo-thumb sont peu fiables. */
  .ds-slider-input:hover:not(:disabled)::-webkit-slider-thumb,
  .ds-slider-input:active:not(:disabled)::-webkit-slider-thumb {
    background: var(--ds-color-accent-surface);
  }

  .ds-slider-input:hover:not(:disabled)::-moz-range-thumb,
  .ds-slider-input:active:not(:disabled)::-moz-range-thumb {
    background: var(--ds-color-accent-surface);
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

  /* --- Tooltip de valeur (achecpparence du Tooltip, position par fraction : le
     thumb natif est un pseudo-élément non ancrable en anchor positioning). */
  .ds-slider-tooltip {
    position: absolute;
    inset-block-end: calc(100% + var(--ds-space-2));
    inset-inline-start: calc(var(--_thumb) / 2 + (100% - var(--_thumb)) * var(--_f));
    inline-size: 0;
    display: flex;
    justify-content: center;
    opacity: 0;
    visibility: hidden;
    transition:
      opacity var(--ds-duration-fast) var(--ds-ease-default),
      visibility var(--ds-duration-fast) var(--ds-ease-default);
  }

  .ds-slider:has(.ds-slider-input-start:active) .ds-slider-tooltip-start,
  .ds-slider:has(.ds-slider-input-start:focus-visible) .ds-slider-tooltip-start,
  .ds-slider:has(.ds-slider-input-end:active) .ds-slider-tooltip-end,
  .ds-slider:has(.ds-slider-input-end:focus-visible) .ds-slider-tooltip-end {
    opacity: 1;
    visibility: visible;
  }

  .ds-slider-tooltip-bubble {
    padding: var(--ds-space-1) var(--ds-space-2);
    background: var(--ds-color-surface-inverse);
    color: var(--ds-color-text-on-inverse);
    font-size: var(--ds-text-caption-size);
    line-height: var(--ds-text-caption-leading);
    border-radius: var(--ds-radius-sm);
    box-shadow: var(--ds-shadow-2);
    white-space: nowrap;
  }

  /* --- Labels de pas ------------------------------------------------------ */
  .ds-slider-labels {
    grid-area: labels;
    position: relative;
    /* Enfants absolus : réserve la hauteur (couvre texte xs ET icônes md). */
    min-block-size: var(--ds-icon-size-md);
    --ds-icon-size: var(--ds-icon-size-md);
    font-size: var(--ds-text-caption-size);
    color: var(--ds-color-text-muted);
  }

  /* Boîte de largeur nulle : le contenu déborde symétriquement, donc centré
     sur le pas — sans transform (physique, casserait en vertical/RTL). */
  .ds-slider-label {
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: calc(var(--_thumb) / 2 + (100% - var(--_thumb)) * var(--_f));
    inline-size: 0;
    display: flex;
    justify-content: center;
    white-space: nowrap;
  }

  /* --- Champs numériques -------------------------------------------------- */
  .ds-slider-field.ds-input {
    inline-size: var(--ds-control-size-slider-field);
  }

  .ds-slider-field-start {
    grid-area: field-start;
  }

  .ds-slider-field-end {
    grid-area: field-end;
  }

  /* --- Vertical : min en bas, max en haut --------------------------------- */
  .ds-slider[data-orientation='vertical'] {
    grid-template-areas: 'rail';
    grid-template-columns: none;
    inline-size: fit-content;
    justify-items: center;
  }

  .ds-slider[data-orientation='vertical']:has(.ds-slider-labels) {
    grid-template-areas: 'rail labels';
    grid-template-columns: auto auto;
  }

  .ds-slider[data-orientation='vertical']:has(.ds-slider-field-end) {
    grid-template-areas: 'field-end' 'rail';
    grid-template-columns: none;
  }

  .ds-slider[data-orientation='vertical']:has(.ds-slider-field-end):has(.ds-slider-labels) {
    grid-template-areas: 'field-end .' 'rail labels';
    grid-template-columns: auto auto;
  }

  .ds-slider[data-orientation='vertical']:has(.ds-slider-field-start) {
    grid-template-areas: 'field-end' 'rail' 'field-start';
    grid-template-columns: none;
  }

  .ds-slider[data-orientation='vertical']:has(.ds-slider-field-start):has(.ds-slider-labels) {
    grid-template-areas: 'field-end .' 'rail labels' 'field-start .';
    grid-template-columns: auto auto;
  }

  .ds-slider[data-orientation='vertical'] .ds-slider-rail {
    inline-size: var(--_thumb);
    block-size: var(--ds-control-size-slider-length);
  }

  /* Le sous-conteneur porte seul le mode d'écriture : la géométrie logique
     (inset-inline-*) de track/fill/ticks bascule sans dupliquer de règles ;
     tooltips et labels restent hors de ce contexte (texte horizontal). */
  .ds-slider[data-orientation='vertical'] .ds-slider-control {
    writing-mode: vertical-lr;
    direction: rtl;
  }

  .ds-slider[data-orientation='vertical'] .ds-slider-tooltip {
    inset-block-end: calc(var(--_thumb) / 2 + (100% - var(--_thumb)) * var(--_f));
    inset-inline-start: auto;
    inset-inline-end: calc(100% + var(--ds-space-2));
    inline-size: auto;
    block-size: 0;
    align-items: center;
    justify-content: flex-end;
  }

  .ds-slider[data-orientation='vertical'] .ds-slider-labels {
    align-self: stretch;
    min-block-size: auto;
  }

  .ds-slider[data-orientation='vertical'] .ds-slider-label {
    inset-block-start: auto;
    inset-block-end: calc(var(--_thumb) / 2 + (100% - var(--_thumb)) * var(--_f));
    inset-inline-start: 0;
    inline-size: auto;
    block-size: 0;
    align-items: center;
    justify-content: flex-start;
  }

  /* --- Disabled : nuances de gris (tokens Checkbox/Switch), pas d'opacité -- */
  .ds-slider[data-disabled] {
    cursor: not-allowed;
  }

  .ds-slider[data-disabled] .ds-slider-track {
    background: var(--ds-color-surface-muted);
  }

  .ds-slider[data-disabled] .ds-slider-fill {
    background: var(--ds-color-text-subtle);
  }

  .ds-slider[data-disabled] .ds-slider-tick {
    background: var(--ds-color-text-subtle);
  }

  /* Sur le fill gris, le tick repasse en clair (la « coche grise » de Checkbox). */
  .ds-slider[data-disabled] .ds-slider-tick[data-filled] {
    background: var(--ds-color-surface-muted);
  }

  .ds-slider[data-disabled] .ds-slider-labels {
    color: var(--ds-color-text-subtle);
  }

  .ds-slider[data-disabled] .ds-slider-input {
    cursor: not-allowed;
  }

  .ds-slider[data-disabled] .ds-slider-input::-webkit-slider-thumb {
    background: var(--ds-color-surface-muted);
    border-color: var(--ds-color-text-subtle);
    box-shadow: none;
    cursor: not-allowed;
  }

  .ds-slider[data-disabled] .ds-slider-input::-moz-range-thumb {
    background: var(--ds-color-surface-muted);
    border-color: var(--ds-color-text-subtle);
    box-shadow: none;
    cursor: not-allowed;
  }

  @media (prefers-reduced-motion: reduce) {
    .ds-slider-input::-webkit-slider-thumb {
      transition: none;
    }

    .ds-slider-input::-moz-range-thumb {
      transition: none;
    }

    .ds-slider-tooltip {
      transition: none;
    }
  }
}
</style>
