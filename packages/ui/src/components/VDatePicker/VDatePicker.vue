<script setup lang="ts">
import { computed, ref, useId, watchEffect } from 'vue'

import VCalendar from '../VCalendar/VCalendar.vue'
import type {
  CalendarEvent,
  CalendarSelection,
  CalendarValue,
  DateMatcher,
  DateRange,
} from '../VCalendar/VCalendar.vue'
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
import type { IconSource } from '../VIcon/types'
import VInput from '../VInput/VInput.vue'
import VPopover from '../VPopover/VPopover.vue'

import { useRootAttrs } from '../../composables/useRootAttrs'

import { useFieldPanel } from '../../composables/useFieldPanel'
import { useMaskedField } from '../../composables/useMaskedField'
import { useLocale, useMessages } from '../../i18n/state'

/**
 * A date picker: a `VInput` field + a `VCalendar` inside a `VPopover` in
 * `mode="manual"`, anchored in pure CSS. VPopover's `#trigger` is not used
 * (`popovertarget` is invalid on a text `<input>`): the opening is programmatic, which
 * is what allows moving the DOM focus into the calendar's grid. Closing happens through
 * `@focusout` on the root + Escape.
 *
 * Two field modes (the `mode` prop): `input` (the default), where the field is typed on
 * the keyboard behind a numeric mask derived from the locale — the user types digits
 * only, and the separators are placed as they go — and `readonly`, where the date can
 * only be chosen from the calendar. The `selection` prop, meanwhile, is the pass-through
 * of VCalendar's selection mode.
 */
type Placement = 'bottom' | 'bottom-start' | 'bottom-end' | 'top' | 'top-start' | 'top-end'

/** Field mode: masked keyboard input (the default) or read-only. */
export type DatePickerMode = 'readonly' | 'input'

const MODES: DatePickerMode[] = ['readonly', 'input']

/**
 * The century a 2-digit year expands into ("10/06/26" → 2026), applied on leaving the
 * field only. A FIXED pivot, not a sliding one: a rule derived from the current year
 * would make the component non-deterministic (the same reason as VCalendar's `today`,
 * set in `onMounted`) and would date its tests.
 */
const YEAR_PIVOT = 2000

const DEFAULT_DISPLAY_FORMAT: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
}

interface DatePickerProps {
  // Pass-through to VCalendar.
  selection?: CalendarSelection
  /**
   * A BCP 47 locale (month/day names, the first day of the week). It TAKES PRECEDENCE
   * over the DS's global locale (`setLocale`), which it falls back to — hence the
   * absence of a literal default here: `undefined` must stay distinguishable for the
   * global locale to have a chance to apply.
   */
  locale?: string
  firstDayOfWeek?: number
  min?: string
  max?: string
  disabledDates?: DateMatcher
  showAdjacentDays?: boolean
  selectAdjacentDays?: boolean
  events?: CalendarEvent[]
  // The field.
  /**
   * `input` (the default): the field is typed on the keyboard, in the locale's numeric
   * mask. `readonly`: the date can only be chosen from the calendar. Typing is reserved
   * for the `single` selection — a range or a list falls back to `readonly`.
   */
  mode?: DatePickerMode
  /**
   * Displays the calendar under the field in input mode: a clickable icon at the end of
   * the field + a panel opened on focus. No effect in read-only mode, where the calendar
   * is the only way to choose a date.
   */
  showCalendar?: boolean
  label?: string
  hint?: string
  placeholder?: string
  /** Field height: sm 32px, md 40px (the default), lg 48px. */
  size?: 'sm' | 'md' | 'lg'
  compact?: boolean
  disabled?: boolean
  invalid?: boolean
  /** A clear button (a cross) emptying the value, to the left of the end icon. */
  clearable?: boolean
  /**
   * The calendar-opening icon, at the end of the field. `clearable`'s clear cross shows
   * to its left without replacing it; no icon is rendered when there is no panel
   * (`showCalendar` false in input mode).
   */
  calendarIcon?: IconSource
  /**
   * Display format of the date in the field (Intl.DateTimeFormat). Pointless in `input`
   * mode (the default), where the field carries the locale's numeric mask: it therefore
   * concerns `mode="readonly"` and the `range` and `multiple` selections, which fall
   * back to it.
   */
  displayFormat?: Intl.DateTimeFormatOptions
  /** Placement of the panel relative to the field. */
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
  // `undefined` and not `'input'`: that is what distinguishes "prop not supplied" from
  // an explicit choice, and hence what makes it possible to warn only the consumer who
  // really asked for something inoperative.
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
  // `undefined` and not the object itself: that is what makes the prop detectable (the
  // dev guard in input mode, where it does not apply).
  displayFormat: undefined,
  placement: 'bottom-start',
})

const model = defineModel<CalendarValue>({ default: null })

defineSlots<{
  /** Custom content of a day cell (relayed to VCalendar). */
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
  /** Footer zone of the panel; it receives `close` to close from a button or a preset. */
  footer?(props: { close: () => void }): unknown
}>()

// Wrapper-root: class/style on the root, the rest carried over to the VInput.
defineOptions({ inheritAttrs: false })
const { rootClass, rootStyle, forwardedAttrs } = useRootAttrs()

const rootEl = ref<HTMLElement | null>(null)
const panelRef = ref<InstanceType<typeof VPopover> | null>(null)
const inputRef = ref<InstanceType<typeof VInput> | null>(null)
const calendarRef = ref<InstanceType<typeof VCalendar> | null>(null)
const panelId = useId()

/** The field's native `<input>` (mask, caret) — exposed by `VInput`. */
const fieldEl = computed<HTMLInputElement | null>(() => inputRef.value?.el ?? null)

/** The requested mode, folded back to the default when the value is absent or unknown. */
const requestedMode = computed<DatePickerMode>(() =>
  props.mode !== undefined && MODES.includes(props.mode) ? props.mode : 'input',
)
/**
 * Input mode is reserved for the single selection: a range or a list of dates does not
 * fit in a single masked field.
 */
const resolvedMode = computed<DatePickerMode>(() =>
  requestedMode.value === 'input' && props.selection === 'single' ? 'input' : 'readonly',
)
const typing = computed(() => resolvedMode.value === 'input')

/**
 * The calendar is only optional in input mode: in read-only, it is the only way to
 * choose a date.
 */
const hasPanel = computed(() => !typing.value || props.showCalendar)

if (isDev) {
  watchEffect(() => {
    if (props.mode !== undefined && !MODES.includes(props.mode))
      console.warn(
        `[VDatePicker] unknown mode "${props.mode}": use "input" (the default) or "readonly".`,
      )
    // `props.mode` and NOT `requestedMode`: since "input" is the default, a
    // range/multiple selection falls back on its own — only whoever explicitly asked for
    // typing should be warned.
    if (props.mode === 'input' && props.selection !== 'single')
      console.warn(
        `[VDatePicker] mode="input" ignored in "${props.selection}" selection: a range or a list of dates cannot be typed on the keyboard.`,
      )
    // `typing` and not `props.mode`: the prop was indeed supplied and really has no
    // effect — the warning stays actionable.
    if (props.displayFormat && typing.value)
      console.warn(
        '[VDatePicker] displayFormat is ignored in "input" mode (the default): the field displays the locale\'s numeric mask, the only typeable format. Pass mode="readonly" for a formatted display.',
      )
  })
}

// The field + `manual` panel shell shared with VTimePicker: opening, closing, focus
// leaving, a click on the control, Escape/ArrowDown/Enter.
const { open, openPanel, closePanel, onControlClick, onFocusout, onKeydown, onPanelMousedown } =
  useFieldPanel({
    rootEl,
    panelRef,
    fieldEl: inputRef,
    // No panel = nothing to open. `disabled` is the composable's SINGLE cut-off point
    // (openPanel + onControlClick) and every opening route goes through it: a click on
    // the control, focusing the field, ArrowDown, Enter, the end icon. There is no need
    // to repeat the condition in each handler.
    disabled: () => props.disabled || !hasPanel.value,
    focusInPanel: () => calendarRef.value?.focus(),
    // In input mode the panel opens under the caret without grabbing it: typing
    // continues in the field, and the down arrow stays the route to the grid.
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

const vectisLocale = useLocale()
/* The prop takes precedence, otherwise the DS's global locale. VDatePicker is the
   SINGLE source: `resolvedLocale` is what flows down to VCalendar, never `locale` (which
   would be `undefined`), or the tag would be resolved twice. */
const resolvedLocale = computed(() => props.locale ?? vectisLocale.value)

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

/* Input mode: the masked draft. */

const mask = computed(() => dateMaskFor(resolvedLocale.value))
const maskHint = computed(() => maskPlaceholder(resolvedLocale.value, mask.value))
const isDisabledDate = computed(() => resolveMatcher(props.disabledDates))

/**
 * The field's text WHILE typing. It is the source of truth as long as the input is in
 * progress: the v-model only receives a complete, valid and acceptable date.
 */
const acceptable = (iso: string) =>
  isWithin(iso, props.min, props.max) && !isDisabledDate.value(iso)

/*
 * The mask plumbing (draft, the `v-model` bridge, caret-preserving reformatting,
 * live commit and silent revert) is shared with VTimePicker — see `useMaskedField`.
 * Only the date vocabulary is injected here: the field order, separator and widths
 * all come from the locale through `utils/date.ts`.
 */
const { draft, fieldModel, writeField, commitLive, commitOrRevert, onFieldInput } = useMaskedField({
  fieldEl,
  typing: () => typing.value,
  displayText: () => displayText.value,
  readValue: () =>
    typeof model.value === 'string' && isValidISO(model.value) ? model.value : null,
  writeValue: (iso) => {
    model.value = iso
  },
  maxDigits: () => mask.value.size,
  format: (digits) => formatDateMask(digits, mask.value),
  caret: (text, digitsBefore, inserting) =>
    caretAfterDigits(text, digitsBefore, inserting ? mask.value.separator : undefined),
  // The 2-digit year is expanded on the leave commit ONLY: a FIXED pivot, so the
  // helper stays pure.
  parse: (text, final) =>
    parseDateMask(text, mask.value, final ? { yearPivot: YEAR_PIVOT } : undefined),
  toMask: (iso) => (iso ? isoToMask(iso, mask.value) : ''),
  acceptable,
})

/**
 * A non-numeric character completes the current field with a leading zero and moves to
 * the next ("5/6/2026" is typed as "05062026"). Reserved for the day and the month: a
 * truncated year has no leading-zero convention.
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
    // preventDefault: it neutralizes both the form submission and the reopening by the
    // root (useFieldPanel's `defaultPrevented` guard).
    event.preventDefault()
    commitOrRevert()
    if (open.value) closeAndFocus()
    return
  }
  if (event.key === 'ArrowDown' && open.value) {
    // the only explicit route from the field to the grid
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
      // The separator is PLACED by the mask, never typed: the digit preceding it is
      // erased — what the user believes they are erasing. Otherwise the mask rewrites it
      // at once and the key appears dead.
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
 * Pasting: an ISO or already-masked date is adopted as it is, otherwise only its digits
 * are inserted. Without this handler, pasting "2026-06-10" into a dd/mm/yyyy mask would
 * give "20/26/0610".
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
 * The focus handed back to the field on closing would reopen it at once (in input mode,
 * the panel opens ON FOCUS): this lock covers the synchronous `focus()` call. Every close
 * with a refocus has to go through here — a direct `closePanel(true)` reintroduces the
 * loop.
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
 * The clear cross goes through VInput's `clearable`, which renders it to the LEFT of the
 * end icon (the VInput/VTextarea/VCombobox convention): both affordances coexist.
 * `clearVisible` is indispensable here — the field is readonly outside input mode, and
 * its value comes from the panel.
 */
const canClear = computed(
  () => props.clearable && !props.disabled && (hasValue.value || (typing.value && !!draft.value)),
)
const endIcon = computed<IconSource | undefined>(() =>
  hasPanel.value ? props.calendarIcon : undefined,
)
/*
 * The LABEL, on the other hand, stays defined at all times, even when no icon is
 * rendered: `useIconClickHandlers` warns AT SETUP as soon as an `@click:icon-end` is
 * attached without an `iconEndLabel`, with no way to know whether an icon exists. Since
 * the listener is attached permanently and its detection is static, a conditional label
 * would raise a false warning when mounting a field with no calendar.
 *
 * Labels: no dedicated prop, the dictionary is the only override point — see `src/i18n/`.
 */
const m = useMessages()

const endIconLabel = computed(() => m.value.datePicker.open)

function onEndIcon() {
  if (open.value) closeAndFocus()
  // An explicit click on the calendar icon: the focus has already left the field for the
  // button, so taking it into the grid is the right move in both modes.
  else openPanel(true)
}
/*
 * Called by VInput's `@clear`, INSIDE its `emit`: the `focus()` placed here under the
 * lock makes the `controlEl.focus()` VInput runs just afterwards inert (an
 * already-focused element = no `focus` event emitted), so the panel does not reopen.
 * Removing the lock from here would reopen it.
 */
function clearValue() {
  model.value =
    props.selection === 'multiple'
      ? []
      : props.selection === 'range'
        ? { start: null, end: null }
        : null
  // `draft` explicitly: when the model was already `null`, `syncDraftFromModel`'s
  // anti-loop guard would not empty it.
  if (typing.value) writeField('')
  refocusing = true
  inputRef.value?.focus()
  refocusing = false
}

/** A selection in the calendar: in single mode, it closes. */
function onSelect() {
  if (props.selection === 'single') closeAndFocus()
}

const close = () => closeAndFocus()
</script>

<template>
  <div
    ref="rootEl"
    class="v-datepicker"
    :class="rootClass"
    :style="rootStyle"
    :data-open="open ? '' : undefined"
    :data-mode="resolvedMode"
    @focusout="onFocusout"
    @keydown="onRootKeydown"
  >
    <div class="v-datepicker-control" @click="onControlClick">
      <!-- `role="combobox"` and not the input's implicit `textbox`, which does not support
           aria-expanded: a text field with a popup IS the combobox pattern (the role
           VCombobox already sets on its own VInput). Role and the three aria-* are gated
           on the SAME `hasPanel`, so the role never appears without the aria-expanded it
           requires, nor aria-controls without a mounted panel. -->
      <VInput
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
        :role="hasPanel ? 'combobox' : undefined"
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

    <!-- With no panel mounted, `panelRef` is null: `open`, fed by the popover's DOM, can
         no longer turn `true`. -->
    <VPopover
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
      class="v-datepicker-panel"
      @mousedown="onPanelMousedown"
    >
      <VCalendar
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
      </VCalendar>
    </VPopover>
  </div>
</template>

<style>
@layer vectis.components {
  .v-datepicker {
    /* Confines the anchor to this instance (the root = the common ancestor of the
       control and the panel) */
    anchor-scope: --datepicker-anchor;
    display: block;
    width: 100%;
    font-family: var(--vectis-text-family);
  }

  .v-datepicker-control {
    anchor-name: --datepicker-anchor;
    display: block;
    cursor: pointer;
  }

  /* Input mode: the field is editable, and the <input>'s text caret takes over from the
     control's `pointer` (which signals "this opens a panel"). The mask has a fixed width:
     tabular figures, otherwise the caret jitters from one digit to the next. */
  .v-datepicker[data-mode='input'] .v-datepicker-control {
    cursor: text;
  }

  .v-datepicker[data-mode='input'] .v-input-control {
    font-variant-numeric: tabular-nums;
  }

  /* `position-anchor` and the chrome come from VPopover (the `anchor` and `surface`
     props, the latter setting `.v-panel`): only the dimensions are left here, which
     `panel.css` deliberately does not carry. The padding is cancelled — VCalendar handles
     its own breathing room; compounded with `.v-popover-panel` (VPopover puts both
     classes on the same element) because `.v-panel` declares `padding` too, and at
     equal specificity the winner would depend on the order in which the consumer's
     bundler concatenates the CSS. */
  .v-popover-panel.v-datepicker-panel {
    width: max-content;
    padding: 0;
  }
}
</style>
