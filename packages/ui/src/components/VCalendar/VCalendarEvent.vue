<script setup lang="ts" generic="E extends CalendarEvent">
// @a11y @core
/**
 * One event as it is drawn on the calendar. Internal to VCalendar, whose documentation
 * covers it.
 *
 * It exists because the same card is drawn from three places in two shapes — a block in a
 * day column, a chip in the all-day band or a month cell — and writing it three times would
 * triplicate the accessible name, the colour table and the slot.
 *
 * A real `<button>`, which is what makes an event reachable and activatable with no JS of its
 * own. The only script here derives the colour; where the card goes and what a drag does
 * belong to the calendar, the thing that knows about the grid.
 */
import { computed } from 'vue'

import VTypography from '../VTypography/VTypography.vue'

import { useMessages } from '../../i18n/state'

import { hueOf } from './color'
import type { CalendarEvent, CalendarEventId } from './types'

export interface CalendarEventProps<T> {
  /** The event this card stands for. */
  event: T
  /**
   * Which shape to take: a block, which fills the box the calendar gives it and can show a
   * second line, or a chip, which is one line high and sits in a row of others.
   */
  layout?: 'block' | 'chip'
  /** The event's times, already written out for the reader by the calendar. */
  timeText?: string
  /** Whether the event carries on past the start or the end of what is on show. */
  continuesBefore?: boolean
  continuesAfter?: boolean
  /** Shows the strip along the bottom edge that the event's end is dragged by. */
  resizable?: boolean
  /** Whether the card is being dragged with a pointer right now. */
  dragging?: boolean
  /**
   * Whether letting go now would write nothing: the pointer has left the calendar, and the event
   * is about to return to where the faded echo shows it started.
   *
   * It is separate from `dragging` rather than folded into it because a refused card is ALSO
   * being dragged — the two are orthogonal, and the stylesheet reads both. Named for what the
   * card knows, which is that its drop will not be taken; a card knows nothing of a view it
   * might be outside of.
   */
  rejected?: boolean
  /** Whether the card has been taken hold of with the keyboard. */
  grabbed?: boolean
  /** How the card says it can be moved, read from a node the calendar shares between them. */
  hintId?: string
  /**
   * Marks this card as the faded echo left behind where a dragged event STARTED, and names
   * the event it echoes.
   *
   * It carries the original id rather than a bare boolean because the colour is derived from
   * an id: a ghost has to be given a distinct one so the layout can tell the two apart, and
   * without this the echo would come out a different colour from the card it belongs to.
   */
  ghostOf?: CalendarEventId
}

const props = withDefaults(defineProps<CalendarEventProps<E>>(), {
  layout: 'block',
  timeText: '',
  continuesBefore: false,
  continuesAfter: false,
  resizable: false,
  dragging: false,
  rejected: false,
  grabbed: false,
  hintId: undefined,
  ghostOf: undefined,
})

defineSlots<{
  /** The whole content of the card, replacing the title and the times. */
  default?(props: {
    event: E
    layout: 'block' | 'chip'
    timeText: string
    continuesBefore: boolean
    continuesAfter: boolean
    dragging: boolean
    grabbed: boolean
  }): unknown
}>()

const m = useMessages()

/*
 * A colour given by the consumer is used as it stands; otherwise a hue is derived from the
 * event's id and the token layer supplies the lightness and the chroma that go with it.
 * The two are kept apart by an attribute rather than by a fallback chain, because the
 * custom case needs a DIFFERENT recipe and not merely a different value — see the
 * stylesheet below.
 */
const hue = computed(() => hueOf(props.ghostOf ?? props.event.id))

const style = computed(() =>
  props.event.color
    ? { '--calendar-event-color': props.event.color }
    : { '--vectis-calendar-event-hue': String(hue.value) },
)

/**
 * What a screen reader hears: the title, then when it happens. The visible card may hide
 * the times when it is too short to hold them, so the name has to carry them itself —
 * "Standup" alone would leave a reader unable to tell two days of it apart.
 */
const accessibleName = computed(() =>
  props.timeText ? `${props.event.title}, ${props.timeText}` : props.event.title,
)
</script>

<template>
  <button
    type="button"
    class="v-calendar-event"
    :data-event-id="String(event.id)"
    :data-layout="layout"
    :data-custom="event.color ? '' : undefined"
    :data-continues-before="continuesBefore ? '' : undefined"
    :data-continues-after="continuesAfter ? '' : undefined"
    :data-dragging="dragging ? '' : undefined"
    :data-rejected="rejected ? '' : undefined"
    :data-grabbed="grabbed ? '' : undefined"
    :data-ghost="ghostOf !== undefined ? '' : undefined"
    :style="style"
    :aria-label="accessibleName"
    :aria-roledescription="m.calendar.eventRoleDescription"
    :aria-describedby="hintId"
    :inert="ghostOf !== undefined ? true : undefined"
  >
    <!--
      The content sits in a box of its own because the CARD is the container the stylesheet
      queries, and an element cannot be styled by its own container query. The layout that
      has to change when a card gets short — a column of two lines becoming one row — must
      therefore live on a descendant. It is also why the padding belongs here rather than on
      the button: a card cannot zero its own.
    -->
    <span class="v-calendar-event-body">
      <slot
        :event="event"
        :layout="layout"
        :time-text="timeText"
        :continues-before="continuesBefore"
        :continues-after="continuesAfter"
        :dragging="dragging"
        :grabbed="grabbed"
      >
        <span class="v-calendar-event-title">{{ event.title }}</span>
        <span v-if="layout === 'block' && timeText" class="v-calendar-event-time">
          {{ timeText }}
        </span>
        <VTypography
          v-if="layout === 'block' && event.description"
          as="span"
          variant="caption"
          class="v-calendar-event-description"
        >
          {{ event.description }}
        </VTypography>
      </slot>
    </span>

    <!--
      The strip the event's end is dragged by.

      It is a `span` and NOT a control, which is what keeps it out of the accessibility tree
      and away from `nested-interactive`: a button inside a button is invalid HTML and a
      blocking accessibility failure at once. It is a pointer affordance and nothing else,
      and its keyboard equivalent lives on the card itself as Shift with the arrow keys —
      which is why hiding it costs a reader nothing.
    -->
    <span
      v-if="resizable && layout === 'block'"
      class="v-calendar-event-handle"
      data-calendar-handle
      aria-hidden="true"
    />
  </button>
</template>

<style>
@layer vectis.components {
  .v-calendar-event {
    /*
     * The three colours of a card, named by what they paint rather than by where they come
     * from — which is what lets the custom block below swap the SOURCE of all three without
     * touching a single rule that consumes them.
     */
    --calendar-event-face: var(--vectis-color-event-surface);
    --calendar-event-edge: var(--vectis-color-event-border);
    --calendar-event-ink: var(--vectis-color-event-text);

    /* The handle is placed against this box, so the card has to establish one. */
    position: relative;
    display: flex;
    overflow: hidden;
    /*
     * The card is what the body below is measured against.
     *
     * `size` and not `inline-size`, which is what the library's other four containers use:
     * the question being asked here is about HEIGHT, since that is what a short event runs
     * out of. It is safe because a card's two dimensions are both set outright by
     * `.v-calendar-block` — size containment therefore removes an influence nothing was
     * exercising. Asking in minutes instead would have meant calibrating against
     * `--vectis-control-size-calendar-hour`, and being silently wrong for anyone who
     * overrode it.
     */
    container-type: size;
    border: 1px solid var(--calendar-event-edge);
    /* The leading edge is what carries the colour at a glance, so it is drawn thicker. It
       is a border and not a background stripe: under Windows forced-colors a background is
       forced to Canvas and vanishes, where a border keeps a colour of its own. */
    border-inline-start: 3px solid var(--calendar-event-edge);
    border-radius: var(--vectis-radius-interactive);
    background: var(--calendar-event-face);
    color: var(--calendar-event-ink);
    font-family: var(--vectis-text-family);
    text-align: start;
    cursor: pointer;
    transition:
      box-shadow var(--vectis-duration-fast) var(--vectis-ease-default),
      filter var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  /*
   * A colour the consumer chose is an arbitrary value, so the card is built so that NOTHING
   * is ever written on top of it: it paints the edge, and the face is a faint wash of it
   * over the page's own surface — which also makes it follow the theme with no second
   * setting. The text stays the page's text colour, whose contrast against that surface is
   * already guaranteed. This is the deliberate difference from VChip, where a fully
   * coloured chip leaves the check to whoever chose the colour.
   */
  .v-calendar-event[data-custom] {
    --calendar-event-edge: var(--calendar-event-color);
    --calendar-event-face: color-mix(
      in oklab,
      var(--calendar-event-color) 14%,
      var(--vectis-color-surface)
    );
    --calendar-event-ink: var(--vectis-color-text);
  }

  .v-calendar-event-body {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 1px;
    /* Without this a flex item refuses to shrink past its content, and a card too short for
       its own text would push its title out of the clip instead of cropping it. */
    min-block-size: 0;
    min-inline-size: 0;
    overflow: hidden;
    padding: var(--vectis-space-1) var(--vectis-space-2);
  }

  /*
   * A card too short for two lines puts them on ONE: the title first and ellipsized, the
   * time after it, and the description dropped — which is the only way a quarter of an hour
   * shows anything at all. Three rem is where a title line, a time line, the gap and the
   * padding stop fitting; below it there is room for exactly one line.
   *
   * The threshold is a literal because a container query takes no custom properties — the
   * same constraint VPagination's steps are written under.
   */
  @container (max-height: 3rem) {
    .v-calendar-event[data-layout='block'] .v-calendar-event-body {
      flex-direction: row;
      align-items: center;
      gap: var(--vectis-space-1);
      padding-block: 0;
    }

    .v-calendar-event[data-layout='block'] .v-calendar-event-title {
      flex: 1;
      min-inline-size: 0;
    }

    .v-calendar-event[data-layout='block'] .v-calendar-event-time {
      flex: none;
    }

    /* There is no room for a third thing, and the title is what identifies the event. */
    .v-calendar-event[data-layout='block'] .v-calendar-event-description {
      display: none;
    }
  }

  /*
   * The shortest card there is: one slot, which at the default hour height is sixteen pixels,
   * leaving fourteen once the border is taken. A line of the title at its normal leading is
   * eighteen — so the leading is what gives, down to the glyphs themselves. Nothing smaller
   * is available: twelve pixels is already the smallest type role the library has.
   *
   * This tier exists because a card may no longer grow past its own length: it is the price
   * of a quarter of an hour that stays inside its slot, and it is paid in leading rather than
   * in a card that covers the next one.
   */
  @container (max-height: 1.5rem) {
    .v-calendar-event[data-layout='block'] .v-calendar-event-title,
    .v-calendar-event[data-layout='block'] .v-calendar-event-time {
      line-height: 1;
    }

    /* Half the strip, or half of a sixteen-pixel card would resize rather than move it. */
    .v-calendar-event[data-layout='block'] .v-calendar-event-handle {
      block-size: calc(var(--vectis-control-size-calendar-handle) / 2);
    }
  }

  .v-calendar-event:hover {
    filter: brightness(0.97);
  }

  /*
   * A card being moved is lifted off the grid and made slightly transparent, so the hours
   * underneath stay readable while it travels — a solid card would hide the very rules the
   * reader is aiming at. `pointer-events: none` matters as much: the pointer is captured by
   * the grid, and a card under the cursor would otherwise take the hover of every cell it
   * passed over.
   */
  .v-calendar-event[data-dragging] {
    opacity: 0.75;
    box-shadow: var(--vectis-shadow-md);
    pointer-events: none;
    z-index: 3;
  }

  /*
   * A card whose drop will not be taken: the pointer has left the calendar, and letting go here
   * puts the event back where the echo shows it started.
   *
   * THREE channels, because one is never enough. The colour is the danger role, reached through
   * the same three local variables `[data-custom]` swaps — which is also what repaints a card the
   * consumer coloured, that rule sitting higher up this sheet. The LIFT is taken away, so a card
   * that will not land visibly stops being carried: the one cue that costs no colour at all. And
   * the border goes DOTTED, the only one of the three surviving Windows forced-colors, where the
   * face is forced to Canvas and every card would otherwise look identical — dotted rather than
   * dashed because dashed is already the echo's language, and a refused drop must not read as a
   * memory of one.
   *
   * `opacity: 0.75` is deliberately left in place: it is what keeps the hours under the card
   * readable, and the reader is still aiming with it.
   *
   * TRAP — this rule must stay BELOW `[data-dragging]`. Both are (0,2,0) and a refused card is
   * always also a dragged one, so the later rule is the whole of the arbitration. That is
   * legitimate here and only here: these two live in the SAME sheet, where the internal order is
   * ours to decide — between two component sheets it would be the consumer's bundler deciding.
   */
  .v-calendar-event[data-rejected] {
    --calendar-event-face: var(--vectis-color-danger-surface);
    --calendar-event-edge: var(--vectis-color-danger-border);
    --calendar-event-ink: var(--vectis-color-danger-text);

    border-style: dotted;
    box-shadow: none;
  }

  /*
   * The echo left where a dragged event started, so the reader can see what they are moving
   * it FROM — without it a long drag ends with no idea what has just been given up.
   *
   * Faded rather than outlined, and dashed rather than solid, so that it reads as a memory
   * and not as a second event: at a glance the only card that looks real is the one under the
   * pointer. It sits UNDER everything (`z-index: 0`), since it is the one thing on the grid
   * that nothing should ever be hidden behind.
   *
   * `inert` in the template is what keeps it out of the accessibility tree and out of reach
   * of the pointer, in one attribute — a duplicate announced a second time would be noise,
   * and a focusable copy inside a hidden subtree is an axe violation of its own.
   */
  .v-calendar-event[data-ghost] {
    opacity: 0.4;
    border-style: dashed;
    z-index: 0;
  }

  /* Held by the keyboard: the same lift, but marked with the focus ring's own colour, since
     there is no pointer to show where it is going. */
  .v-calendar-event[data-grabbed] {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: var(--vectis-focus-ring-offset);
    box-shadow: var(--vectis-shadow-md);
    z-index: 3;
  }

  .v-calendar-event-handle {
    position: absolute;
    inset-block-end: 0;
    inset-inline: 0;
    block-size: var(--vectis-control-size-calendar-handle);
    /* Dragging here IS how the end is set, so it must do nothing else: no scrolling under a
       finger, and no selecting the text it sits over. */
    touch-action: none;
    cursor: ns-resize;
  }

  /* The grip appears on hover and while the card is being resized, never permanently: a
     short card is mostly handle, and a line across every event all the time reads as a
     border nobody asked for. */
  .v-calendar-event-handle::after {
    content: '';
    position: absolute;
    inset-block-end: 2px;
    inset-inline-start: 50%;
    inline-size: var(--vectis-space-4);
    block-size: 2px;
    translate: -50% 0;
    border-radius: var(--vectis-radius-pill);
    background: var(--calendar-event-ink);
    opacity: 0;
    transition: opacity var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  .v-calendar-event:hover .v-calendar-event-handle::after,
  .v-calendar-event[data-dragging] .v-calendar-event-handle::after {
    opacity: 0.6;
  }

  .v-calendar-event:focus-visible {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: calc(-1 * var(--vectis-focus-ring-width));
  }

  /* An event running past what is on show loses the corner on that side, so the card reads
     as cut off rather than as merely small. */
  .v-calendar-event[data-continues-before] {
    border-start-start-radius: 0;
    border-start-end-radius: 0;
    border-block-start-style: dashed;
  }

  .v-calendar-event[data-continues-after] {
    border-end-start-radius: 0;
    border-end-end-radius: 0;
    border-block-end-style: dashed;
  }

  /*
   * A chip fills the box it was put in — a lane of the all-day band, whose grid row is
   * already the right height — unless the consumer of this class names a height instead.
   *
   * TRAP — that indirection is not a nicety, it is the only correct shape. This selector is
   * (0,2,0) and `.v-calendar-month-chip`, which needs a different height, is (0,1,0) in
   * ANOTHER SHEET: matching specificity would hand the winner to whichever order the
   * consumer's bundler happens to emit, and beating it would need a three-class compound.
   * Routing through a property this rule already reads is the library's documented way out,
   * the one `.v-table-title` takes on `--typography-color`.
   */
  .v-calendar-event[data-layout='chip'] {
    block-size: var(--calendar-chip-height, 100%);
  }

  .v-calendar-event[data-layout='chip'] .v-calendar-event-body {
    flex-direction: row;
    align-items: center;
    gap: var(--vectis-space-1);
    padding-block: 0;
  }

  .v-calendar-event-title {
    overflow: hidden;
    font-size: var(--vectis-text-body-sm-size);
    font-weight: var(--vectis-font-weight-medium);
    line-height: var(--vectis-text-body-sm-leading);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .v-calendar-event-time {
    overflow: hidden;
    font-size: var(--vectis-text-caption-size);
    line-height: var(--vectis-text-caption-leading);
    text-overflow: ellipsis;
    white-space: nowrap;
    /* The times are secondary to the title, but the card's colour is already doing the
       quiet work — a muted token here would fight it, so the same ink at less weight. */
    opacity: 0.85;
  }

  .v-calendar-event-description {
    overflow: hidden;
    /* The card's height is the event's length, so a description shows only where there is
       genuinely room for it: it takes whatever is left and disappears when that is nothing. */
    min-block-size: 0;
    color: inherit;
    text-overflow: ellipsis;
    opacity: 0.85;
  }

  @media (prefers-reduced-motion: reduce) {
    .v-calendar-event,
    .v-calendar-event-handle::after {
      transition: none;
    }
  }
}
</style>
