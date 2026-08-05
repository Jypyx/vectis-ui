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
 * A time picker: a `VInput` field + an optional floating panel. The same shell as
 * VDatePicker (a `VPopover` in `mode="manual"` anchored in pure CSS, a programmatic
 * opening to move the focus into the panel, closing through the root's `@focusout` +
 * Escape).
 *
 * Three field modes (`mode`): `input` (the default — a masked "HH:MM" field, with an
 * optional dial through `showDial`), `readonly` (the dial is the only route) and `list`
 * (a panel listing the times in `minuteStep` increments).
 *
 * The DIAL works on a draft: only OK writes the v-model (a canonical 24 h `'HH:mm'`);
 * Cancel, Escape and focus leaving all discard it. The LIST, on the other hand, commits
 * directly — choosing a time there is a single gesture.
 */
export type TimePickerFormat = HourFormat
export type TimePickerMode = 'readonly' | 'input' | 'list'

const MODES: TimePickerMode[] = ['readonly', 'input', 'list']

type Placement = 'bottom' | 'bottom-start' | 'bottom-end' | 'top' | 'top-start' | 'top-end'

interface TimePickerProps {
  /** The hour cycle displayed; default: derived from the locale (Intl's `hourCycle`). */
  format?: TimePickerFormat
  /**
   * Field mode:
   * - `input` (the default): an editable masked "HH:MM" field, with an optional dial;
   * - `readonly`: read-only, the dial being the only route — hence `showDial` forced to
   *   `true`;
   * - `list`: a panel of times in `minuteStep` increments, with a read-only field;
   *   `showDial` is pointless there.
   */
  mode?: TimePickerMode
  /**
   * A clickable icon at the end of the field + the dial's popover (`input` mode). Left
   * at `undefined` by default rather than at `false`: that is what makes it possible to
   * distinguish "not supplied" from an explicit `false`, and hence to warn in `readonly`
   * mode only the consumer who really asked to disable it.
   */
  showDial?: boolean
  /** Minute granularity: the dial, the arrows, and the list's step. */
  minuteStep?: number
  /**
   * A BCP 47 locale (the hour cycle, the display format). It TAKES PRECEDENCE over the
   * DS's global locale (`setLocale`), which it falls back to — hence the absence of a
   * literal default here: `undefined` must stay distinguishable for the global locale to
   * have a chance to apply.
   */
  locale?: string
  // The field.
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
   * The DIAL-opening icon, at the end of the field. No effect in `mode="list"`, whose
   * chevron follows the VCombobox convention. `clearable`'s clear cross shows to its left
   * without replacing it.
   */
  clockIcon?: IconSource
  /** Placement of the panel relative to the field. */
  placement?: Placement
}

const props = withDefaults(defineProps<TimePickerProps>(), {
  format: undefined,
  // `undefined` and not `'input'`: that is what distinguishes "prop not supplied" from
  // an explicit choice, and hence what makes it possible to warn only the consumer who
  // really asked for something inoperative.
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

/** A canonical 24 h `'HH:mm'` time, whatever the 12 h / 24 h display. */
const model = defineModel<string | null>({ default: null })

// Wrapper-root: class/style on the root, the rest carried over to the VInput.
defineOptions({ inheritAttrs: false })
const { rootClass, rootStyle, forwardedAttrs } = useRootAttrs()

const rootEl = ref<HTMLElement | null>(null)
const panelRef = ref<InstanceType<typeof VPopover> | null>(null)
const inputRef = ref<InstanceType<typeof VInput> | null>(null)
const panelId = useId()

/** The field's native `<input>` (mask, caret) — exposed by `VInput`. */
const fieldEl = computed<HTMLInputElement | null>(() => inputRef.value?.el ?? null)

const resolvedMode = computed<TimePickerMode>(() => {
  // The `??` comes BEFORE the validation: an absent prop is not an "unknown" value, so
  // it must trigger nothing.
  const mode = props.mode ?? 'input'
  return MODES.includes(mode) ? mode : 'input'
})
const typing = computed(() => resolvedMode.value === 'input')
const isList = computed(() => resolvedMode.value === 'list')
/** The dial: forced in read-only, opt-in in input mode, pointless in list mode. */
const hasDial = computed(
  () => resolvedMode.value === 'readonly' || (typing.value && props.showDial === true),
)
const hasPanel = computed(() => hasDial.value || isList.value)

const vectisLocale = useLocale()
/* The prop takes precedence, otherwise the DS's global locale. */
const resolvedLocale = computed(() => props.locale ?? vectisLocale.value)

const resolvedFormat = computed<TimePickerFormat>(
  () => props.format ?? hourCycleFor(resolvedLocale.value),
)

if (isDev) {
  watchEffect(() => {
    if (props.minuteStep < 1 || 60 % props.minuteStep !== 0)
      console.warn(`[VTimePicker] minuteStep ${props.minuteStep} — a divisor of 60 is expected.`)
    if (props.mode !== undefined && !MODES.includes(props.mode))
      console.warn(
        `[VTimePicker] unknown mode "${props.mode}": use "input" (the default), "readonly" or "list".`,
      )
    if (resolvedMode.value === 'readonly' && props.showDial === false)
      console.warn(
        '[VTimePicker] showDial is forced to true in "readonly" mode: with no dial, a read-only field would be impossible to fill.',
      )
    if (isList.value && props.showDial === true)
      console.warn(
        '[VTimePicker] showDial is ignored in "list" mode: the list of times is the only panel.',
      )
    if (isList.value && props.minuteStep < 5)
      console.warn(
        `[VTimePicker] minuteStep ${props.minuteStep} in "list" mode would render ${Math.ceil(1440 / props.minuteStep)} rows: a step of 15 or 30 minutes is expected.`,
      )
  })
}

const activeStep = ref<'hour' | 'minute'>('hour')

// The DIAL's draft (committed by OK only).
const draftHour = ref(0) // canonical 24 h
const draftMinute = ref(0)

const modelParts = computed(() => parseTime(model.value))

/**
 * The meridiem remembered while NO time is set: the VToggle is `mandatory`, so it always
 * needs a value, and `null` is not one. A hardcoded 'AM' (and not the current time):
 * deterministic, hence SSR-safe and testable.
 */
const pendingMeridiem = ref<Meridiem>('AM')

/**
 * The AM/PM VToggle lives OUTSIDE the panel, on the field's row: it therefore drives the
 * v-model, not the dial's draft.
 */
const meridiemModel = computed<ToggleModelValue>({
  get: () => (modelParts.value ? to12h(modelParts.value.hour).meridiem : pendingMeridiem.value),
  set: (value) => {
    const meridiem: Meridiem = value === 'PM' ? 'PM' : 'AM'
    pendingMeridiem.value = meridiem
    const parts = modelParts.value
    // With no value there is nothing to convert: the choice is REMEMBERED and will apply
    // to the first time typed or chosen.
    if (parts) model.value = formatTime(to24h(to12h(parts.hour).hour, meridiem), parts.minute)
    // With the dial open, the draft follows, or OK would rewrite the old meridiem.
    if (open.value && hasDial.value) draftHour.value = to24h(to12h(draftHour.value).hour, meridiem)
  },
})

const displayHourText = computed(() =>
  pad2(resolvedFormat.value === '12h' ? to12h(draftHour.value).hour : draftHour.value),
)

const hasValue = computed(() => !!modelParts.value)
const displayText = computed(() =>
  model.value ? formatDisplay(model.value, resolvedLocale.value, resolvedFormat.value) : '',
)

// Opening / closing the panel (a manual popover).
function focusInPanel() {
  const panel = panelRef.value?.el
  if (!panel) return
  if (isList.value) focusListSelection(panel)
  // The panel shows the dial alone: the slider is the useful target. A DOM query rather
  // than an expose — VTimePickerDial has none, and therefore does not have to change.
  else panel.querySelector<HTMLElement>('[role="slider"]')?.focus()
}

// The field + `manual` panel shell shared with VDatePicker. The opening prologue (the
// draft, the step) and the closing epilogue (the live region) are the only parts
// specific to VTimePicker.
const { open, openPanel, closePanel, onControlClick, onFocusout, onKeydown, onPanelMousedown } =
  useFieldPanel({
    rootEl,
    panelRef,
    fieldEl: inputRef,
    // No panel = nothing to open. `disabled` is the composable's SINGLE cut-off point
    // (openPanel + onControlClick) and every opening route goes through it: a click,
    // focus, ArrowDown, Enter, the end icon.
    disabled: () => props.disabled || !hasPanel.value,
    focusInPanel,
    // In input mode the panel opens under the caret without grabbing it.
    focusOnOpen: () => !typing.value,
    onOpen: () => {
      // The draft: specific to the dial — the list commits directly.
      if (!hasDial.value) return
      const parts = modelParts.value
      if (parts) {
        draftHour.value = parts.hour
        draftMinute.value = parts.minute
      } else {
        const now = new Date() // a handler → client only
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
 * The focus handed back to the field on closing would reopen it (in input mode, the
 * panel opens ON FOCUS): this lock covers the synchronous `focus()` call. Every close
 * with a refocus has to go through here — a direct `closePanel(true)` reintroduces the
 * loop.
 */
let refocusing = false
function closeAndFocus() {
  refocusing = true
  closePanel(true)
  refocusing = false
}

/** OK: the DIAL's only route that writes the v-model. */
function confirm() {
  model.value = formatTime(draftHour.value, draftMinute.value)
  closeAndFocus()
}

function cancel() {
  closeAndFocus()
}

/** The step settled on the dial: hour → minutes; minutes → OK on the keyboard ONLY
    (releasing the pointer must not close the panel). */
function onDialConfirm(via: 'pointer' | 'keyboard') {
  if (activeStep.value === 'hour') activeStep.value = 'minute'
  else if (via === 'keyboard') confirm()
}

/*
 * Called by VInput's `@clear`, INSIDE its `emit`: the `focus()` placed here under the
 * lock makes the `controlEl.focus()` VInput runs just afterwards inert (an
 * already-focused element = no `focus` event emitted), so the panel does not reopen.
 * Removing the lock from here would reopen it.
 */
function clearValue() {
  model.value = null
  // `draft` explicitly: when the model was already `null`, `syncMaskFromModel`'s
  // anti-loop guard would not empty it.
  if (typing.value) writeField('')
  refocusing = true
  inputRef.value?.focus()
  refocusing = false
}

// Escape and focus leaving close WITHOUT committing (the dial's Cancel semantics):
// `closePanel` never writes the v-model, only `confirm()` does.

// The step is carried only by the slider's aria-label, whose change is not reliably
// announced: a polite live region doubles the information. No dedicated prop: the
// dictionary is the only override point.
const m = useMessages()

const liveMessage = ref('')
watch(activeStep, (step) => {
  if (open.value)
    liveMessage.value =
      step === 'minute' ? m.value.timePicker.minuteStep : m.value.timePicker.hourStep
})

/* Input mode: the "HH:MM" mask. */

const maskDraft = ref('')

function syncMaskFromModel() {
  const next = timeToMask(model.value, resolvedFormat.value)
  // An anti-loop guard: a commit made while typing comes back through here and would
  // overwrite the draft AND the caret with an identical text.
  if (next !== maskDraft.value) maskDraft.value = next
}
watch([model, resolvedFormat], syncMaskFromModel, { immediate: true })

/**
 * `v-model` and NEVER `:model-value`: without an `onUpdate:modelValue` listener,
 * `useModel` internally copies the RAW typed text and rewrites it on the next patch,
 * erasing the mask as soon as the mask itself does not change (the 5th digit, a rejected
 * character). Covered by a test.
 */
const fieldModel = computed<string | number>({
  get: () => (typing.value ? maskDraft.value : displayText.value),
  set: (value) => {
    if (typing.value) maskDraft.value = String(value ?? '')
  },
})

/** Writes the draft AND the DOM: Vue does not re-patch an unchanged masked text. */
function writeField(text: string, caret?: number) {
  maskDraft.value = text
  const el = fieldEl.value
  if (!el) return
  if (el.value !== text) el.value = text
  if (caret !== undefined) el.setSelectionRange(caret, caret)
}

const currentMeridiem = (): Meridiem => (meridiemModel.value === 'PM' ? 'PM' : 'AM')

/** A commit as you type, as soon as the time is complete and valid. */
function commitLive() {
  const time = parseTimeMask(maskDraft.value, resolvedFormat.value, currentMeridiem())
  if (time && time !== model.value) model.value = time
}

/**
 * Leaving the field (`change` then `blur`, hence the idempotence): normalization or a
 * SILENT REVERT — no home-made error state to compete with the `invalid` prop.
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
 * The mask as you type. Invariant: the number of digits to the LEFT of the caret is
 * preserved by the reformatting — absolute positions jump as soon as the `:` appears or
 * disappears.
 */
function onFieldInput(event: Event) {
  if (!typing.value) return
  const el = event.target as HTMLInputElement
  const raw = el.value
  const caret = el.selectionStart ?? raw.length
  const before = digitsOf(raw.slice(0, caret)).length
  const digits = digitsOf(raw).slice(0, 4)
  // The caret only crosses the separator on insertion: on deletion it has to stay in
  // front of it, or the key never makes progress.
  const deleting = String((event as InputEvent).inputType ?? '').startsWith('delete')
  writeField(formatTimeMask(digits), timeCaret(Math.min(before, digits.length), !deleting))
  commitLive()
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
  if (event.key === 'ArrowDown' && open.value && hasDial.value) {
    // the only explicit route from the field to the dial
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
      // The `:` is PLACED by the mask, never typed: the digit preceding it is erased —
      // otherwise the mask rewrites it and the key appears dead.
      event.preventDefault()
      const n = digitsOf(el.value.slice(0, start)).length
      const digits = digitsOf(el.value)
      writeField(formatTimeMask(digits.slice(0, n - 1) + digits.slice(n)), timeCaret(n - 1))
      commitLive()
    }
    return
  }
  // A non-numeric character — the ":" included, so "9:30" is typed as it reads —
  // completes the hour with a leading zero and moves to the minutes.
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

/** Pasting: "19:05" or "1905" are adopted, otherwise only the digits come in. */
function onFieldPaste(event: ClipboardEvent) {
  if (!typing.value) return
  const el = fieldEl.value
  if (!el) return
  event.preventDefault()
  const pasted = (event.clipboardData?.getData('text') ?? '').trim()
  // A pasted canonical 24 h time stays read as 24 h, whatever the display.
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

/* List mode. */

const options = computed<TimeOption[]>(() =>
  isList.value ? timeList(props.minuteStep, resolvedLocale.value, resolvedFormat.value) : [],
)

/**
 * OUR OWN list (the VMenuPanel idiom) and not `navigableItems`: the latter calls
 * `getComputedStyle` on EVERY element — unacceptable across dozens of rows, and none of
 * them is hidden here.
 */
const optionEls = (panel: HTMLElement) => [
  ...panel.querySelectorAll<HTMLElement>('[role="option"]'),
]

/** Opening: focus AND scroll onto the current value — or the closest one, since "09:07"
    with a 15-minute step lands on no row at all. */
function focusListSelection(panel: HTMLElement) {
  const items = optionEls(panel)
  if (!items.length) return
  const minutes = minutesOf(model.value)
  const index =
    minutes === null ? 0 : clamp(Math.round(minutes / props.minuteStep), 0, items.length - 1)
  const el = items[index]
  // `?.()`: jsdom does not implement scrollIntoView. No `behavior`, which would ignore
  // `scroll-behavior` and prefers-reduced-motion.
  el?.scrollIntoView?.({ block: 'center' })
  el?.focus({ preventScroll: true })
}

/** A click or Enter on a row: a DIRECT commit + closing (the `VDatePicker.onSelect`
    model) — no draft, no panel footer. */
function selectTime(value: string) {
  model.value = value
  closeAndFocus()
}

function onPanelKeydown(event: KeyboardEvent) {
  if (!isList.value) return
  const panel = panelRef.value?.el
  if (!panel) return
  if (event.key === 'Enter' || event.key === ' ') {
    // preventDefault is MANDATORY: without it, Enter fires the <button>'s native click
    // (hence the close) THEN bubbles to the root without being marked consumed —
    // useFieldPanel's `defaultPrevented` guard does not apply and the panel reopens at
    // once. So the commit is explicit.
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

/*
 * The clear cross and the end icon.
 *
 * The cross goes through VInput's `clearable`, which renders it to the LEFT of the end
 * icon (the VInput/VTextarea/VCombobox convention): both affordances coexist, and in list
 * mode this gives exactly VCombobox's cross + chevron pairing. `clearVisible` is
 * indispensable here — the field is readonly outside input mode, and its value comes from
 * the panel.
 */
const canClear = computed(
  () =>
    props.clearable && !props.disabled && (hasValue.value || (typing.value && !!maskDraft.value)),
)
const endIcon = computed<IconSource | undefined>(() =>
  isList.value ? 'expand_more' : hasDial.value ? props.clockIcon : undefined,
)
/*
 * The LABEL, on the other hand, stays defined at all times, even when no icon is
 * rendered: `useIconClickHandlers` warns AT SETUP as soon as an `@click:icon-end` is
 * attached without an `iconEndLabel`, with no way to know whether an icon exists. Since
 * the listener is attached permanently and its detection is static, a conditional label
 * would raise a false warning when mounting an input field with no dial.
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
        <!-- `role="combobox"` and not the input's implicit `textbox`, which does not
             support aria-expanded — see VDatePicker, same reasoning, and here it also
             matches the `aria-haspopup="listbox"` of the list mode. -->
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
          :role="hasPanel ? 'combobox' : undefined"
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

      <!-- The meridiem lives OUTSIDE the panel: it serves all three modes and drives the
           v-model directly. Still inside the root, so clicking it does not fire the
           `focusout` that would close the panel. -->
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

    <!-- With no panel mounted, `panelRef` is null: `open`, fed by the popover's DOM, can
         no longer turn `true`. -->
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
      <!-- List mode: `option` rows, DOM focus inside the panel (the VMenu/VCalendar
           model), a direct commit on click or on Enter. -->
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
        <!-- The cells switch the active step: `tone` accent = the step under way (the
             tonal variant supplying the pair of backgrounds). -->
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
    /* Confines the anchor to this instance (the root = the common ancestor of the
       control and the panel) */
    anchor-scope: --timepicker-anchor;
    display: block;
    width: 100%;
    font-family: var(--vectis-text-family);
  }

  /* The field's row: the field takes the remaining room, the AM/PM VToggle its intrinsic
     width. */
  .v-timepicker-row {
    display: flex;
    align-items: stretch;
    gap: var(--vectis-space-2);
  }

  .v-timepicker-control {
    anchor-name: --timepicker-anchor;
    flex: 1;
    /* without it, the flex item's automatic minimum would make the field overflow */
    min-inline-size: 0;
    cursor: pointer;
  }

  /* Input mode: the field is editable, and the text caret takes over from the control's
     `pointer`. The mask has a fixed width: tabular figures, otherwise the caret jitters
     from one digit to the next. */
  .v-timepicker[data-mode='input'] .v-timepicker-control {
    cursor: text;
  }

  .v-timepicker[data-mode='input'] .v-input-control {
    font-variant-numeric: tabular-nums;
  }

  /* The VToggle aligns on the FIELD, not on the VInput block (which stacks label /
     field / hint): the label's and the hint's heights are compensated with margins. Its
     own height equals the field's (same size/compact). */
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

  /* `position-anchor` and the chrome come from VPopover (the `anchor` and `surface`
     props, the latter setting `.v-panel`): only the column layout and the padding
     specific to the dial are left here. The author's `display: flex` overrides
     [popover]'s UA `display: none`: the `.v-overlay:not(:popover-open)` guard is what
     closes it back. */
  .v-timepicker-panel {
    display: flex;
    flex-direction: column;
    gap: var(--vectis-space-4);
    width: max-content;
    padding: var(--vectis-space-3);
    color: var(--vectis-color-text);
  }

  /* A numeric time always reads HH:MM: without this forced ltr, bidi would reorder the
     cells in RTL. */
  .v-timepicker-time {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--vectis-space-2);
    direction: ltr;
  }

  /* The HH/MM cells: design system VButtons (the `tonal` variant, an accent tone on the
     active step — their `--tone-bg-soft`/`--tone-text-tinted` pair supplying the
     colours). The override is limited to the "large numeral" template: height, states,
     focus and transitions all come from VButton. Qualified by [data-size] (the
     VIconButton/VTabs model): the export order is not constraining. */
  .v-timepicker-cell[data-size] {
    width: var(--control-height);
    font-size: var(--vectis-text-heading-1-size);
    font-weight: var(--vectis-text-heading-2-weight);
    /* "11" and "00" must not shift the cell */
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

  /* List mode: the chrome comes from `.v-panel` (VPopover's `surface` prop) and the
     rows' template from the `v-control` set on the PANEL. Only the dimensions stay here —
     `panel.css` carries none. */
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

  /* An INNER ring: the panel scrolls, so a positive offset would be cropped. */
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
