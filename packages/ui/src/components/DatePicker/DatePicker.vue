<script setup lang="ts">
import { computed, ref, useId } from 'vue'

import Calendar from '../Calendar/Calendar.vue'
import type {
  CalendarEvent,
  CalendarMode,
  CalendarValue,
  DateMatcher,
  DateRange,
} from '../Calendar/Calendar.vue'
import { formatDisplay, formatDisplayRange, isValidISO } from '../../utils/date'
import Input from '../Input/Input.vue'
import Popover from '../Popover/Popover.vue'

import { useRootAttrs } from '../../composables/useRootAttrs'

import { useFieldPanel } from '../../composables/useFieldPanel'

/**
 * Sélecteur de date : champ `Input` (lecture seule) + `Calendar` dans un
 * `Popover` en `mode="manual"`, ancré en pur CSS. On ne passe pas par le
 * `#trigger` de Popover (`popovertarget` est invalide sur un `<input>` texte) :
 * l'ouverture est programmatique, ce qui permet de déplacer le focus DOM dans
 * la grille du calendrier. Fermeture par `@focusout` sur la racine + Échap.
 */
type Placement = 'bottom' | 'bottom-start' | 'bottom-end' | 'top' | 'top-start' | 'top-end'

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

// Wrapper-root : class/style sur la racine, le reste reporté sur l'Input.
defineOptions({ inheritAttrs: false })
const { rootClass, rootStyle, forwardedAttrs } = useRootAttrs()

const rootEl = ref<HTMLElement | null>(null)
const panelRef = ref<InstanceType<typeof Popover> | null>(null)
const inputRef = ref<InstanceType<typeof Input> | null>(null)
const calendarRef = ref<InstanceType<typeof Calendar> | null>(null)
const panelId = useId()

// Coquille champ + panneau `manual` partagée avec le TimePicker : ouverture,
// fermeture, sortie de focus, clic sur le contrôle, Échap/ArrowDown/Entrée.
const { open, openPanel, closePanel, onControlClick, onFocusout, onKeydown } = useFieldPanel({
  rootEl,
  panelRef,
  fieldEl: inputRef,
  disabled: () => props.disabled,
  focusInPanel: () => calendarRef.value?.focus(),
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
  const list = Array.isArray(model.value) ? model.value : []
  return list.map((iso) => formatDisplay(iso, locale, displayFormat)).join(', ')
})

// L'icône de fin devient la croix d'effacement quand il y a une valeur.
const showClearIcon = computed(() => props.clearable && hasValue.value && !props.disabled)
const endIcon = computed(() => (showClearIcon.value ? 'close' : 'calendar_today'))
const endIconLabel = computed(() =>
  showClearIcon.value ? 'Effacer la date' : 'Ouvrir le calendrier',
)

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
