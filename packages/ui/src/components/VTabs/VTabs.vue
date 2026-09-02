<script setup lang="ts">
// @a11y @keyboard @core
/**
 * A row of tabs, and optionally the panels they show. Only one panel is visible at a
 * time, and the tabs follow the pattern assistive technology expects of them: the row
 * is a single stop in the tab order, and the arrow keys move between the tabs inside
 * it.
 *
 * No button is invented here. Every tab is a VButton and the scroll controls are
 * VIconButtons, so hovering, focusing, disabling and the respect of a reader's
 * reduced-motion setting all come from there, without a single state rule being
 * written again in this file.
 *
 * Nothing touches the DOM outside event handlers and effects that run after the page
 * has been updated, which is what lets the component render on a server.
 */

import { computed, nextTick, provide, ref, useId, useSlots, watch } from 'vue'

import VIcon from '../VIcon/VIcon.vue'
import { iconProps } from '../VIcon/iconProps'
import { chevron_left as chevronLeftIcon } from '../VIcon/icons/chevron_left'
import { chevron_right as chevronRightIcon } from '../VIcon/icons/chevron_right'
import { expand_less as expandLessIcon } from '../VIcon/icons/expand_less'
import { expand_more as expandMoreIcon } from '../VIcon/icons/expand_more'
import type { IconSource } from '../VIcon/types'
import VIconButton from '../VIconButton/VIconButton.vue'
import { panelIdFor, tabIdFor, tabsKey } from './context'

import { arrowNavigate, navigableItems } from '../../utils/arrowNav'
import { isRtl } from '../../utils/direction'

import { useRootAttrs } from '../../composables/useRootAttrs'
import { useAriaLabel } from '../../composables/useAriaLabel'
import { useMessages } from '../../i18n/state'

export type TabsVariant = 'flat' | 'outlined' | 'inset'
export type TabsTone = 'accent' | 'neutral' | 'danger'
export type TabsSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type TabsOrientation = 'horizontal' | 'vertical'
export type TabsAlign = 'start' | 'center' | 'end'
export type TabsActivation = 'manual' | 'automatic'

interface TabsProps {
  /**
   * How the bar is framed. `flat` draws nothing but a rule under the tabs, with the
   * selected one underlined; `outlined` puts that same bar and its panels inside a
   * card; `inset` turns the row into a segmented control sitting in a hollow track.
   */
  variant?: TabsVariant
  /** The colour the selected tab takes. The others stay neutral whatever this says. */
  tone?: TabsTone
  /** The height of the tabs, from the scale shared by every control. */
  size?: TabsSize
  /** Takes 4px off the height of every tab. */
  compact?: boolean
  /** Whether the tabs run across the page or down its side. */
  orientation?: TabsOrientation
  /** Where the tabs sit along the bar when they do not fill it. */
  align?: TabsAlign
  /** Makes the tabs share the whole bar between them, in equal parts. */
  grow?: boolean
  /**
   * Adds a button at each end of the bar to scroll it, each disabled once that end is
   * reached. It only makes sense when the tabs can overflow, so it excludes `grow`.
   */
  scrollButtons?: boolean
  /** The icon of the button scrolling backwards. It follows the orientation by default. */
  prevIcon?: IconSource
  /** The icon of the button scrolling forwards. It follows the orientation by default. */
  nextIcon?: IconSource
  /** What the backward scroll button does, in words. It falls back to the dictionary. */
  prevLabel?: string
  /** What the forward scroll button does, in words. It falls back to the dictionary. */
  nextLabel?: string
  /**
   * Whether moving to a tab also selects it. Selecting on arrival is what the ARIA
   * authoring practices recommend when a panel appears instantly; leave it manual when
   * showing a panel costs a request, or every tab passed over would fire one.
   */
  activation?: TabsActivation
  /**
   * What screen readers announce for the row of tabs. It falls back to the design
   * system dictionary.
   */
  label?: string
}

const props = withDefaults(defineProps<TabsProps>(), {
  variant: 'flat',
  tone: 'accent',
  size: 'md',
  compact: false,
  orientation: 'horizontal',
  align: 'start',
  grow: false,
  scrollButtons: false,
  prevIcon: undefined,
  nextIcon: undefined,
  prevLabel: undefined,
  nextLabel: undefined,
  activation: 'manual',
  label: undefined,
})

defineSlots<{
  /** The tabs themselves. */
  default(): unknown
  /**
   * The panels the tabs show. Leaving it out renders no panel area at all, which is
   * how the same component serves as a plain bar or a segmented control.
   */
  panels?(): unknown
}>()

/**
 * The `value` of the selected tab. There is deliberately no default: the component cannot
 * know which of the tabs a consumer wrote should open.
 *
 * CONTRACT — it must name a tab that exists and is not disabled. Pointing it anywhere else
 * leaves no tab with a tab stop, and the bar becomes unreachable from the keyboard.
 */
const model = defineModel<string | number>()

// The root element is only a container; the one that matters is the row of tabs. So
// `class` and `style` stay outside, where a consumer expects to place the component,
// and everything else — the id, the aria-* naming it, the data-* — goes down onto the
// row itself.
defineOptions({ inheritAttrs: false })
const { rootClass, rootStyle, forwardedAttrs: listAttrs } = useRootAttrs()
// The prop wins over the dictionary, and above both, a consumer's own aria-label or
// aria-labelledby still wins — that arbitration is what `useAriaLabel` is for.
const m = useMessages()
const ariaLabel = useAriaLabel(() => props.label ?? m.value.tabs.label)
const resolvedPrevLabel = computed(() => props.prevLabel ?? m.value.tabs.previous)
const resolvedNextLabel = computed(() => props.nextLabel ?? m.value.tabs.next)

const slots = useSlots()
const baseId = useId()

// Everything is exposed through getters rather than as values: that is what keeps the
// root's props reactive on the other side of the injection, so a tab re-renders when
// the size or the tone changes.
provide(tabsKey, {
  get value() {
    return model.value
  },
  select(value: string | number) {
    model.value = value
  },
  tabId: (value: string | number) => tabIdFor(baseId, value),
  panelId: (value: string | number) => panelIdFor(baseId, value),
  // @ssr
  /*
   * Whether a slot was given is decided by the parent as it renders, so the answer is
   * the same on the server and in the browser. A registry the panels filled in as they
   * mounted would instead read as empty on the server and full on the client, which is
   * a hydration mismatch.
   *
   * The trade-off is that this is not reactive: the panels slot must be there or not
   * there, and cannot appear halfway through the life of the component.
   */
  get hasPanels() {
    return slots.panels !== undefined
  },
  get variant() {
    return props.variant
  },
  get tone() {
    return props.tone
  },
  get size() {
    return props.size
  },
  get compact() {
    return props.compact
  },
  get activation() {
    return props.activation
  },
})

const isVertical = computed(() => props.orientation === 'vertical')
const resolvedPrevIcon = computed(
  () => props.prevIcon ?? (isVertical.value ? expandLessIcon : chevronLeftIcon),
)
const resolvedNextIcon = computed(
  () => props.nextIcon ?? (isVertical.value ? expandMoreIcon : chevronRightIcon),
)

const listEl = ref<HTMLElement | null>(null)

// @keyboard @a11y
/*
 * The arrow keys, through the shared implementation in `utils/arrowNav`. This handler
 * ONLY moves the focus. Selecting the tab that receives it — what `automatic`
 * activation means — is done by the tab itself, which knows its own typed value and
 * therefore never has to send it back through a DOM attribute.
 *
 * A tab the consumer has hidden is left out by the helper, which skips anything not
 * displayed.
 */
function onKeydown(event: KeyboardEvent) {
  const list = listEl.value
  if (!list) return
  arrowNavigate(event, list, navigableItems(list, '[role="tab"]:not(:disabled)'), {
    vertical: isVertical.value,
  })
}

/*
 * Whether each end of the bar has been reached, which is what disables the scroll buttons.
 *
 * READ THIS BEFORE PROPOSING `@container scroll-state` AGAIN. CSS can ask the question —
 * VDialog uses that query for its scroll shadows — and still cannot answer this one, for two
 * independent reasons. It is Chrome/Edge 133+, with neither Safari nor Firefox shipping it,
 * and where VDialog's hairlines merely stay invisible without it these buttons are
 * functional; an `@supports` guard would mean keeping everything below anyway. And CSS
 * cannot set `disabled` on a button: hiding or greying an arrow is a different affordance
 * and a different announcement, not the same behaviour written another way.
 *
 * So two hairline sentinels sit at the ends of the row and are observed. ONE observer then
 * covers all three things that change the answer — scrolling, a resize, tabs added or
 * removed — where measuring the scroll would need a second mechanism for the resize alone.
 *
 * Both start as reached, so the buttons are disabled on the first render and on the server,
 * never wrongly enabled. That also gives the "nothing overflows" case for free: both
 * sentinels are visible at once, so both buttons stay disabled with no test of their own.
 */
const startSentinelEl = ref<HTMLElement | null>(null)
const endSentinelEl = ref<HTMLElement | null>(null)
const atStart = ref(true)
const atEnd = ref(true)

watch(
  [listEl, startSentinelEl, endSentinelEl],
  ([root, start, end], _previous, onCleanup) => {
    // @fallback
    // The observer exists neither on the server nor in the unit-test environment, so
    // its absence has to be tolerated rather than assumed away. The behaviour of the
    // ends is checked in a real browser instead, by the play functions.
    if (!root || !start || !end || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target === start) atStart.value = entry.isIntersecting
          else atEnd.value = entry.isIntersecting
        }
      },
      { root },
    )
    observer.observe(start)
    observer.observe(end)
    onCleanup(() => observer.disconnect())
  },
  // `post` so the effect runs once the DOM is up to date: in the default timing the three
  // template refs are still null on the first pass, the guard above returns, and the
  // buttons stay disabled for good — the effect having tracked nothing to wake it again.
  { flush: 'post' },
)

/**
 * Scrolls the bar by most of its own length. No scrolling behaviour is requested,
 * deliberately: leaving it out lets the stylesheet decide, which is what makes the
 * movement respect a reader who has asked for less motion.
 */
function scrollStep(direction: -1 | 1) {
  const list = listEl.value
  if (!list) return
  // Called optionally because the unit-test environment implements no scrolling at
  // all; this behaviour is covered in a real browser.
  if (isVertical.value) {
    list.scrollBy?.({ top: direction * list.clientHeight * 0.8 })
    return
  }
  // The horizontal offset is physical, not logical: in a right-to-left page, moving
  // forward means moving left, so the direction has to be flipped by hand.
  const rtl = isRtl(list)
  list.scrollBy?.({ left: direction * list.clientWidth * 0.8 * (rtl ? -1 : 1) })
}

// @a11y @core
/*
 * Brings the selected tab back into view when the selection was changed from code.
 * The keyboard needs nothing here: it moves the focus, and the browser scrolls a
 * focused element into view by itself.
 *
 * The scrolling is confined to the row rather than asking the element to reveal
 * itself, which would scroll every scrollable ancestor up to the page. The distances
 * are read from the two boxes, so they are already physical: the same code serves
 * left-to-right, right-to-left and vertical without a single test of direction.
 */
watch(model, () => {
  nextTick(() => {
    const list = listEl.value
    const tab = list?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')
    if (!list || !tab) return
    const t = tab.getBoundingClientRect()
    const c = list.getBoundingClientRect()
    list.scrollBy?.({
      left: t.left < c.left ? t.left - c.left : t.right > c.right ? t.right - c.right : 0,
      top: t.top < c.top ? t.top - c.top : t.bottom > c.bottom ? t.bottom - c.bottom : 0,
    })
  })
})
</script>

<template>
  <div
    :class="['v-tabs', rootClass]"
    :style="rootStyle"
    :data-variant="variant"
    :data-orientation="orientation"
    :data-align="align"
    :data-grow="grow ? '' : undefined"
    :data-compact="compact ? '' : undefined"
  >
    <div class="v-tabs-bar">
      <VIconButton
        v-if="scrollButtons"
        class="v-tabs-scroll"
        :label="resolvedPrevLabel"
        tone="neutral"
        :size="size"
        :compact="compact"
        :disabled="atStart"
        @click="scrollStep(-1)"
      >
        <VIcon v-bind="iconProps(resolvedPrevIcon)" />
      </VIconButton>

      <div
        ref="listEl"
        v-bind="listAttrs"
        class="v-tabs-list"
        role="tablist"
        :aria-label="ariaLabel"
        :aria-orientation="isVertical ? 'vertical' : undefined"
        @keydown="onKeydown"
      >
        <!-- The two markers watched to know whether an end of the bar is reached.
             They are hidden from assistive technology: a row of tabs may contain
             nothing but tabs. -->
        <span
          v-if="scrollButtons"
          ref="startSentinelEl"
          class="v-tabs-sentinel"
          aria-hidden="true"
        />
        <slot />
        <span v-if="scrollButtons" ref="endSentinelEl" class="v-tabs-sentinel" aria-hidden="true" />
      </div>

      <VIconButton
        v-if="scrollButtons"
        class="v-tabs-scroll"
        :label="resolvedNextLabel"
        tone="neutral"
        :size="size"
        :compact="compact"
        :disabled="atEnd"
        @click="scrollStep(1)"
      >
        <VIcon v-bind="iconProps(resolvedNextIcon)" />
      </VIconButton>
    </div>

    <div v-if="$slots.panels" class="v-tabs-panels">
      <slot name="panels" />
    </div>
  </div>
</template>

<style>
@layer vectis.components {
  .v-tabs {
    /*
     * The panels' padding, and the four pixels the compact density takes off it. The
     * delta is held apart from the value rather than the two being written out, so the
     * density stays one subtraction wherever the padding is read instead of a second
     * table to keep in step — the VAccordion idiom.
     *
     * It follows the density and deliberately not the SIZE: the padding is a property of
     * the layout, and in any case the size variables live on the descendant buttons, each
     * tab declaring its own, so the root could not read them.
     */
    --tabs-pad-delta: 0px;
    --tabs-panels-pad: calc(var(--vectis-space-4) - var(--tabs-pad-delta));

    display: flex;
    flex-direction: column;
    font-family: var(--vectis-text-family);
  }

  .v-tabs[data-compact] {
    --tabs-pad-delta: var(--vectis-space-1);
  }

  /* Turned vertical, the bar and the panels sit side by side rather than stacked. */
  .v-tabs[data-orientation='vertical'] {
    flex-direction: row;
  }

  /*
   * The card, taken from the decoration scale shared with VAccordion and VDataTable.
   * The flat default has nothing to undo, since it declares no decoration at all.
   *
   * The frame goes on the ROOT, so it encloses the bar AND the panels, and the rule
   * under the tabs then becomes the boundary between the two inside it.
   *
   * The bar spends NO gutter: the tabs sit against the card's border and the track runs
   * from edge to edge, so the whole of the padding is the panels'. That is also what
   * lands an end tab exactly on a corner of the card, where its outer radius has to be
   * the frame's INNER one — VTab.vue derives it, and the two cannot move apart without
   * the corner showing on hover.
   *
   * Unlike VDataTable, nothing is clipped here: clipping would cut the panel's focus
   * ring, the only one that leaves the component, and forbid a consumer any content
   * running edge to edge. The bar with no panels under it is the single exception, and
   * it is handled where that case is.
   */
  .v-tabs[data-variant='outlined'] {
    background: var(--vectis-color-surface-raised);
    border: 1px solid var(--vectis-color-border);
    border-radius: var(--vectis-radius-surface);
  }

  .v-tabs-bar {
    display: flex;
    /* Stretched rather than centred: the row deliberately overlaps the track by one
       pixel through a negative margin, and centring would displace it by half of
       that. */
    align-items: stretch;
    /*
     * The alignment belongs to the BAR and not to the row of tabs. The row is allowed
     * to shrink below its content as soon as the tabs overflow, so there would be
     * nothing left to distribute; and setting an alignment on a scrolling container
     * makes whatever overflows past its start edge permanently unreachable, since a
     * scroll position cannot go negative.
     */
    justify-content: flex-start;
    gap: var(--vectis-space-1);
  }

  .v-tabs[data-orientation='vertical'] .v-tabs-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .v-tabs[data-align='center'] .v-tabs-bar {
    justify-content: center;
  }

  .v-tabs[data-align='end'] .v-tabs-bar {
    justify-content: flex-end;
  }

  /* The rule the tabs sit on, in the flat and outlined frames. It is drawn on the BAR
     rather than on the row, so that it also runs under the scroll buttons, which are
     siblings of the row and not part of it. Inside a card it is what separates the
     tabs from the panels — which is why that edge is left without a gutter, since
     otherwise the rule would separate nothing from nothing.

     Both frames are named explicitly rather than excluding the third: a fourth frame
     will have to opt in by hand instead of inheriting this silently. */
  .v-tabs:is([data-variant='flat'], [data-variant='outlined']) .v-tabs-bar {
    border-block-end: 1px solid var(--vectis-color-border);
  }

  .v-tabs:is([data-variant='flat'], [data-variant='outlined'])[data-orientation='vertical']
    .v-tabs-bar {
    border-block-end: none;
    border-inline-start: 1px solid var(--vectis-color-border);
  }

  /*
   * Framed AND vertical, the rule MIGRATES to the other edge. Flat, it marks the edge
   * of the tab column, hence the start; inside a card that edge is already drawn by
   * the frame's own border — two parallel lines a pixel apart — and what is missing is
   * the boundary between the tabs and the panels.
   *
   * TRAP — this block has exactly the same specificity as the one above, so it is the
   * ORDER that decides. Moving it up would leave the vertical framed case with two
   * rules on one side and none between the two areas.
   */
  .v-tabs[data-variant='outlined'][data-orientation='vertical'] .v-tabs-bar {
    border-inline-start: none;
    border-inline-end: 1px solid var(--vectis-color-border);
  }

  .v-tabs-list {
    display: flex;
    align-items: center;
    gap: var(--vectis-space-1);
    overflow: auto;
    /* Without these the row refuses to shrink below the width of its tabs, and it
       would widen the whole bar instead of scrolling. */
    min-inline-size: 0;
    min-block-size: 0;
    scrollbar-width: none;
    scroll-behavior: smooth;
  }

  .v-tabs[data-orientation='vertical'] .v-tabs-list {
    flex-direction: column;
    align-items: stretch;
  }

  /* Pulling the row one pixel into the track is what lets the selected tab's indicator
     COVER that line rather than sit on top of it, which would read as a thicker rule.
   */
  .v-tabs:is([data-variant='flat'], [data-variant='outlined']) .v-tabs-list {
    margin-block-end: -1px;
    /* On a track the tabs are contiguous segments and not a queue of buttons: no gap
       here, and no rounded corners on the tabs themselves. */
    gap: 0;
  }

  /* The row is now a pixel taller than the tabs it holds, so they are pushed against
     its end edge; the indicator each tab draws there then falls exactly on the
     track. */
  .v-tabs:is([data-variant='flat'], [data-variant='outlined'])[data-orientation='horizontal']
    .v-tabs-list {
    align-items: flex-end;
  }

  .v-tabs:is([data-variant='flat'], [data-variant='outlined'])[data-orientation='vertical']
    .v-tabs-list {
    margin-block-end: 0;
    margin-inline-start: -1px;
  }

  /* Framed AND vertical, there is no longer a track on that edge to cover, since the
     rule has migrated to the other side: the one-pixel overlap would simply slide the
     row under the frame's own border.

     TRAP — same specificity as the rule above, so again it is the order that decides. */
  .v-tabs[data-variant='outlined'][data-orientation='vertical'] .v-tabs-list {
    margin-inline-start: 0;
  }

  /*
   * A framed bar with no panels: the card is reduced to the tabs alone. There is no
   * longer a boundary to mark, and the track would run right alongside the frame's own
   * border, doubling it. So the frame takes its place and the row stops overlapping.
   *
   * This is the one place the card may clip, and the one place it must. The tabs fill
   * it on all four sides here, so a hovered end tab reaches the two corners no radius
   * of its own covers — the ends round the edge the track used to occupy, and that one
   * only. Nothing is lost to the clip: there is no panel, hence no outer focus ring,
   * and a tab draws its own ring inwards.
   */
  .v-tabs[data-variant='outlined']:not(:has(> .v-tabs-panels)) {
    overflow: clip;
  }

  .v-tabs[data-variant='outlined']:not(:has(> .v-tabs-panels)) .v-tabs-bar {
    border-block-end: none;
    border-inline-end: none;
  }

  .v-tabs[data-variant='outlined']:not(:has(> .v-tabs-panels)) .v-tabs-list {
    margin-block-end: 0;
  }

  /* The hollow track of the segmented variant is drawn on the scrolling row itself,
     and not on the bar around it: its padding is what keeps the raised tab's shadow
     from being clipped as the row scrolls. */
  .v-tabs[data-variant='inset'] .v-tabs-list {
    background: var(--vectis-color-surface-sunken);
    padding: var(--vectis-space-1);
    border-radius: var(--vectis-radius-surface);
  }

  .v-tabs[data-grow] .v-tabs-list {
    flex: 1;
  }

  .v-tabs-sentinel {
    flex: 0 0 1px;
    align-self: stretch;
  }

  .v-tabs-scroll {
    flex: none;
    /* The bar stretches its children for the track's sake, so the scroll buttons have
       to re-centre themselves on the row — which in the segmented variant is taller
       than they are. */
    align-self: center;
  }

  /* A chevron points at a physical direction, which the logical properties do not
     mirror: in a right-to-left page it has to be flipped by hand. */
  [dir='rtl'] .v-tabs[data-orientation='horizontal'] .v-tabs-scroll .v-icon {
    scale: -1 1;
  }

  .v-tabs-panels {
    min-inline-size: 0;
  }

  /*
   * Flat and segmented, the panels sit in no card, so they take no gutter: their content
   * has to stay aligned with whatever the page puts above and below the component, which
   * an indent would break. What they do owe is the separation from the bar, the boundary
   * between two parts of the same component rather than the parent layout's business —
   * which the framed variant folds into the gutter it gives its panels on all four sides.
   *
   * The axis follows the ORIENTATION and not the writing mode, so it cannot be a single
   * logical declaration: the bar is above the panels when horizontal and beside them when
   * vertical.
   *
   * Both variants are named explicitly rather than excluding the framed one, as in the
   * track rules above: a fourth frame opts in by hand.
   */
  .v-tabs:is([data-variant='flat'], [data-variant='inset'])[data-orientation='horizontal']
    .v-tabs-panels {
    padding-block-start: var(--tabs-panels-pad);
  }

  .v-tabs:is([data-variant='flat'], [data-variant='inset'])[data-orientation='vertical']
    .v-tabs-panels {
    padding-inline-start: var(--tabs-panels-pad);
  }

  /* Inside a card the gutter is the panels' alone, on all four sides: the bar spends
     none, so the tabs and their track reach the frame and the content is the only thing
     set back from it. */
  .v-tabs[data-variant='outlined'] .v-tabs-panels {
    padding: var(--tabs-panels-pad);
  }

  .v-tabs[data-orientation='vertical'] .v-tabs-panels {
    flex: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    .v-tabs-list {
      scroll-behavior: auto;
    }
  }
}
</style>
