<script setup lang="ts">
import { computed, ref } from 'vue'

import {
  DIAL_INNER_THRESHOLD,
  angleToIndex,
  dialIndexToHour24,
  distanceFraction,
  hour24ToDial,
  snapMinute,
  to12h,
  to24h,
} from '../../utils/time'
import type { HourFormat } from '../../utils/time'
import { pad2 } from '../../utils/text'
import { useMessages } from '../../i18n/state'

/**
 * Cadran horloge du VTimePicker (interne, non exporté).
 *
 * Aucune primitive native ne couvre la sélection angulaire : le JS se limite à
 * (1) la conversion pointeur → valeur (pointerdown/move : mesure du rect puis
 * trigonométrie PURE dans `utils/time` — atan2, seuil d'anneau) et (2) le pattern
 * ARIA « slider » au clavier (flèches / Home / End / PageUp-Down). Tout le
 * rendu — position des chiffres, aiguille — est du CSS (`sin()`/`cos()` sur la
 * fraction de tour unitless `--dial-turn` inline).
 *
 * Un unique élément focusable `role="slider"` (1 arrêt de tabulation,
 * `aria-valuetext` localisé) : les chiffres sont des repères purement visuels
 * (`aria-hidden`), atteints par l'angle du pointeur, pas par cellule.
 */
interface TimePickerDialProps {
  /** Étape courante : sélection de l'heure ou des minutes. */
  step: 'hour' | 'minute'
  format: HourFormat
  /** Heure 24 h canonique (0–23). */
  hour: number
  minute: number
  /** Granularité des minutes (drag et flèches). */
  minuteStep: number
}

const props = defineProps<TimePickerDialProps>()

const emit = defineEmits<{
  'update:hour': [hour: number]
  'update:minute': [minute: number]
  /** Valeur d'étape arrêtée (relâcher du pointeur, Entrée/Espace). */
  'confirm-step': [via: 'pointer' | 'keyboard']
}>()

interface DialCell {
  key: string
  label: string
  /** Fraction de tour [0, 1) de la position du chiffre (0 = midi). */
  turn: number
  ring: 'outer' | 'inner'
  selected: boolean
}

const cells = computed<DialCell[]>(() => {
  if (props.step === 'minute') {
    // Repères 5 min ; la sélection au drag reste à la minute près.
    return Array.from({ length: 12 }, (_, i) => ({
      key: `m-${i}`,
      label: pad2(i * 5),
      turn: i / 12,
      ring: 'outer' as const,
      selected: props.minute === i * 5,
    }))
  }
  const outer: DialCell[] = Array.from({ length: 12 }, (_, i) => {
    const hour24 = dialIndexToHour24(i, 'outer')
    return {
      key: `o-${i}`,
      label: String(i === 0 ? 12 : i),
      turn: i / 12,
      ring: 'outer' as const,
      selected:
        props.format === '24h'
          ? props.hour === hour24
          : to12h(props.hour).hour === (i === 0 ? 12 : i),
    }
  })
  if (props.format === '12h') return outer
  const inner: DialCell[] = Array.from({ length: 12 }, (_, i) => {
    const hour24 = dialIndexToHour24(i, 'inner')
    return {
      key: `i-${i}`,
      label: pad2(hour24),
      turn: i / 12,
      ring: 'inner' as const,
      selected: props.hour === hour24,
    }
  })
  return [...outer, ...inner]
})

const handTurn = computed(() => {
  if (props.step === 'minute') return props.minute / 60
  const index =
    props.format === '24h' ? hour24ToDial(props.hour).index : to12h(props.hour).hour % 12
  return index / 12
})

const handRing = computed(() =>
  props.step === 'hour' && props.format === '24h' ? hour24ToDial(props.hour).ring : 'outer',
)

/** Minute hors repère 5 min : l'aiguille porte un point (détail M3). */
const handMinor = computed(() => props.step === 'minute' && props.minute % 5 !== 0)

const ariaValueNow = computed(() => {
  if (props.step === 'minute') return props.minute
  return props.format === '12h' ? to12h(props.hour).hour : props.hour
})
const ariaValueMin = computed(() => (props.step === 'minute' ? 0 : props.format === '12h' ? 1 : 0))
const ariaValueMax = computed(() =>
  props.step === 'minute' ? 59 : props.format === '12h' ? 12 : 23,
)
// Aucune prop dédiée : le dictionnaire est le seul point de surcharge.
const m = useMessages()
const ariaValueText = computed(() =>
  props.step === 'minute'
    ? m.value.timePicker.minutesValue(props.minute)
    : m.value.timePicker.hoursValue(ariaValueNow.value),
)

// ── Pointeur : clic et drag sur la surface ──────────────────────────────────
const faceEl = ref<HTMLElement | null>(null)
const dragging = ref(false)

function applyPoint(event: PointerEvent) {
  const face = faceEl.value
  if (!face) return
  const rect = face.getBoundingClientRect() // handler → client only (SSR-safe)
  const dx = event.clientX - (rect.left + rect.width / 2)
  const dy = event.clientY - (rect.top + rect.height / 2)
  if (props.step === 'minute') {
    emit('update:minute', snapMinute(angleToIndex(dx, dy, 60), props.minuteStep))
    return
  }
  const index = angleToIndex(dx, dy, 12)
  if (props.format === '24h') {
    const ring = distanceFraction(dx, dy, rect.width / 2) < DIAL_INNER_THRESHOLD ? 'inner' : 'outer'
    emit('update:hour', dialIndexToHour24(index, ring))
  } else {
    emit('update:hour', to24h(index === 0 ? 12 : index, to12h(props.hour).meridiem))
  }
}

function onPointerdown(event: PointerEvent) {
  // try/catch : les PointerEvent synthétiques (play functions) n'ont pas de
  // pointeur actif → setPointerCapture jetterait NotFoundError.
  try {
    faceEl.value?.setPointerCapture(event.pointerId)
  } catch {
    /* pointeur synthétique */
  }
  dragging.value = true
  applyPoint(event)
}

function onPointermove(event: PointerEvent) {
  if (dragging.value) applyPoint(event)
}

function onPointerup() {
  if (!dragging.value) return
  dragging.value = false
  emit('confirm-step', 'pointer')
}

function onPointercancel() {
  dragging.value = false
}

// ── Clavier (pattern slider) ────────────────────────────────────────────────
function moveHour(delta: number) {
  if (props.format === '24h') {
    emit('update:hour', (props.hour + delta + 24) % 24)
    return
  }
  // 12h : cycle 1–12 dans le méridien courant (l'AM/PM se change au VToggle).
  const { hour, meridiem } = to12h(props.hour)
  emit('update:hour', to24h(((hour - 1 + delta + 12) % 12) + 1, meridiem))
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    emit('confirm-step', 'keyboard')
    return
  }
  // Flèches non inversées en RTL : le cadran n'est jamais miroité (le sens
  // horaire est invariant), + reste « avancer » dans les deux directions.
  const delta =
    event.key === 'ArrowUp' || event.key === 'ArrowRight'
      ? 1
      : event.key === 'ArrowDown' || event.key === 'ArrowLeft'
        ? -1
        : 0
  if (props.step === 'hour') {
    if (delta) moveHour(delta)
    else if (event.key === 'Home')
      emit('update:hour', props.format === '12h' ? to24h(1, to12h(props.hour).meridiem) : 0)
    else if (event.key === 'End')
      emit('update:hour', props.format === '12h' ? to24h(12, to12h(props.hour).meridiem) : 23)
    else return
    event.preventDefault()
    return
  }
  if (delta)
    emit('update:minute', snapMinute(props.minute + delta * props.minuteStep, props.minuteStep))
  else if (event.key === 'PageUp')
    emit('update:minute', snapMinute(props.minute + 5, props.minuteStep))
  else if (event.key === 'PageDown')
    emit('update:minute', snapMinute(props.minute - 5, props.minuteStep))
  else if (event.key === 'Home') emit('update:minute', 0)
  else if (event.key === 'End')
    emit('update:minute', snapMinute(60 - props.minuteStep, props.minuteStep))
  else return
  event.preventDefault()
}
</script>

<template>
  <div
    ref="faceEl"
    role="slider"
    tabindex="0"
    class="v-timepicker-dial-face"
    :aria-label="step === 'hour' ? m.timePicker.hour : m.timePicker.minutes"
    :aria-valuemin="ariaValueMin"
    :aria-valuemax="ariaValueMax"
    :aria-valuenow="ariaValueNow"
    :aria-valuetext="ariaValueText"
    :data-dragging="dragging ? '' : undefined"
    @pointerdown="onPointerdown"
    @pointermove="onPointermove"
    @pointerup="onPointerup"
    @pointercancel="onPointercancel"
    @keydown="onKeydown"
  >
    <div
      class="v-timepicker-hand"
      aria-hidden="true"
      :data-ring="handRing"
      :data-minor="handMinor ? '' : undefined"
      :style="{ '--dial-turn': String(handTurn) }"
    />
    <span class="v-timepicker-dial-center" aria-hidden="true" />
    <span
      v-for="cell in cells"
      :key="cell.key"
      class="v-timepicker-number"
      aria-hidden="true"
      :data-ring="cell.ring"
      :data-selected="cell.selected ? '' : undefined"
      :style="{ '--dial-turn': String(cell.turn) }"
      >{{ cell.label }}</span
    >
  </div>
</template>

<style>
@layer vectis.components {
  .v-timepicker-dial-face {
    position: relative;
    inline-size: var(--vectis-control-size-timepicker-dial);
    block-size: var(--vectis-control-size-timepicker-dial);
    border-radius: var(--vectis-radius-pill);
    background: var(--vectis-color-surface-muted);
    /* le drag sélectionne, il ne doit ni scroller (tactile) ni sélectionner du texte */
    touch-action: none;
    user-select: none;
    cursor: pointer;
    /* Rayon du centre des chiffres (anneau extérieur). Hérité par chiffres et
       aiguille ; l'anneau intérieur le redéfinit. À garder en phase avec
       DIAL_INNER_THRESHOLD (`utils/time`). */
    --dial-radius: calc(
      var(--vectis-control-size-timepicker-dial) / 2 -
        var(--vectis-control-size-timepicker-number) / 2
    );
  }

  .v-timepicker-dial-face:focus-visible {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: var(--vectis-focus-ring-offset);
  }

  /*
   * Chiffres positionnés par trigonométrie CSS sur la fraction de tour
   * `--dial-turn` inline (sin()/cos() : Chrome 111+ / Safari 15.4+, très en deçà
   * du plancher du repo). `left`/`top`/`rotate` PHYSIQUES délibérés : une
   * horloge ne se miroite jamais en RTL (le sens horaire est universel).
   */
  .v-timepicker-number {
    position: absolute;
    left: calc(50% + var(--dial-radius) * sin(var(--dial-turn) * 1turn));
    top: calc(50% - var(--dial-radius) * cos(var(--dial-turn) * 1turn));
    translate: -50% -50%;
    inline-size: var(--vectis-control-size-timepicker-number);
    block-size: var(--vectis-control-size-timepicker-number);
    display: grid;
    place-items: center;
    border-radius: var(--vectis-radius-pill);
    /* anneau extérieur : lisibilité du cadran, taille du corps de texte large */
    font-size: var(--vectis-text-body-lg-size);
    color: var(--vectis-color-text);
    /* au-dessus de l'aiguille : le chiffre visé se lit sur sa pastille */
    z-index: 1;
    pointer-events: none;
  }

  .v-timepicker-number[data-ring='inner'],
  .v-timepicker-hand[data-ring='inner'] {
    --dial-radius: calc(
      var(--vectis-control-size-timepicker-dial) / 2 -
        var(--vectis-control-size-timepicker-number) * 1.5
    );
  }

  .v-timepicker-number[data-ring='inner'] {
    font-size: var(--vectis-text-body-md-size);
    color: var(--vectis-color-text-muted);
  }

  .v-timepicker-number[data-selected] {
    color: var(--vectis-color-text-on-accent);
  }

  /*
   * Aiguille : trait ancré au centre, tourné par `rotate` sur la même fraction
   * de tour. PAS de transition sur rotate : entre 55 et 0 min l'angle repasse
   * de 0.916turn à 0turn, l'interpolation ferait le grand tour à l'envers
   * (compromis assumé vs Material).
   */
  .v-timepicker-hand {
    position: absolute;
    left: calc(50% - var(--vectis-control-size-timepicker-hand) / 2);
    bottom: 50%;
    inline-size: var(--vectis-control-size-timepicker-hand);
    block-size: var(--dial-radius);
    background: var(--vectis-color-accent);
    transform-origin: 50% 100%;
    rotate: calc(var(--dial-turn) * 1turn);
  }

  /* Pastille de pointe : recouvre le chiffre visé (le texte passe en
     text-on-accent via [data-selected]) */
  .v-timepicker-hand::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    translate: -50% -50%;
    inline-size: var(--vectis-control-size-timepicker-number);
    block-size: var(--vectis-control-size-timepicker-number);
    border-radius: var(--vectis-radius-pill);
    background: var(--vectis-color-accent);
    /* Seule la BASCULE DE TAILLE (repère ↔ [data-minor]) s'anime : elle
       interpole entre deux valeurs bornées, contrairement au `rotate` de
       l'aiguille, laissé sans transition (cf. plus haut). */
    transition:
      inline-size var(--vectis-duration-fast) var(--vectis-ease-default),
      block-size var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  /*
   * Minute hors repère 5 min : la pastille ne recouvre aucun chiffre et
   * déborderait sur les deux voisins → réduite, elle devient à elle seule le
   * repère précis (d'où l'abandon du point clair central de M3, qui ferait un
   * anneau à cette taille). Seule la taille du pseudo change : redéfinir
   * --vectis-control-size-timepicker-number ici déplacerait aussi --dial-radius, donc la
   * longueur de l'aiguille et le rayon des anneaux.
   */
  .v-timepicker-hand[data-minor]::before {
    inline-size: var(--vectis-control-size-timepicker-hand-minor);
    block-size: var(--vectis-control-size-timepicker-hand-minor);
  }

  .v-timepicker-dial-center {
    position: absolute;
    left: 50%;
    top: 50%;
    translate: -50% -50%;
    inline-size: var(--vectis-control-size-timepicker-center);
    block-size: var(--vectis-control-size-timepicker-center);
    border-radius: var(--vectis-radius-pill);
    background: var(--vectis-color-accent);
  }

  @media (prefers-reduced-motion: reduce) {
    .v-timepicker-hand::before {
      transition: none;
    }
  }
}
</style>
