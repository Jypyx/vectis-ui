<script setup lang="ts">
import { computed, ref, useAttrs, useId } from 'vue'
import type { StyleValue } from 'vue'

import Calendar from '../Calendar/Calendar.vue'
import type {
  CalendarEvent,
  CalendarMode,
  CalendarValue,
  DateMatcher,
  DateRange,
} from '../Calendar/Calendar.vue'
import { formatDisplay, formatDisplayRange, isValidISO } from '../Calendar/dateUtils'
import Input from '../Input/Input.vue'
import { usePopover } from '../../composables/usePopover'

/**
 * Sélecteur de date : champ `Input` (lecture seule) + `Calendar` dans un
 * panneau flottant. Composé des briques du DS ; ne réintroduit AUCUNE
 * dépendance ni positionnement JS.
 *
 * Le panneau est un `popover="manual"` ancré en pur CSS (`anchor-scope` sur la
 * racine + `anchor-name` sur le contrôle → `position-anchor`, cf. Tooltip /
 * Combobox). On ne passe pas par `popovertarget` (invalide sur un `<input>`
 * texte) : l'ouverture est programmatique, ce qui permet de **déplacer le focus
 * DOM dans la grille** du calendrier (modèle d'accessibilité correct). La
 * fermeture suit le pattern Combobox : `@focusout` sur la racine + Échap.
 */
type Placement = 'bottom' | 'bottom-start' | 'bottom-end' | 'top' | 'top-start' | 'top-end'

interface DatePickerProps {
  // ── Calendar (passe-plat) ──
  mode?: CalendarMode
  locale?: string
  firstDayOfWeek?: number
  min?: string
  max?: string
  disabledDates?: DateMatcher
  showAdjacentDays?: boolean
  selectAdjacentDays?: boolean
  events?: CalendarEvent[]
  // ── Champ ──
  label?: string
  hint?: string
  placeholder?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
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
  label: undefined,
  hint: undefined,
  placeholder: undefined,
  size: 'md',
  compact: false,
  disabled: false,
  invalid: false,
  clearable: true,
  displayFormat: () => ({ day: 'numeric', month: 'short', year: 'numeric' }),
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
const calendarRef = ref<InstanceType<typeof Calendar> | null>(null)
const panelId = useId()

// État d'ouverture du panneau : alimenté par les événements du popover (cf.
// usePopover), jamais écrit à la main — `openPanel`/`closePanel` passent par
// `show()`/`hide()`, dont les gardes évitent l'InvalidStateError.
const { shown: open, syncShown, show, hide } = usePopover(panelEl)

// ── Valeur affichée dans le champ (localisée) ───────────────────────────────
const hasValue = computed(() => {
  if (props.mode === 'multiple') return Array.isArray(model.value) && model.value.length > 0
  if (props.mode === 'range') {
    const r = model.value as DateRange | null
    return !!(r && (r.start || r.end))
  }
  return typeof model.value === 'string' && !!model.value
})

const displayText = computed(() => {
  const { locale, displayFormat } = props
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
  // multiple
  const list = Array.isArray(model.value) ? model.value : []
  return list.map((iso) => formatDisplay(iso, locale, displayFormat)).join(', ')
})

// L'icône de fin devient la croix d'effacement quand il y a une valeur.
const showClearIcon = computed(() => props.clearable && hasValue.value && !props.disabled)
const endIcon = computed(() => (showClearIcon.value ? 'close' : 'calendar_today'))
const endIconLabel = computed(() =>
  showClearIcon.value ? 'Effacer la date' : 'Ouvrir le calendrier',
)

// ── Ouverture / fermeture du panneau (popover manual) ───────────────────────
function openPanel() {
  if (props.disabled || open.value) return
  show()
  // focus DOM déplacé dans la grille (le natif ne le fait pas pour un manual)
  requestAnimationFrame(() => calendarRef.value?.focus())
}
function closePanel(refocus = false) {
  if (!open.value) return
  hide()
  if (refocus) inputRef.value?.focus()
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
  model.value =
    props.mode === 'multiple' ? [] : props.mode === 'range' ? { start: null, end: null } : null
  inputRef.value?.focus()
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    if (open.value) {
      event.preventDefault()
      closePanel(true)
    }
    return
  }
  if ((event.key === 'ArrowDown' || event.key === 'Enter') && !open.value) {
    event.preventDefault()
    openPanel()
  }
}

/** Fermeture quand le focus sort du composant (panneau compris, descendant DOM). */
function onFocusout(event: FocusEvent) {
  const next = event.relatedTarget as Node | null
  if (!next || !rootEl.value?.contains(next)) closePanel(false)
}

/** Sélection dans le calendrier : en mode simple, on ferme. */
function onSelect() {
  if (props.mode === 'single') closePanel(true)
}

const close = () => closePanel(true)
</script>

<template>
  <div
    ref="rootEl"
    class="ds-datepicker"
    :class="rootClass"
    :style="rootStyle"
    :data-open="open ? '' : undefined"
    @focusout="onFocusout"
    @keydown="onKeydown"
  >
    <div class="ds-datepicker-control" @click="onControlClick">
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
      :aria-label="label ?? 'Choisir une date'"
      class="ds-datepicker-panel ds-floating"
      :data-placement="placement"
      @beforetoggle="syncShown"
      @toggle="syncShown"
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
    </div>
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

  .ds-datepicker-panel {
    position-anchor: --ds-datepicker-anchor;
    /* le Calendar porte son propre fond ; le panneau épouse ses coins et ajoute
       l'ombre d'élévation (box-shadow, pas filter : drop-shadow() n'accepte
       qu'une seule ombre alors que --ds-shadow-* en empile deux). */
    width: max-content;
    padding: 0;
    border: none;
    background: transparent;
    border-radius: var(--ds-radius-overlay);
    box-shadow: var(--ds-shadow-4);
  }
}
</style>
