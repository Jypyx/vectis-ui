<script setup lang="ts">
import { computed, ref, useId, watch, watchEffect } from 'vue'

import VButton from '../VButton/VButton.vue'
import type { IconSource } from '../VIcon/types'
import VInput from '../VInput/VInput.vue'
import VPopover from '../VPopover/VPopover.vue'
import VToggle from '../VToggle/VToggle.vue'
import type { ToggleModelValue } from '../VToggle/VToggle.vue'
import VToggleItem from '../VToggle/VToggleItem.vue'
import VTimePickerDial from './VTimePickerDial.vue'
import {
  formatDisplay,
  formatTime,
  formatTimeMask,
  hourCycleFor,
  isValidTime,
  minutesOf,
  parseTime,
  parseTimeMask,
  snapMinute,
  timeCaret,
  timeList,
  timeToMask,
  to12h,
  to24h,
} from '../../utils/time'
import type { HourFormat, Meridiem, TimeOption } from '../../utils/time'
import { arrowNavigate } from '../../utils/arrowNav'
import { clamp } from '../../utils/number'
import { isDev } from '../../utils/env'
import { digitsOf, pad2 } from '../../utils/text'

import { useRootAttrs } from '../../composables/useRootAttrs'

import { useFieldPanel } from '../../composables/useFieldPanel'
import { useLocale, useMessages } from '../../i18n/state'

/**
 * Sélecteur d'heure : champ `VInput` + panneau flottant optionnel. Coquille
 * identique au VDatePicker (`VPopover` en `mode="manual"` ancré en pur CSS,
 * ouverture programmatique pour déplacer le focus dans le panneau, fermeture
 * par `@focusout` racine + Échap).
 *
 * Trois modes de champ (`mode`) : `input` (défaut — champ masqué « HH:MM »,
 * cadran optionnel via `showDial`), `readonly` (le cadran est le seul chemin)
 * et `list` (panneau listant les heures par pas de `minuteStep`).
 *
 * Le CADRAN travaille sur un brouillon : seul OK écrit le v-model (`'HH:mm'`
 * 24 h canonique) ; Annuler, Échap et la sortie de focus abandonnent. La LISTE,
 * elle, commite directement — choisir une heure y est un geste unique.
 */
export type TimePickerFormat = HourFormat
/** BREAKING : les valeurs ont changé (anciennement `'dial' | 'input'`). */
export type TimePickerMode = 'readonly' | 'input' | 'list'

const MODES: TimePickerMode[] = ['readonly', 'input', 'list']

type Placement = 'bottom' | 'bottom-start' | 'bottom-end' | 'top' | 'top-start' | 'top-end'

interface TimePickerProps {
  /** Cycle horaire affiché ; défaut : dérivé de la locale (`hourCycle` Intl). */
  format?: TimePickerFormat
  /**
   * Mode du champ :
   * - `input` (défaut) : champ éditable masqué « HH:MM », cadran optionnel ;
   * - `readonly` : lecture seule, le cadran est le seul chemin — d'où `showDial`
   *   forcé à `true` ;
   * - `list` : panneau des heures par pas de `minuteStep`, champ en lecture
   *   seule ; `showDial` y est sans objet.
   */
  mode?: TimePickerMode
  /**
   * Icône cliquable en fin de champ + popover du cadran (mode `input`). Laissée
   * à `undefined` par défaut plutôt qu'à `false` : c'est ce qui permet de
   * distinguer « non fournie » d'un `false` explicite, et donc de n'avertir en
   * mode `readonly` que le consommateur qui a vraiment demandé à la désactiver.
   */
  showDial?: boolean
  /** Granularité des minutes : cadran, flèches, et pas de la liste. */
  minuteStep?: number
  /**
   * Locale BCP 47 (noms de mois/jours, 1er jour de semaine). PRIORITAIRE sur la
   * locale globale du DS (`setLocale`), sur laquelle elle retombe à défaut —
   * d'où l'absence de défaut littéral ici : `undefined` doit rester
   * distinguable pour que la locale globale ait une chance de s'appliquer.
   */
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
  /** Bouton d'effacement (croix) qui vide la valeur, à gauche de l'icône de fin. */
  clearable?: boolean
  /**
   * Icône d'ouverture du CADRAN, à la fin du champ. Sans effet en `mode="list"`,
   * dont le chevron suit la convention du VCombobox. La croix d'effacement de
   * `clearable` s'affiche à sa gauche sans la remplacer.
   */
  clockIcon?: IconSource
  /** Placement du panneau par rapport au champ. */
  placement?: Placement
}

const props = withDefaults(defineProps<TimePickerProps>(), {
  format: undefined,
  // `undefined` et non `'input'` : c'est ce qui distingue « prop non fournie »
  // d'un choix explicite, et donc ce qui permet de n'avertir que le
  // consommateur qui a vraiment demandé quelque chose d'inopérant.
  mode: undefined,
  showDial: undefined,
  minuteStep: 1,
  locale: undefined,
  label: undefined,
  hint: undefined,
  placeholder: undefined,
  size: 'md',
  compact: false,
  disabled: false,
  invalid: false,
  clearable: true,
  clockIcon: 'schedule',
  placement: 'bottom-start',
})

/** Heure `'HH:mm'` 24 h canonique, quel que soit l'affichage 12 h / 24 h. */
const model = defineModel<string | null>({ default: null })

// ── Wrapper-root : class/style sur la racine, reste reporté sur le VInput ──────
defineOptions({ inheritAttrs: false })
const { rootClass, rootStyle, forwardedAttrs } = useRootAttrs()

const rootEl = ref<HTMLElement | null>(null)
const panelRef = ref<InstanceType<typeof VPopover> | null>(null)
const inputRef = ref<InstanceType<typeof VInput> | null>(null)
const panelId = useId()

/** L'`<input>` natif du champ (masque, caret) — exposé par `VInput`. */
const fieldEl = computed<HTMLInputElement | null>(() => inputRef.value?.el ?? null)

const resolvedMode = computed<TimePickerMode>(() => {
  // Le `??` passe AVANT la validation : une prop absente n'est pas une valeur
  // « inconnue », elle ne doit donc rien déclencher.
  const mode = props.mode ?? 'input'
  return MODES.includes(mode) ? mode : 'input'
})
const typing = computed(() => resolvedMode.value === 'input')
const isList = computed(() => resolvedMode.value === 'list')
/** Le cadran : imposé en lecture seule, opt-in en saisie, sans objet en liste. */
const hasDial = computed(
  () => resolvedMode.value === 'readonly' || (typing.value && props.showDial === true),
)
const hasPanel = computed(() => hasDial.value || isList.value)

const dsLocale = useLocale()
/* Prop prioritaire, sinon locale globale du DS. */
const resolvedLocale = computed(() => props.locale ?? dsLocale.value)

const resolvedFormat = computed<TimePickerFormat>(
  () => props.format ?? hourCycleFor(resolvedLocale.value),
)

if (isDev) {
  watchEffect(() => {
    if (props.minuteStep < 1 || 60 % props.minuteStep !== 0)
      console.warn(`[VTimePicker] minuteStep ${props.minuteStep} — un diviseur de 60 est attendu.`)
    if (props.mode !== undefined && !MODES.includes(props.mode))
      console.warn(
        `[VTimePicker] mode « ${props.mode} » inconnu : utilisez « input » (défaut), « readonly » ou « list » — l'ancien « dial » s'appelle désormais « readonly ».`,
      )
    if (resolvedMode.value === 'readonly' && props.showDial === false)
      console.warn(
        '[VTimePicker] showDial est forcé à true en mode « readonly » : sans cadran, un champ en lecture seule serait impossible à remplir.',
      )
    if (isList.value && props.showDial === true)
      console.warn(
        '[VTimePicker] showDial est ignoré en mode « list » : la liste des heures est le seul panneau.',
      )
    if (isList.value && props.minuteStep < 5)
      console.warn(
        `[VTimePicker] minuteStep ${props.minuteStep} en mode « list » rendrait ${Math.ceil(1440 / props.minuteStep)} rangées : un pas de 15 ou 30 minutes est attendu.`,
      )
  })
}

const activeStep = ref<'hour' | 'minute'>('hour')

// ── Brouillon du CADRAN (commité par OK seulement) ──────────────────────────
const draftHour = ref(0) // 24 h canonique
const draftMinute = ref(0)

const modelParts = computed(() => parseTime(model.value))

/**
 * Méridien retenu tant qu'AUCUNE heure n'est posée : le VToggle est `mandatory`,
 * il lui faut toujours une valeur, et `null` n'en est pas une. 'AM' en dur (et
 * non l'heure courante) : déterministe, donc SSR-safe et testable.
 */
const pendingMeridiem = ref<Meridiem>('AM')

/**
 * Le VToggle AM/PM vit HORS du panneau, sur la rangée du champ : il pilote donc
 * le v-model, et non plus le brouillon du cadran.
 */
const meridiemModel = computed<ToggleModelValue>({
  get: () => (modelParts.value ? to12h(modelParts.value.hour).meridiem : pendingMeridiem.value),
  set: (value) => {
    const meridiem: Meridiem = value === 'PM' ? 'PM' : 'AM'
    pendingMeridiem.value = meridiem
    const parts = modelParts.value
    // Sans valeur, il n'y a rien à convertir : le choix est MÉMORISÉ et
    // s'appliquera à la première heure saisie ou choisie.
    if (parts) model.value = formatTime(to24h(to12h(parts.hour).hour, meridiem), parts.minute)
    // Cadran ouvert : le brouillon suit, sinon OK réécrirait l'ancien méridien.
    if (open.value && hasDial.value) draftHour.value = to24h(to12h(draftHour.value).hour, meridiem)
  },
})

const displayHourText = computed(() =>
  pad2(resolvedFormat.value === '12h' ? to12h(draftHour.value).hour : draftHour.value),
)

// ── Valeur affichée dans le champ ───────────────────────────────────────────
const hasValue = computed(() => !!modelParts.value)
const displayText = computed(() =>
  model.value ? formatDisplay(model.value, resolvedLocale.value, resolvedFormat.value) : '',
)

// ── Ouverture / fermeture du panneau (popover manual) ───────────────────────
function focusInPanel() {
  const panel = panelRef.value?.el
  if (!panel) return
  if (isList.value) focusListSelection(panel)
  // Le panneau ne montre plus que le cadran : le slider est la cible utile. Une
  // requête DOM plutôt qu'un expose — VTimePickerDial n'en a aucun, et n'a donc
  // pas à changer.
  else panel.querySelector<HTMLElement>('[role="slider"]')?.focus()
}

// Coquille champ + panneau `manual` partagée avec le VDatePicker. Le prologue
// d'ouverture (brouillon, étape) et l'épilogue de fermeture (live region) sont
// les seules parties propres au VTimePicker.
const { open, openPanel, closePanel, onControlClick, onFocusout, onKeydown, onPanelMousedown } =
  useFieldPanel({
    rootEl,
    panelRef,
    fieldEl: inputRef,
    // Pas de panneau = rien à ouvrir. `disabled` est le point de coupure UNIQUE
    // du composable (openPanel + onControlClick) et toutes les voies d'ouverture
    // y passent : clic, focus, ArrowDown, Entrée, icône de fin.
    disabled: () => props.disabled || !hasPanel.value,
    focusInPanel,
    // En saisie, le panneau s'ouvre sous le curseur sans le happer.
    focusOnOpen: () => !typing.value,
    onOpen: () => {
      // Brouillon : propre au cadran — la liste commite directement.
      if (!hasDial.value) return
      const parts = modelParts.value
      if (parts) {
        draftHour.value = parts.hour
        draftMinute.value = parts.minute
      } else {
        const now = new Date() // handler → client only
        draftHour.value = now.getHours()
        draftMinute.value = snapMinute(now.getMinutes(), props.minuteStep)
      }
      activeStep.value = 'hour'
    },
    onClose: () => {
      liveMessage.value = ''
    },
  })

/**
 * Le focus rendu au champ à la fermeture le rouvrirait (en saisie, le panneau
 * s'ouvre AU FOCUS) : ce verrou couvre l'appel, synchrone, de `focus()`. Toute
 * fermeture avec refocus doit passer par ici — un `closePanel(true)` direct
 * réintroduit la boucle.
 */
let refocusing = false
function closeAndFocus() {
  refocusing = true
  closePanel(true)
  refocusing = false
}

/** OK : seul chemin du CADRAN qui écrit le v-model. */
function confirm() {
  model.value = formatTime(draftHour.value, draftMinute.value)
  closeAndFocus()
}

function cancel() {
  closeAndFocus()
}

/** Étape arrêtée au cadran : heure → minutes ; minutes → OK au clavier
    seulement (le relâcher du pointeur ne doit pas fermer le panneau). */
function onDialConfirm(via: 'pointer' | 'keyboard') {
  if (activeStep.value === 'hour') activeStep.value = 'minute'
  else if (via === 'keyboard') confirm()
}

/*
 * Appelé par `@clear` de le VInput, DANS son `emit` : le `focus()` posé ici sous
 * verrou rend le `controlEl.focus()` que VInput exécute juste après inopérant
 * (élément déjà focalisé = aucun événement `focus` émis), donc le panneau ne se
 * rouvre pas. Retirer le verrou d'ici le rouvrirait.
 */
function clearValue() {
  model.value = null
  // `draft` explicitement : quand le modèle valait déjà `null`, la garde
  // anti-boucle de `syncMaskFromModel` ne le viderait pas.
  if (typing.value) writeField('')
  refocusing = true
  inputRef.value?.focus()
  refocusing = false
}

// Échap et la sortie de focus ferment SANS commit (sémantique Annuler du
// cadran) : `closePanel` n'écrit jamais le v-model, seul `confirm()` le fait.

// L'étape n'est portée que par l'aria-label du slider, dont le changement n'est
// pas annoncé de façon fiable : une live region polie double l'information.
// Aucune prop dédiée : le dictionnaire est le seul point de surcharge.
const m = useMessages()

const liveMessage = ref('')
watch(activeStep, (step) => {
  if (open.value)
    liveMessage.value =
      step === 'minute' ? m.value.timePicker.minuteStep : m.value.timePicker.hourStep
})

/* ── Mode saisie : masque « HH:MM » ─────────────────────────────────────── */

const maskDraft = ref('')

function syncMaskFromModel() {
  const next = timeToMask(model.value, resolvedFormat.value)
  // Garde anti-boucle : un commit en cours de frappe repasse ici et écraserait
  // le brouillon ET le caret par un texte identique.
  if (next !== maskDraft.value) maskDraft.value = next
}
watch([model, resolvedFormat], syncMaskFromModel, { immediate: true })

/**
 * `v-model` et JAMAIS `:model-value` : sans écouteur `onUpdate:modelValue`,
 * `useModel` recopie en interne le texte BRUT tapé et le réécrit au patch
 * suivant, effaçant le masque dès qu'il ne change pas lui-même (5e chiffre,
 * caractère refusé). Couvert par un test.
 */
const fieldModel = computed<string | number>({
  get: () => (typing.value ? maskDraft.value : displayText.value),
  set: (value) => {
    if (typing.value) maskDraft.value = String(value ?? '')
  },
})

/** Écrit le brouillon ET le DOM : Vue ne repatche pas un texte masqué inchangé. */
function writeField(text: string, caret?: number) {
  maskDraft.value = text
  const el = fieldEl.value
  if (!el) return
  if (el.value !== text) el.value = text
  if (caret !== undefined) el.setSelectionRange(caret, caret)
}

const currentMeridiem = (): Meridiem => (meridiemModel.value === 'PM' ? 'PM' : 'AM')

/** Commit au fil de la frappe, dès que l'heure est complète et valide. */
function commitLive() {
  const time = parseTimeMask(maskDraft.value, resolvedFormat.value, currentMeridiem())
  if (time && time !== model.value) model.value = time
}

/**
 * Sortie du champ (`change` puis `blur`, d'où l'idempotence) : normalisation ou
 * REVERT SILENCIEUX — pas d'état d'erreur maison qui entrerait en concurrence
 * avec la prop `invalid`.
 */
function commitOrRevert() {
  if (!typing.value) return
  if (!digitsOf(maskDraft.value)) {
    if (model.value !== null) model.value = null
    writeField('')
    return
  }
  const time = parseTimeMask(maskDraft.value, resolvedFormat.value, currentMeridiem())
  if (time) {
    if (time !== model.value) model.value = time
    writeField(timeToMask(time, resolvedFormat.value))
    return
  }
  writeField(timeToMask(model.value, resolvedFormat.value))
}

/**
 * Masque à la frappe. Invariant : le nombre de chiffres à GAUCHE du caret est
 * conservé par le reformatage — les positions absolues sautent dès que le `:`
 * apparaît ou disparaît.
 */
function onFieldInput(event: Event) {
  if (!typing.value) return
  const el = event.target as HTMLInputElement
  const raw = el.value
  const caret = el.selectionStart ?? raw.length
  const before = digitsOf(raw.slice(0, caret)).length
  const digits = digitsOf(raw).slice(0, 4)
  // Le caret ne franchit le séparateur qu'en insertion : à la suppression il
  // doit rester devant, sinon la touche ne progresse jamais.
  const deleting = String((event as InputEvent).inputType ?? '').startsWith('delete')
  writeField(formatTimeMask(digits), timeCaret(Math.min(before, digits.length), !deleting))
  commitLive()
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
  if (event.key === 'ArrowDown' && open.value && hasDial.value) {
    // seul chemin explicite du champ vers le cadran
    event.preventDefault()
    focusInPanel()
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
      // Le `:` est POSÉ par le masque, jamais saisi : on efface le chiffre qui
      // le précède — sinon le masque le réécrit et la touche paraît morte.
      event.preventDefault()
      const n = digitsOf(el.value.slice(0, start)).length
      const digits = digitsOf(el.value)
      writeField(formatTimeMask(digits.slice(0, n - 1) + digits.slice(n)), timeCaret(n - 1))
      commitLive()
    }
    return
  }
  // Un caractère non numérique — le « : » compris, donc « 9:30 » se tape tel
  // quel — complète l'heure par un zéro de tête et passe aux minutes.
  if (
    event.key.length === 1 &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.altKey &&
    !/\d/.test(event.key)
  ) {
    event.preventDefault()
    const digits = digitsOf(el.value)
    if (digits.length === 1) writeField(formatTimeMask(`0${digits}`), 3)
  }
}

/** Collage : « 19:05 » ou « 1905 » adoptés, sinon seuls les chiffres entrent. */
function onFieldPaste(event: ClipboardEvent) {
  if (!typing.value) return
  const el = fieldEl.value
  if (!el) return
  event.preventDefault()
  const pasted = (event.clipboardData?.getData('text') ?? '').trim()
  // Une heure canonique 24 h collée reste lue en 24 h, quel que soit l'affichage.
  if (isValidTime(pasted)) {
    const text = timeToMask(pasted, resolvedFormat.value)
    writeField(text, text.length)
    if (pasted !== model.value) model.value = pasted
    return
  }
  const digits = digitsOf(el.value)
  const start = el.selectionStart ?? el.value.length
  const end = el.selectionEnd ?? start
  const from = digitsOf(el.value.slice(0, start)).length
  const to = digitsOf(el.value.slice(0, end)).length
  const inserted = digitsOf(pasted)
  const next = (digits.slice(0, from) + inserted + digits.slice(to)).slice(0, 4)
  writeField(formatTimeMask(next), timeCaret(Math.min(from + inserted.length, next.length), true))
  commitLive()
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

/* ── Mode liste ─────────────────────────────────────────────────────────── */

const options = computed<TimeOption[]>(() =>
  isList.value ? timeList(props.minuteStep, resolvedLocale.value, resolvedFormat.value) : [],
)

/**
 * Liste PROPRE (idiome VMenuPanel) et non `navigableItems` : celui-ci appelle
 * `getComputedStyle` sur CHAQUE élément — inacceptable sur des dizaines de
 * rangées, et aucune n'est masquée ici.
 */
const optionEls = (panel: HTMLElement) => [
  ...panel.querySelectorAll<HTMLElement>('[role="option"]'),
]

/** Ouverture : focus ET défilement sur la valeur courante — ou la plus proche,
    « 09:07 » avec un pas de 15 ne tombant sur aucune rangée. */
function focusListSelection(panel: HTMLElement) {
  const items = optionEls(panel)
  if (!items.length) return
  const minutes = minutesOf(model.value)
  const index =
    minutes === null ? 0 : clamp(Math.round(minutes / props.minuteStep), 0, items.length - 1)
  const el = items[index]
  // `?.()` : jsdom n'implémente pas scrollIntoView. Pas de `behavior`, qui
  // ignorerait `scroll-behavior` et prefers-reduced-motion (précédent VTabs).
  el?.scrollIntoView?.({ block: 'center' })
  el?.focus({ preventScroll: true })
}

/** Clic ou Entrée sur une rangée : commit DIRECT + fermeture (modèle
    `VDatePicker.onSelect`) — ni brouillon, ni pied de panneau. */
function selectTime(value: string) {
  model.value = value
  closeAndFocus()
}

function onPanelKeydown(event: KeyboardEvent) {
  if (!isList.value) return
  const panel = panelRef.value?.el
  if (!panel) return
  if (event.key === 'Enter' || event.key === ' ') {
    // preventDefault OBLIGATOIRE : sans lui l'Entrée déclenche le clic natif du
    // <button> (donc la fermeture) PUIS remonte à la racine sans être marquée
    // consommée — la garde `defaultPrevented` de useFieldPanel ne joue pas et
    // le panneau se rouvre aussitôt. On commite donc explicitement.
    const value = (document.activeElement as HTMLElement | null)?.closest<HTMLElement>(
      '[role="option"]',
    )?.dataset.value
    if (!value) return
    event.preventDefault()
    selectTime(value)
    return
  }
  arrowNavigate(event, panel, optionEls(panel), { vertical: true })
}

/* ── Croix d'effacement et icône de fin ─────────────────────────────────── */

/*
 * La croix passe par le `clearable` de le VInput, qui la rend À GAUCHE de l'icône
 * de fin (convention VInput/VTextarea/VCombobox) : les deux affordances coexistent,
 * et en mode liste on retrouve exactement le couple croix + chevron du VCombobox.
 * `clearVisible` est indispensable ici — le champ est readonly hors saisie, et
 * la valeur y vient du panneau.
 */
const canClear = computed(
  () =>
    props.clearable && !props.disabled && (hasValue.value || (typing.value && !!maskDraft.value)),
)
const endIcon = computed<IconSource | undefined>(() =>
  isList.value ? 'expand_more' : hasDial.value ? props.clockIcon : undefined,
)
/*
 * Le LIBELLÉ, lui, reste toujours défini, même quand aucune icône n'est rendue :
 * `useIconClickHandlers` avertit AU SETUP dès qu'un `@click:icon-end` est
 * attaché sans `iconEndLabel`, sans savoir si une icône est rendue. Le listener
 * étant posé en permanence et sa détection statique, un libellé conditionnel
 * ferait un faux avertissement au montage d'une saisie sans cadran.
 */
const endIconLabel = computed(() =>
  isList.value ? m.value.timePicker.openList : m.value.timePicker.openDial,
)

function onEndIcon() {
  if (open.value) closeAndFocus()
  else openPanel(true)
}
</script>

<template>
  <div
    ref="rootEl"
    class="v-timepicker"
    :class="rootClass"
    :style="rootStyle"
    :data-open="open ? '' : undefined"
    :data-mode="resolvedMode"
    @focusout="onFocusout"
    @keydown="onRootKeydown"
  >
    <div class="v-timepicker-row">
      <div class="v-timepicker-control" @click="onControlClick">
        <VInput
          ref="inputRef"
          v-model="fieldModel"
          :inputmode="typing ? 'numeric' : undefined"
          :autocomplete="typing ? 'off' : undefined"
          v-bind="forwardedAttrs"
          :readonly="!typing"
          :label="label"
          :hint="hint"
          :placeholder="placeholder ?? (typing ? m.timePicker.maskPlaceholder : undefined)"
          :size="size"
          :compact="compact"
          :disabled="disabled"
          :invalid="invalid"
          :clearable="clearable"
          :clear-visible="canClear"
          :clear-label="m.timePicker.clear"
          :icon-end="endIcon"
          :icon-end-label="endIconLabel"
          :aria-haspopup="hasPanel ? (isList ? 'listbox' : 'dialog') : undefined"
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

      <!-- Le méridien vit HORS du panneau : il sert les trois modes et pilote
           directement le v-model. Toujours dans la racine, donc cliquer dessus
           ne déclenche pas le `focusout` qui fermerait le panneau. -->
      <VToggle
        v-if="resolvedFormat === '12h'"
        v-model="meridiemModel"
        class="v-timepicker-meridiem"
        mandatory
        variant="outline"
        :size="size"
        :compact="compact"
        :label="m.timePicker.meridiem"
      >
        <VToggleItem value="AM" :label="m.timePicker.am" />
        <VToggleItem value="PM" :label="m.timePicker.pm" />
      </VToggle>
    </div>

    <!-- Sans panneau monté, `panelRef` est nul : `open`, alimenté par le DOM du
         popover, ne peut plus passer à `true`. -->
    <VPopover
      v-if="hasPanel"
      :id="panelId"
      ref="panelRef"
      v-model:open="open"
      mode="manual"
      anchor="--timepicker-anchor"
      :placement="placement"
      surface
      :role="isList ? 'listbox' : 'dialog'"
      :class="isList ? 'v-timepicker-list v-control' : 'v-timepicker-panel'"
      :data-size="isList ? size : undefined"
      :data-compact="isList && compact ? '' : undefined"
      :aria-label="label ?? (isList ? m.timePicker.listLabel : m.timePicker.dialLabel)"
      @mousedown="onPanelMousedown"
      @keydown="onPanelKeydown"
    >
      <!-- Mode liste : rangées `option`, focus DOM dans le panneau (modèle
           VMenu/VCalendar), commit direct au clic ou à l'Entrée. -->
      <template v-if="isList">
        <button
          v-for="option in options"
          :key="option.value"
          type="button"
          role="option"
          tabindex="-1"
          class="v-timepicker-option"
          :data-value="option.value"
          :aria-selected="option.value === model ? 'true' : 'false'"
          @click="selectTime(option.value)"
        >
          {{ option.label }}
        </button>
      </template>

      <template v-else>
        <!-- Les cellules basculent l'étape active : `tone` accent = étape en
             cours (variant tonal → le couple de fonds de l'ancien aria-pressed). -->
        <div class="v-timepicker-time">
          <VButton
            class="v-timepicker-cell"
            variant="ghost"
            size="lg"
            :tone="activeStep === 'hour' ? 'accent' : 'neutral'"
            :aria-pressed="activeStep === 'hour' ? 'true' : 'false'"
            :aria-label="m.timePicker.selectHour"
            @click="activeStep = 'hour'"
          >
            {{ displayHourText }}
          </VButton>
          <span class="v-timepicker-sep" aria-hidden="true">:</span>
          <VButton
            class="v-timepicker-cell"
            variant="ghost"
            size="lg"
            :tone="activeStep === 'minute' ? 'accent' : 'neutral'"
            :aria-pressed="activeStep === 'minute' ? 'true' : 'false'"
            :aria-label="m.timePicker.selectMinute"
            @click="activeStep = 'minute'"
          >
            {{ pad2(draftMinute) }}
          </VButton>
        </div>

        <VTimePickerDial
          :step="activeStep"
          :format="resolvedFormat"
          :hour="draftHour"
          :minute="draftMinute"
          :minute-step="minuteStep"
          @update:hour="draftHour = $event"
          @update:minute="draftMinute = $event"
          @confirm-step="onDialConfirm"
        />

        <div class="v-visually-hidden" aria-live="polite">{{ liveMessage }}</div>

        <div class="v-timepicker-footer">
          <VButton variant="ghost" tone="neutral" @click="cancel">{{ m.common.cancel }}</VButton>
          <VButton @click="confirm">{{ m.common.confirm }}</VButton>
        </div>
      </template>
    </VPopover>
  </div>
</template>

<style>
@layer vectis.components {
  .v-timepicker {
    /* confine l'ancre à cette instance (racine = ancêtre commun contrôle/panneau) */
    anchor-scope: --timepicker-anchor;
    display: block;
    width: 100%;
    font-family: var(--vectis-text-family);
  }

  /* Rangée du champ : le champ prend la place restante, le VToggle AM/PM sa
     largeur intrinsèque. */
  .v-timepicker-row {
    display: flex;
    align-items: stretch;
    gap: var(--vectis-space-2);
  }

  .v-timepicker-control {
    anchor-name: --timepicker-anchor;
    flex: 1;
    /* sans lui, le minimum automatique du flex item ferait déborder le champ */
    min-inline-size: 0;
    cursor: pointer;
  }

  /* Mode saisie : le champ est éditable, le curseur texte reprend la main sur
     le `pointer` du contrôle. Le masque a une largeur fixe : chasse tabulaire,
     sinon le caret vibre d'un chiffre à l'autre. */
  .v-timepicker[data-mode='input'] .v-timepicker-control {
    cursor: text;
  }

  .v-timepicker[data-mode='input'] .v-input-control {
    font-variant-numeric: tabular-nums;
  }

  /* Le VToggle s'aligne sur le CHAMP, pas sur le bloc VInput (qui empile
     label / champ / hint) : on compense en marges la hauteur du label et du
     hint. Sa propre hauteur égale celle du champ (mêmes size/compact). */
  .v-timepicker-meridiem {
    flex: none;
    align-self: center;
  }

  .v-timepicker-row:has(.v-input-label) .v-timepicker-meridiem {
    margin-block-start: calc(
      var(--vectis-text-label-size) * var(--vectis-text-label-leading) + var(--vectis-space-1)
    );
  }

  .v-timepicker-row:has(.v-input-hint) .v-timepicker-meridiem {
    margin-block-end: calc(
      var(--vectis-text-caption-size) * var(--vectis-text-caption-leading) + var(--vectis-space-1)
    );
  }

  /* `position-anchor` et le chrome viennent de VPopover (props `anchor` et
     `surface`, cette dernière posant `.v-panel`) : il ne reste ici que la mise
     en colonne et le padding propres au cadran. Le `display: flex` d'auteur
     écrase le `display: none` UA de [popover] : c'est le garde-fou
     `.v-overlay:not(:popover-open)` qui referme. */
  .v-timepicker-panel {
    display: flex;
    flex-direction: column;
    gap: var(--vectis-space-4);
    width: max-content;
    padding: var(--vectis-space-3);
    color: var(--vectis-color-text);
  }

  /* Une heure numérique se lit toujours HH:MM : sans ce ltr forcé, le bidi
     réordonnerait les cellules en RTL. */
  .v-timepicker-time {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--vectis-space-2);
    direction: ltr;
  }

  /* Cellules HH/MM : des VButton du DS (variant `tonal`, tone accent à l'étape
     active — leur couple `--tone-bg-soft`/`--tone-text-tinted` reproduit exactement
     l'ancien surface-muted/text ↔ accent-surface/accent-text). La surcharge se
     limite au gabarit « grand chiffre » : hauteur, états, focus et transitions
     viennent de VButton. Qualifiée [data-size] (modèle VIconButton/VTabs) :
     l'ordre d'export n'est pas contraignant. */
  .v-timepicker-cell[data-size] {
    width: var(--control-height);
    font-size: var(--vectis-text-heading-1-size);
    font-weight: var(--vectis-text-heading-2-weight);
    /* « 11 » et « 00 » ne doivent pas décaler la cellule */
    font-variant-numeric: tabular-nums;
  }

  .v-timepicker-sep {
    font-size: var(--vectis-text-heading-2-size);
    color: var(--vectis-color-text);
    user-select: none;
  }

  .v-timepicker-panel .v-timepicker-dial-face {
    align-self: center;
  }

  /* Mode liste : le chrome vient de `.v-panel` (prop `surface` de VPopover) et
     le gabarit des rangées de `v-control` posé sur le PANNEAU. Seules les
     dimensions restent ici — `panel.css` n'en porte aucune. */
  .v-timepicker-list {
    min-inline-size: anchor-size(width);
    max-block-size: var(--vectis-control-size-timepicker-list-max-block);
    overflow: auto;
  }

  .v-timepicker-option {
    display: flex;
    align-items: center;
    width: 100%;
    min-height: var(--control-height);
    padding: var(--vectis-space-1) var(--control-padding-inline);
    border: none;
    border-radius: var(--vectis-radius-sm);
    background: transparent;
    color: var(--vectis-color-text);
    font-family: inherit;
    font-size: var(--control-font-size);
    line-height: var(--vectis-text-body-md-leading);
    font-variant-numeric: tabular-nums;
    text-align: start;
    cursor: pointer;
  }

  .v-timepicker-option:hover {
    background: var(--vectis-color-surface-muted);
  }

  /* Anneau INTÉRIEUR : le panneau défile, un offset positif serait rogné
     (précédent VTabs). */
  .v-timepicker-option:focus-visible {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: calc(-1 * var(--vectis-focus-ring-width));
  }

  .v-timepicker-option[aria-selected='true'] {
    background: var(--vectis-color-accent-surface);
    color: var(--vectis-color-accent-text);
  }

  .v-timepicker-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--vectis-space-2);
  }
}
</style>
