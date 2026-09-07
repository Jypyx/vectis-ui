<script setup lang="ts">
// @a11y @core
/**
 * A field for choosing a time. Three forms, and only two of them are built here.
 *
 * `input` types hours and minutes behind a mask, optionally with a clock beside it, and
 * `readonly` makes that clock the only way in. Both use the VDateInput shell
 * (`useFieldPanel`): the panel is opened imperatively, so the focus can be moved into it,
 * and closes on `focusout` or Escape. The CLOCK works on a draft only OK writes — Cancel,
 * Escape and focusout all discard it — because dragging a hand passes over dozens of times
 * nobody meant.
 *
 * `list` offers the times at a fixed interval, which suits booking a slot far better than
 * pointing at a dial. It is a VCombobox outright, so a time is FOUND by typing as much as
 * scrolled to, and the whole listbox pattern comes from there rather than being written
 * again. Choosing a row commits at once: picking from a list is a single gesture.
 *
 * Whatever is displayed, the value is always a canonical 24-hour `'HH:mm'`.
 */

import { computed, inject, provide, ref, useId, watchEffect } from 'vue'

import VButton from '../VButton/VButton.vue'
import { NO_BUTTON_GROUP, buttonGroupKey } from '../VButton/context'
import VCombobox from '../VCombobox/VCombobox.vue'
import { inputGroupKey } from '../VInput/context'
import { schedule as scheduleIcon } from '../VIcon/icons/schedule'
import type { IconSource } from '../VIcon/types'
import VInput from '../VInput/VInput.vue'
import VPopover from '../VPopover/VPopover.vue'
import VSeparator from '../VSeparator/VSeparator.vue'
import VTimePicker from '../VTimePicker/VTimePicker.vue'
import type { TimePickerFormat } from '../VTimePicker/VTimePicker.vue'
import {
  isTimeAllowed,
  limitsProblem,
  nearestAllowedTime,
  resolveLimits,
} from '../VTimePicker/limits'
import type { TimeMatcher } from '../VTimePicker/limits'
import {
  formatDisplay,
  formatTime,
  formatTimeMask,
  hourCycleFor,
  isValidTime,
  parseTime,
  parseTimeMask,
  snapMinute,
  timeCaret,
  timeList,
  timeToMask,
  to12h,
  to24h,
} from '../../utils/time'
import type { Meridiem, TimeOption } from '../../utils/time'
import { timeMatches } from './search'
import { isDev } from '../../utils/env'
import { digitsOf } from '../../utils/text'

import { useRootAttrs } from '../../composables/useRootAttrs'

import { useFieldPanel } from '../../composables/useFieldPanel'
import { useMaskedField } from '../../composables/useMaskedField'
import { useLocale, useMessages } from '../../i18n/state'

export type TimeInputMode = 'readonly' | 'input' | 'list'

const MODES: TimeInputMode[] = ['readonly', 'input', 'list']

type Placement = 'bottom' | 'bottom-start' | 'bottom-end' | 'top' | 'top-start' | 'top-end'

interface TimeInputProps {
  /**
   * Whether times are shown on a 12- or a 24-hour clock. Left out, the reader's language
   * decides, which is almost always what one wants.
   */
  format?: TimePickerFormat
  /**
   * Which form the field takes: one that can be TYPED into, a read-only one where the
   * picker is the only way in — so the picker is forced on there — or a searchable LIST of
   * times at a fixed interval, where a picker would make no sense.
   */
  mode?: TimeInputMode
  /**
   * Offers the picker beside a field one can type into: an icon at the end of the field,
   * and a panel it opens.
   *
   * It is left undefined by default rather than set to off, which is what distinguishes
   * "not given" from an explicit refusal — and therefore what allows warning only the
   * consumer who really asked to remove the picker from a read-only field, where it is the
   * only way in.
   */
  showPicker?: boolean
  /**
   * The interval between two times that can be chosen. It applies to the picker, to the
   * arrow keys and to the rows of the list.
   */
  minuteStep?: number
  /**
   * The earliest time that can be chosen, inclusive, as a canonical 24-hour `'HH:mm'`.
   * The picker DISABLES what it rules out, the list leaves it out altogether, and a time
   * typed past it makes the field invalid.
   */
  min?: string
  /** The latest time that can be chosen, inclusive, written like `min`. */
  max?: string
  /**
   * Which hours can be chosen: the list of them, or a rule answering for one. The hour
   * handed to a rule is always the 24-hour one, whichever clock is on display.
   */
  allowedHours?: TimeMatcher
  /** Which minutes can be chosen: the list of them, or a rule answering for one. */
  allowedMinutes?: TimeMatcher
  /**
   * A BCP 47 locale, which decides the clock and how a time is written out. It TAKES
   * PRECEDENCE over the design system's global locale and falls back to it — which is why
   * it has no literal default: `undefined` has to stay recognizable for the global locale
   * to have its chance.
   */
  locale?: string
  // From here on: the field.
  /** The label above the field. */
  label?: string
  /** A line of help under the field. */
  hint?: string
  /** What the field says while empty. */
  placeholder?: string
  /** The height of the field: 32, 40 or 48 pixels. */
  size?: 'sm' | 'md' | 'lg'
  /** Takes 4px off the height. */
  compact?: boolean
  /** Makes the field unusable, greyed out through the colour tokens. */
  disabled?: boolean
  /** Marks the field as invalid — for a rule of your own. */
  invalid?: boolean
  /** Offers a cross that empties the value, shown before the end icon. */
  clearable?: boolean
  /**
   * The icon that opens the PICKER, at the end of the field. It has no effect on the list
   * form, whose chevron follows the combobox convention. The clear cross appears to its
   * left rather than in its place.
   */
  pickerIcon?: IconSource
  /** Where the panel opens relative to the field, whether it holds the clock or the list. */
  placement?: Placement
}

const props = withDefaults(defineProps<TimeInputProps>(), {
  format: undefined,
  // Deliberately left undefined rather than defaulted to the typed mode: that is what
  // distinguishes "the prop was not given" from "the prop was given this value", and
  // therefore what allows warning ONLY the consumer who explicitly asked for something
  // that cannot work.
  mode: undefined,
  showPicker: undefined,
  minuteStep: 1,
  min: undefined,
  max: undefined,
  allowedHours: undefined,
  allowedMinutes: undefined,
  locale: undefined,
  label: undefined,
  hint: undefined,
  placeholder: undefined,
  size: 'md',
  compact: false,
  disabled: false,
  invalid: false,
  clearable: false,
  pickerIcon: () => scheduleIcon,
  placement: 'bottom-start',
})

/**
 * The time, always as a 24-hour "HH:mm" string whatever clock is displayed. A consumer
 * therefore never has to know which clock the reader's language uses.
 */
const model = defineModel<string | null>({ default: null })

// `class` and `style` stay on the wrapper; everything else goes down to the text field,
// which is what a consumer's label points at and what assistive technology deals with.
defineOptions({ inheritAttrs: false })
const { rootClass, rootStyle, forwardedAttrs } = useRootAttrs()

const rootEl = ref<HTMLElement | null>(null)
const panelRef = ref<InstanceType<typeof VPopover> | null>(null)
const inputRef = ref<InstanceType<typeof VInput> | null>(null)
const pickerRef = ref<InstanceType<typeof VTimePicker> | null>(null)
const panelId = useId()

/** The real input inside the field, which the mask and the caret work on. */
const fieldEl = computed<HTMLInputElement | null>(() => inputRef.value?.el ?? null)

const resolvedMode = computed<TimeInputMode>(() => {
  // TRAP — the default is applied BEFORE the value is checked. A prop that was never
  // given is not an unknown value, and treating it as one would warn on a bare
  // `<VTimeInput />`.
  const mode = props.mode ?? 'input'
  return MODES.includes(mode) ? mode : 'input'
})
const typing = computed(() => resolvedMode.value === 'input')
const isList = computed(() => resolvedMode.value === 'list')
/**
 * Whether there is a picker — which here also means whether this component builds a panel
 * of its own at all, the list form handing that job to VCombobox. It is forced on a
 * read-only field, where nothing else could fill it, and offered beside a field one types
 * into.
 */
const hasPicker = computed(
  () => resolvedMode.value === 'readonly' || (typing.value && props.showPicker === true),
)

const vectisLocale = useLocale()
/* The prop wins, and the design system's global locale is what it falls back to. */
const resolvedLocale = computed(() => props.locale ?? vectisLocale.value)

const resolvedFormat = computed<TimePickerFormat>(
  () => props.format ?? hourCycleFor(resolvedLocale.value),
)

/**
 * The restrictions, resolved once. VTimePicker resolves the same props again for itself:
 * they are ITS contract, and this component only consults them for the two things the
 * picker knows nothing about — which rows the list offers, and whether a typed time is
 * one the field should be showing as invalid.
 */
const limits = computed(() => resolveLimits(props))

/** Whether the value is one the restrictions allow. Nothing at all is not a breach. */
const valueAllowed = computed(() => {
  const parts = modelParts.value
  return !parts || isTimeAllowed(parts.hour, parts.minute, limits.value)
})

// @devwarn
if (isDev) {
  watchEffect(() => {
    if (props.minuteStep < 1 || 60 % props.minuteStep !== 0)
      console.warn(`[VTimeInput] minuteStep ${props.minuteStep} — a divisor of 60 is expected.`)
    if (props.mode !== undefined && !MODES.includes(props.mode))
      console.warn(
        `[VTimeInput] unknown mode "${props.mode}": use "input" (the default), "readonly" or "list".`,
      )
    if (resolvedMode.value === 'readonly' && props.showPicker === false)
      console.warn(
        '[VTimeInput] showPicker is forced to true in "readonly" mode: with no picker, a read-only field would be impossible to fill.',
      )
    if (isList.value && props.showPicker === true)
      console.warn(
        '[VTimeInput] showPicker is ignored in "list" mode: the list of times is the only panel.',
      )
    const problem = limitsProblem(limits.value)
    if (problem) console.warn(`[VTimeInput] ${problem}`)
    if (isList.value && props.minuteStep < 5)
      console.warn(
        `[VTimeInput] minuteStep ${props.minuteStep} in "list" mode would render ${Math.ceil(1440 / props.minuteStep)} rows: a step of 15 or 30 minutes is expected.`,
      )
  })
}

/**
 * The time being built on the clock, in the same canonical form as the value itself.
 * Nothing here reaches the value until OK is pressed — which is the whole reason the
 * picker is bound to THIS rather than to the model.
 */
const draft = ref<string | null>(null)

const modelParts = computed(() => parseTime(model.value))

/**
 * Which half of the day is chosen while NO time is set at all. The AM/PM control always
 * needs a value — it refuses to have none — and "nothing" is not one.
 *
 * It starts at AM rather than at whatever the current time happens to be, which keeps the
 * component's first render identical on a server and in a browser, and its tests free of
 * a clock.
 */
const pendingMeridiem = ref<Meridiem>('AM')

/**
 * The half of the day the FIELD is showing. It is what the mask needs: typing "9:30" says
 * nothing about the morning or the afternoon, so the answer has to be readable while the
 * panel is shut.
 */
const meridiem = computed<Meridiem>(() => {
  // With the picker open it is the DRAFT that is on screen, and this control has to read
  // the same thing: two controls showing opposite halves of the day until OK is pressed
  // is the one state that must not happen.
  const parts = open.value && hasPicker.value ? parseTime(draft.value) : modelParts.value
  return parts ? to12h(parts.hour).meridiem : pendingMeridiem.value
})

/**
 * The button beside the value flips the half of the day. There is no third state to reach,
 * so it names the half it is showing and swaps to the other one on a click.
 */
function toggleMeridiem() {
  const next: Meridiem = meridiem.value === 'PM' ? 'AM' : 'PM'
  pendingMeridiem.value = next
  const parts = modelParts.value
  // With no time set there is nothing to convert, so the choice is simply REMEMBERED
  // and applies to the first time typed or chosen.
  if (parts) model.value = formatTime(to24h(to12h(parts.hour).hour, next), parts.minute)
  // With the picker open the draft has to follow as well, or OK would write back the
  // half of the day the reader has just changed.
  const pending = open.value && hasPicker.value ? parseTime(draft.value) : null
  if (pending) draft.value = formatTime(to24h(to12h(pending.hour).hour, next), pending.minute)
}

/**
 * Whether the button is rendered at all. Only the typed form needs it: the read-only form
 * reaches the clock, which carries its own AM/PM, and the list already spells the half of
 * the day out on every row.
 */
const hasMeridiem = computed(() => typing.value && resolvedFormat.value === '12h')

const hasValue = computed(() => !!modelParts.value)
const displayText = computed(() =>
  model.value ? formatDisplay(model.value, resolvedLocale.value, resolvedFormat.value) : '',
)

// @a11y
// Where the focus goes when the panel opens. The picker publishes where its own focus
// belongs, so nothing here has to know that the target is a slider — the same arrangement
// VDateInput has with VDatePicker.
function focusInPanel() {
  pickerRef.value?.focus()
}

// A VInputGroup joins several controls into one object, so the shape of this field is the
// row's decision rather than its own (VInput/context.ts). Nothing else is needed here: the
// AM/PM button lives INSIDE the field, so a 12 hour field is one box like any other and
// the row has nothing of its own to join.
const group = inject(inputGroupKey, null)
const resolvedSize = computed(() => group?.size ?? props.size)
const resolvedCompact = computed(() => group?.compact ?? props.compact)
const resolvedDisabled = computed(() => group?.disabled || props.disabled)

// @core
// TRAP — this stops a VButtonGroup's or a VInputGroup's row context at this boundary. The
// VTimePicker below writes `size="lg"` on its hour and minute cells, and a group WINS over a
// button's prop: without this line a VInputGroup would resize them to its own height, and it
// only shows once the panel is open. It is the JS counterpart of the `.v-overlay` guard
// every VButtonGroup selector carries.
provide(buttonGroupKey, NO_BUTTON_GROUP)

// The whole "field plus panel" shell, shared with VDateInput. What is specific to this
// component is only what happens around it: preparing the draft as the panel opens, and
// clearing the announcement as it closes.
const { open, openPanel, closePanel, onControlClick, onFocusout, onKeydown, onPanelMousedown } =
  useFieldPanel({
    rootEl,
    panelRef,
    fieldEl: inputRef,
    // With no panel there is nothing to open. This is the composable's SINGLE cut-off
    // point, and every way in passes through it — clicking the field, focusing it, the
    // down arrow, Enter, the icon.
    disabled: () => resolvedDisabled.value || !hasPicker.value,
    focusInPanel,
    // Beside a field one types into, the panel opens WITHOUT taking the focus, so typing
    // carries on.
    focusOnOpen: () => !typing.value,
    onOpen: () => {
      // Only the picker works on a draft; the list writes its choice straight away.
      if (!hasPicker.value) return
      const parts = modelParts.value
      if (parts) draft.value = formatTime(parts.hour, parts.minute)
      else {
        // Opening on the current time when none is set. Reading the clock is safe here:
        // this runs from a handler, hence in a browser, never during a render — and it is
        // why the picker itself never reads it, so that it stays identical on both sides
        // of hydration. The instant is taken ONCE: two reads could straddle a minute.
        const now = new Date()
        const wanted = snapMinute(now.getMinutes(), props.minuteStep)
        // Pulled to the nearest time the restrictions allow, so that the panel never opens
        // on one the reader would be refused. Null is a set of restrictions that allows
        // nothing at all, which the warning above has already reported.
        draft.value =
          nearestAllowedTime(now.getHours(), wanted, limits.value) ??
          formatTime(now.getHours(), wanted)
      }
      pickerRef.value?.reset()
    },
    onClose: () => {
      pickerRef.value?.reset()
    },
  })

// @a11y
/**
 * TRAP — closing the panel hands the focus back to the field, and beside a field one
 * types into the panel opens ON FOCUS: the two would chase each other and the panel would
 * never close.
 *
 * This lock covers the focus call, which is synchronous. EVERY close that returns the
 * focus must go through here; closing directly brings the loop straight back.
 */
let refocusing = false
function closeAndFocus() {
  refocusing = true
  closePanel(true)
  refocusing = false
}

/** OK: the ONE route by which the picker's draft becomes the value. */
function confirm() {
  if (draft.value) model.value = draft.value
  closeAndFocus()
}

function cancel() {
  closeAndFocus()
}

// @a11y
/*
 * Emptying the value, called by the field as it emits its clear event.
 *
 * TRAP — the focus is taken here, under the lock, on purpose: the field focuses itself
 * immediately afterwards, and focusing an element that ALREADY has the focus emits no
 * event at all. That is what stops the panel reopening. Taking the lock away from this
 * function brings the reopening straight back.
 */
function clearValue() {
  model.value = null
  // The typed text is emptied EXPLICITLY: when the value was already empty, nothing
  // changes, and the guard that keeps the field and the value from chasing each other
  // would leave the text where it was.
  if (typing.value) writeField('')
  refocusing = true
  inputRef.value?.focus()
  refocusing = false
}

// Escape and the focus leaving both close WITHOUT committing, which is the picker's Cancel
// behaviour: closing never writes the value, and only OK does.

const m = useMessages()

// @core
/**
 * Saying no to a time that is not one the restrictions allow.
 *
 * The value is committed all the same — the field shows what was typed, and a consumer
 * bound to it reads the same thing — and the refusal is carried by the control's OWN
 * validity, which is what turns the field red through `:user-invalid` and what stops a
 * form being submitted with it. That is the design system's route for a rule of its own
 * making (`useTextLimit`), never an event of its own invention.
 *
 * It is written unconditionally rather than only while typing: the browser BARS a
 * read-only control from constraint validation, so the read-only form settles it without
 * a branch here. The list form never reaches this at all, having no control of this
 * component's own to write on.
 */
watchEffect(
  () => {
    const el = fieldEl.value
    if (!el) return
    el.setCustomValidity(valueAllowed.value ? '' : m.value.timeInput.unavailable)
  },
  { flush: 'post' },
)

/* From here on: everything the typed field needs. */

const currentMeridiem = (): Meridiem => meridiem.value

/*
 * The mask machinery — the text being typed, the bridge to the value, the reformatting
 * that preserves the caret, the commit and the silent revert — is shared with VDateInput
 * and lives in `useMaskedField`.
 *
 * The time vocabulary is the simpler of the two: four digits, and a separator that is the
 * SAME in every language. That is why the caret can be computed outright here, where a
 * date has to look for a separator it cannot predict; and why nothing distinguishes a
 * final commit from a live one, there being no equivalent of expanding a two-digit year.
 */
const {
  draft: maskDraft,
  fieldModel,
  writeField,
  commitLive,
  commitOrRevert,
  onFieldInput,
} = useMaskedField({
  fieldEl,
  typing: () => typing.value,
  displayText: () => displayText.value,
  readValue: () => model.value,
  writeValue: (time) => {
    model.value = time
  },
  maxDigits: () => 4,
  format: formatTimeMask,
  caret: (_text, digitsBefore, inserting) => timeCaret(digitsBefore, inserting),
  parse: (text) => parseTimeMask(text, resolvedFormat.value, currentMeridiem()),
  toMask: (time) => timeToMask(time, resolvedFormat.value),
})

// @keyboard @core — the keys the mask itself needs, plus the down arrow, which is the one
// explicit way from the field into the picker.
function onFieldKeydown(event: KeyboardEvent) {
  if (!typing.value) return
  const el = fieldEl.value
  if (!el) return

  if (event.key === 'Enter') {
    // Cancelling the default does two things at once: it stops the surrounding form from
    // being submitted, and it stops the panel this keystroke has just closed from being
    // reopened as the event travels up to the root.
    event.preventDefault()
    commitOrRevert()
    if (open.value) closeAndFocus()
    return
  }
  if (event.key === 'ArrowDown' && open.value && hasPicker.value) {
    // The one explicit route from the field into the picker.
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
      // TRAP — the separator is PLACED by the mask and never typed, so erasing one has to
      // erase the DIGIT before it. Left alone, the mask would write it straight back and
      // the key would look dead.
      event.preventDefault()
      const n = digitsOf(el.value.slice(0, start)).length
      const digits = digitsOf(el.value)
      writeField(formatTimeMask(digits.slice(0, n - 1) + digits.slice(n)), timeCaret(n - 1))
      commitLive()
    }
    return
  }
  // Typing anything that is not a digit — the separator included, so that "9:30" can be
  // typed exactly as it reads — completes the hour with a leading zero and moves on to
  // the minutes.
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

/**
 * Pasting. A time recognizable as a whole is adopted as it stands; anything else
 * contributes its digits alone.
 */
function onFieldPaste(event: ClipboardEvent) {
  if (!typing.value) return
  const el = fieldEl.value
  if (!el) return
  event.preventDefault()
  const pasted = (event.clipboardData?.getData('text') ?? '').trim()
  // A pasted 24-hour time is read as one whatever clock is on display: "19:05" means
  // seven in the evening even in a field showing a 12-hour clock.
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

/*
 * TRAP — the list form must not reach these two at all, and being panel-less is not
 * enough to keep it out. `useFieldPanel.onKeydown` cancels the default on Enter BEFORE
 * asking whether a panel can open, so an Enter travelling up from the VCombobox would
 * stop a surrounding form from being submitted with nothing to show for it.
 */
function onRootKeydown(event: KeyboardEvent) {
  if (isList.value) return
  if (typing.value && event.key === 'Escape' && open.value) {
    event.preventDefault()
    closeAndFocus()
    return
  }
  onKeydown(event)
}

function onRootFocusout(event: FocusEvent) {
  if (!isList.value) onFocusout(event)
}

/*
 * From here on: everything the list form needs.
 *
 * The list is a VCombobox, so the whole ARIA listbox pattern — the panel, the highlight,
 * the scroll onto the chosen row, the commit and the dismissal — comes from there and
 * NONE of it is written here. What is left is the three things a combobox cannot know
 * about times: which rows to offer, how a search matches one, and the fact that this
 * component's value is a nullable string where a combobox's is a plain one.
 */

/**
 * The rows on offer.
 *
 * A value that is not ON the step is added to them, in order: it is a real value, so the
 * field has to be able to write it out and the panel to open on it. Without it the field
 * would fall back to showing the raw canonical string — "09:07" in a field that spells
 * every other row "9:07 AM" — since a combobox labels a value through the option carrying
 * it.
 */
const options = computed<TimeOption[]>(() => {
  if (!isList.value) return []
  const rows = timeList(props.minuteStep, resolvedLocale.value, resolvedFormat.value).filter(
    (row) => {
      // A list is READ before it is chosen from, so a time it may not take has no reason
      // to be in it — the opposite of the picker, where a disabled numeral is what makes a
      // bound legible against the hours around it.
      const parts = parseTime(row.value)
      return !parts || isTimeAllowed(parts.hour, parts.minute, limits.value)
    },
  )
  const current = model.value
  if (!isValidTime(current) || rows.some((row) => row.value === current)) return rows
  const at = rows.findIndex((row) => row.value > current)
  const extra: TimeOption = {
    value: current,
    label: formatDisplay(current, resolvedLocale.value, resolvedFormat.value),
  }
  return at < 0 ? [...rows, extra] : [...rows.slice(0, at), extra, ...rows.slice(at)]
})

/**
 * The search, which accepts the digit run as well as the words — "930" finds 9:30, the way
 * the typed form's mask reads what it is given. The rule itself is pure and lives in
 * `./search`, which says why it is not in `utils/time.ts`.
 */
const matchTime = (option: TimeOption, query: string) =>
  timeMatches(option.label, option.value, query)

/**
 * The bridge to VCombobox, whose value is a plain string where this component's is
 * nullable: an emptied combobox says so with an empty string, which is not a time.
 */
const listModel = computed<string | string[]>({
  get: () => model.value ?? '',
  set: (value) => {
    model.value = typeof value === 'string' && value ? value : null
  },
})

/*
 * The clear cross and the icon at the end of the field, for the two forms this component
 * builds itself; the list form gets both from VCombobox.
 *
 * The cross is the field's own, which renders it BEFORE the end icon rather than in its
 * place — the convention every field in the design system follows.
 *
 * Whether the cross is shown has to be answered explicitly here: outside the typed mode
 * the field is read-only and would hide it, while the value comes from the panel.
 */
const canClear = computed(
  () =>
    props.clearable &&
    !resolvedDisabled.value &&
    (hasValue.value || (typing.value && !!maskDraft.value)),
)
const endIcon = computed<IconSource | undefined>(() =>
  hasPicker.value ? props.pickerIcon : undefined,
)
// @a11y @devwarn
/*
 * TRAP — the LABEL is passed at all times, even when no icon is rendered at all.
 *
 * The helper detecting a click handler on an icon warns AT SETUP if one is attached
 * without a label, and it has no way of knowing whether an icon exists. Since the
 * listener here is attached permanently and that detection is static, making the label
 * conditional would produce a false warning every time a typed field without a picker is
 * mounted.
 */
const endIconLabel = computed(() => m.value.timeInput.openPicker)

function onEndIcon() {
  if (open.value) closeAndFocus()
  else openPanel(true)
}
</script>

<template>
  <div
    ref="rootEl"
    class="v-time-input"
    :class="rootClass"
    :style="rootStyle"
    :data-open="open ? '' : undefined"
    :data-mode="resolvedMode"
    @focusout="onRootFocusout"
    @keydown="onRootKeydown"
  >
    <!-- The list form is a VCombobox and nothing else: a list one picks a value from and
         narrows by typing IS the combobox pattern, down to the chevron, the clear cross
         and the dismissal. All this component adds is the three things a combobox cannot
         know about times — the rows, the search, and a value that may be nothing. -->
    <VCombobox
      v-if="isList"
      v-model="listModel"
      v-bind="forwardedAttrs"
      :options="options"
      :filter="matchTime"
      :label="label"
      :hint="hint"
      :placeholder="placeholder"
      :size="resolvedSize"
      :compact="resolvedCompact"
      :disabled="resolvedDisabled"
      :invalid="invalid"
      :clearable="clearable"
      :placement="placement"
    />

    <div v-else class="v-time-input-control" @click="onControlClick">
      <!-- The field is declared a combobox rather than left as the plain text box it
           implicitly is, because a text box may not carry the attribute saying whether
           something is expanded — the same reasoning as in VDateInput. -->
      <VInput
        ref="inputRef"
        v-model="fieldModel"
        :inputmode="typing ? 'numeric' : undefined"
        :autocomplete="typing ? 'off' : undefined"
        v-bind="forwardedAttrs"
        :readonly="!typing"
        :label="label"
        :hint="hint"
        :placeholder="placeholder ?? (typing ? m.timeInput.maskPlaceholder : undefined)"
        :size="resolvedSize"
        :compact="resolvedCompact"
        :disabled="resolvedDisabled"
        :invalid="invalid"
        :clearable="clearable"
        :clear-visible="canClear"
        :clear-label="m.timeInput.clear"
        :icon-end="endIcon"
        :icon-end-label="endIconLabel"
        :role="hasPicker ? 'combobox' : undefined"
        :aria-haspopup="hasPicker ? 'dialog' : undefined"
        :aria-expanded="hasPicker ? open : undefined"
        :aria-controls="hasPicker ? panelId : undefined"
        @click:icon-end="onEndIcon"
        @clear="clearValue"
        @focus="onFieldFocus"
        @input="onFieldInput"
        @change="commitOrRevert"
        @blur="commitOrRevert"
        @keydown="onFieldKeydown"
        @paste="onFieldPaste"
      >
        <!-- The AM/PM button sits beside the value it qualifies, before the controls that
             clear the field and open the panel. It carries `.v-input-action`, which is
             what the field's own buttons wear AND what tells the shell that a click here
             is that button's business rather than a reason to open the panel.

             The rule after it separates what acts on the VALUE from what acts on the
             FIELD. It is dropped when nothing follows it, or it would trail off the end
             of an otherwise bare field. -->
        <template v-if="hasMeridiem" #value-end>
          <button
            type="button"
            class="v-input-action v-time-input-meridiem"
            :disabled="resolvedDisabled"
            :aria-label="
              m.timeInput.meridiem(meridiem === 'PM' ? m.timePicker.pm : m.timePicker.am)
            "
            @click="toggleMeridiem"
          >
            {{ meridiem === 'PM' ? m.timePicker.pm : m.timePicker.am }}
          </button>
          <VSeparator
            v-if="canClear || endIcon"
            orientation="vertical"
            class="v-time-input-divider"
          />
        </template>
      </VInput>
    </div>

    <!-- With no panel rendered there is nothing to hold a reference to, and the open state
         — which is fed by the panel's own events — can no longer become true. The absence
         of a panel is therefore self-enforcing. -->
    <VPopover
      v-if="hasPicker"
      :id="panelId"
      ref="panelRef"
      v-model:open="open"
      mode="manual"
      anchor="--time-input-anchor"
      :placement="placement"
      role="dialog"
      class="v-time-input-panel"
      :aria-label="label ?? m.timeInput.pickerLabel"
      @mousedown="onPanelMousedown"
    >
      <!-- The picker works on the DRAFT and not on the value, which is what makes OK the
           only way in: Cancel, Escape and the focus leaving simply drop it. The two
           actions are handed to its own footer slot, since they belong to this panel
           rather than to a clock shown on its own. -->
      <VTimePicker
        ref="pickerRef"
        v-model="draft"
        :format="resolvedFormat"
        :locale="resolvedLocale"
        :minute-step="minuteStep"
        :min="min"
        :max="max"
        :allowed-hours="allowedHours"
        :allowed-minutes="allowedMinutes"
        @confirm="confirm"
      >
        <template #footer>
          <VButton variant="ghost" tone="neutral" @click="cancel">{{ m.common.cancel }}</VButton>
          <VButton @click="confirm">{{ m.common.confirm }}</VButton>
        </template>
      </VTimePicker>
    </VPopover>
  </div>
</template>

<style>
@layer vectis.components {
  .v-time-input {
    /* Confines the anchor name to this instance. It is declared on the root because that
       is the common ancestor of the field and the panel. */
    anchor-scope: --time-input-anchor;
    display: block;
    width: 100%;
    font-family: var(--vectis-text-family);
  }

  .v-time-input-control {
    cursor: pointer;
  }

  /* The anchor is the FIELD's box and not this wrapper's, which also holds the label and
     the hint: anchored to the wrapper, the panel opens a hint's height below the field, and
     a label's height above it once there is no room below and `flip-block` turns it over.
     Against the field it covers whichever of the two it lands on, which is what a panel
     belonging to a control is supposed to do.

     TRAP — the selector has to start at the wrapper and never at the root. In `list` mode
     that wrapper is not rendered at all and the field on screen belongs to a VCombobox,
     which names it `--combobox-anchor` from its own sheet at the same (0,2,0): written
     `.v-time-input .v-input-field`, this rule would put a SECOND `anchor-name` on that very
     element, and which of the two survived would be decided by the order the consumer's
     bundler gave the two sheets. The list's panel would then lose its anchor and paint
     itself at the viewport origin, with nothing in the console to say why. */
  .v-time-input-control .v-input-field {
    anchor-name: --time-input-anchor;
  }

  /* A field one types into shows the text cursor rather than the pointer a clickable
     control shows. Its figures are also given equal widths: with proportional ones the
     text shifts as digits are typed, and the caret appears to jitter. */
  .v-time-input[data-mode='input'] .v-time-input-control {
    cursor: text;
  }

  .v-time-input[data-mode='input'] .v-input-control {
    font-variant-numeric: tabular-nums;
  }

  /* The AM/PM button wears the field's own action recipe — the box, the muted colour that
     lights up on hover, the focus ring and the disabled state all come from
     `.v-input-action` — and changes only what a WORD needs that a glyph does not: room to
     be read, and the field's type rather than the browser's default button font.

     The floor keeps the hit target at the size of its neighbours, so the two spellings do
     not resize the field between them.

     The padding is DERIVED and not picked from the spacing scale: `.v-input-action` carries
     a negative inline margin that cancels the slack around a glyph inside its box, so that
     the row's gap is measured from the INK. A word fills its own box, so it has to put that
     slack back or it would sit a couple of pixels off the rhythm its neighbours keep —
     which reads as an asymmetry around the rule, whose two sides are otherwise identical.

     The selector compounds the two classes because they are the same specificity in two
     different sheets, and which one the consumer's bundler puts last is not ours to
     decide. */
  .v-input-action.v-time-input-meridiem {
    inline-size: auto;
    min-inline-size: var(--control-action-size);
    padding-inline: calc((var(--control-action-size) - var(--vectis-icon-size)) / 2);
    font: inherit;
  }

  /* The rule between the AM/PM button and the field's own controls, which is what keeps a
     word from reading as a third icon in the row.

     A vertical VSeparator stretches to its flex line by contract, which here is the full
     height of the field: it would meet the border at both ends and read as a division of
     the box rather than a break in the row. It is brought back to the height of the
     buttons on either side of it.

     `align-self` and the height are declared against the ORIENTATION branch, which is the
     one that stretches, and beating it takes the extra class: the compound alone would tie
     with it. */
  .v-separator[data-orientation='vertical'].v-time-input-divider {
    align-self: center;
    block-size: var(--control-action-size);
  }

  /* The anchoring and the panel's surface both come from VPopover; what is left here is
     the padding around the picker. The picker brings its own layout — including the gap
     between its parts and the centring of the face — so nothing of that is declared here.

     TRAP — NO `display` here, and that is not an omission. The column layout comes from
     `.v-panel`, which is (0,1,0) and therefore loses to `.v-overlay:not(:popover-open)`, the
     guard that hides a closed popover. This selector is (0,2,0): declaring a display on it
     would TIE with that guard, and a tie between two sheets is settled by whichever the
     consumer's bundler put last. The symptom when the component wins is silent and nasty —
     the closed panel keeps its box, invisible at `opacity: 0` and fixed over the page, and
     swallows every click that lands on it.

     The selector compounds two classes VPopover puts on the same element, because the
     padding is also declared by the shared panel class: at equal specificity the winner
     would be whichever sheet the consumer's bundler put last. The size attribute cannot
     serve that purpose here — the picker's panel carries none. */
  .v-popover-panel.v-time-input-panel {
    width: max-content;
    padding: var(--vectis-space-3);
    color: var(--vectis-color-text);
  }

  /* The list form is a VCombobox and takes everything from it — this is the one
     declaration that does not belong to a combobox in general.

     A column of times read down the panel is a column of FIGURES, and proportional ones
     slide the colon from row to row. The selector is (0,2,0) against the panel's own
     (0,1,0), so it wins on specificity and not on the order the consumer's bundler
     happens to give the two sheets. */
  .v-time-input[data-mode='list'] .v-combobox-panel {
    font-variant-numeric: tabular-nums;
  }
}
</style>
