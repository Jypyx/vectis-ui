<script setup lang="ts" generic="E extends CalendarEvent">
// @a11y @ssr @core
/**
 * An agenda: the days laid out side by side with the hours running down them, and the
 * events drawn where they fall.
 *
 * It is a place to READ and REARRANGE a schedule, not to write one. Opening an event for
 * editing, and adding one by any route other than pointing at an empty slot, stay with the
 * consumer — the component tells them what was asked for and leaves the form to them.
 *
 * Everything is handled in local time as ISO `YYYY-MM-DD` dates and 24-hour `HH:mm` times
 * (see `utils/date` and `utils/time`), which is what keeps the server and the browser in
 * agreement. An event may name a time zone, and that name is shown beside its times as an
 * annotation; it is never applied. Converting would mean the card moved depending on where
 * the page was rendered, which is the one thing a calendar must not do.
 *
 * The JavaScript here is what the platform gives no way to avoid. There is no accessible
 * time grid to build on and no way to express "these three meetings overlap, so share the
 * width between them" in CSS, so the ARIA grid pattern and the overlap layout are written
 * out by hand. Every geometric and calendrical decision lives in `layout.ts`, pure, because
 * the test environment lays nothing out and that is the only place any of it can be checked.
 */
import { computed, onMounted, ref, useId } from 'vue'

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
import { useRootAttrs } from '../../composables/useRootAttrs'
import { useTimer } from '../../composables/useTimer'
import {
  firstDayOfWeekFor,
  formatDisplay as formatDate,
  formatDisplayRange,
} from '../../utils/date'
import { hourCycleFor, minutesOf, type HourFormat } from '../../utils/time'

import { useLocale, useMessages } from '../../i18n/state'

import VCalendarMonth from './VCalendarMonth.vue'
import VCalendarTimeGrid, { type FocusedCell } from './VCalendarTimeGrid.vue'
import VCalendarYear from './VCalendarYear.vue'
import { EDGE_STEP_DELAY } from './edgeStep'
import {
  monthWeeks,
  monthsOfYear,
  normalizeWeekdays,
  stepAnchor,
  timeOf,
  timesOf,
  todayISO,
  visibleDays,
  visibleRange,
  windowOf,
} from './layout'
import type { CalendarEvent, CalendarEventId, CalendarEventTimes, CalendarView } from './types'

export interface CalendarProps {
  /**
   * Which views the menu offers, in the order it lists them. Narrowing it is how a
   * calendar that only ever shows weeks stops offering anything else.
   */
  views?: CalendarView[]
  /** How many days the custom view shows, and how far Previous and Next step in it. */
  customDays?: number
  /**
   * Which weekdays are on show, as numbers from 0 for Sunday. `[1,2,3,4,5]` hides the
   * weekend everywhere. The ORDER matters as well: the first entry is the day a week
   * starts on, which is why there is no separate first-day setting. Left out, the seven
   * days in the order the locale puts them.
   */
  weekdays?: number[]
  /** The language the days, months and times are written in. Falls back to the global one. */
  locale?: string
  /** Whether times are shown on a twelve or twenty-four hour clock. Follows the locale. */
  hourFormat?: HourFormat
  /** The hour the grid starts at, from 0. */
  dayStart?: number
  /** The hour it ends at, up to 24. */
  dayEnd?: number
  /**
   * The step everything snaps to, in minutes: how far a nudge moves an event, and how long
   * a newly created one is.
   */
  slotDuration?: number
  /** Where the grid is scrolled to when it first appears, so the working day is in view. */
  scrollTime?: string
  /**
   * Draws a line across today's column at the time it is now, with a dot on its leading
   * edge. It ticks once a minute while the calendar is on screen.
   */
  showCurrentTime?: boolean
  /** How many events a day of the month view shows before it starts counting the rest. */
  monthEventLimit?: number
  /**
   * Lets events be moved and stretched — by dragging them, and with the keyboard. Turning it
   * off leaves them readable and clickable, and nothing else.
   */
  editable?: boolean
  /**
   * Makes an event when an empty part of a day is taken up: a click makes one `slotDuration`
   * long, a drag makes one as long as it was drawn. `slot-activate` still fires either way,
   * so a consumer who wants their own form can turn this off and keep the signal.
   */
  creatable?: boolean
  /**
   * How long a dragged event has to rest against the side of the calendar before the view
   * turns to the previous or next period, in milliseconds. `0` turns that off.
   *
   * The wait is the point of it: paging the instant the pointer touched the edge would make
   * the last day of a week impossible to aim at.
   */
  edgeStepDelay?: number
  /** Whether dragging near the top or bottom of a time grid scrolls it. */
  autoScroll?: boolean
  /** What the calendar is called, for anyone who cannot see it. */
  label?: string
}

const props = withDefaults(defineProps<CalendarProps>(), {
  views: () => ['day', '4days', 'week'],
  customDays: 4,
  weekdays: undefined,
  locale: undefined,
  hourFormat: undefined,
  dayStart: 0,
  dayEnd: 24,
  slotDuration: 15,
  scrollTime: '08:00',
  showCurrentTime: true,
  monthEventLimit: 3,
  editable: true,
  creatable: true,
  edgeStepDelay: EDGE_STEP_DELAY,
  autoScroll: true,
  label: undefined,
})

/*
 * The wrapper-root pattern: the consumer's class and style stay on the outer box, and
 * everything else — their `id`, their `aria-*` — goes on the region, which is the part
 * that carries the role and is therefore the part they mean.
 */
defineOptions({ inheritAttrs: false })

const view = defineModel<CalendarView>('view', { default: 'week' })

/*
 * @ssr — the anchor is read from the clock at setup, so the server and the client can in
 * principle disagree across a midnight boundary. That is the trade VDatePicker already
 * makes for the month it opens on, and it is a safer one here: what the anchor decides is
 * a whole WEEK or month, which is the same on both sides for all but a few seconds a day.
 * Today's date, which marks a single column, is a different matter and is read below in
 * `onMounted` where the server cannot see it at all.
 */
const date = defineModel<string>('date', { default: () => todayISO() })
const events = defineModel<E[]>('events', { default: () => [] })

const emit = defineEmits<{
  /** A card was clicked or activated — the cue to open an editor of your own. */
  'event-activate': [event: E]
  /** An empty part of the grid was activated, at this day and this time. */
  'slot-activate': [slot: { date: string; time: string }]
  /**
   * An event was dragged or nudged somewhere else. It carries the event as it now stands and
   * where it came from, so undoing it needs no copy of your own.
   */
  'event-move': [event: E, previous: CalendarEventTimes]
  /** An event's end was dragged or nudged, in the same two parts. */
  'event-resize': [event: E, previous: CalendarEventTimes]
  /**
   * An event was made by taking up an empty part of a day. It has already been added to
   * `events`; this is the cue to give it a real name, or to save it.
   */
  'event-create': [event: CalendarEvent]
}>()

defineSlots<{
  /** Extra controls in the toolbar, between the range and the view menu. */
  actions?(): unknown
  /** The content of one event's card, replacing the title and times. */
  event?(props: {
    event: E
    layout: 'block' | 'chip'
    timeText: string
    continuesBefore: boolean
    continuesAfter: boolean
  }): unknown
  /** The head of one day column, replacing the weekday and the number. */
  'day-header'?(props: { iso: string; weekday: string; day: string; today: boolean }): unknown
  /** The label beside the band of all-day events. */
  'all-day-label'?(): unknown
}>()

const m = useMessages()
const vectisLocale = useLocale()
const { rootClass, rootStyle, forwardedAttrs } = useRootAttrs()

/*
 * The prop wins, and the design system's global locale is what it falls back to. Every read
 * goes through this one derivation, so the two sources can never be consulted in a
 * different order somewhere else.
 */
const resolvedLocale = computed(() => props.locale ?? vectisLocale.value)
const resolvedHourFormat = computed(() => props.hourFormat ?? hourCycleFor(resolvedLocale.value))
const resolvedWeekdays = computed(() =>
  normalizeWeekdays(props.weekdays, firstDayOfWeekFor(resolvedLocale.value)),
)

const window = computed(() => windowOf(props.dayStart, props.dayEnd))

const days = computed(() =>
  visibleDays(date.value, view.value, resolvedWeekdays.value, props.customDays),
)

/** Which view is a time grid, and which is a summary. Several things below turn on this. */
const isTimeGrid = computed(() => view.value !== 'month' && view.value !== 'year')

const weeks = computed(() =>
  view.value === 'month' ? monthWeeks(date.value, resolvedWeekdays.value) : [],
)

const months = computed(() => (view.value === 'year' ? monthsOfYear(date.value) : []))

// @ssr — today and the time it is now can only be known on the client: the server has no
// way to tell either where the reader is, and rendering a guess would make the two markups
// differ. Both stay null until then, and every rule that draws them is written to expect it.
const today = ref<string | null>(null)
const now = ref<number | null>(null)

const clock = useTimer()

/**
 * Re-reads the clock, then arms itself for the top of the next minute — so the line moves
 * when the minute does rather than drifting by however long the interval was.
 *
 * TRAP — the floor on the delay is not a nicety. `useTimer` runs a delay of zero or less
 * SYNCHRONOUSLY, by design, so a tick that ever computed one would call itself straight back
 * and go on doing so until the stack gave out. A second is well below the resolution
 * anything here needs and comfortably above the point where that could happen.
 */
function tick() {
  const at = new Date()
  now.value = at.getHours() * 60 + at.getMinutes()
  clock.start(tick, Math.max(1000, (60 - at.getSeconds()) * 1000))
}

onMounted(() => {
  today.value = todayISO()
  if (props.showCurrentTime) tick()
  const at = minutesOf(props.scrollTime)
  if (at !== null) gridRef.value?.scrollToMinutes(at)
})

/**
 * The grid, named by what it exposes rather than by `InstanceType<typeof …>`.
 *
 * TRAP — the usual form does not work here and the error it gives says nothing useful about
 * why. A generic `<script setup>` compiles to a FUNCTION, not to a class, so it has no
 * construct signature for `InstanceType` to read: the message complains that the component
 * "provides no match for the signature `new (...args: any)`", pointing at the template.
 * Writing the contract out is also the more honest of the two, since these two methods are
 * the whole of what this component asks of that one.
 */
const gridRef = ref<{ focus(): void; scrollToMinutes(minutes: number): void } | null>(null)

/*
 * Which cell holds the tab stop, kept as two refs because the two kinds of view mean
 * different things by it: a time grid needs a day AND an hour, a month only a day. One ref
 * carrying an hour the month ignores would leave that hour to go stale, and the grid would
 * then reopen on whatever the month happened to leave behind.
 */
const focused = ref<FocusedCell>({ iso: date.value, minutes: window.value.start })
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
  if (view.value === 'year') return formatDate(range.value.start, locale, { year: 'numeric' })
  if (view.value === 'month') {
    return formatDate(range.value.start, locale, { month: 'long', year: 'numeric' })
  }
  if (view.value === 'day') {
    return formatDate(range.value.start, locale, {
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

/**
 * What the two navigation buttons are called. They name the step rather than saying
 * "previous" alone, because the step is what changes from one view to the next and a bare
 * "previous" leaves a reader to guess whether it is a day or a year they are about to lose.
 */
const stepLabels = computed(() => {
  const words = m.value.calendar
  if (view.value === 'day') return { previous: words.previousDay, next: words.nextDay }
  if (view.value === 'week') return { previous: words.previousWeek, next: words.nextWeek }
  if (view.value === 'month') return { previous: words.previousMonth, next: words.nextMonth }
  if (view.value === 'year') return { previous: words.previousYear, next: words.nextYear }
  return { previous: words.previousPeriod, next: words.nextPeriod }
})

const ariaLabel = useAriaLabel(() => props.label ?? m.value.calendar.label)

function step(delta: -1 | 1) {
  date.value = stepAnchor(date.value, view.value, delta, resolvedWeekdays.value, props.customDays)
}

function today_() {
  date.value = todayISO()
}

function setView(value: CalendarView) {
  view.value = value
}

function onCellActivate(iso: string, minutes: number) {
  emit('slot-activate', { date: iso, time: timeOf(minutes) })
}

/**
 * Going from a summary to the thing it summarises: opening a day from the month view, or a
 * month from the year view.
 *
 * The view only changes if the calendar was offering that one in the first place. A consumer
 * who narrowed `views` to a week and a year has said what their calendar is for, and jumping
 * it into a day view they deliberately left out would be the component overruling them —
 * so the date moves and the view stays, which is still a step towards what was asked for.
 */
function openIn(iso: string, target: CalendarView) {
  date.value = iso
  if (props.views.includes(target)) view.value = target
}

/**
 * What a reader who cannot see the grid is told: the range after every step of a move, and
 * whether the move was taken or given up.
 *
 * The node is rendered from the FIRST paint and left empty, never inserted along with its
 * first message — a live region that appears at the same moment as its text is not announced
 * at all, which is the trap VDataTable's selection count already documents.
 */
const announcement = ref('')
const uid = useId()
const hintId = `${uid}-hint`

function announce(message: string) {
  announcement.value = message
}

/**
 * Writes one event's new times into the model and says what happened.
 *
 * The array is replaced rather than edited in place: a new reference is what wakes a
 * consumer's own watchers, and it is the design system's rule for every v-model holding a
 * list. This runs ONCE, when a gesture ends — never per frame of a drag, which would fill an
 * undo stack with sixty entries a second and send each one back as a render fighting the
 * finger.
 */
function onEventDrop(id: CalendarEventId, times: CalendarEventTimes, kind: 'move' | 'resize') {
  const current = events.value.find((item) => item.id === id)
  if (!current) return

  const previous = timesOf(current)
  const next = { ...current, ...times }
  events.value = events.value.map((item) => (item.id === id ? next : item))
  // Written out rather than picking the name with a conditional: the emit signatures are an
  // overload set, and TypeScript resolves one only against a literal.
  if (kind === 'resize') emit('event-resize', next, previous)
  else emit('event-move', next, previous)
}

/**
 * How many events this calendar has minted, which is what numbers their default names.
 *
 * It counts from one per calendar rather than from the length of the list, so removing an
 * event does not make the next one reuse its name.
 */
let created = 0

function onSlotCreate(times: CalendarEventTimes) {
  // The grid only ever asks for this when it was told it could create, so there is no second
  // guard here: `creatable` is decided once, where the press is read.
  emit('slot-activate', { date: times.start, time: times.startTime })

  created++
  const draft: CalendarEvent = {
    // Vue's own id makes it unique to this calendar, so two on one page cannot collide, and
    // it is stable across the server and the client.
    id: `${uid}-${created}`,
    title: m.value.calendar.newEvent(created),
    ...times,
  }

  /*
   * A consumer whose own event type adds REQUIRED fields gets a draft without them — there
   * is nothing here that could invent a room number or an attendee list. That is what
   * `event-create` is for: it fires with the event as made, and replacing that entry with a
   * complete one is the intended answer. Documented in the `.mdx`.
   */
  events.value = [...events.value, draft as E]
  emit('event-create', draft)
}

defineExpose({
  /** Brings the focus into the grid, onto the cell it is currently showing. */
  focus: () => gridRef.value?.focus(),
  /** Goes back to the current day, exactly as the Today button does. */
  today: today_,
  previous: () => step(-1),
  next: () => step(1),
  /** Scrolls the grid so a given `HH:mm` sits at the top of the visible area. */
  scrollTo: (time: string) => {
    const at = minutesOf(time)
    if (at !== null) gridRef.value?.scrollToMinutes(at)
  },
})
</script>

<template>
  <div class="v-calendar" :class="rootClass" :style="rootStyle">
    <section
      v-bind="forwardedAttrs"
      class="v-calendar-region"
      :aria-label="ariaLabel"
      :aria-roledescription="m.calendar.roleDescription"
    >
      <div class="v-calendar-toolbar">
        <div class="v-calendar-nav">
          <VIconButton
            :icon="chevronLeftIcon"
            :label="stepLabels.previous"
            size="sm"
            @click="step(-1)"
          />
          <VIconButton
            :icon="chevronRightIcon"
            :label="stepLabels.next"
            size="sm"
            @click="step(1)"
          />
        </div>

        <VButton variant="outline" tone="neutral" size="sm" @click="today_">
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

      <VCalendarTimeGrid
        v-if="isTimeGrid"
        ref="gridRef"
        v-model:focused="focused"
        class="v-calendar-view"
        :days="days"
        :events="events"
        :window="window"
        :slot-duration="slotDuration"
        :locale="resolvedLocale"
        :hour-format="resolvedHourFormat"
        :today="today"
        :now="showCurrentTime ? now : null"
        :editable="editable"
        :creatable="creatable"
        :hint-id="hintId"
        :edge-step-delay="edgeStepDelay"
        :auto-scroll="autoScroll"
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
        :hour-format="resolvedHourFormat"
        :today="today"
        :event-limit="monthEventLimit"
        :editable="editable"
        :hint-id="hintId"
        :edge-step-delay="edgeStepDelay"
        :label="rangeText"
        @day-activate="openIn($event, 'day')"
        @cell-activate="onCellActivate($event, window.start)"
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
        class="v-calendar-view"
        :months="months"
        :events="events"
        :locale="resolvedLocale"
        :weekdays="resolvedWeekdays"
        :today="today"
        :label="rangeText"
        @month-activate="openIn($event, 'month')"
      />

      <!--
        Both of these are rendered from the first paint and never conditionally.

        The live region has to EXIST before it has anything to say: one inserted along with
        its first message is not announced at all. And the hint is what every card points at
        with `aria-describedby`, so one node serves the whole calendar rather than repeating
        the same sentence on each of a hundred events.
      -->
      <div class="v-visually-hidden" role="status" aria-live="polite">{{ announcement }}</div>
      <span :id="hintId" class="v-visually-hidden">{{ m.calendar.eventHint }}</span>
    </section>
  </div>
</template>

<style>
@layer vectis.components {
  .v-calendar {
    display: flex;
    block-size: 100%;
    min-block-size: 0;
    font-family: var(--vectis-text-family);
    color: var(--vectis-color-text);
  }

  /*
   * The height is settled in CSS rather than measured, the VDataTable idiom: the region is
   * a flex column at full height, the toolbar refuses to grow and the grid takes what is
   * left. `min-block-size: 0` on the grid is what lets it shrink below its content and
   * therefore scroll — without it the automatic minimum of a flex item would hold it at its
   * full 24-hour height and the whole page would scroll instead.
   *
   * All of it is a no-op when the parent's height is auto, where the percentage falls back
   * to auto and the calendar is simply as tall as its content. That is what makes an opt-in
   * prop unnecessary.
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
    /* It may be long — a full weekday and month in the day view — so it is the part that
       gives way first, and the controls keep their size. */
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

  .v-calendar-view {
    flex: 1;
    min-block-size: 0;
    border: 1px solid var(--vectis-color-border);
    border-radius: var(--vectis-radius-surface);
  }
}
</style>
