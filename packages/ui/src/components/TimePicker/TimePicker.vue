<script setup lang="ts">
import { computed, ref, useAttrs, useId, watch } from 'vue'
import type { StyleValue } from 'vue'

import Button from '../Button/Button.vue'
import IconButton from '../IconButton/IconButton.vue'
import Input from '../Input/Input.vue'
import Toggle from '../Toggle/Toggle.vue'
import type { ToggleModelValue } from '../Toggle/Toggle.vue'
import ToggleItem from '../Toggle/ToggleItem.vue'
import TimePickerDial from './TimePickerDial.vue'
import { usePopover } from '../../composables/usePopover'
import {
  clampInt,
  formatDisplay,
  formatTime,
  hourCycleFor,
  parseTime,
  snapMinute,
  to12h,
  to24h,
} from './timeUtils'
import type { HourFormat } from './timeUtils'

/**
 * Sélecteur d'heure Material : champ `Input` (lecture seule) + panneau flottant
 * avec deux modes permutables — cadran (dial) et saisie clavier (input).
 * Composé des briques du DS ; coquille identique au DatePicker (`popover =
 * "manual"` ancré en pur CSS, ouverture programmatique pour déplacer le focus
 * dans le panneau, fermeture par `@focusout` racine + Échap).
 *
 * Le panneau travaille sur un BROUILLON : seul OK écrit le v-model (`'HH:mm'`
 * 24 h canonique) ; Annuler, Échap et la sortie de focus abandonnent. Le
 * méridien AM/PM DÉRIVE de l'heure 24 h du brouillon (pas de 3e état
 * désynchronisable).
 */
export type TimePickerFormat = HourFormat
export type TimePickerMode = 'dial' | 'input'

type Placement = 'bottom' | 'bottom-start' | 'bottom-end' | 'top' | 'top-start' | 'top-end'

interface TimePickerProps {
  /** Cycle horaire affiché ; défaut : dérivé de la locale (`hourCycle` Intl). */
  format?: TimePickerFormat
  /** Mode INITIAL du panneau (l'icône du pied permet de basculer). */
  mode?: TimePickerMode
  /** Fige le mode : masque l'icône de bascule. */
  lockMode?: boolean
  /** Granularité des minutes au cadran et aux flèches (diviseur de 60). */
  minuteStep?: number
  locale?: string
  // ── Champ ──
  label?: string
  hint?: string
  placeholder?: string
  /** Hauteur du champ : sm 32px, md 40px (défaut), lg 48px. */
  size?: 'sm' | 'md' | 'lg'
  compact?: boolean
  disabled?: boolean
  invalid?: boolean
  /** Bouton d'effacement (croix) qui vide la valeur. */
  clearable?: boolean
  /** Placement du panneau par rapport au champ. */
  placement?: Placement
}

const props = withDefaults(defineProps<TimePickerProps>(), {
  format: undefined,
  mode: 'dial',
  lockMode: false,
  minuteStep: 1,
  locale: 'fr-FR',
  label: undefined,
  hint: undefined,
  placeholder: undefined,
  size: 'md',
  compact: false,
  disabled: false,
  invalid: false,
  clearable: true,
  placement: 'bottom-start',
})

/** Heure `'HH:mm'` 24 h canonique, quel que soit l'affichage 12 h / 24 h. */
const model = defineModel<string | null>({ default: null })

// Garde-fou de dev uniquement : `import.meta.env` est spécifique à Vite/Vitest
// et peut être absent chez un consommateur non-Vite.
if ((import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV) {
  if (props.minuteStep < 1 || 60 % props.minuteStep !== 0)
    console.warn(`[TimePicker] minuteStep ${props.minuteStep} — un diviseur de 60 est attendu.`)
}

// ── Wrapper-root : class/style sur la racine, reste reporté sur l'Input ──────
defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const rootClass = computed(() => attrs.class)
const rootStyle = computed(() => attrs.style as StyleValue)
const forwardedAttrs = computed(() =>
  Object.fromEntries(Object.entries(attrs).filter(([k]) => k !== 'class' && k !== 'style')),
)

const rootEl = ref<HTMLElement | null>(null)
const panelEl = ref<HTMLElement | null>(null)
const inputRef = ref<InstanceType<typeof Input> | null>(null)
const hourCellEl = ref<HTMLButtonElement | null>(null)
const fieldHourEl = ref<HTMLInputElement | null>(null)
const fieldMinuteEl = ref<HTMLInputElement | null>(null)
const panelId = useId()

const pad2 = (n: number) => String(n).padStart(2, '0')

// État d'ouverture du panneau : alimenté par les événements du popover (cf.
// usePopover), jamais écrit à la main — `openPanel`/`closePanel` passent par
// `show()`/`hide()`, dont les gardes évitent l'InvalidStateError.
const { shown: open, syncShown, show, hide } = usePopover(panelEl)
/** Mode courant du panneau ; persiste entre ouvertures (préférence d'usage). */
const activeMode = ref<TimePickerMode>(props.mode)
const activeStep = ref<'hour' | 'minute'>('hour')

// ── Brouillon (commité par OK seulement) ────────────────────────────────────
const draftHour = ref(0) // 24 h canonique
const draftMinute = ref(0)

const resolvedFormat = computed<TimePickerFormat>(() => props.format ?? hourCycleFor(props.locale))

/** Pont vers le Toggle AM/PM : le méridien dérive de l'heure 24 h. */
const meridiemModel = computed<ToggleModelValue>({
  get: () => (draftHour.value >= 12 ? 'PM' : 'AM'),
  set: (value) => {
    if (value === 'PM' && draftHour.value < 12) draftHour.value += 12
    else if (value === 'AM' && draftHour.value >= 12) draftHour.value -= 12
  },
})

const displayHourText = computed(() =>
  pad2(resolvedFormat.value === '12h' ? to12h(draftHour.value).hour : draftHour.value),
)

// ── Valeur affichée dans le champ (localisée) ───────────────────────────────
const hasValue = computed(() => typeof model.value === 'string' && !!model.value)
const displayText = computed(() =>
  model.value ? formatDisplay(model.value, props.locale, resolvedFormat.value) : '',
)

// L'icône de fin devient la croix d'effacement quand il y a une valeur.
const showClearIcon = computed(() => props.clearable && hasValue.value && !props.disabled)
const endIcon = computed(() => (showClearIcon.value ? 'close' : 'schedule'))
const endIconLabel = computed(() =>
  showClearIcon.value ? "Effacer l'heure" : 'Ouvrir le sélecteur d’heure',
)

// ── Ouverture / fermeture du panneau (popover manual) ───────────────────────
function focusPrimary() {
  // focus DOM déplacé dans le panneau (le natif ne le fait pas pour un manual)
  requestAnimationFrame(() => {
    if (activeMode.value === 'dial') hourCellEl.value?.focus()
    else {
      fieldHourEl.value?.focus()
      fieldHourEl.value?.select()
    }
  })
}

function openPanel() {
  if (props.disabled || open.value) return
  // Brouillon : valeur commitée, sinon heure courante (handler → client only).
  const parts = parseTime(model.value)
  if (parts) {
    draftHour.value = parts.hour
    draftMinute.value = parts.minute
  } else {
    const now = new Date()
    draftHour.value = now.getHours()
    draftMinute.value = snapMinute(now.getMinutes(), props.minuteStep)
  }
  activeStep.value = 'hour'
  show()
  focusPrimary()
}

function closePanel(refocus = false) {
  if (!open.value) return
  hide()
  liveMessage.value = ''
  if (refocus) inputRef.value?.focus()
}

/** OK : seul chemin qui écrit le v-model. */
function confirm() {
  model.value = formatTime(draftHour.value, draftMinute.value)
  closePanel(true)
}

function cancel() {
  closePanel(true)
}

function toggleMode() {
  activeMode.value = activeMode.value === 'dial' ? 'input' : 'dial'
  focusPrimary()
}

/** Étape arrêtée au cadran : heure → minutes (Material) ; minutes → OK au clavier
    seulement (le relâcher du pointeur ne doit pas fermer le panneau). */
function onDialConfirm(via: 'pointer' | 'keyboard') {
  if (activeStep.value === 'hour') activeStep.value = 'minute'
  else if (via === 'keyboard') confirm()
}

function onControlClick(event: MouseEvent) {
  // clic sur un bouton interne (croix/icône) : laisser son handler agir
  if ((event.target as HTMLElement).closest('.ds-input-action')) return
  if (props.disabled) return
  openPanel()
}

function onEndIcon() {
  if (showClearIcon.value) clearValue()
  else if (open.value) closePanel(true)
  else openPanel()
}

function clearValue() {
  model.value = null
  inputRef.value?.focus()
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    if (open.value) {
      event.preventDefault()
      cancel()
    }
    return
  }
  // `defaultPrevented` : une Entrée déjà consommée DANS le panneau (commit du
  // cadran ou d'un champ) vient de le fermer — sans ce garde, elle le rouvrirait
  // en atteignant la racine par bubbling.
  if (
    (event.key === 'ArrowDown' || event.key === 'Enter') &&
    !open.value &&
    !event.defaultPrevented
  ) {
    event.preventDefault()
    openPanel()
  }
}

/** Fermeture SANS commit quand le focus sort du composant (sémantique Annuler). */
function onFocusout(event: FocusEvent) {
  const next = event.relatedTarget as Node | null
  if (!next || !rootEl.value?.contains(next)) closePanel(false)
}

// L'étape n'est portée que par l'aria-label du slider, dont le changement n'est
// pas annoncé de façon fiable : une live region polie double l'information.
const liveMessage = ref('')
watch(activeStep, (step) => {
  if (open.value)
    liveMessage.value = step === 'minute' ? 'Sélection des minutes' : 'Sélection de l’heure'
})

// ── Mode saisie : champs HH / MM (modèle InputOTP, commit au change) ────────
const fieldHour = ref('')
const fieldMinute = ref('')

function syncFields() {
  fieldHour.value = displayHourText.value
  fieldMinute.value = pad2(draftMinute.value)
}
watch([draftHour, draftMinute, resolvedFormat], syncFields, { immediate: true })

/** ±1 heure avec wrap — en 12 h, cycle 1–12 dans le méridien courant. */
function stepDraftHour(delta: number) {
  if (resolvedFormat.value === '24h') {
    draftHour.value = (draftHour.value + delta + 24) % 24
  } else {
    const { hour, meridiem } = to12h(draftHour.value)
    draftHour.value = to24h(((hour - 1 + delta + 12) % 12) + 1, meridiem)
  }
}

function onFieldInput(which: 'hour' | 'minute', event: Event) {
  const el = event.target as HTMLInputElement
  const digits = el.value.replace(/\D/g, '').slice(0, 2)
  el.value = digits
  if (which === 'hour') {
    fieldHour.value = digits
    // 2 chiffres saisis : avance auto vers les minutes (modèle InputOTP)
    if (digits.length === 2) {
      commitField('hour')
      fieldMinuteEl.value?.focus()
      fieldMinuteEl.value?.select()
    }
  } else {
    fieldMinute.value = digits
  }
}

/** Commit au `change` (blur/Entrée), jamais à la frappe : on clamperait « 1 »
    pendant la saisie de « 15 » (précédent Slider). Vide/NaN → revert. */
function commitField(which: 'hour' | 'minute') {
  const raw = which === 'hour' ? fieldHour.value : fieldMinute.value
  const n = Number(raw)
  if (raw === '' || Number.isNaN(n)) {
    syncFields()
    return
  }
  if (which === 'hour') {
    draftHour.value =
      resolvedFormat.value === '12h'
        ? to24h(clampInt(n, 1, 12), to12h(draftHour.value).meridiem)
        : clampInt(n, 0, 23)
  } else {
    draftMinute.value = clampInt(n, 0, 59)
  }
  syncFields()
}

function onFieldKeydown(which: 'hour' | 'minute', event: KeyboardEvent) {
  if (event.key === 'Enter') {
    event.preventDefault()
    commitField(which)
    confirm()
    return
  }
  // ±1 aux flèches avec wrap : action discrète, committée immédiatement.
  // (`type="number"` écarté : spinners natifs non stylables, validation laxiste.)
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    event.preventDefault()
    const delta = event.key === 'ArrowUp' ? 1 : -1
    if (which === 'hour') stepDraftHour(delta)
    else draftMinute.value = (draftMinute.value + delta + 60) % 60
    syncFields()
  }
}
</script>

<template>
  <div
    ref="rootEl"
    class="ds-timepicker"
    :class="rootClass"
    :style="rootStyle"
    :data-open="open ? '' : undefined"
    @focusout="onFocusout"
    @keydown="onKeydown"
  >
    <div class="ds-timepicker-control" @click="onControlClick">
      <Input
        ref="inputRef"
        v-bind="forwardedAttrs"
        :model-value="displayText"
        readonly
        :label="label"
        :hint="hint"
        :placeholder="placeholder"
        :size="size"
        :compact="compact"
        :disabled="disabled"
        :invalid="invalid"
        :icon-end="endIcon"
        :icon-end-label="endIconLabel"
        aria-haspopup="dialog"
        :aria-expanded="open"
        :aria-controls="panelId"
        @click:icon-end="onEndIcon"
      />
    </div>

    <div
      :id="panelId"
      ref="panelEl"
      popover="manual"
      role="dialog"
      :aria-label="label ?? 'Choisir une heure'"
      class="ds-timepicker-panel ds-floating"
      :data-placement="placement"
      @beforetoggle="syncShown"
      @toggle="syncShown"
    >
      <div class="ds-timepicker-caption">
        {{ activeMode === 'dial' ? 'Sélectionner l’heure' : 'Saisir l’heure' }}
      </div>

      <div class="ds-timepicker-header">
        <div class="ds-timepicker-time">
          <!-- Mode cadran : les cellules basculent l'étape active -->
          <template v-if="activeMode === 'dial'">
            <button
              ref="hourCellEl"
              type="button"
              class="ds-timepicker-cell"
              :aria-pressed="activeStep === 'hour' ? 'true' : 'false'"
              aria-label="Sélectionner l’heure"
              @click="activeStep = 'hour'"
            >
              {{ displayHourText }}
            </button>
            <span class="ds-timepicker-sep" aria-hidden="true">:</span>
            <button
              type="button"
              class="ds-timepicker-cell"
              :aria-pressed="activeStep === 'minute' ? 'true' : 'false'"
              aria-label="Sélectionner les minutes"
              @click="activeStep = 'minute'"
            >
              {{ pad2(draftMinute) }}
            </button>
          </template>
          <!-- Mode saisie : champs nus (modèle InputOTP) -->
          <template v-else>
            <div class="ds-timepicker-field-group">
              <input
                :id="`${panelId}-h`"
                ref="fieldHourEl"
                type="text"
                inputmode="numeric"
                maxlength="2"
                class="ds-timepicker-cell ds-timepicker-field"
                :value="fieldHour"
                @input="onFieldInput('hour', $event)"
                @change="commitField('hour')"
                @keydown="onFieldKeydown('hour', $event)"
                @focus="($event.target as HTMLInputElement).select()"
              />
              <label class="ds-timepicker-field-label" :for="`${panelId}-h`">Heure</label>
            </div>
            <span class="ds-timepicker-sep" aria-hidden="true">:</span>
            <div class="ds-timepicker-field-group">
              <input
                :id="`${panelId}-m`"
                ref="fieldMinuteEl"
                type="text"
                inputmode="numeric"
                maxlength="2"
                class="ds-timepicker-cell ds-timepicker-field"
                :value="fieldMinute"
                @input="onFieldInput('minute', $event)"
                @change="commitField('minute')"
                @keydown="onFieldKeydown('minute', $event)"
                @focus="($event.target as HTMLInputElement).select()"
              />
              <label class="ds-timepicker-field-label" :for="`${panelId}-m`">Minute</label>
            </div>
          </template>
        </div>

        <Toggle
          v-if="resolvedFormat === '12h'"
          v-model="meridiemModel"
          class="ds-timepicker-meridiem"
          orientation="vertical"
          mandatory
          variant="outline"
          size="sm"
          label="AM ou PM"
        >
          <ToggleItem value="AM" label="AM" />
          <ToggleItem value="PM" label="PM" />
        </Toggle>
      </div>

      <TimePickerDial
        v-if="activeMode === 'dial'"
        :step="activeStep"
        :format="resolvedFormat"
        :hour="draftHour"
        :minute="draftMinute"
        :minute-step="minuteStep"
        @update:hour="draftHour = $event"
        @update:minute="draftMinute = $event"
        @confirm-step="onDialConfirm"
      />

      <div class="ds-visually-hidden" aria-live="polite">{{ liveMessage }}</div>

      <div class="ds-timepicker-footer">
        <IconButton
          v-if="!lockMode"
          class="ds-timepicker-mode"
          variant="ghost"
          tone="neutral"
          :icon="activeMode === 'dial' ? 'keyboard' : 'schedule'"
          :label="activeMode === 'dial' ? 'Passer en saisie clavier' : 'Passer au cadran'"
          @click="toggleMode"
        />
        <Button variant="ghost" tone="neutral" @click="cancel">Annuler</Button>
        <Button @click="confirm">OK</Button>
      </div>
    </div>
  </div>
</template>

<style>
@layer ds.components {
  .ds-timepicker {
    /* confine l'ancre à cette instance (racine = ancêtre commun contrôle/panneau) */
    anchor-scope: --ds-timepicker-anchor;
    display: block;
    width: 100%;
    font-family: var(--ds-text-family);
  }

  .ds-timepicker-control {
    anchor-name: --ds-timepicker-anchor;
    display: block;
    cursor: pointer;
  }

  /* Le `display: flex` d'auteur écrase le `display: none` UA de [popover] :
     c'est le garde-fou `.ds-floating:not(:popover-open)` qui referme. */
  .ds-timepicker-panel {
    position-anchor: --ds-timepicker-anchor;
    display: flex;
    flex-direction: column;
    gap: var(--ds-space-5);
    width: max-content;
    padding: var(--ds-space-6);
    border: none;
    background: var(--ds-color-surface-overlay);
    color: var(--ds-color-text);
    border-radius: var(--ds-radius-overlay);
    box-shadow: var(--ds-shadow-4);
  }

  .ds-timepicker-caption {
    font-size: var(--ds-text-caption-size);
    color: var(--ds-color-text-muted);
  }

  .ds-timepicker-header {
    display: flex;
    align-items: flex-start;
    gap: var(--ds-space-3);
  }

  /* Une heure numérique se lit toujours HH:MM : sans ce ltr forcé, le bidi
     réordonnerait les cellules en RTL. */
  .ds-timepicker-time {
    display: flex;
    align-items: flex-start;
    gap: var(--ds-space-2);
    direction: ltr;
  }

  .ds-timepicker-cell {
    inline-size: var(--ds-control-size-timepicker-cell-w);
    block-size: var(--ds-control-size-timepicker-cell-h);
    display: grid;
    place-items: center;
    padding: 0;
    /* bordure transparente : géométrie stable quand le focus la colore (champ) */
    border: 1px solid transparent;
    border-radius: var(--ds-radius-surface);
    background: var(--ds-color-surface-muted);
    color: var(--ds-color-text);
    font-family: var(--ds-text-family);
    /* chiffres géants de l'en-tête : rôle display (48px — l'ancien
       calc(3xl × 1.5) valait 45px, +3px assumés en rejoignant l'échelle) */
    font-size: var(--ds-text-display-size);
    line-height: var(--ds-text-display-leading);
    transition:
      background-color var(--ds-duration-fast) var(--ds-ease-default),
      color var(--ds-duration-fast) var(--ds-ease-default);
  }

  button.ds-timepicker-cell {
    cursor: pointer;
  }

  button.ds-timepicker-cell:focus-visible {
    outline: var(--ds-focus-ring-width) solid var(--ds-focus-ring-color);
    outline-offset: var(--ds-focus-ring-offset);
  }

  .ds-timepicker-cell[aria-pressed='true'] {
    background: var(--ds-color-accent-surface);
    color: var(--ds-color-accent-text);
  }

  .ds-timepicker-sep {
    block-size: var(--ds-control-size-timepicker-cell-h);
    display: grid;
    place-items: center;
    font-size: var(--ds-text-display-size);
    line-height: var(--ds-text-display-leading);
    color: var(--ds-color-text);
    user-select: none;
  }

  .ds-timepicker-field-group {
    display: flex;
    flex-direction: column;
    gap: var(--ds-space-2);
  }

  .ds-timepicker-field {
    text-align: center;
  }

  /* Focus « bordure 2px » = bordure 1px + shadow externe 1px (aligné sur
     InputOTP) ; l'outline transparent est le filet forced-colors */
  .ds-timepicker-field:focus-visible {
    border-color: var(--ds-color-accent);
    box-shadow: 0 0 0 1px var(--ds-color-accent);
    outline: var(--ds-focus-ring-width) solid transparent;
  }

  .ds-timepicker-field-label {
    font-size: var(--ds-text-caption-size);
    color: var(--ds-color-text-muted);
  }

  .ds-timepicker-panel .ds-timepicker-dial-face {
    align-self: center;
  }

  .ds-timepicker-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--ds-space-2);
  }

  /* pousse Annuler/OK à droite ; qualifié .ds-timepicker (ordre d'export libre) */
  .ds-timepicker-panel .ds-timepicker-mode {
    margin-inline-end: auto;
  }

  @media (prefers-reduced-motion: reduce) {
    .ds-timepicker-cell {
      transition: none;
    }
  }
}
</style>
