<script setup lang="ts">
// @a11y
/**
 * One event of a VTimeline: a marker on the line, a date, a title and content. The marker is
 * decoration, hidden from assistive technology: what the tone means must also be said in words.
 */
import { computed, inject } from 'vue'

import VIcon from '../VIcon/VIcon.vue'
import { iconProps } from '../VIcon/iconProps'
import type { IconSource } from '../VIcon/types'
import { useResolvedLocale } from '../../i18n/state'
import { timelineKey } from './context'
import { formatTimelineDate } from './datetime'

/** The colour of the marker. */
export type TimelineItemTone = 'neutral' | 'accent' | 'danger' | 'success' | 'warning'

interface TimelineItemProps {
  /**
   * When the event happened, as an ISO string: a year (`2019`), a month (`2026-10`), a day
   * (`2026-10-06`) or a moment (`2026-10-06T14:30`). It is written out in the locale, at that
   * precision, inside a `<time datetime>`.
   */
  datetime?: string
  /**
   * Visible text replacing the written-out date, such as "2 hours ago". The `<time>` keeps
   * `datetime` for machines.
   */
  timeText?: string
  /** What happened, in a few words. The `#title` slot replaces it. */
  title?: string
  /** The colour of the marker. */
  tone?: TimelineItemTone
  /**
   * An icon in a round badge on the line, in place of the dot: an icon name, or an explicit
   * render (the VIcon contract). The `#marker` slot replaces it.
   */
  icon?: IconSource
}

const props = withDefaults(defineProps<TimelineItemProps>(), {
  datetime: undefined,
  timeText: undefined,
  title: undefined,
  tone: 'accent',
  icon: undefined,
})

defineSlots<{
  /** The details of the event: text, links, buttons. */
  default?(): unknown
  /** Replaces the `title` prop with content of your own. */
  title?(): unknown
  /** Replaces the dot or the icon badge on the line, an avatar for instance. It is decoration. */
  marker?(): unknown
}>()

const timeline = inject(timelineKey, undefined)
const locale = useResolvedLocale(() => timeline?.locale)

const titleTag = computed(() => (timeline?.headingLevel ? `h${timeline.headingLevel}` : 'p'))

const displayTime = computed(() => {
  if (props.timeText) return props.timeText
  if (!props.datetime) return ''
  return formatTimelineDate(props.datetime, locale.value, timeline?.formatOptions)
})
</script>

<template>
  <li
    class="v-timeline-item v-tone"
    :data-tone="tone"
    :data-marker="$slots.marker ? 'custom' : icon ? 'icon' : 'dot'"
    :data-orientation="timeline?.orientation ?? 'vertical'"
    :data-layout="timeline?.layout ?? 'stacked'"
  >
    <span class="v-timeline-marker" aria-hidden="true">
      <slot name="marker">
        <span v-if="icon" class="v-timeline-icon"><VIcon v-bind="iconProps(icon)" /></span>
        <span v-else class="v-timeline-dot" />
      </slot>
    </span>
    <span class="v-timeline-connector" aria-hidden="true" />
    <component
      :is="datetime ? 'time' : 'span'"
      v-if="displayTime"
      class="v-timeline-time"
      :datetime="datetime"
    >
      {{ displayTime }}
    </component>
    <component :is="titleTag" v-if="$slots.title || title" class="v-timeline-title">
      <slot name="title">{{ title }}</slot>
    </component>
    <div v-if="$slots.default" class="v-timeline-content">
      <slot />
    </div>
  </li>
</template>

<style>
@layer vectis.components {
  /*
   * The parts are placed on the grid of the list: the marker in the first row, the line under it
   * down to the end of the event, the texts beside it one row after another, and a last row for
   * the space before the next event, which the line runs through.
   */
  .v-timeline-item {
    --timeline-marker: var(--timeline-dot);
    /*
     * The first row is as tall as a title line, and the marker is centred on it. A badge taller
     * than the line reaches above and below it by `--timeline-overflow`, which the line and the
     * outer events make room for, so that the texts keep the same spacing beside a dot or a badge.
     */
    --timeline-line: calc(var(--vectis-text-label-size) * var(--vectis-text-label-leading));
    --timeline-overflow: max(0px, (var(--timeline-marker) - var(--timeline-line)) / 2);
    --timeline-dot-color: var(--tone-bg-solid);

    display: grid;
    min-inline-size: 0;
  }

  .v-timeline-item:last-child {
    --timeline-gap: 0px;
  }

  .v-timeline-item[data-orientation='vertical']:first-child {
    margin-block-start: var(--timeline-overflow);
  }

  .v-timeline-item[data-orientation='vertical']:last-child {
    --timeline-gap: var(--timeline-overflow);
  }

  .v-timeline-item[data-marker='icon'],
  .v-timeline-item[data-marker='custom'] {
    --timeline-marker: var(--timeline-icon);
  }

  .v-timeline-item[data-tone='neutral'] {
    --timeline-dot-color: var(--vectis-color-text-muted);
  }

  .v-timeline-item[data-orientation='vertical'] {
    grid-column: 1 / -1;
    grid-template-columns: subgrid;
    grid-template-rows: auto auto auto var(--timeline-gap);
  }

  /*
   * A flex line keeps the height of the marker, where a grid track would grow to fit a taller
   * badge; `unsafe` then centres the badge on that height rather than hanging it from its top.
   */
  .v-timeline-marker {
    display: flex;
    align-items: unsafe center;
    justify-content: center;
    min-inline-size: var(--timeline-marker);
  }

  .v-timeline-item[data-orientation='vertical'] > .v-timeline-marker {
    grid-column: marker;
    grid-row: 1;
    block-size: var(--timeline-line);
  }

  /* A border rather than a fill draws the dot and the line, which forced colours keep. */
  .v-timeline-dot {
    box-sizing: border-box;
    inline-size: var(--timeline-dot);
    block-size: var(--timeline-dot);
    border: calc(var(--timeline-dot) / 2) solid var(--timeline-dot-color);
    border-radius: var(--vectis-radius-full);
  }

  .v-timeline-icon {
    --vectis-icon-size: calc(var(--timeline-icon) / 2);

    display: grid;
    place-items: center;
    box-sizing: border-box;
    inline-size: var(--timeline-icon);
    block-size: var(--timeline-icon);
    border: 1px solid var(--tone-border-soft);
    border-radius: var(--vectis-radius-full);
    background: var(--tone-bg-soft);
    color: var(--tone-text-tinted);
  }

  .v-timeline-connector {
    border-color: var(--vectis-color-border);
    border-style: solid;
    border-width: 0;
  }

  .v-timeline-item:last-child > .v-timeline-connector {
    display: none;
  }

  /* From under the marker down to the next one, stopping a little short of both. */
  .v-timeline-item[data-orientation='vertical'] > .v-timeline-connector {
    grid-column: marker;
    grid-row: 2 / -1;
    justify-self: center;
    margin-block: calc(var(--vectis-space-1) + var(--timeline-overflow)) var(--vectis-space-1);
    border-inline-start-width: 1px;
  }

  .v-timeline-item[data-orientation='vertical']:has(
      + :is([data-marker='icon'], [data-marker='custom'])
    )
    > .v-timeline-connector {
    /* Halved term by term: cssnano's calc parser rejects a bracketed group inside max(). */
    margin-block-end: calc(
      var(--vectis-space-1) + max(0px, var(--timeline-icon) / 2 - var(--timeline-line) / 2)
    );
  }

  .v-timeline-item[data-orientation='vertical']
    > :is(.v-timeline-time, .v-timeline-title, .v-timeline-content) {
    grid-column: main;
  }

  /* The first text beside the marker is at least a title line high, its first line centred. */
  .v-timeline-item[data-orientation='vertical'] > .v-timeline-connector + * {
    min-block-size: var(--timeline-line);
    align-content: center;
  }

  .v-timeline-time {
    display: block;
    color: var(--vectis-color-text-muted);
    font-size: var(--vectis-text-caption-size);
    font-weight: var(--vectis-text-caption-weight);
    line-height: var(--vectis-text-caption-leading);
    font-variant-numeric: tabular-nums;
  }

  .v-timeline-title {
    margin: 0;
    color: var(--vectis-color-text);
    font-size: var(--vectis-text-label-size);
    font-weight: var(--vectis-text-label-weight);
    line-height: var(--vectis-text-label-leading);
  }

  .v-timeline-content {
    color: var(--vectis-color-text-muted);
    font-size: var(--vectis-text-body-md-size);
    font-weight: var(--vectis-text-body-md-weight);
    line-height: var(--vectis-text-body-md-leading);
  }

  .v-timeline-item > .v-timeline-title + .v-timeline-content {
    margin-block-start: var(--vectis-space-1);
  }

  .v-timeline[data-size='sm'] > .v-timeline-list > .v-timeline-item > .v-timeline-content {
    font-size: var(--vectis-text-body-sm-size);
    font-weight: var(--vectis-text-body-sm-weight);
    line-height: var(--vectis-text-body-sm-leading);
  }

  /* Across the page: the marker and the line in the first row, the texts under them. */
  .v-timeline-item[data-orientation='horizontal'] {
    grid-row: 1 / -1;
    grid-template-rows: subgrid;
    grid-template-columns: auto minmax(0, 1fr);
  }

  .v-timeline-item[data-orientation='horizontal'] > .v-timeline-marker {
    grid-column: 1;
    grid-row: 1;
    align-self: center;
    block-size: var(--timeline-marker);
  }

  .v-timeline-item[data-orientation='horizontal'] > .v-timeline-connector {
    grid-column: 2;
    grid-row: 1;
    align-self: center;
    margin-inline: var(--vectis-space-1);
    border-block-start-width: 1px;
  }

  .v-timeline-item[data-orientation='horizontal'] > .v-timeline-time {
    grid-row: 2;
  }

  .v-timeline-item[data-orientation='horizontal'] > .v-timeline-title {
    grid-row: 3;
  }

  .v-timeline-item[data-orientation='horizontal'] > .v-timeline-content {
    grid-row: 4;
  }

  .v-timeline-item[data-orientation='horizontal']
    > :is(.v-timeline-time, .v-timeline-title, .v-timeline-content) {
    grid-column: 1 / -1;
    padding-inline-end: var(--timeline-gap);
  }

  .v-timeline-item[data-orientation='horizontal'] > .v-timeline-connector + * {
    margin-block-start: var(--timeline-gutter);
  }

  /*
   * Across the line, the date sits in its own column and the title beside the marker takes the
   * row height too. The thresholds repeat those of VTimeline.
   */
  @container v-timeline (width > 30rem) {
    .v-timeline-item[data-layout='split'] > .v-timeline-time {
      grid-column: time;
      grid-row: 1;
      text-align: end;
    }

    .v-timeline-item[data-layout='split'] > .v-timeline-time + * {
      min-block-size: var(--timeline-line);
      align-content: center;
    }
  }

  /* Every other event swaps sides: its date goes after the line, its texts before it. */
  @container v-timeline (width > 36rem) {
    .v-timeline-item[data-layout='alternate'] > .v-timeline-time {
      grid-column: time;
      grid-row: 1;
      text-align: end;
    }

    .v-timeline-item[data-layout='alternate'] > .v-timeline-time + * {
      min-block-size: var(--timeline-line);
      align-content: center;
    }

    .v-timeline-item[data-layout='alternate']:nth-child(even) > .v-timeline-time {
      grid-column: main;
      text-align: start;
    }

    .v-timeline-item[data-layout='alternate']:nth-child(even)
      > :is(.v-timeline-title, .v-timeline-content) {
      grid-column: time;
      text-align: end;
    }
  }
}
</style>
