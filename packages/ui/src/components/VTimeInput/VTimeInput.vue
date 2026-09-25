<script setup lang="ts">
// @a11y @core
/**
 * A field for choosing a time. Three forms, and only two of them are built here.
 *
 * `input` types hours and minutes behind a mask, optionally with a clock beside it, and
 * `picker` makes that clock the only way in. What the field is FOR is a different question
 * from the `readonly` prop, which freezes whatever it holds by every route at once. Both use the VDateInput shell
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

import { computed, inject, provide, ref, watchEffect } from 'vue'

import VButton from '../VButton/VButton.vue'
import VCombobox from '../VCombobox/VCombobox.vue'
import type { ComboboxOption } from '../VCombobox/VCombobox.vue'
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
import type { TimePickerAllowed } from '../VTimePicker/limits'
import {
  formatTime,
  formatTimeDisplay,
  hourCycleFor,
  isValidTime,
  parseTime,
} from '../../utils/time'
import {
  formatTimeMask,
  parseTimeMask,
  snapMinute,
  timeCaret,
  timeList,
  timeToMask,
  to12h,
  withMeridiem,
} from '../../utils/clock'
import type { Meridiem } from '../../utils/time'
import type { TimeOption } from '../../utils/clock'
import { readWrittenTime, timeMatches } from './search'
import { isDev } from '../../utils/env'
import { hostWarnsKey } from '../../utils/hostWarns'
import { digitsOf } from '../../utils/text'

import { useControlShape } from '../../composables/useControlShape'
import { useRootAttrs } from '../../composables/useRootAttrs'

import { useFieldPanel } from '../../composables/useFieldPanel'
import { canClear } from '../../composables/useClearable'
import { iconStartListener } from '../../composables/useIconClickHandlers'
import { useMaskedField } from '../../composables/useMaskedField'
import { useMessages, useResolvedLocale } from '../../i18n/state'

/**
 * Whether the field can be typed into, only filled from the clock, or picked from a list of
 * times.
 */
export type TimeInputMode = 'picker' | 'input' | 'list'

/** What the `#footer` slot receives. */
export interface TimeInputFooterSlotProps {
  /** Writes the time on the clock into the value, then closes. */
  confirm: () => void
  /** Closes and drops the time on the clock, the value left as it was. */
  cancel: () => void
  /** The same as `cancel`, under the name VDateInput's footer uses. */
  close: () => void
}

const MODES: TimeInputMode[] = ['picker', 'input', 'list']

/** Where the panel opens relative to the field, whether it holds the clock or the list. */
export type TimeInputPlacement =
  'bottom' | 'bottom-start' | 'bottom-end' | 'top' | 'top-start' | 'top-end'

/** The height of the field: 32, 40 or 48 pixels. */
export type TimeInputSize = 'sm' | 'md' | 'lg'

interface TimeInputProps {
  /**
   * Whether times are shown on a 12- or a 24-hour clock. Left out, the reader's language
   * decides, which is almost always what one wants.
   */
  format?: TimePickerFormat
  /**
   * Which form the field takes: one that can be TYPED into, a `picker` one where the
   * clock is the only way in (so the picker is forced on there), or a searchable LIST of
   * times at a fixed interval, where a picker would make no sense.
   */
  mode?: TimeInputMode
  /**
   * Offers the picker beside a field one can type into: an icon at the end of the field,
   * and a panel it opens.
   *
   * It means nothing in `picker` mode, where the clock is already the only way to choose,
   * nor in `list` mode, which has a panel of its own. VDateInput reads it the same way.
   */
  showPicker?: boolean
  /**
   * The interval between two times that can be chosen. It applies to the picker, to the
   * arrow keys and to the rows of the list.
   */
  minuteStep?: number
  /**
   * The earliest time that can be chosen, inclusive, as a canonical 24-hour `'HH:mm'`.
   * The picker and the list both LEAVE OUT what it rules out, and a time typed past it
   * makes the field invalid.
   */
  min?: string
  /** The latest time that can be chosen, inclusive, written like `min`. */
  max?: string
  /**
   * Which hours can be chosen: the list of them, or a rule answering for one. The hour
   * handed to a rule is always the 24-hour one, whichever clock is on display.
   */
  allowedHours?: TimePickerAllowed
  /** Which minutes can be chosen: the list of them, or a rule answering for one. */
  allowedMinutes?: TimePickerAllowed
  /**
   * A BCP 47 locale, which decides the clock and how a time is written out. It TAKES
   * PRECEDENCE over the design system's global locale and falls back to it, which is why
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
  size?: TimeInputSize
  /** Takes 4px off the height. */
  compact?: boolean
  /** Makes the field unusable, greyed out through the colour tokens. */
  disabled?: boolean
  /**
   * Shows the time without letting it be changed: nothing can be typed, there is no
   * clock and no clear cross. The field stays focusable and can be copied from, which
   * is what separates it from `disabled`, and it is a different question from `mode`,
   * which says how a field that CAN be changed is filled in.
   */
  readonly?: boolean
  /** Marks the field as invalid, for a rule of your own. */
  invalid?: boolean
  /**
   * An icon inside the field, at the start. It is decorative by default and becomes a
   * real button as soon as a `@click:icon-start` listener is attached, in which case it
   * needs `iconStartLabel`.
   */
  iconStart?: IconSource
  /** What the start icon does, in words, once it is clickable. */
  iconStartLabel?: string
  /**
   * What the clock button does, in words. It names the button `pickerIcon` renders,
   * and falls back to the design system dictionary.
   */
  pickerIconLabel?: string
  /**
   * Shows a spinner at the end of the field, in place of the clock icon. It says that
   * something is being loaded and changes nothing else: the field can still be typed
   * into and the panel still opens.
   */
  loading?: boolean
  /**
   * What screen readers announce while the spinner turns. It falls back to the design
   * system dictionary.
   */
  loadingText?: string
  /** Offers a cross that empties the value, shown before the end icon. */
  clearable?: boolean
  /** What that cross does, in words. It falls back to the design system dictionary. */
  clearLabel?: string
  /**
   * The icon that opens the PICKER, at the end of the field. It has no effect on the list
   * form, whose chevron follows the combobox convention. The clear cross appears to its
   * left rather than in its place.
   */
  pickerIcon?: IconSource
  /** Where the panel opens relative to the field, whether it holds the clock or the list. */
  placement?: TimeInputPlacement
}

const props = withDefaults(defineProps<TimeInputProps>(), {
  format: undefined,
  // Deliberately left undefined rather than defaulted to the typed mode: that is what
  // distinguishes "the prop was not given" from "the prop was given this value", and
  // therefore what allows warning ONLY the consumer who explicitly asked for something
  // that cannot work.
  mode: undefined,
  showPicker: false,
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
  readonly: false,
  invalid: false,
  iconStart: undefined,
  iconStartLabel: undefined,
  pickerIconLabel: undefined,
  loading: false,
  loadingText: undefined,
  clearable: false,
  clearLabel: undefined,
  pickerIcon: () => scheduleIcon,
  placement: 'bottom-start',
})

/**
 * The time, always as a 24-hour "HH:mm" string whatever clock is displayed. A consumer
 * therefore never has to know which clock the reader's language uses.
 */
const model = defineModel<string | null>({ default: null })

const emit = defineEmits<{
  /** The clear cross emptied the field. The value has already been reset. */
  clear: []
  /** The start icon was clicked. Attaching this listener is what makes it a button. */
  'click:icon-start': [event: MouseEvent]
}>()

defineSlots<{
  /**
   * Content at the start of the field, rendered after `iconStart` rather than in its place,
   * as in VInput.
   */
  start?(): unknown
  /**
   * Controls of your own inside the field, after the AM/PM button when there is one and
   * before the ones the field owns: the clear cross and the icon that opens the panel.
   * Those two are this component's own affordance, which is why there is no `#end` here.
   */
  'value-end'?(): unknown
  /**
   * The strip at the foot of the clock, which REPLACES the Cancel and OK buttons rather
   * than joining them.
   *
   * It receives both actions, and they are what make the slot usable: the clock writes a
   * DRAFT that only `confirm` commits, so a footer of your own without it would leave the
   * value unchangeable through the panel. `cancel` drops the draft and closes, and `close`
   * is the same function under the name VDateInput's footer hands out.
   *
   * It is not rendered in `list` mode, which has no panel of this component's own.
   */
  footer?(props: TimeInputFooterSlotProps): unknown
}>()

// `class` and `style` stay on the wrapper; everything else goes down to the text field,
// which is what a consumer's label points at and what assistive technology deals with.
defineOptions({ inheritAttrs: false })
const { rootClass, rootStyle, forwardedAttrs } = useRootAttrs()

// Declared as this component's own event, `click:icon-start` is out of `$attrs`, so the
// listener is relayed to the field by hand — and only when the consumer wrote one.
const iconStartClick = iconStartListener((event) => emit('click:icon-start', event))

/** What reaches the field on screen — the masked VInput or the list's VCombobox. */
const fieldAttrs = computed(() => ({ ...forwardedAttrs.value, ...iconStartClick }))

const rootEl = ref<HTMLElement | null>(null)
const panelRef = ref<InstanceType<typeof VPopover> | null>(null)
const inputRef = ref<InstanceType<typeof VInput> | null>(null)
const listRef = ref<InstanceType<typeof VCombobox> | null>(null)
const pickerRef = ref<InstanceType<typeof VTimePicker> | null>(null)

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
 * Whether this component builds a panel of its own, which is the clock's: the list form
 * hands that job to VCombobox. It is forced on a `picker` field, where nothing else could
 * fill it, and offered beside a field one types into. A frozen field has none: there is
 * nothing left for a panel to do.
 */
const hasPanel = computed(
  () => !props.readonly && (resolvedMode.value === 'picker' || (typing.value && props.showPicker)),
)

const resolvedLocale = useResolvedLocale(() => props.locale)

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
  // The clock receives `minuteStep` and the restrictions as they stand, so what it would say
  // about them is said here, under the name the consumer wrote (utils/hostWarns).
  provide(hostWarnsKey, true)
  watchEffect(() => {
    if (!Number.isInteger(props.minuteStep) || props.minuteStep < 1 || 60 % props.minuteStep !== 0)
      console.warn(`[VTimeInput] minuteStep ${props.minuteStep} — a divisor of 60 is expected.`)
    if (props.mode !== undefined && !MODES.includes(props.mode))
      console.warn(
        `[VTimeInput] unknown mode "${props.mode}": use "input" (the default), "picker" or "list".`,
      )
    if (isList.value && props.showPicker)
      console.warn(
        '[VTimeInput] showPicker is ignored in "list" mode: the list of times is the only panel.',
      )
    // The list form is a VCombobox, which draws the end of the field itself: its own
    // chevron in place of the clock. The two props that describe THIS component's end icon
    // therefore reach nothing at all, and their absence is invisible on screen.
    // `loadingText` is not among them: the combobox announces the loading with it.
    const inert = ([] as string[]).concat(
      props.pickerIcon !== scheduleIcon ? 'pickerIcon' : [],
      props.pickerIconLabel ? 'pickerIconLabel' : [],
    )
    const isAre = inert.length > 1 ? 'are' : 'is'
    if (isList.value && inert.length > 0)
      console.warn(
        `[VTimeInput] ${inert.join(', ')} ${isAre} ignored in "list" mode: the list draws its own chevron.`,
      )
    // A field one types into without the picker has no end icon either, as in VDateInput.
    // A read-only field is left out: it is a state that comes and goes, not a configuration
    // to correct.
    if (typing.value && !props.showPicker && inert.length > 0)
      console.warn(
        `[VTimeInput] ${inert.join(', ')} ${isAre} ignored without showPicker: a field one types into has no clock icon unless it offers the clock.`,
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
const pickerDraft = ref<string | null>(null)

const modelParts = computed(() => parseTime(model.value))

/** The half of the day chosen while no time is set: VTimePicker's own `pendingMeridiem`. */
const pendingMeridiem = ref<Meridiem>('AM')

/**
 * The half of the day the FIELD is showing. It is what the mask needs: typing "9:30" says
 * nothing about the morning or the afternoon, so the answer has to be readable while the
 * panel is shut.
 */
const currentMeridiem = computed<Meridiem>(() => {
  // With the picker open it is the DRAFT that is on screen, and this control has to read
  // the same thing: two controls showing opposite halves of the day until OK is pressed
  // is the one state that must not happen.
  const parts = open.value && hasPanel.value ? parseTime(pickerDraft.value) : modelParts.value
  return parts ? to12h(parts.hour).meridiem : pendingMeridiem.value
})

/**
 * The button beside the value flips the half of the day. There is no third state to reach,
 * so it names the half it is showing and swaps to the other one on a click.
 */
function toggleMeridiem() {
  const next: Meridiem = currentMeridiem.value === 'PM' ? 'AM' : 'PM'
  pendingMeridiem.value = next
  // With no time set there is nothing to convert, so the choice is simply REMEMBERED
  // and applies to the first time typed or chosen.
  const moved = withMeridiem(model.value, next)
  if (moved) model.value = moved
  // With the picker open the draft has to follow as well, or OK would write back the
  // half of the day the reader has just changed.
  const pending = open.value && hasPanel.value ? withMeridiem(pickerDraft.value, next) : null
  if (pending) pickerDraft.value = pending
}

/**
 * Whether the button is rendered at all. Only the typed form needs it: the `picker` form
 * reaches the clock, which carries its own AM/PM, and the list already spells the half of
 * the day out on every row. It writes the value, so a frozen field renders none.
 */
const hasMeridiem = computed(
  () => typing.value && !props.readonly && resolvedFormat.value === '12h',
)

const hasValue = computed(() => !!modelParts.value)
const displayText = computed(() =>
  model.value ? formatTimeDisplay(model.value, resolvedLocale.value, resolvedFormat.value) : '',
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
const {
  size: resolvedSize,
  compact: resolvedCompact,
  disabled: resolvedDisabled,
} = useControlShape(props, group)

// The whole "field plus panel" shell, shared with VDateInput. What is specific to this
// component is only what happens around it: preparing the draft as the panel opens, and
// clearing the announcement as it closes.
const {
  open,
  panelId,
  closeAndFocus,
  focusField,
  onFieldFocus,
  toggleFromIcon,
  onControlClick,
  onFocusout,
  onKeydown,
  onPanelMousedown,
} = useFieldPanel({
  rootEl,
  panelRef,
  field: inputRef,
  // With no panel there is nothing to open. This is the composable's SINGLE cut-off
  // point, and every way in passes through it — clicking the field, focusing it, the
  // down arrow, Enter, the icon.
  disabled: () => resolvedDisabled.value || !hasPanel.value,
  focusInPanel,
  // Beside a field one types into, the panel opens on focus WITHOUT taking it, so typing
  // carries on.
  openOnFocus: () => typing.value,
  onOpen: () => {
    const parts = modelParts.value
    if (parts) pickerDraft.value = formatTime(parts.hour, parts.minute)
    // A clock opened BESIDE a field one types into starts empty: it opened because the
    // field took the focus, not because a time was asked for, and a draft set to the
    // current time would hand its half of the day to the digits about to be typed, so
    // "0930" typed in the afternoon would become 21:30.
    else if (typing.value) pickerDraft.value = null
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
      pickerDraft.value =
        nearestAllowedTime(now.getHours(), wanted, limits.value) ??
        formatTime(now.getHours(), wanted)
    }
    pickerRef.value?.reset()
  },
  onClose: () => {
    pickerRef.value?.reset()
  },
})

/** OK: the ONE route by which the picker's draft becomes the value. */
function confirm() {
  if (pickerDraft.value) model.value = pickerDraft.value
  closeAndFocus()
}

/** Cancel: the draft is simply dropped with the panel. */
const cancel = closeAndFocus

// @a11y
// TRAP — the popup wiring is spread OVER the forwarded attributes, never bound as four
// attributes after them. A binding written after `v-bind` wins even when it is
// `undefined`, so a field with no panel would erase the consumer's own `role` or
// `aria-controls`; spread, the wiring carries no key at all when there is no panel, and
// wins over the consumer's when there is one, which is what a combobox needs.
const inputAttrs = computed(() =>
  hasPanel.value
    ? {
        ...fieldAttrs.value,
        role: 'combobox',
        'aria-haspopup': 'dialog',
        'aria-expanded': open.value,
        'aria-controls': panelId,
      }
    : fieldAttrs.value,
)

/*
 * Emptying the value, called by the field as it emits its clear event. The focus is taken
 * through `focusField`, whose note says why that stops the panel reopening.
 */
function clearValue() {
  model.value = null
  // The typed text is emptied EXPLICITLY: when the value was already empty, nothing
  // changes, and the guard that keeps the field and the value from chasing each other
  // would leave the text where it was.
  if (typing.value) writeField('')
  focusField()
  emit('clear')
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
    const own = m.value.timeInput.unavailable
    if (!valueAllowed.value) el.setCustomValidity(own)
    // Only the component's own message is taken back: a consumer's verdict written over it,
    // a server saying the slot is taken, stays until the consumer clears it.
    else if (el.validationMessage === own) el.setCustomValidity('')
  },
  { flush: 'post' },
)

/* From here on: everything the typed field needs. */

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
  draft,
  fieldModel,
  writeField,
  commitOrRevert,
  onFieldInput,
  onKeydown: onMaskKeydown,
  onPaste,
} = useMaskedField({
  fieldEl,
  typing: () => typing.value,
  displayText: () => displayText.value,
  readValue: () => model.value,
  writeValue: (time) => {
    model.value = time
    // With the clock open beside the field, it follows what is typed: otherwise OK would
    // write the clock's time back over the one the reader has just typed.
    if (open.value && hasPanel.value) pickerDraft.value = time
  },
  maxDigits: () => 4,
  format: formatTimeMask,
  caret: (_text, digitsBefore, inserting) => timeCaret(digitsBefore, inserting),
  parse: (text) => parseTimeMask(text, resolvedFormat.value, currentMeridiem.value),
  toMask: (time) => timeToMask(time, resolvedFormat.value),
})

// @keyboard
// What the mask's keys mean for a time: typing anything that is not a digit,
// the separator included so that "9:30" can be typed exactly as it reads, completes the
// hour with a leading zero and moves on to the minutes; the down arrow is the one explicit
// way from the field into the picker.
function onFieldKeydown(event: KeyboardEvent) {
  onMaskKeydown(event, {
    onSeparator: (el) => {
      const digits = digitsOf(el.value)
      if (digits.length === 1) writeField(formatTimeMask(`0${digits}`), 3)
    },
    onArrowDown: () => {
      if (!open.value) return false
      focusInPanel()
      return true
    },
    onEnter: closeAndFocus,
  })
}

/**
 * Pasting. A time recognizable as a whole is adopted as it stands — and a pasted 24-hour
 * time is read as one whatever clock is on display: "19:05" means seven in the evening
 * even in a field showing a 12-hour clock. Anything else contributes its digits alone.
 */
function onFieldPaste(event: ClipboardEvent) {
  onPaste(event, (pasted) =>
    isValidTime(pasted)
      ? pasted
      : readWrittenTime(pasted, resolvedFormat.value, currentMeridiem.value),
  )
}

/*
 * TRAP — the list form must not reach these two at all, and being panel-less is not
 * enough to keep it out. `useFieldPanel.onKeydown` cancels the default on Enter BEFORE
 * asking whether a panel can open, so an Enter travelling up from the VCombobox would
 * stop a surrounding form from being submitted with nothing to show for it.
 */
function onRootKeydown(event: KeyboardEvent) {
  if (!isList.value) onKeydown(event)
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
 * The rows the step and the restrictions offer, which the value does not enter into: a
 * change of value must not format up to 1440 times again.
 */
const baseOptions = computed<TimeOption[]>(() => {
  if (!isList.value) return []
  return timeList(props.minuteStep, resolvedLocale.value, resolvedFormat.value).filter((row) => {
    // A list is READ before it is chosen from, so a time it may not take has no reason to be
    // in it, which is the picker's own rule for its numerals.
    const parts = parseTime(row.value)
    return !parts || isTimeAllowed(parts.hour, parts.minute, limits.value)
  })
})

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
  const rows = baseOptions.value
  const current = model.value
  if (!isValidTime(current) || rows.some((row) => row.value === current)) return rows
  const at = rows.findIndex((row) => row.value > current)
  const extra: TimeOption = {
    value: current,
    label: formatTimeDisplay(current, resolvedLocale.value, resolvedFormat.value),
  }
  return at < 0 ? [...rows, extra] : [...rows.slice(0, at), extra, ...rows.slice(at)]
})

/**
 * The search, which accepts the digit run as well as the words — "930" finds 9:30, the way
 * the typed form's mask reads what it is given. The rule itself is pure and lives in
 * `./search`, which says why it is not in `utils/time.ts`.
 */
const matchTime = (option: ComboboxOption, query: string) =>
  timeMatches(option.label, String(option.value), query)

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
 * the field is read-only and would hide it, while the value comes from the panel. The
 * `readonly` PROP is the one case where that default answer was right: frozen, the field
 * offers no route to a new value, so it offers no route to none either.
 */
const clearVisible = computed(() =>
  canClear(props, resolvedDisabled.value, hasValue.value || (typing.value && !!draft.value)),
)
const endIcon = computed<IconSource | undefined>(() =>
  hasPanel.value ? props.pickerIcon : undefined,
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
const endIconLabel = computed(() => props.pickerIconLabel ?? m.value.timeInput.openPicker)
const resolvedClearLabel = computed(() => props.clearLabel ?? m.value.timeInput.clear)

/*
 * The three of them go through whichever field is on screen: in the list form there is no
 * VInput of this component's own, the VCombobox owning the one the reader sees. Exposing
 * the same trio as the other fields is what keeps a consumer's `ref` working whatever the
 * mode, which is a runtime prop they may well be binding.
 */
const field = computed(() => (isList.value ? listRef.value : inputRef.value))

defineExpose({
  /** Moves the focus to the text field. */
  focus: (options?: FocusOptions) => field.value?.focus(options),
  /** Selects what the field is showing. */
  select: () => field.value?.select(),
  /** The real `<input>` behind the field, for what neither of the two above covers. */
  el: computed(() => field.value?.el ?? null),
})
</script>

<template>
  <div
    ref="rootEl"
    class="v-time-input"
    :class="rootClass"
    :style="rootStyle"
    :data-open="open ? '' : undefined"
    :data-mode="resolvedMode"
    :data-disabled="resolvedDisabled ? '' : undefined"
    :data-readonly="readonly ? '' : undefined"
    @focusout="onRootFocusout"
    @keydown="onRootKeydown"
  >
    <!-- The list form is a VCombobox and nothing else: a list one picks a value from and
         narrows by typing IS the combobox pattern, down to the chevron, the clear cross
         and the dismissal. All this component adds is the three things a combobox cannot
         know about times — the rows, the search, and a value that may be nothing. -->
    <VCombobox
      v-if="isList"
      ref="listRef"
      v-model="listModel"
      v-bind="fieldAttrs"
      :options="options"
      :filter="matchTime"
      :label="label"
      :hint="hint"
      :placeholder="placeholder"
      :size="resolvedSize"
      :compact="resolvedCompact"
      :disabled="resolvedDisabled"
      :readonly="readonly"
      :invalid="invalid"
      :icon-start="iconStart"
      :icon-start-label="iconStartLabel"
      :clearable="clearable"
      :clear-label="clearLabel"
      :loading="loading"
      :loading-text="loadingText"
      :placement="placement"
      @clear="emit('clear')"
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
        v-bind="inputAttrs"
        :readonly="readonly"
        :no-typing="!typing"
        :label="label"
        :hint="hint"
        :placeholder="placeholder ?? (typing ? m.timeInput.maskPlaceholder : undefined)"
        :size="resolvedSize"
        :compact="resolvedCompact"
        :disabled="resolvedDisabled"
        :invalid="invalid"
        :clearable="clearable"
        :clear-visible="clearVisible"
        :clear-label="resolvedClearLabel"
        :icon-start="iconStart"
        :icon-start-label="iconStartLabel"
        :loading="loading"
        :loading-text="loadingText"
        :icon-end="endIcon"
        :icon-end-label="endIconLabel"
        @click:icon-end="toggleFromIcon"
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
        <template v-if="$slots.start" #start><slot name="start" /></template>
        <template v-if="hasMeridiem || $slots['value-end']" #value-end>
          <button
            v-if="hasMeridiem"
            type="button"
            class="v-input-action v-field-action v-time-input-meridiem"
            :disabled="resolvedDisabled"
            :aria-label="
              m.timeInput.meridiemValue(
                currentMeridiem === 'PM' ? m.timePicker.pm : m.timePicker.am,
              )
            "
            @click="toggleMeridiem"
          >
            {{ currentMeridiem === 'PM' ? m.timePicker.pm : m.timePicker.am }}
          </button>
          <VSeparator
            v-if="hasMeridiem && (clearVisible || endIcon)"
            orientation="vertical"
            class="v-time-input-divider"
          />
          <slot name="value-end" />
        </template>
      </VInput>
    </div>

    <!-- With no panel rendered there is nothing to hold a reference to, and the open state
         — which is fed by the panel's own events — can no longer become true. The absence
         of a panel is therefore self-enforcing. -->
    <VPopover
      v-if="hasPanel"
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
        v-model="pickerDraft"
        :format="resolvedFormat"
        :locale="resolvedLocale"
        :minute-step="minuteStep"
        :min="min"
        :max="max"
        :allowed-hours="allowedHours"
        :allowed-minutes="allowedMinutes"
        @confirm="confirm"
      >
        <!-- The slot REPLACES the two buttons rather than sitting beside them, so it is
             handed both actions: the clock writes a draft, and without `confirm` a footer
             of one's own could never commit it — the value would become unchangeable
             through the panel. The `remove` of VCombobox's `#chip` slot exists for the
             same reason. -->
        <template #footer>
          <slot name="footer" :confirm="confirm" :cancel="cancel" :close="cancel">
            <VButton variant="ghost" tone="neutral" @click="cancel">{{ m.common.cancel }}</VButton>
            <VButton @click="confirm">{{ m.common.confirm }}</VButton>
          </slot>
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

  /* The pointer says "this opens a panel", which a read-only or disabled field no longer
     does: the VFileInput gating. */
  .v-time-input:not([data-disabled]):not([data-readonly]) .v-time-input-control {
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
  .v-time-input[data-mode='input']:not([data-disabled]):not([data-readonly]) .v-time-input-control {
    cursor: text;
  }

  .v-time-input[data-mode='input'] .v-input-control {
    font-variant-numeric: tabular-nums;
  }

  /* The AM/PM button wears the field's own action recipe — the box, the muted colour that
     lights up on hover, the focus ring and the disabled state all come from
     `.v-field-action` — and changes only what a WORD needs that a glyph does not: room to
     be read, and the field's type rather than the browser's default button font.

     The floor keeps the hit target at the size of its neighbours, so the two spellings do
     not resize the field between them.

     The padding is DERIVED and not picked from the spacing scale: `.v-field-action` carries
     a negative inline margin that cancels the slack around a glyph inside its box, so that
     the row's gap is measured from the INK. A word fills its own box, so it has to put that
     slack back or it would sit a couple of pixels off the rhythm its neighbours keep —
     which reads as an asymmetry around the rule, whose two sides are otherwise identical.

     The selector compounds the two classes because they are the same specificity in two
     different sheets, and which one the consumer's bundler puts last is not ours to
     decide. */
  .v-field-action.v-time-input-meridiem {
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

  /* The anchoring and the panel's surface both come from VPopover. The panel's OWN padding
     is cancelled: VTimePicker pads itself, as VDatePicker does, so both pickers keep the
     same room on a page and in a panel. The picker brings its own layout too — the gap
     between its parts and the centring of the face — so nothing of that is declared here.

     NO `display` here either: the column layout is `.v-panel`'s, and a panel declaring
     its own is what the doubled-class `.v-overlay` guard exists to overrule.

     The selector compounds two classes VPopover puts on the same element, because the
     padding is also declared by the shared panel class: at equal specificity the winner
     would be whichever sheet the consumer's bundler put last. The size attribute cannot
     serve that purpose here — the picker's panel carries none. */
  .v-popover-panel.v-time-input-panel {
    width: max-content;
    padding: 0;
  }

  /* The list form is a VCombobox and takes everything from it — this is the one
     declaration that does not belong to a combobox in general.

     A column of times read down the panel is a column of FIGURES, and proportional ones
     slide the colon from row to row. The selector is (0,3,0) against the panel's own
     (0,1,0), so it wins on specificity and not on the order the consumer's bundler
     happens to give the two sheets. */
  .v-time-input[data-mode='list'] .v-combobox-panel {
    font-variant-numeric: tabular-nums;
  }
}
</style>
