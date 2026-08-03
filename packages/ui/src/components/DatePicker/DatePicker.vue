<script setup lang="ts">
import { computed, ref, useId, watch, watchEffect } from 'vue'

import Calendar from '../Calendar/Calendar.vue'
import type {
  CalendarEvent,
  CalendarSelection,
  CalendarValue,
  DateMatcher,
  DateRange,
} from '../Calendar/Calendar.vue'
import {
  caretAfterDigits,
  dateMaskFor,
  formatDateMask,
  formatDisplay,
  formatDisplayRange,
  isValidISO,
  isWithin,
  isoToMask,
  maskPlaceholder,
  parseDateMask,
} from '../../utils/date'
import { digitsOf } from '../../utils/text'
import { resolveMatcher } from '../../utils/matcher'
import { isDev } from '../../utils/env'
import type { IconSource } from '../Icon/types'
import Input from '../Input/Input.vue'
import Popover from '../Popover/Popover.vue'

import { useRootAttrs } from '../../composables/useRootAttrs'

import { useFieldPanel } from '../../composables/useFieldPanel'
import { useLocale, useMessages } from '../../i18n/state'

/**
 * Sélecteur de date : champ `Input` + `Calendar` dans un `Popover` en
 * `mode="manual"`, ancré en pur CSS. On ne passe pas par le `#trigger` de
 * Popover (`popovertarget` est invalide sur un `<input>` texte) : l'ouverture
 * est programmatique, ce qui permet de déplacer le focus DOM dans la grille du
 * calendrier. Fermeture par `@focusout` sur la racine + Échap.
 *
 * Deux modes de champ (prop `mode`) : `input` (défaut) où le champ se tape au
 * clavier derrière un masque numérique dérivé de la locale — l'utilisateur ne
 * saisit que des chiffres, les séparateurs sont posés au fil de la frappe — et
 * `readonly`, où la date ne se choisit qu'au calendrier. La prop `selection`,
 * elle, est le passe-plat du mode de sélection du Calendar.
 */
type Placement = 'bottom' | 'bottom-start' | 'bottom-end' | 'top' | 'top-start' | 'top-end'

/** Mode du champ : saisie clavier masquée (défaut) ou lecture seule. */
export type DatePickerMode = 'readonly' | 'input'

const MODES: DatePickerMode[] = ['readonly', 'input']

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
  selection?: CalendarSelection
  /**
   * Locale BCP 47 (noms de mois/jours, 1er jour de semaine). PRIORITAIRE sur la
   * locale globale du DS (`setLocale`), sur laquelle elle retombe à défaut —
   * d'où l'absence de défaut littéral ici : `undefined` doit rester
   * distinguable pour que la locale globale ait une chance de s'appliquer.
   */
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
   * `input` (défaut) : le champ se tape au clavier, au masque numérique de la
   * locale. `readonly` : la date ne se choisit qu'au calendrier. La saisie est
   * réservée à la sélection `single` — une plage ou une liste retombe d'office
   * en `readonly`.
   */
  mode?: DatePickerMode
  /**
   * Affiche le calendrier sous le champ en mode saisie : icône cliquable en fin
   * de champ + panneau ouvert au focus. Sans effet en lecture seule, où le
   * calendrier est le seul moyen de choisir une date.
   */
  showCalendar?: boolean
  label?: string
  hint?: string
  placeholder?: string
  /** Hauteur du champ : sm 32px, md 40px (défaut), lg 48px. */
  size?: 'sm' | 'md' | 'lg'
  compact?: boolean
  disabled?: boolean
  invalid?: boolean
  /** Bouton d'effacement (croix) qui vide la valeur, à gauche de l'icône de fin. */
  clearable?: boolean
  /**
   * Icône d'ouverture du calendrier, à la fin du champ. La croix d'effacement de
   * `clearable` s'affiche à sa gauche sans la remplacer ; aucune icône n'est
   * rendue quand il n'y a pas de panneau (`showCalendar` à false en saisie).
   */
  calendarIcon?: IconSource
  /**
   * Format d'affichage de la date dans le champ (Intl.DateTimeFormat). Sans
   * objet en mode `input` (défaut), où le champ porte le masque numérique de la
   * locale : concerne donc `mode="readonly"` et les sélections `range` et
   * `multiple`, qui y retombent.
   */
  displayFormat?: Intl.DateTimeFormatOptions
  /** Placement du panneau par rapport au champ. */
  placement?: Placement
}

const props = withDefaults(defineProps<DatePickerProps>(), {
  selection: 'single',
  locale: undefined,
  firstDayOfWeek: undefined,
  min: undefined,
  max: undefined,
  disabledDates: undefined,
  showAdjacentDays: false,
  selectAdjacentDays: false,
  events: undefined,
  // `undefined` et non `'input'` : c'est ce qui distingue « prop non fournie »
  // d'un choix explicite, et donc ce qui permet de n'avertir que le
  // consommateur qui a vraiment demandé quelque chose d'inopérant.
  mode: undefined,
  showCalendar: false,
  label: undefined,
  hint: undefined,
  placeholder: undefined,
  size: 'md',
  compact: false,
  disabled: false,
  invalid: false,
  clearable: true,
  calendarIcon: 'calendar_today',
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

/** Mode demandé, replié sur le défaut si la valeur est absente ou inconnue. */
const requestedMode = computed<DatePickerMode>(() =>
  props.mode !== undefined && MODES.includes(props.mode) ? props.mode : 'input',
)
/**
 * Le mode saisie est réservé à la sélection simple : une plage ou une liste de
 * dates ne tient pas dans un champ unique masqué.
 */
const resolvedMode = computed<DatePickerMode>(() =>
  requestedMode.value === 'input' && props.selection === 'single' ? 'input' : 'readonly',
)
const typing = computed(() => resolvedMode.value === 'input')

/**
 * Le calendrier n'est optionnel qu'en saisie : en lecture seule, il est le seul
 * moyen de choisir une date.
 */
const hasPanel = computed(() => !typing.value || props.showCalendar)

if (isDev) {
  watchEffect(() => {
    if (props.mode !== undefined && !MODES.includes(props.mode))
      console.warn(
        `[DatePicker] mode « ${props.mode} » inconnu : utilisez « input » (défaut) ou « readonly ».`,
      )
    // `props.mode` et NON `requestedMode` : « input » étant le défaut, une
    // sélection range/multiple y retombe d'elle-même — seul celui qui a
    // explicitement demandé la saisie doit être averti.
    if (props.mode === 'input' && props.selection !== 'single')
      console.warn(
        `[DatePicker] mode="input" ignoré en sélection « ${props.selection} » : une plage ou une liste de dates ne se saisit pas au clavier.`,
      )
    // `typing` et non `props.mode` : la prop a bien été fournie et se trouve
    // réellement sans effet — l'avertissement reste actionnable.
    if (props.displayFormat && typing.value)
      console.warn(
        '[DatePicker] displayFormat est ignoré en mode « input » (défaut) : le champ affiche le masque numérique de la locale, seul format saisissable. Passez mode="readonly" pour un affichage formaté.',
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
    // Pas de panneau = rien à ouvrir. `disabled` est le point de coupure UNIQUE
    // du composable (openPanel + onControlClick) et toutes les voies d'ouverture
    // y passent : clic sur le contrôle, focus du champ, ArrowDown, Entrée, icône
    // de fin. Inutile de répéter la condition dans chaque handler.
    disabled: () => props.disabled || !hasPanel.value,
    focusInPanel: () => calendarRef.value?.focus(),
    // En saisie, le panneau s'ouvre sous le curseur sans le happer : la frappe
    // continue dans le champ, la flèche bas reste le chemin vers la grille.
    focusOnOpen: () => !typing.value,
  })

const hasValue = computed(() => {
  if (props.selection === 'multiple') return Array.isArray(model.value) && model.value.length > 0
  if (props.selection === 'range') {
    const r = model.value as DateRange | null
    return !!(r && (r.start || r.end))
  }
  return typeof model.value === 'string' && !!model.value
})

const dsLocale = useLocale()
/* Prop prioritaire, sinon locale globale du DS. DatePicker est la source
   UNIQUE : c'est `resolvedLocale` qui descend au Calendar, jamais `locale`
   (qui vaudrait `undefined`), sinon la balise serait résolue deux fois. */
const resolvedLocale = computed(() => props.locale ?? dsLocale.value)

const displayText = computed(() => {
  const locale = resolvedLocale.value
  const displayFormat = props.displayFormat ?? DEFAULT_DISPLAY_FORMAT
  if (props.selection === 'single') {
    return typeof model.value === 'string' && isValidISO(model.value)
      ? formatDisplay(model.value, locale, displayFormat)
      : ''
  }
  if (props.selection === 'range') {
    const r = model.value as DateRange | null
    if (!r?.start) return ''
    if (!r.end) return formatDisplay(r.start, locale, displayFormat)
    return formatDisplayRange(r.start, r.end, locale, displayFormat)
  }
  const list = Array.isArray(model.value) ? model.value : []
  return list.map((iso) => formatDisplay(iso, locale, displayFormat)).join(', ')
})

/* ── Mode saisie : brouillon masqué ─────────────────────────────────────── */

const mask = computed(() => dateMaskFor(resolvedLocale.value))
const maskHint = computed(() => maskPlaceholder(resolvedLocale.value, mask.value))
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

/*
 * La croix d'effacement passe par le `clearable` de l'Input, qui la rend À
 * GAUCHE de l'icône de fin (convention Input/Textarea/Combobox) : les deux
 * affordances coexistent. `clearVisible` est indispensable ici — le champ est
 * readonly hors saisie, et la valeur y vient du panneau.
 */
const canClear = computed(
  () => props.clearable && !props.disabled && (hasValue.value || (typing.value && !!draft.value)),
)
const endIcon = computed<IconSource | undefined>(() =>
  hasPanel.value ? props.calendarIcon : undefined,
)
/*
 * Le LIBELLÉ, lui, reste toujours défini, même quand aucune icône n'est rendue :
 * `useIconClickHandlers` avertit AU SETUP dès qu'un `@click:icon-end` est
 * attaché sans `iconEndLabel`, sans savoir si une icône est rendue. Le listener
 * étant posé en permanence et sa détection statique, un libellé conditionnel
 * ferait apparaître un faux avertissement au montage d'un champ sans calendrier.
 */
// Libellés : aucune prop dédiée, le dictionnaire est le seul point de
// surcharge — cf. `src/i18n/`.
const m = useMessages()

const endIconLabel = computed(() => m.value.datePicker.open)

function onEndIcon() {
  if (open.value) closeAndFocus()
  // Clic explicite sur l'icône calendrier : le focus a déjà quitté le champ
  // pour le bouton, l'emmener dans la grille est le bon geste dans les 2 modes.
  else openPanel(true)
}
/*
 * Appelé par `@clear` de l'Input, DANS son `emit` : le `focus()` posé ici sous
 * verrou rend le `controlEl.focus()` qu'Input exécute juste après inopérant
 * (élément déjà focalisé = aucun événement `focus` émis), donc le panneau ne se
 * rouvre pas. Retirer le verrou d'ici le rouvrirait.
 */
function clearValue() {
  model.value =
    props.selection === 'multiple'
      ? []
      : props.selection === 'range'
        ? { start: null, end: null }
        : null
  // `draft` explicitement : quand le modèle valait déjà `null`, la garde
  // anti-boucle de `syncDraftFromModel` ne le viderait pas.
  if (typing.value) writeField('')
  refocusing = true
  inputRef.value?.focus()
  refocusing = false
}

/** Sélection dans le calendrier : en mode simple, on ferme. */
function onSelect() {
  if (props.selection === 'single') closeAndFocus()
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
    :data-mode="resolvedMode"
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
        :clearable="clearable"
        :clear-visible="canClear"
        :clear-label="m.datePicker.clear"
        :icon-end="endIcon"
        :icon-end-label="endIconLabel"
        :aria-haspopup="hasPanel ? 'dialog' : undefined"
        :aria-expanded="hasPanel ? open : undefined"
        :aria-controls="hasPanel ? panelId : undefined"
        @click:icon-end="onEndIcon"
        @clear="clearValue"
        @focus="onFieldFocus"
        @input="onFieldInput"
        @change="commitOrRevert"
        @blur="commitOrRevert"
        @keydown="onFieldKeydown"
        @paste="onFieldPaste"
      />
    </div>

    <!-- Sans panneau monté, `panelRef` est nul : `open`, alimenté par le DOM du
         popover, ne peut plus passer à `true`. -->
    <Popover
      v-if="hasPanel"
      :id="panelId"
      ref="panelRef"
      v-model:open="open"
      mode="manual"
      anchor="--datepicker-anchor"
      :placement="placement"
      surface
      role="dialog"
      :aria-label="label ?? m.datePicker.label"
      class="ds-datepicker-panel"
      @mousedown="onPanelMousedown"
    >
      <Calendar
        ref="calendarRef"
        v-model="model"
        :selection="selection"
        :locale="resolvedLocale"
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
    anchor-scope: --datepicker-anchor;
    display: block;
    width: 100%;
    font-family: var(--vectis-text-family);
  }

  .ds-datepicker-control {
    anchor-name: --datepicker-anchor;
    display: block;
    cursor: pointer;
  }

  /* Mode saisie : le champ est éditable, le curseur texte de l'<input> reprend
     la main sur le `pointer` du contrôle (qui, lui, signale « ceci ouvre un
     panneau »). Le masque a une largeur fixe : chasse tabulaire, sinon le caret
     vibre d'un chiffre à l'autre. */
  .ds-datepicker[data-mode='input'] .ds-datepicker-control {
    cursor: text;
  }

  .ds-datepicker[data-mode='input'] .ds-input-control {
    font-variant-numeric: tabular-nums;
  }

  /* `position-anchor` et le chrome viennent de Popover (props `anchor` et
     `surface`, cette dernière posant `.ds-panel`) : il ne reste ici que les
     dimensions, que `panel.css` ne porte volontairement pas. Padding annulé —
     le Calendar gère sa propre respiration. */
  .ds-datepicker-panel {
    width: max-content;
    padding: 0;
  }
}
</style>
