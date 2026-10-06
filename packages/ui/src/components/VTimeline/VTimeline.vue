<script setup lang="ts">
// @a11y @core
/**
 * An ordered list of dated events, each a VTimelineItem: a marker on a line, a date, a title and
 * content of its own. The root is a wrapper, the size container of the side-by-side layouts;
 * attributes other than `class` and `style` go to the list.
 */
import { provide } from 'vue'

import { useRootAttrs } from '../../composables/useRootAttrs'
import { timelineKey, type TimelineHeadingLevel } from './context'

defineOptions({ inheritAttrs: false })

/** Whether the events run down the page or across it. */
export type TimelineOrientation = 'vertical' | 'horizontal'

/**
 * Where a vertical timeline puts the date: above the title (`stacked`), in a column of its own
 * across the line (`split`), or across the line from content that alternates sides
 * (`alternate`).
 */
export type TimelineLayout = 'stacked' | 'split' | 'alternate'

/** The density of the timeline. */
export type TimelineSize = 'sm' | 'md'

interface TimelineProps {
  /**
   * Whether the events run down the page (`vertical`) or across it (`horizontal`). A horizontal
   * timeline scrolls when its events no longer fit.
   */
  orientation?: TimelineOrientation
  /**
   * Where a vertical timeline puts the date: above the title (`stacked`), in a column across the
   * line (`split`), or across the line from content that alternates sides (`alternate`). The
   * last two fall back to `stacked` in a narrow space.
   */
  layout?: TimelineLayout
  /** The density: `sm` tightens the spacing, the markers and the content text. */
  size?: TimelineSize
  /**
   * Renders the titles of the events as headings of this level, without changing how they look.
   * Left out, they are paragraphs.
   */
  headingLevel?: TimelineHeadingLevel
  /** The locale the dates are written in. Left out, the design system locale applies. */
  locale?: string
  /**
   * How a day or a moment is written, as `Intl.DateTimeFormat` options. Years and months keep
   * their own format. Set `timeZone` when the page is rendered on a server and a date carries an
   * offset, or the server's time zone would be the one shown.
   */
  formatOptions?: Intl.DateTimeFormatOptions
}

const props = withDefaults(defineProps<TimelineProps>(), {
  orientation: 'vertical',
  layout: 'stacked',
  size: 'md',
  headingLevel: undefined,
  locale: undefined,
  formatOptions: undefined,
})

defineSlots<{
  /** The `<VTimelineItem>`s, oldest or newest first as the story reads best. */
  default?(): unknown
}>()

const { rootClass, rootStyle, forwardedAttrs } = useRootAttrs()

provide(timelineKey, {
  get orientation() {
    return props.orientation
  },
  get layout() {
    return props.layout
  },
  get headingLevel() {
    return props.headingLevel
  },
  get locale() {
    return props.locale
  },
  get formatOptions() {
    return props.formatOptions
  },
})
</script>

<template>
  <div
    :class="['v-timeline', rootClass]"
    :style="rootStyle"
    :data-orientation="orientation"
    :data-layout="orientation === 'vertical' ? layout : undefined"
    :data-size="size"
  >
    <!--
      A horizontal list scrolls, and its events may hold nothing focusable: the list itself is
      the tab stop that lets a keyboard scroll it.
    -->
    <ol
      class="v-timeline-list"
      :tabindex="orientation === 'horizontal' ? 0 : undefined"
      v-bind="forwardedAttrs"
    >
      <slot />
    </ol>
  </div>
</template>

<style>
@layer vectis.components {
  .v-timeline {
    --timeline-dot: var(--vectis-control-size-timeline-dot-md);
    --timeline-icon: var(--vectis-control-size-timeline-icon-md);
    --timeline-gutter: var(--vectis-space-3);
    --timeline-gap: var(--vectis-space-6);

    font-family: var(--vectis-text-family);
    color: var(--vectis-color-text);
  }

  .v-timeline[data-size='sm'] {
    --timeline-dot: var(--vectis-control-size-timeline-dot-sm);
    --timeline-icon: var(--vectis-control-size-timeline-icon-sm);
    --timeline-gutter: var(--vectis-space-2);
    --timeline-gap: var(--vectis-space-4);
  }

  /*
   * The side-by-side layouts make the wrapper a size container, which is what lets them fall back
   * to `stacked` below a width. It therefore takes its width from its parent, never from its
   * events: in a row, give it a `flex` basis of its own.
   */
  .v-timeline[data-layout='split'],
  .v-timeline[data-layout='alternate'] {
    container: v-timeline / inline-size;
  }

  .v-timeline-list {
    display: grid;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  /*
   * The events are subgrids of the list: the marker column is as wide as the widest marker, so
   * the line runs straight through dots and badges alike.
   */
  .v-timeline[data-orientation='vertical'] > .v-timeline-list {
    grid-template-columns: [marker-start] auto [marker-end main-start] minmax(0, 1fr) [main-end];
    column-gap: var(--timeline-gutter);
  }

  /*
   * Across the page, the rows are shared instead: markers, dates, titles and contents line up
   * from one event to the next.
   */
  .v-timeline[data-orientation='horizontal'] > .v-timeline-list {
    grid-auto-flow: column;
    grid-auto-columns: minmax(var(--vectis-control-size-timeline-item-min), 1fr);
    grid-template-rows: repeat(4, auto);
    overflow-x: auto;
    border-radius: var(--vectis-radius-interactive);
  }

  .v-timeline-list:focus-visible {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: var(--vectis-focus-ring-offset);
  }

  /*
   * The thresholds are literals, a container query accepting no variables. The date column of
   * `split` takes what its longest date needs, up to a third of the width.
   */
  @container v-timeline (width > 30rem) {
    .v-timeline[data-layout='split'] > .v-timeline-list {
      grid-template-columns:
        [time-start] fit-content(33%) [time-end marker-start] auto [marker-end main-start]
        minmax(0, 1fr) [main-end];
    }
  }

  /* VTimelineItem repeats both thresholds: keep them in step. */
  @container v-timeline (width > 36rem) {
    .v-timeline[data-layout='alternate'] > .v-timeline-list {
      grid-template-columns:
        [time-start] minmax(0, 1fr) [time-end marker-start] auto [marker-end main-start]
        minmax(0, 1fr) [main-end];
    }
  }
}
</style>
