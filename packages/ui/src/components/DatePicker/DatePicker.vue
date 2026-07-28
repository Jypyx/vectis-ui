<script setup lang="ts">
import { computed, ref, useId, watch, watchEffect } from 'vue'

import Calendar from '../Calendar/Calendar.vue'
import type {
  CalendarEvent,
  CalendarMode,
  CalendarValue,
  DateMatcher,
  DateRange,
} from '../Calendar/Calendar.vue'
import {
  caretAfterDigits,
  dateMaskFor,
  digitsOf,
  formatDateMask,
  formatDisplay,
  formatDisplayRange,
  isValidISO,
  isWithin,
  isoToMask,
  maskPlaceholder,
  parseDateMask,
} from '../../utils/date'
import { resolveMatcher } from '../../utils/matcher'
import { isDev } from '../../utils/env'
import Input from '../Input/Input.vue'
import Popover from '../Popover/Popover.vue'

import { useRootAttrs } from '../../composables/useRootAttrs'

import { useFieldPanel } from '../../composables/useFieldPanel'

/**
 * Sélecteur de date : champ `Input` + `Calendar` dans un `Popover` en
 * `mode="manual"`, ancré en pur CSS. On ne passe pas par le `#trigger` de
 * Popover (`popovertarget` est invalide sur un `<input>` texte) : l'ouverture
 * est programmatique, ce qui permet de déplacer le focus DOM dans la grille du
 * calendrier. Fermeture par `@focusout` sur la racine + Échap.
 *
 * Deux modes de champ (prop `entry`) : `readonly` (défaut, la date ne se
 * choisit qu'au calendrier) et `input`, où le champ se tape au clavier derrière
 * un masque numérique dérivé de la locale — l'utilisateur ne saisit que des
 * chiffres, les séparateurs sont posés au fil de la frappe.
 */
type Placement = 'bottom' | 'bottom-start' | 'bottom-end' | 'top' | 'top-start' | 'top-end'

/** Mode du champ : `readonly` (défaut) ou saisie clavier masquée. */
export type DatePickerEntry = 'readonly' | 'input'

/**
 * Siècle d'expansion d'une année à 2 chiffres (« 10/06/26 » → 2026), appliqué à
 * la sortie du champ seulement. Pivot FIXE et non glissant : une règle dérivée
 * de l'année courante rendrait le composant non déterministe (même raison que
 * le `today` posé en `onMounted` du Calendar) et daterait ses tests.
 */
const YEAR_PIVOT = 2000

const DEFAULT_DISPLAY_FORMAT: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
}

interface DatePickerProps {
  // Passe-plat vers Calendar.
  mode?: CalendarMode
  locale?: string
  firstDayOfWeek?: number
  min?: string
  max?: string
  disabledDates?: DateMatcher
  showAdjacentDays?: boolean
  selectAdjacentDays?: boolean
  events?: CalendarEvent[]
  // Champ.
  /**
   * `readonly` (défaut) : la date ne se choisit qu'au calendrier. `input` : le
   * champ se tape au clavier, au masque numérique de la locale. Réservé au mode
   * de sélection `single` — une plage ou une liste retombe en `readonly`.
   */
  entry?: DatePickerEntry
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
  /** Format d'affichage de la date dans le champ (Intl.DateTimeFormat). */
  displayFormat?: Intl.DateTimeFormatOptions
  /** Placement du panneau par rapport au champ. */
  placement?: Placement
}

const props = withDefaults(defineProps<DatePickerProps>(), {
  mode: 'single',
  locale: 'fr-FR',
  firstDayOfWeek: undefined,
  min: undefined,
  max: undefined,
  disabledDates: undefined,
  showAdjacentDays: false,
  selectAdjacentDays: false,
  events: undefined,
  entry: 'readonly',
  label: undefined,
  hint: undefined,
  placeholder: undefined,
  size: 'md',
  compact: false,
  disabled: false,
  invalid: false,
  clearable: true,
  // `undefined` et non l'objet lui-même : c'est ce qui rend la prop détectable
  // (garde-fou dev en mode saisie, où elle n'a pas cours).
  displayFormat: undefined,
  placement: 'bottom-start',
})

const model = defineModel<CalendarValue>({ default: null })

defineSlots<{
  /** Contenu personnalisé d'une cellule jour (relayé vers Calendar). */
  day?(props: {
    iso: string
    day: number
    inMonth: boolean
    disabled: boolean
    selected: boolean
    today: boolean
    inRange: boolean
    events: CalendarEvent[]
  }): unknown
  /** Zone footer du panneau ; reçoit `close` pour fermer depuis un bouton/preset. */
  footer?(props: { close: () => void }): unknown
}>()

// Wrapper-root : class/style sur la racine, le reste reporté sur l'Input.
defineOptions({ inheritAttrs: false })
const { rootClass, rootStyle, forwardedAttrs } = useRootAttrs()

const rootEl = ref<HTMLElement | null>(null)
const panelRef = ref<InstanceType<typeof Popover> | null>(null)
const inputRef = ref<InstanceType<typeof Input> | null>(null)
const calendarRef = ref<InstanceType<typeof Calendar> | null>(null)
const panelId = useId()

/** L'`<input>` natif du champ (masque, caret) — exposé par `Input`. */
const fieldEl = computed<HTMLInputElement | null>(() => inputRef.value?.el ?? null)

/**
 * Le mode saisie est réservé à la sélection simple : une plage ou une liste de
 * dates ne tient pas dans un champ unique masqué.
 */
const resolvedEntry = computed<DatePickerEntry>(() =>
  props.entry === 'input' && props.mode === 'single' ? 'input' : 'readonly',
)
const typing = computed(() => resolvedEntry.value === 'input')

if (isDev) {
  watchEffect(() => {
    if (props.entry === 'input' && props.mode !== 'single')
      console.warn(
        `[DatePicker] entry="input" ignoré en mode « ${props.mode} » : une plage ou une liste de dates ne se saisit pas au clavier.`,
      )
    if (props.entry === 'input' && props.displayFormat)
      console.warn(
        '[DatePicker] displayFormat est ignoré quand entry="input" : le champ affiche le masque numérique de la locale, seul format saisissable.',
      )
  })
}

// Coquille champ + panneau `manual` partagée avec le TimePicker : ouverture,
// fermeture, sortie de focus, clic sur le contrôle, Échap/ArrowDown/Entrée.
const { open, openPanel, closePanel, onControlClick, onFocusout, onKeydown, onPanelMousedown } =
  useFieldPanel({
    rootEl,
    panelRef,
    fieldEl: inputRef,
    disabled: () => props.disabled,
    focusInPanel: () => calendarRef.value?.focus(),
    // En saisie, le panneau s'ouvre sous le curseur sans le happer : la frappe
    // continue dans le champ, la flèche bas reste le chemin vers la grille.
    focusOnOpen: () => !typing.value,
  })

const hasValue = computed(() => {
  if (props.mode === 'multiple') return Array.isArray(model.value) && model.value.length > 0
  if (props.mode === 'range') {
    const r = model.value as DateRange | null
    return !!(r && (r.start || r.end))
  }
  return typeof model.value === 'string' && !!model.value
})

const displayText = computed(() => {
  const { locale } = props
  const displayFormat = props.displayFormat ?? DEFAULT_DISPLAY_FORMAT
  if (props.mode === 'single') {
    return typeof model.value === 'string' && isValidISO(model.value)
      ? formatDisplay(model.value, locale, displayFormat)
      : ''
  }
  if (props.mode === 'range') {
    const r = model.value as DateRange | null
    if (!r?.start) return ''
    if (!r.end) return formatDisplay(r.start, locale, displayFormat)
    return formatDisplayRange(r.start, r.end, locale, displayFormat)
  }
  const list = Array.isArray(model.value) ? model.value : []
  return list.map((iso) => formatDisplay(iso, locale, displayFormat)).join(', ')
})

/* ── Mode saisie : brouillon masqué ─────────────────────────────────────── */

const mask = computed(() => dateMaskFor(props.locale))
const maskHint = computed(() => maskPlaceholder(props.locale, mask.value))
const isDisabledDate = computed(() => resolveMatcher(props.disabledDates))

/**
 * Texte du champ PENDANT la frappe. C'est lui la source de vérité tant que la
 * saisie est en cours : le v-model, lui, ne reçoit qu'une date complète, valide
 * et acceptable.
 */
const draft = ref('')

function syncDraftFromModel() {
  const iso = typeof model.value === 'string' && isValidISO(model.value) ? model.value : null
  const next = iso ? isoToMask(iso, mask.value) : ''
  // Garde anti-boucle : un commit en cours de frappe réécrit le modèle, qui
  // repasse ici — sans ce test on écraserait le brouillon et le caret par un
  // texte identique.
  if (next !== draft.value) draft.value = next
}
watch([model, mask], syncDraftFromModel, { immediate: true })

/**
 * `v-model` et non `:model-value` : sans écouteur `onUpdate:modelValue`, l'Input
 * recopierait en interne le texte BRUT tapé (via son propre `v-model`) et le
 * réécrirait dans le DOM au patch suivant, effaçant le masque dès qu'il ne
 * change pas lui-même (9e chiffre, caractère refusé). Avec l'écouteur, son état
 * interne ne bouge plus que par la prop, donc par `draft`.
 */
const fieldModel = computed<string | number>({
  get: () => (typing.value ? draft.value : displayText.value),
  set: (value) => {
    if (typing.value) draft.value = String(value ?? '')
  },
})

/** Écrit le brouillon ET le DOM : Vue ne repatche pas un texte masqué inchangé. */
function writeField(text: string, caret?: number) {
  draft.value = text
  const el = fieldEl.value
  if (!el) return
  if (el.value !== text) el.value = text
  if (caret !== undefined) el.setSelectionRange(caret, caret)
}

const acceptable = (iso: string) =>
  isWithin(iso, props.min, props.max) && !isDisabledDate.value(iso)

/**
 * Commit au fil de la frappe, dès que la date est complète ET acceptable : le
 * calendrier suit la saisie. Sans pivot d'année — « …/26 » ne doit pas commiter
 * 2026 alors que l'utilisateur est en train de taper son année.
 */
function commitLive() {
  const iso = parseDateMask(draft.value, mask.value)
  if (iso && acceptable(iso) && iso !== model.value) model.value = iso
}

/**
 * Sortie du champ (`change` puis `blur`, d'où l'idempotence) : on normalise, ou
 * on REVERT SILENCIEUSEMENT. Une saisie incomplète, impossible (31/02), hors
 * bornes ou désactivée disparaît au profit de la valeur courante — pas d'état
 * d'erreur maison qui entrerait en concurrence avec la prop `invalid`.
 */
function commitOrRevert() {
  if (!typing.value) return
  if (!digitsOf(draft.value)) {
    if (model.value !== null) model.value = null
    writeField('')
    return
  }
  const iso = parseDateMask(draft.value, mask.value, { yearPivot: YEAR_PIVOT })
  if (iso && acceptable(iso)) {
    if (iso !== model.value) model.value = iso
    writeField(isoToMask(iso, mask.value)) // « 5/6/26 » → « 05/06/2026 »
    return
  }
  const current = typeof model.value === 'string' && isValidISO(model.value) ? model.value : ''
  writeField(current ? isoToMask(current, mask.value) : '')
}

/**
 * Masque à la frappe. Invariant : le nombre de chiffres à GAUCHE du caret est
 * conservé par le reformatage — les positions absolues sautent dès qu'un
 * séparateur apparaît ou disparaît.
 */
function onFieldInput(event: Event) {
  if (!typing.value) return
  const el = event.target as HTMLInputElement
  const raw = el.value
  const caret = el.selectionStart ?? raw.length
  const before = digitsOf(raw.slice(0, caret)).length
  const digits = digitsOf(raw).slice(0, mask.value.size)
  // Le caret ne franchit le séparateur qu'en insertion : à la suppression, il
  // doit rester devant lui, sinon la touche ne progresse jamais.
  const deleting = String((event as InputEvent).inputType ?? '').startsWith('delete')
  const text = formatDateMask(digits, mask.value)
  writeField(
    text,
    caretAfterDigits(
      text,
      Math.min(before, digits.length),
      deleting ? undefined : mask.value.separator,
    ),
  )
  commitLive()
}

/**
 * Un caractère non numérique complète le champ courant par un zéro de tête et
 * passe au suivant (« 5/6/2026 » se tape comme « 05062026 »). Réservé au jour
 * et au mois : une année tronquée n'a pas de convention de zéro de tête.
 */
function padCurrentField(el: HTMLInputElement) {
  const start = el.selectionStart ?? el.value.length
  const before = digitsOf(el.value.slice(0, start)).length
  const digits = digitsOf(el.value)
  let offset = 0
  for (let k = 0; k < mask.value.order.length; k++) {
    const len = mask.value.lengths[k] as number
    if (before < offset + len) {
      const filled = before - offset
      if (mask.value.order[k] === 'year' || filled !== len - 1) return
      const next = digits.slice(0, offset) + '0'.repeat(len - filled) + digits.slice(offset)
      const text = formatDateMask(next.slice(0, mask.value.size), mask.value)
      writeField(text, caretAfterDigits(text, offset + len, mask.value.separator))
      return
    }
    offset += len
  }
}

function onFieldKeydown(event: KeyboardEvent) {
  if (!typing.value) return
  const el = fieldEl.value
  if (!el) return

  if (event.key === 'Enter') {
    // preventDefault : neutralise à la fois la soumission du formulaire et la
    // réouverture par la racine (garde `defaultPrevented` de useFieldPanel).
    event.preventDefault()
    commitOrRevert()
    if (open.value) closeAndFocus()
    return
  }
  if (event.key === 'ArrowDown' && open.value) {
    // seul chemin explicite du champ vers la grille
    event.preventDefault()
    calendarRef.value?.focus()
    return
  }
  if (event.key === 'Backspace') {
    const start = el.selectionStart
    if (
      start !== null &&
      start === el.selectionEnd &&
      start > 0 &&
      !/\d/.test(el.value[start - 1] ?? '')
    ) {
      // Le séparateur est POSÉ par le masque, jamais saisi : on efface le
      // chiffre qui le précède — ce que l'utilisateur croit effacer. Sinon le
      // masque le réécrit aussitôt et la touche paraît morte.
      event.preventDefault()
      const n = digitsOf(el.value.slice(0, start)).length
      const digits = digitsOf(el.value)
      const text = formatDateMask(digits.slice(0, n - 1) + digits.slice(n), mask.value)
      writeField(text, caretAfterDigits(text, n - 1))
      commitLive()
    }
    return
  }
  if (
    event.key.length === 1 &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.altKey &&
    !/\d/.test(event.key)
  ) {
    event.preventDefault()
    padCurrentField(el)
  }
}

/**
 * Collage : une date ISO ou déjà masquée est adoptée telle quelle, sinon seuls
 * ses chiffres sont insérés. Sans ce handler, coller « 2026-06-10 » dans un
 * masque jj/mm/aaaa donnerait « 20/26/0610 ».
 */
function onFieldPaste(event: ClipboardEvent) {
  if (!typing.value) return
  const el = fieldEl.value
  if (!el) return
  event.preventDefault()
  const pasted = (event.clipboardData?.getData('text') ?? '').trim()
  const iso = isValidISO(pasted)
    ? pasted
    : parseDateMask(pasted, mask.value, { yearPivot: YEAR_PIVOT })
  if (iso) {
    const text = isoToMask(iso, mask.value)
    writeField(text, text.length)
    commitLive()
    return
  }
  const start = el.selectionStart ?? el.value.length
  const end = el.selectionEnd ?? start
  const digits = digitsOf(el.value)
  const from = digitsOf(el.value.slice(0, start)).length
  const to = digitsOf(el.value.slice(0, end)).length
  const inserted = digitsOf(pasted)
  const next = (digits.slice(0, from) + inserted + digits.slice(to)).slice(0, mask.value.size)
  const text = formatDateMask(next, mask.value)
  writeField(text, caretAfterDigits(text, Math.min(from + inserted.length, next.length)))
  commitLive()
}

/**
 * Le focus rendu au champ à la fermeture le rouvrirait aussitôt (en saisie, le
 * panneau s'ouvre AU FOCUS) : ce verrou couvre l'appel, synchrone, de `focus()`.
 * Toute fermeture avec refocus doit passer par ici — un `closePanel(true)`
 * direct réintroduit la boucle.
 */
let refocusing = false
function closeAndFocus() {
  refocusing = true
  closePanel(true)
  refocusing = false
}

function onFieldFocus() {
  if (!typing.value || refocusing) return
  openPanel(false)
}

function onRootKeydown(event: KeyboardEvent) {
  if (typing.value && event.key === 'Escape' && open.value) {
    event.preventDefault()
    closeAndFocus()
    return
  }
  onKeydown(event)
}

// L'icône de fin devient la croix d'effacement quand il y a une valeur.
const showClearIcon = computed(
  () => props.clearable && !props.disabled && (hasValue.value || (typing.value && !!draft.value)),
)
const endIcon = computed(() => (showClearIcon.value ? 'close' : 'calendar_today'))
const endIconLabel = computed(() =>
  showClearIcon.value ? 'Effacer la date' : 'Ouvrir le calendrier',
)

function onEndIcon() {
  if (showClearIcon.value) clearValue()
  else if (open.value) closeAndFocus()
  // Clic explicite sur l'icône calendrier : le focus a déjà quitté le champ
  // pour le bouton, l'emmener dans la grille est le bon geste dans les 2 modes.
  else openPanel(true)
}
function clearValue() {
  model.value =
    props.mode === 'multiple' ? [] : props.mode === 'range' ? { start: null, end: null } : null
  // `draft` explicitement : quand le modèle valait déjà `null`, la garde
  // anti-boucle de `syncDraftFromModel` ne le viderait pas.
  if (typing.value) writeField('')
  refocusing = true
  inputRef.value?.focus()
  refocusing = false
}

/** Sélection dans le calendrier : en mode simple, on ferme. */
function onSelect() {
  if (props.mode === 'single') closeAndFocus()
}

const close = () => closeAndFocus()
</script>

<template>
  <div
    ref="rootEl"
    class="ds-datepicker"
    :class="rootClass"
    :style="rootStyle"
    :data-open="open ? '' : undefined"
    :data-entry="resolvedEntry"
    @focusout="onFocusout"
    @keydown="onRootKeydown"
  >
    <div class="ds-datepicker-control" @click="onControlClick">
      <Input
        ref="inputRef"
        v-model="fieldModel"
        :inputmode="typing ? 'numeric' : undefined"
        :autocomplete="typing ? 'off' : undefined"
        v-bind="forwardedAttrs"
        :readonly="!typing"
        :label="label"
        :hint="hint"
        :placeholder="placeholder ?? (typing ? maskHint : undefined)"
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
        @focus="onFieldFocus"
        @input="onFieldInput"
        @change="commitOrRevert"
        @blur="commitOrRevert"
        @keydown="onFieldKeydown"
        @paste="onFieldPaste"
      />
    </div>

    <Popover
      :id="panelId"
      ref="panelRef"
      v-model:open="open"
      mode="manual"
      anchor="--ds-datepicker-anchor"
      :placement="placement"
      surface
      role="dialog"
      :aria-label="label ?? 'Choisir une date'"
      class="ds-datepicker-panel"
      @mousedown="onPanelMousedown"
    >
      <Calendar
        ref="calendarRef"
        v-model="model"
        :mode="mode"
        :locale="locale"
        :first-day-of-week="firstDayOfWeek"
        :min="min"
        :max="max"
        :disabled-dates="disabledDates"
        :show-adjacent-days="showAdjacentDays"
        :select-adjacent-days="selectAdjacentDays"
        :events="events"
        @select="onSelect"
      >
        <template v-if="$slots.day" #day="slotProps">
          <slot name="day" v-bind="slotProps" />
        </template>
        <template v-if="$slots.footer" #footer>
          <slot name="footer" :close="close" />
        </template>
      </Calendar>
    </Popover>
  </div>
</template>

<style>
@layer ds.components {
  .ds-datepicker {
    /* confine l'ancre à cette instance (racine = ancêtre commun contrôle/panneau) */
    anchor-scope: --ds-datepicker-anchor;
    display: block;
    width: 100%;
    font-family: var(--ds-text-family);
  }

  .ds-datepicker-control {
    anchor-name: --ds-datepicker-anchor;
    display: block;
    cursor: pointer;
  }

  /* Mode saisie : le champ est éditable, le curseur texte de l'<input> reprend
     la main sur le `pointer` du contrôle (qui, lui, signale « ceci ouvre un
     panneau »). Le masque a une largeur fixe : chasse tabulaire, sinon le caret
     vibre d'un chiffre à l'autre. */
  .ds-datepicker[data-entry='input'] .ds-datepicker-control {
    cursor: text;
  }

  .ds-datepicker[data-entry='input'] .ds-input-control {
    font-variant-numeric: tabular-nums;
  }

  /* `position-anchor` vient de Popover (prop `anchor`), rendu sans surface */
  .ds-datepicker-panel {
    /* le Calendar porte son propre fond : on neutralise les styles UA de
       [popover] (bordure, padding, fond), et le panneau épouse ses coins en
       ajoutant l'ombre d'élévation (box-shadow, pas filter : drop-shadow()
       n'accepte qu'une seule ombre alors que --ds-shadow-* en empile deux). */
    width: max-content;
    padding: 0;
  }
}
</style>
