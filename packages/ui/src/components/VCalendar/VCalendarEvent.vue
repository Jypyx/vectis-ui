<script setup lang="ts" generic="E extends CalendarEvent">
// @a11y @core
/**
 * Share the native event button across calendar views so accessible naming and event-slot
 * rendering remain consistent.
 */
import { computed } from 'vue'

import VTypography from '../VTypography/VTypography.vue'

import { useMessages } from '../../i18n/state'

import { hueOf } from './color'
import type {
  CalendarEvent,
  CalendarEventId,
  CalendarEventLayout,
  CalendarEventSlotProps,
} from './types'

export interface CalendarEventProps<T> {
  /** The event this card stands for. */
  event: T
  /**
   * Which shape to take: a block, which fills the box the calendar gives it and can show a
   * second line, or a chip, which is one line high and sits in a row of others.
   */
  layout?: CalendarEventLayout
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
   * Whether letting go now would write nothing: the pointer has left the calendar, and the
   * event is about to return to where the faded echo shows it started.
   */
  rejected?: boolean
  /** Whether the card has been taken hold of with the keyboard. */
  grabbed?: boolean
  /** How the card says it can be moved, read from a node the calendar shares between them. */
  hintId?: string
  /**
   * Marks this card as the faded echo left behind where a dragged event STARTED, and names the
   * event it echoes.
   */
  ghostOf?: CalendarEventId
  /** Whether the whole calendar is disabled, which makes the card a real disabled button. */
  disabled?: boolean
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
  disabled: false,
})

defineSlots<{
  /** The whole content of the card, replacing the title and the times. */
  default?(props: CalendarEventSlotProps<E>): unknown
}>()

const m = useMessages()

/*
 * A colour given by the consumer is used as it stands; otherwise a hue is derived from the
 * event's id and the token layer supplies the lightness and the chroma that go with it. The two
 * are kept apart by an attribute rather than by a fallback chain, because the custom case needs
 * a DIFFERENT recipe and not merely a different value; see the stylesheet below.
 */
const hue = computed(() => hueOf(props.ghostOf ?? props.event.id))

const style = computed(() =>
  props.event.color
    ? { '--calendar-event-color': props.event.color }
    : { '--vectis-calendar-event-hue': String(hue.value) },
)

/** What a screen reader hears: the title, then when it happens. */
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
    :disabled="disabled || undefined"
    :inert="ghostOf !== undefined ? true : undefined"
  >
    <!--
      The content sits in a box of its own because the CARD is the container the stylesheet
      queries, and an element cannot be styled by its own container query. The layout that has
      to change when a card gets short; a column of two lines becoming one row; must therefore
      live on a descendant.
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
      It is a pointer affordance and nothing else, and its keyboard equivalent lives on the card
      itself as Shift with the arrow keys; which is why hiding it costs a reader nothing.
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
     * from; which lets the custom block below swap the source of all three without touching a
     * single rule that consumes them.
     */
    /*
     * The hue is turned here, on the card, and never in the tokens. Relative colour syntax
     * keeps the token's lightness and chroma, which are what hold the title's contrast, and
     * takes the hue the card sets inline, or the token's own (`h`) when none is set.
     */
    --calendar-event-face: oklch(
      from var(--vectis-color-event-surface) l c var(--vectis-calendar-event-hue, h)
    );
    --calendar-event-edge: oklch(
      from var(--vectis-color-event-border) l c var(--vectis-calendar-event-hue, h)
    );
    --calendar-event-ink: oklch(
      from var(--vectis-color-event-text) l c var(--vectis-calendar-event-hue, h)
    );

    position: relative;
    display: flex;
    overflow: hidden;
    /*
     * It is safe because a card's two dimensions are both set outright by `.v-calendar-block`;
     * size containment therefore removes an influence nothing was exercising. Asking in minutes
     * instead would have meant calibrating against `--vectis-control-size-calendar-hour`, and
     * being silently wrong for anyone who overrode it.
     */
    container-type: size;
    border: 1px solid var(--calendar-event-edge);
    /* The leading edge is what carries the colour at a glance, so it is drawn thicker. It
       is a border and not a background stripe: under Windows forced-colors a background is
       forced to Canvas and vanishes, where a border keeps a colour of its own. */
    border-inline-start: var(--vectis-control-size-calendar-event-edge) solid
      var(--calendar-event-edge);
    /*
     * A browser scales down any radius it cannot fit, so a chip already paints half a lane
     * under a large --vectis-radius-interactive; min() applies that same reduction to a timed
     * block, whose height is the event's DURATION. Written bare, a pill theme paints half of a
     * three-hour block instead: 96px corners on one card and 12px on the chip beside it.
     */
    border-radius: min(
      var(--vectis-radius-interactive),
      calc(var(--vectis-control-size-calendar-allday-lane) / 2)
    );
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
   * A colour the consumer chose is an arbitrary value, so the card is built so that NOTHING is
   * ever written on top of it: it paints the edge, and the face is a faint wash of it over the
   * page's own surface; which also makes it follow the theme with no second setting. The text
   * stays the page's text colour, whose contrast against that surface is already guaranteed.
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
   * Give the time a larger weighted flex-shrink so it disappears before truncating the event
   * title.
   */
  @container (max-block-size: 3rem) {
    .v-calendar-event[data-layout='block'] .v-calendar-event-body {
      flex-direction: row;
      align-items: center;
      gap: var(--vectis-space-1);
      padding-block: 0;
    }

    .v-calendar-event[data-layout='block'] .v-calendar-event-title {
      flex: 0 1 auto;
      min-inline-size: 0;
    }

    .v-calendar-event[data-layout='block'] .v-calendar-event-time {
      flex: 0 1000 auto;
      min-inline-size: 0;
    }

    .v-calendar-event[data-layout='block'] .v-calendar-event-description {
      display: none;
    }
  }

  /*
   * The shortest card there is: one slot, which at the default hour height is sixteen pixels,
   * leaving fourteen once the border is taken. A line of the title at its normal leading is
   * eighteen; so the leading is what gives, down to the glyphs themselves.
   */
  @container (max-block-size: 1.5rem) {
    .v-calendar-event[data-layout='block'] .v-calendar-event-title,
    .v-calendar-event[data-layout='block'] .v-calendar-event-time {
      line-height: 1;
    }

    .v-calendar-event[data-layout='block'] .v-calendar-event-handle {
      block-size: calc(var(--vectis-control-size-calendar-handle) / 2);
    }
  }

  .v-calendar-event:hover {
    filter: brightness(0.97);
  }

  /*
   * `pointer-events: none` matters as much: the pointer is captured by the grid, and a card
   * under the cursor would otherwise take the hover of every cell it passed over.
   */
  .v-calendar-event[data-dragging] {
    opacity: 0.75;
    box-shadow: var(--vectis-shadow-md);
    pointer-events: none;
    z-index: 3;
  }

  /*
   * This rule must stay BELOW `[data-dragging]`. Both are (0,2,0) and a refused card is always
   * also a dragged one, so the later rule is the whole of the arbitration.
   */
  .v-calendar-event[data-rejected] {
    --calendar-event-face: var(--vectis-color-danger-surface);
    --calendar-event-edge: var(--vectis-color-danger-border);
    --calendar-event-ink: var(--vectis-color-danger-text);

    border-style: dotted;
    box-shadow: none;
  }

  /*
   * The echo left where a dragged event started, so the reader can see what they are moving it
   * FROM; without it a long drag ends with no idea what has just been given up. Faded rather
   * than outlined, and dashed rather than solid, so that it reads as a memory and not as a
   * second event: at a glance the only card that looks real is the one under the pointer.
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
    inset-block-end: var(--vectis-control-size-calendar-grip-thickness);
    inset-inline-start: 50%;
    inline-size: var(--vectis-control-size-calendar-grip);
    block-size: var(--vectis-control-size-calendar-grip-thickness);
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
   * The height goes through `--calendar-chip-height`, which `.v-calendar-month-chip` sets,
   * rather than that rule setting `block-size` itself. This selector is (0,2,0) and that one is
   * (0,1,0) in ANOTHER SHEET: matching specificity would hand the winner to whichever order the
   * consumer's bundler emits, and beating it would need a three-class compound.
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
    /*
     * The times are secondary to the title, but the card's colour is already doing the quiet
     * work; a muted token here would fight it, so the same ink at less weight.
     */
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

  @media (forced-colors: active) {
    .v-calendar-event-handle::after {
      forced-color-adjust: none;
      background: CanvasText;
    }
  }
}
</style>
