<script setup lang="ts" generic="E extends CalendarEvent">
// @a11y @ssr @core
/**
 * Calendar layout is pure; JavaScript supplies grid navigation, editing gestures and
 * announcements because HTML has no native agenda widget. Editing forms remain consumer-owned.
 */
import { computed, onMounted, ref, useId, watch } from 'vue'

import VButton from '../VButton/VButton.vue'
import VIcon from '../VIcon/VIcon.vue'
import { arrow_drop_down as arrowDropDownIcon } from '../VIcon/icons/arrow_drop_down'
import { chevron_left as chevronLeftIcon } from '../VIcon/icons/chevron_left'
import { chevron_right as chevronRightIcon } from '../VIcon/icons/chevron_right'
import VIconButton from '../VIconButton/VIconButton.vue'
import VMenu from '../VMenu/VMenu.vue'
import VMenuItem from '../VMenu/VMenuItem.vue'
import VTypography from '../VTypography/VTypography.vue'

import { useAriaLabel } from '../../composables/useAriaLabel'
import { useLiveAnnouncer } from '../../composables/useLiveAnnouncer'
import { useRootAttrs } from '../../composables/useRootAttrs'
import { useTimer } from '../../composables/useTimer'
import { firstDayOfWeekFor, formatDateDisplay, formatDisplayRange } from '../../utils/date'
import { hourCycleFor, minutesOf } from '../../utils/time'

import { useMessages, useResolvedLocale } from '../../i18n/state'

import VCalendarMonth from './VCalendarMonth.vue'
import VCalendarTimeGrid, { type FocusedCell } from './VCalendarTimeGrid.vue'
import VCalendarYear from './VCalendarYear.vue'
import { EDGE_STEP_DELAY } from './edgeStep'
import {
  monthWeeks,
  monthsOfYear,
  normalizeWeekdays,
  stepAnchor,
  sameTimes,
  timeOf,
  timesOf,
  todayISO,
  visibleDays,
  visibleRange,
  windowOf,
} from './layout'
import type {
  ActivatedCell,
  CalendarCell,
  CalendarEvent,
  CalendarEventId,
  CalendarEventSlotProps,
  CalendarEventTimes,
  CalendarFormat,
  CalendarVariant,
  CalendarView,
} from './types'

export interface CalendarProps {
  /**
   * How the view is framed: nothing at all (`flat`), or rounded corners set off by a border on
   * the page surface (`outline`, the default), a shadow over a raised surface (`elevated`), or
   * a muted fill (`filled`). The toolbar stays outside the frame.
   */
  variant?: CalendarVariant
  /**
   * Which views the menu offers, in the order it lists them. Narrowing it is how a
   * calendar that only ever shows weeks stops offering anything else.
   */
  views?: CalendarView[]
  /** How many days the custom view shows, and how far Previous and Next step in it. */
  customDays?: number
  /**
   * Which weekdays are on show, as numbers from 0 for Sunday. The ORDER matters as well: the
   * first entry is the day a week starts on, and it wins over `firstDayOfWeek`.
   */
  weekdays?: number[]
  /**
   * The day a week starts on, from 0 for Sunday, when `weekdays` is not given. Left out,
   * the locale decides.
   */
  firstDayOfWeek?: number
  /** The language the days, months and times are written in. Falls back to the global one. */
  locale?: string
  /**
   * Whether times are shown on a twelve or twenty-four hour clock. Left out, the reader's
   * language decides. It is the same prop, under the same name, as VTimePicker's.
   */
  format?: CalendarFormat
  /** The hour the grid starts at, from 0. */
  dayStart?: number
  /** The hour it ends at, up to 24. */
  dayEnd?: number
  /**
   * The step everything snaps to, in minutes: how far a nudge moves an event, and the unit a
   * slot is drawn out in.
   */
  slotDuration?: number
  /** Where the grid is scrolled to when it first appears, so the working day is in view. */
  scrollTime?: string
  /**
   * Leaves out the line drawn across today's column at the time it is now, and the dot on
   * its leading edge. Left in, it ticks once a minute while the calendar is on screen.
   */
  hideCurrentTime?: boolean
  /** How many events a day of the month view shows before it starts counting the rest. */
  monthEventLimit?: number
  /**
   * Stops events being moved and stretched, by dragging or with the keyboard. They
   * stay readable and clickable, and nothing else.
   */
  readonly?: boolean
  /**
   * Freezes the whole calendar: nothing can be moved, created or opened, no other period can be
   * reached, and everything greys out through the colour tokens. That is what separates this
   * from `readonly`, where only the editing stops.
   */
  disabled?: boolean
  /**
   * Lets an empty stretch of a time grid be drawn out with the pointer, up or down from the
   * slot pressed.
   */
  creatable?: boolean
  /**
   * How long a dragged event has to rest against the side of the calendar before the view turns
   * to the previous or next period, in milliseconds.
   */
  edgeStepDelay?: number
  /** Stops dragging near the top or bottom of a time grid from scrolling it. */
  noEdgeScroll?: boolean
  /** What the calendar is called, for anyone who cannot see it. */
  label?: string
}

const props = withDefaults(defineProps<CalendarProps>(), {
  variant: 'outline',
  views: () => ['day', '4days', 'week'],
  customDays: 4,
  weekdays: undefined,
  firstDayOfWeek: undefined,
  locale: undefined,
  format: undefined,
  dayStart: 0,
  dayEnd: 24,
  slotDuration: 15,
  scrollTime: '08:00',
  hideCurrentTime: false,
  monthEventLimit: 3,
  readonly: false,
  disabled: false,
  creatable: false,
  edgeStepDelay: EDGE_STEP_DELAY,
  noEdgeScroll: false,
  label: undefined,
})

/*
 * The wrapper-root pattern: the consumer's class and style stay on the outer box, and
 * everything else; their `id`, their `aria-*`; goes on the region, which is the part that
 * carries the role and is therefore the part they mean.
 */
defineOptions({ inheritAttrs: false })

/** Which span the calendar is showing. It opens on the week. */
const view = defineModel<CalendarView>('view', { default: 'week' })

// @ssr
/*
 * Today's date, which marks a single column, is a different matter and is read below in
 * `onMounted` where the server cannot see it at all.
 */
/**
 * The day the calendar is anchored on, as `YYYY-MM-DD`: the view shows the week, month or
 * year holding it. It opens on today.
 */
const date = defineModel<string>('date', { default: () => todayISO() })
/** What is on the calendar, empty to begin with. */
const events = defineModel<E[]>('events', { default: () => [] })

const emit = defineEmits<{
  /** A card was clicked or activated: the cue to open an editor of your own. */
  'event-activate': [event: E]
  /**
   * An empty part of the grid was activated, at this day and this time. A day of the month
   * view has no hour of its own, and reports the one the time grids start at.
   */
  'cell-activate': [cell: CalendarCell]
  /** An event was dragged or nudged somewhere else. */
  'event-move': [event: E, previous: CalendarEventTimes]
  /** An event's end was dragged or nudged, in the same two parts. */
  'event-resize': [event: E, previous: CalendarEventTimes]
  /**
   * An empty stretch of a day was drawn out, and these are its times. Nothing has been added
   * to `events`: this is the cue to make the event, in your own model or through your own form.
   */
  'event-create': [times: CalendarEventTimes]
}>()

defineSlots<{
  /** Extra controls in the toolbar, between the range and the view menu. */
  actions?(): unknown
  /** The content of one event's card, replacing the title and times. */
  event?(props: CalendarEventSlotProps<E>): unknown
  /** The head of one day column, replacing the weekday and the number. */
  'day-header'?(props: { iso: string; weekday: string; dayText: string; today: boolean }): unknown
  /** The label beside the band of all-day events. */
  'all-day-label'?(): unknown
}>()

const m = useMessages()
const { rootClass, rootStyle, forwardedAttrs } = useRootAttrs()

const resolvedLocale = useResolvedLocale(() => props.locale)
const resolvedFormat = computed(() => props.format ?? hourCycleFor(resolvedLocale.value))
const resolvedWeekdays = computed(() =>
  normalizeWeekdays(
    props.weekdays,
    props.firstDayOfWeek ?? firstDayOfWeekFor(resolvedLocale.value),
  ),
)

const timeWindow = computed(() => windowOf(props.dayStart, props.dayEnd))

const days = computed(() =>
  visibleDays(date.value, view.value, resolvedWeekdays.value, props.customDays),
)

/** Which view is a time grid, and which is a summary. Several things below turn on this. */
const isTimeGrid = computed(() => view.value !== 'month' && view.value !== 'year')

const weeks = computed(() =>
  view.value === 'month' ? monthWeeks(date.value, resolvedWeekdays.value) : [],
)

const months = computed(() => (view.value === 'year' ? monthsOfYear(date.value) : []))

// @ssr
// Way to tell either where the reader is, and rendering a guess would make the two markups
// differ. Both stay null until then, and every rule that draws them is written to expect it.
const today = ref<string | null>(null)
const now = ref<number | null>(null)

const clock = useTimer()

/**
 * The floor on the delay is not a nicety. `useTimer` runs a delay of zero or less
 * synchronously, by design, so a tick that ever computed one would call itself straight back
 * and go on doing so until the stack gave out.
 */
function tick() {
  const at = new Date()
  now.value = at.getHours() * 60 + at.getMinutes()
  clock.start(tick, Math.max(1000, (60 - at.getSeconds()) * 1000))
}

/** Scrolls the time grid on show to `scrollTime`. */
function scrollToStart() {
  const at = minutesOf(props.scrollTime)
  if (at !== null) gridRef.value?.scrollToMinutes(at)
}

onMounted(() => {
  today.value = todayISO()
  if (!props.hideCurrentTime) tick()
  scrollToStart()
})

// @core
// Watch the visibility prop so toggling the current-time line starts or stops its timer after
// mount.
watch(
  () => props.hideCurrentTime,
  (hidden) => {
    if (!hidden) return tick()
    clock.cancel()
    now.value = null
  },
)

/**
 * The usual form does not work here and the error it gives says nothing useful about why. A
 * generic `<script setup>` compiles to a FUNCTION, not to a class, so it has no construct
 * signature for `InstanceType` to read: the message complains that the component "provides no
 * match for the signature `new (...args: any)`", pointing at the template.
 */
const gridRef = ref<{
  focus(options?: FocusOptions): void
  scrollToMinutes(minutes: number): void
} | null>(null)

// @core
// A time grid that appears after mount, a month switched to a week, opens at `scrollTime`
// too. Post-flush, so the new grid is rendered and measurable when it is asked to scroll.
watch(gridRef, scrollToStart, { flush: 'post' })

/** The region, the element a consumer's attributes land on. */
const regionEl = ref<HTMLElement | null>(null)

/*
 * Which cell holds the tab stop, kept as two refs because the two kinds of view mean different
 * things by it: a time grid needs a day and an hour, a month only a day. One ref carrying an
 * hour the month ignores would leave that hour to go stale, and the grid would then reopen on
 * whatever the month happened to leave behind.
 */
const focused = ref<FocusedCell>({ iso: date.value, minutes: timeWindow.value.start })
const focusedDay = ref(date.value)

const range = computed(() =>
  visibleRange(date.value, view.value, resolvedWeekdays.value, props.customDays),
)

/**
 * What the toolbar says the calendar is showing. Each view names itself at the coarsest
 * granularity that still identifies it: a single day says its weekday, a year says nothing
 * but the number.
 */
const rangeText = computed(() => {
  const locale = resolvedLocale.value
  if (view.value === 'year')
    return formatDateDisplay(range.value.start, locale, { year: 'numeric' })
  if (view.value === 'month') {
    return formatDateDisplay(range.value.start, locale, { month: 'long', year: 'numeric' })
  }
  if (view.value === 'day') {
    return formatDateDisplay(range.value.start, locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }
  return formatDisplayRange(range.value.start, range.value.end, locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})

const viewLabel = (value: CalendarView) => {
  const words = m.value.calendar
  if (value === 'day') return words.viewDay
  if (value === '4days') return words.view4Days
  if (value === 'week') return words.viewWeek
  if (value === 'month') return words.viewMonth
  if (value === 'year') return words.viewYear
  return words.viewCustom(props.customDays)
}

/** What the two navigation buttons are called. */
const stepLabels = computed(() => {
  const words = m.value.calendar
  if (view.value === 'day') return { previous: words.previousDay, next: words.nextDay }
  if (view.value === 'week') return { previous: words.previousWeek, next: words.nextWeek }
  if (view.value === 'month') return { previous: words.previousMonth, next: words.nextMonth }
  if (view.value === 'year') return { previous: words.previousYear, next: words.nextYear }
  return { previous: words.previousPeriod, next: words.nextPeriod }
})

const ariaLabel = useAriaLabel(() => props.label ?? m.value.calendar.label)

/*
 * The four ways of reaching another period all pass through here, and `disabled` is refused in
 * every one of them rather than on the controls alone: the edge step pages the view from a
 * drag, and the year grid opens a month from a cell, neither of which is a button this
 * component disabled. It is the VDatePicker arrangement, where the guard sits on `goTo`.
 */
function step(delta: -1 | 1) {
  if (props.disabled) return
  date.value = stepAnchor(date.value, view.value, delta, resolvedWeekdays.value, props.customDays)
}

function goToToday() {
  if (props.disabled) return
  date.value = todayISO()
}

function setView(value: CalendarView) {
  if (props.disabled) return
  view.value = value
}

/**
 * `disabled` is refused here, and not by the stylesheet's `pointer-events: none` alone. That
 * rule stops a click, but the grid keeps its tab stop so the agenda stays readable, and Enter
 * on a focused cell reaches this with nothing in its way; a frozen calendar would go on
 * reporting cells to a consumer's form.
 */
function onCellActivate(cell: ActivatedCell) {
  if (props.disabled) return
  emit('cell-activate', {
    date: cell.date,
    time: timeOf(cell.minutes ?? timeWindow.value.start),
  })
}

/**
 * Drill into an allowed detail view; if views excludes it, update the date while preserving the
 * current view.
 */
function openIn(iso: string, target: CalendarView) {
  if (props.disabled) return
  date.value = iso
  if (props.views.includes(target)) view.value = target
}

/**
 * What a reader who cannot see the grid is told: the range after every step of a move, and
 * whether the move was taken or given up.
 */
const { polite: announcement, announce: say } = useLiveAnnouncer()
const uid = useId()
const hintId = `${uid}-hint`

/*
 * Through the shared announcer, which empties the region and writes on the next tick: the
 * same words twice in a row are no change to a live region, and would not be read again.
 */
function announce(message: string) {
  say(message, false)
}

/** Writes one event's new times into the model and says what happened. */
function onEventDrop(id: CalendarEventId, times: CalendarEventTimes, kind: 'move' | 'resize') {
  const current = events.value.find((item) => item.id === id)
  if (!current) return

  const previous = timesOf(current)
  // A gesture that ends where it began moved nothing, and a consumer's undo stack must not
  // gain an entry for it, nor its watchers a new array.
  if (sameTimes(previous, times)) return
  const next = { ...current, ...times }
  events.value = events.value.map((item) => (item.id === id ? next : item))
  // Written out rather than picking the name with a conditional: the emit signatures are an
  // overload set, and TypeScript resolves one only against a literal.
  if (kind === 'resize') emit('event-resize', next, previous)
  else emit('event-move', next, previous)
}

/*
 * A drawn slot is REPORTED and never added. What an event is called, what else it carries and
 * whether it exists at all are the consumer's decisions, so the calendar hands over the times
 * and draws nothing once the pointer is let go.
 */
function onSlotCreate(times: CalendarEventTimes) {
  emit('event-create', times)
}

defineExpose({
  /**
   * Brings the focus into the view: the cell the grid is showing, or the first month heading
   * in the year view.
   */
  focus: (options?: FocusOptions) => gridRef.value?.focus(options),
  /** The region, which is where your `id` and `aria-*` attributes land. */
  el: regionEl,
  /** Goes back to the current day, exactly as the Today button does. */
  today: goToToday,
  /** Moves back one view (a week, a month or a year), exactly as the toolbar's arrow does. */
  previous: () => step(-1),
  /** Moves forward one view. */
  next: () => step(1),
  /** Scrolls the grid so a given `HH:mm` sits at the top of the visible area. */
  scrollTo: (time: string) => {
    const at = minutesOf(time)
    if (at !== null) gridRef.value?.scrollToMinutes(at)
  },
})
</script>

<template>
  <div
    class="v-calendar"
    :class="rootClass"
    :style="rootStyle"
    :data-variant="variant"
    :data-disabled="disabled ? '' : undefined"
  >
    <section
      ref="regionEl"
      :aria-roledescription="m.calendar.roleDescription"
      v-bind="forwardedAttrs"
      class="v-calendar-region"
      :aria-label="ariaLabel"
    >
      <div class="v-calendar-toolbar">
        <div class="v-calendar-nav">
          <VIconButton
            :label="stepLabels.previous"
            size="sm"
            :disabled="disabled"
            @click="step(-1)"
          >
            <VIcon :name="chevronLeftIcon" mirrored />
          </VIconButton>
          <VIconButton :label="stepLabels.next" size="sm" :disabled="disabled" @click="step(1)">
            <VIcon :name="chevronRightIcon" mirrored />
          </VIconButton>
        </div>

        <VButton variant="outline" tone="neutral" size="sm" :disabled="disabled" @click="goToToday">
          {{ m.calendar.today }}
        </VButton>

        <VTypography variant="heading-4" as="h2" class="v-calendar-title">
          {{ rangeText }}
        </VTypography>

        <div class="v-calendar-actions">
          <slot name="actions" />

          <VMenu v-if="views.length > 1" size="sm" placement="bottom-end" match-trigger>
            <template #trigger="{ triggerProps }">
              <VButton
                variant="outline"
                tone="neutral"
                size="sm"
                :disabled="disabled"
                v-bind="triggerProps"
                :aria-label="`${m.calendar.view}: ${viewLabel(view)}`"
              >
                {{ viewLabel(view) }}
                <VIcon :name="arrowDropDownIcon" />
              </VButton>
            </template>
            <VMenuItem
              v-for="value in views"
              :key="value"
              :label="viewLabel(value)"
              :selected="value === view"
              @select="setView(value)"
            />
          </VMenu>
        </div>
      </div>

      <!--
        Invert opt-out public props once at the internal-grid boundary; internal view contracts
        use positive booleans.
      -->
      <VCalendarTimeGrid
        v-if="isTimeGrid"
        ref="gridRef"
        v-model:focused="focused"
        class="v-calendar-view"
        :days="days"
        :events="events"
        :time-window="timeWindow"
        :slot-duration="slotDuration"
        :locale="resolvedLocale"
        :format="resolvedFormat"
        :today="today"
        :now="hideCurrentTime ? null : now"
        :editable="!readonly && !disabled"
        :disabled="disabled"
        :creatable="creatable && !disabled"
        :hint-id="hintId"
        :edge-step-delay="edgeStepDelay"
        :auto-scroll="!noEdgeScroll"
        :label="rangeText"
        @cell-activate="onCellActivate"
        @event-activate="emit('event-activate', $event)"
        @event-drop="onEventDrop"
        @slot-create="onSlotCreate"
        @announce="announce"
        @step="step"
      >
        <template v-if="$slots.event" #event="slotProps">
          <slot name="event" v-bind="slotProps" />
        </template>
        <template v-if="$slots['day-header']" #day-header="slotProps">
          <slot name="day-header" v-bind="slotProps" />
        </template>
        <template v-if="$slots['all-day-label']" #all-day-label>
          <slot name="all-day-label" />
        </template>
      </VCalendarTimeGrid>

      <VCalendarMonth
        v-else-if="view === 'month'"
        ref="gridRef"
        v-model:focused="focusedDay"
        class="v-calendar-view"
        :weeks="weeks"
        :events="events"
        :locale="resolvedLocale"
        :format="resolvedFormat"
        :today="today"
        :month-event-limit="monthEventLimit"
        :editable="!readonly && !disabled"
        :disabled="disabled"
        :hint-id="hintId"
        :edge-step-delay="edgeStepDelay"
        :label="rangeText"
        @day-activate="openIn($event, 'day')"
        @cell-activate="onCellActivate"
        @event-activate="emit('event-activate', $event)"
        @event-drop="onEventDrop"
        @announce="announce"
        @step="step"
      >
        <template v-if="$slots.event" #event="slotProps">
          <slot name="event" v-bind="slotProps" />
        </template>
      </VCalendarMonth>

      <VCalendarYear
        v-else
        ref="gridRef"
        class="v-calendar-view"
        :disabled="disabled"
        :months="months"
        :events="events"
        :locale="resolvedLocale"
        :weekdays="resolvedWeekdays"
        :today="today"
        :label="rangeText"
        @month-activate="openIn($event, 'month')"
      />

      <!--
        Both of these are rendered from the first paint and never conditionally. The live region
        has to EXIST before it has anything to say: one inserted along with its first message is
        not announced at all.
      -->
      <div class="v-visually-hidden" role="status" aria-live="polite">{{ announcement }}</div>
      <span :id="hintId" class="v-visually-hidden">{{ m.calendar.eventHint }}</span>
    </section>
  </div>
</template>

<style>
@layer vectis.components {
  .v-calendar {
    /*
     * The surface under the view, which its sticky headings repeat to stay opaque, and the
     * hover tint that has to stand out from it. Unframed, the page surface is the best guess at
     * what lies behind.
     */
    --calendar-surface: var(--vectis-color-surface);
    --calendar-hover-bg: var(--vectis-color-surface-muted);

    display: flex;
    block-size: 100%;
    min-block-size: 0;
    font-family: var(--vectis-text-family);
    color: var(--vectis-color-text);
  }

  /* A frozen calendar greys out through the colour tokens and never through opacity, the
     design system rule: what a reader keeps here is the agenda itself, which has to stay
     readable. The cards are real disabled buttons, so they grey themselves. */
  .v-calendar[data-disabled] {
    color: var(--vectis-color-text-subtle);
    cursor: not-allowed;
  }

  .v-calendar[data-disabled] .v-calendar-view {
    pointer-events: none;
  }

  /*
   * `min-block-size: 0` on the grid is what lets it shrink below its content and therefore
   * scroll; without it the automatic minimum of a flex item would hold it at its full 24-hour
   * height and the whole page would scroll instead. All of it is a no-op when the parent's
   * height is auto, where the percentage falls back to auto and the calendar is simply as tall
   * as its content.
   */
  .v-calendar-region {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-inline-size: 0;
    min-block-size: 0;
  }

  .v-calendar-toolbar {
    display: flex;
    flex: none;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--vectis-space-2);
    padding-block-end: var(--vectis-space-3);
  }

  .v-calendar-nav {
    display: flex;
    align-items: center;
    gap: var(--vectis-space-1);
  }

  .v-calendar-title {
    /*
     * It may be long; a full weekday and month in the day view; so it is the part that gives
     * way first, and the controls keep their size.
     */
    min-inline-size: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .v-calendar-actions {
    display: flex;
    align-items: center;
    gap: var(--vectis-space-2);
    /* The two siblings are pushed apart from here rather than by a `justify-content` on the
       toolbar, which would space every control equally instead of grouping them. */
    margin-inline-start: auto;
  }

  /*
   * The view on show, whichever it is: the one box that scrolls. The views inherit the family
   * and the colour from `.v-calendar` and declare neither again.
   */
  .v-calendar-view {
    flex: 1;
    overflow: auto;
    block-size: 100%;
    min-block-size: 0;
    /* Transparent rather than absent: forced colours paint it. Only `elevated` drops it, so
       that the grid's rules reach the edge its shadow draws. */
    border: 1px solid transparent;
    border-radius: var(--vectis-radius-surface);
  }

  .v-calendar[data-variant='outline'] .v-calendar-view {
    background: var(--calendar-surface);
    border-color: var(--vectis-color-border);
  }

  .v-calendar[data-variant='elevated'] {
    --calendar-surface: var(--vectis-color-surface-raised);
  }

  .v-calendar[data-variant='elevated'] .v-calendar-view {
    border: none;
    background: var(--calendar-surface);
    box-shadow: var(--vectis-shadow-sm);
  }

  .v-calendar[data-variant='filled'] {
    --calendar-surface: var(--vectis-color-surface-muted);
    --calendar-hover-bg: color-mix(
      in oklab,
      var(--vectis-color-surface-muted),
      var(--vectis-color-text) 4%
    );
  }

  .v-calendar[data-variant='filled'] .v-calendar-view {
    background: var(--calendar-surface);
  }

  /*
   * Every rule a view writes against one of these classes is either disjoint from it or more
   * specific, never tied: a tie between two sheets would be settled by the consumer's bundler.
   */

  /*
   * `not-allowed` is the word the library already uses for "you cannot do this", on every
   * disabled control. BEST-EFFORT, and never the signal: while a pointer is captured the cursor
   * is resolved against the capture target rather than against whatever sits under the pointer,
   * and engines differ on it.
   */
  .v-calendar-view[data-outside] {
    cursor: not-allowed;
  }

  .v-calendar-weekday {
    color: var(--vectis-color-text-muted);
    font-size: var(--vectis-text-overline-size);
    font-weight: var(--vectis-text-overline-weight);
    letter-spacing: var(--vectis-text-overline-tracking);
    text-transform: uppercase;
  }

  /*
   * Today's date, marked on the number the way a calendar marks a date rather than a column.
   * Semibold here marks a state, not a type role.
   */
  .v-calendar-view .v-calendar-today {
    background: var(--vectis-color-accent);
    color: var(--vectis-color-text-on-accent);
    font-weight: var(--vectis-font-weight-semibold);
  }

  /*
   * A cell of either grid: ruled on two sides, the other two drawn by its neighbours. It keeps
   * the default cursor: the pointer hand belongs to what can be opened, the events, and a grid
   * of hands would say every square of the week is a link.
   */
  .v-calendar-cell {
    border-block-start: 1px solid var(--vectis-color-border);
    border-inline-start: 1px solid var(--vectis-color-border);
  }

  .v-calendar-cell:first-child {
    border-inline-start: none;
  }

  .v-calendar-cell:focus-visible {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    /* Drawn inwards: the view is a scrolling box, and an outward ring on a cell at the edge
       would be cropped by it. */
    outline-offset: calc(-1 * var(--vectis-focus-ring-width));
  }

  .v-calendar-button {
    /* A button carries a border and a background from the browser, which around a round day
       number read as a stray ring. Neither is optional. */
    border: none;
    background: none;
    font-family: inherit;
    cursor: pointer;
    transition: background-color var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  .v-calendar-button:focus-visible {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: var(--vectis-focus-ring-offset);
  }

  /*
   * Drawn INSIDE the box the cells occupy rather than on the scroller, because a scroller's
   * absolutely positioned child is placed against its content and scrolls away with it. That
   * box has to be positioned, which each view's own sheet sees to.
   */
  .v-calendar-edge-cue[data-edge]::after {
    content: '';
    position: absolute;
    inset-block: 0;
    inline-size: var(--vectis-control-size-calendar-edge);
    background: var(--vectis-color-accent-surface);
    z-index: 2;
    pointer-events: none;
  }

  .v-calendar-edge-cue[data-edge='start']::after {
    inset-inline-start: 0;
  }

  .v-calendar-edge-cue[data-edge='end']::after {
    inset-inline-end: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .v-calendar-button {
      transition: none;
    }
  }

  /*
   * Windows forced colors flattens every background to Canvas, and today and the paging strip
   * are drawn with nothing else. Today takes the system selection pair, the one every other
   * "current" mark in the library takes, and the strip takes Highlight.
   */
  @media (forced-colors: active) {
    .v-calendar-view .v-calendar-today {
      forced-color-adjust: none;
      background: Highlight;
      color: HighlightText;
    }

    .v-calendar-edge-cue[data-edge]::after {
      forced-color-adjust: none;
      background: Highlight;
    }
  }
}
</style>
