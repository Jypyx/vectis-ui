<script setup lang="ts">
// @a11y @keyboard @core
/**
 * Implement ARIA tab selection and roving focus over native buttons. Overflow measurements
 * control scrolling arrows because CSS cannot expose overflow state.
 */

import { computed, onMounted, provide, ref, useId, useSlots, watch } from 'vue'

import VIcon from '../VIcon/VIcon.vue'
import { iconProps } from '../VIcon/iconProps'
import { chevron_left as chevronLeftIcon } from '../VIcon/icons/chevron_left'
import { chevron_right as chevronRightIcon } from '../VIcon/icons/chevron_right'
import { expand_less as expandLessIcon } from '../VIcon/icons/expand_less'
import { expand_more as expandMoreIcon } from '../VIcon/icons/expand_more'
import type { IconSource } from '../VIcon/types'
import VIconButton from '../VIconButton/VIconButton.vue'
import { panelIdFor, tabIdFor, tabsKey } from './context'

import type { ItemValue } from '../../types'
import { arrowNavigate, navigableItems } from '../../utils/arrowNav'
import { isRtl } from '../../utils/direction'

import { useRootAttrs } from '../../composables/useRootAttrs'
import { useAriaLabel } from '../../composables/useAriaLabel'
import { useMessages } from '../../i18n/state'

/** How the bar is drawn: a rule under the tabs, the same inside a card, or a sunken track. */
export type TabsVariant = 'flat' | 'outlined' | 'inset'
/** The colour of the selected tab. */
export type TabsTone = 'accent' | 'neutral' | 'danger'
/** The height of the tabs, from the scale every control shares. */
export type TabsSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
/** Whether the tabs run across the page or down its side. */
export type TabsOrientation = 'horizontal' | 'vertical'
/** Where the tabs sit along the bar when they do not fill it. */
export type TabsAlign = 'start' | 'center' | 'end'
/** Whether a tab is selected when it takes the focus, or only when it is activated. */
export type TabsActivation = 'manual' | 'automatic'

interface TabsProps {
  /** How the bar is framed. */
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
  /**
   * Stretches the tabs across the whole bar, every tab taking an equal share of it, on the
   * terms of VButtonGroup's own `fullWidth`.
   */
  fullWidth?: boolean
  /**
   * Adds a button at each end of the bar to scroll it, each disabled once that end is
   * reached. It only makes sense when the tabs can overflow, so it excludes `fullWidth`.
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
  /** Whether moving to a tab also selects it. */
  activation?: TabsActivation
  /**
   * Makes every tab unusable, and the scroll buttons with them: the tabs leave the tab order
   * and grey out through the colour tokens.
   */
  disabled?: boolean
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
  fullWidth: false,
  scrollButtons: false,
  prevIcon: undefined,
  nextIcon: undefined,
  prevLabel: undefined,
  nextLabel: undefined,
  activation: 'manual',
  disabled: false,
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
 * The `value` of the selected tab. There is deliberately no default: the component cannot know
 * which of the tabs a consumer wrote should open.
 */
const model = defineModel<ItemValue>()

// The root element is only a container; the one that matters is the row of tabs. So `class` and
// `style` stay outside, where a consumer expects to place the component, and everything else;
// the id, the aria-* naming it, the data-*; goes down onto the row itself.
defineOptions({ inheritAttrs: false })
const { rootClass, rootStyle, forwardedAttrs: listAttrs } = useRootAttrs()
// The prop wins over the dictionary, and above both, a consumer's own aria-label or
// aria-labelledby still wins; that arbitration is what `useAriaLabel` is for.
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
  select(value: ItemValue) {
    model.value = value
  },
  tabId: (value: ItemValue) => tabIdFor(baseId, value),
  panelId: (value: ItemValue) => panelIdFor(baseId, value),
  // @ssr
  /*
   * A registry the panels filled in as they mounted would instead read as empty on the server
   * and full on the client, which is a hydration mismatch. The trade-off is that this is not
   * reactive: the panels slot must be there or not there, and cannot appear halfway through the
   * life of the component.
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
  get disabled() {
    return props.disabled
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
 * This handler only moves the focus. Selecting the tab that receives it; what `automatic`
 * activation means; is done by the tab itself, which knows its own typed value and therefore
 * never has to send it back through a DOM attribute.
 */
function onKeydown(event: KeyboardEvent) {
  const list = listEl.value
  if (!list) return
  arrowNavigate(event, list, () => navigableItems(list, '[role="tab"]:not(:disabled)'), {
    vertical: isVertical.value,
  })
}

/*
 * CSS can ask the question; VDialog uses that query for its scroll shadows; and still cannot
 * answer this one, for two independent reasons. It is Chrome/Edge 133+, with neither Safari nor
 * Firefox shipping it, and where VDialog's hairlines merely stay invisible without it these
 * buttons are functional; an `@supports` guard would mean keeping everything below anyway.
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
  // template refs are still null on the first pass, the guard above returns, and the buttons
  // stay disabled for good; the effect having tracked nothing to wake it again.
  { flush: 'post' },
)

// @a11y
/*
 * The default `pre` timing is the point: the button still holds the focus when this runs, the
 * DOM not being patched with `disabled` yet. In `post` timing the focus would already be on
 * <body>, with nothing left to say which control lost it.
 */
watch([atStart, atEnd], ([start, end]) => {
  const list = listEl.value
  const prev = list?.previousElementSibling as HTMLElement | null
  const next = list?.nextElementSibling as HTMLElement | null
  const focused = document.activeElement
  const fromPrev = focused === prev
  if (!(fromPrev ? start : focused === next && end)) return
  if (fromPrev ? end : start) focusSelected()
  else (fromPrev ? next : prev)?.focus()
})

/** Scrolls the bar by most of its own length. */
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
 * The keyboard needs nothing here: it moves the focus, and the browser scrolls a focused
 * element into view by itself. The scrolling is confined to the row rather than asking the
 * element to reveal itself, which would scroll every scrollable ancestor up to the page.
 */
function revealSelected(behavior?: ScrollBehavior) {
  const list = listEl.value
  const tab = list?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')
  if (!list || !tab) return
  const t = tab.getBoundingClientRect()
  const c = list.getBoundingClientRect()
  list.scrollBy?.({
    left: t.left < c.left ? t.left - c.left : t.right > c.right ? t.right - c.right : 0,
    top: t.top < c.top ? t.top - c.top : t.bottom > c.bottom ? t.bottom - c.bottom : 0,
    behavior,
  })
}

// `post`, so the tab that is now selected already carries `aria-selected` when it is looked
// for: in the default timing the query would find the one that was selected before.
watch(model, () => revealSelected(), { flush: 'post' })
onMounted(() => revealSelected('instant'))

// `focus` goes where the Tab key would land: the selected tab, which holds the row's single tab
// stop.
function focusSelected(options?: FocusOptions) {
  const list = listEl.value
  const tab =
    list?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]:not(:disabled)') ??
    list?.querySelector<HTMLElement>('[role="tab"]:not(:disabled)')
  tab?.focus(options)
}

defineExpose({
  /**
   * Moves the focus to the selected tab, or to the first tab that can take it when the
   * v-model names none.
   */
  focus: focusSelected,
  /** The `role="tablist"` row, which is also where the consumer's attributes land. */
  el: listEl,
})
</script>

<template>
  <div
    :class="['v-tabs', rootClass]"
    :style="rootStyle"
    :data-variant="variant"
    :data-orientation="orientation"
    :data-align="align"
    :data-full-width="fullWidth ? '' : undefined"
    :data-compact="compact ? '' : undefined"
  >
    <div class="v-tabs-bar">
      <VIconButton
        v-if="scrollButtons"
        class="v-tabs-scroll"
        :label="resolvedPrevLabel"
        :size="size"
        :compact="compact"
        :disabled="disabled || atStart"
        @click="scrollStep(-1)"
      >
        <VIcon v-bind="iconProps(resolvedPrevIcon)" :mirrored="!isVertical" />
      </VIconButton>

      <div
        ref="listEl"
        :aria-orientation="isVertical ? 'vertical' : undefined"
        v-bind="listAttrs"
        class="v-tabs-list"
        role="tablist"
        :aria-label="ariaLabel"
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
        :size="size"
        :compact="compact"
        :disabled="disabled || atEnd"
        @click="scrollStep(1)"
      >
        <VIcon v-bind="iconProps(resolvedNextIcon)" :mirrored="!isVertical" />
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
     * The panels' padding, and the four pixels the compact density takes off it. The delta is
     * held apart from the value rather than the two being written out, so the density stays one
     * subtraction wherever the padding is read instead of a second table to keep in step; the
     * VAccordion idiom.
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

  .v-tabs[data-orientation='vertical'] {
    flex-direction: row;
  }

  /*
   * Keep card inner-radius calculations aligned with the tab corners; avoid clipping panel
   * focus rings and edge-to-edge consumer content.
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
     * The row is allowed to shrink below its content as soon as the tabs overflow, so there
     * would be nothing left to distribute; and setting an alignment on a scrolling container
     * makes whatever overflows past its start edge permanently unreachable, since a scroll
     * position cannot go negative.
     */
    justify-content: flex-start;
    gap: var(--vectis-space-1);
  }

  .v-tabs[data-orientation='vertical'] > .v-tabs-bar {
    flex-direction: column;
  }

  .v-tabs[data-align='center'] > .v-tabs-bar {
    justify-content: center;
  }

  .v-tabs[data-align='end'] > .v-tabs-bar {
    justify-content: flex-end;
  }

  /*
   * Inside a card it is what separates the tabs from the panels; which is why that edge is left
   * without a gutter, since otherwise the rule would separate nothing from nothing. Both frames
   * are named explicitly rather than excluding the third: a fourth frame will have to opt in by
   * hand instead of inheriting this silently.
   */
  .v-tabs:is([data-variant='flat'], [data-variant='outlined']) > .v-tabs-bar {
    border-block-end: 1px solid var(--vectis-color-border);
  }

  .v-tabs:is([data-variant='flat'], [data-variant='outlined'])[data-orientation='vertical']
    > .v-tabs-bar {
    border-block-end: none;
    border-inline-start: 1px solid var(--vectis-color-border);
  }

  /*
   * This block has exactly the same specificity as the one above, so it is the ORDER that
   * decides. Moving it up would leave the vertical framed case with two rules on one side and
   * none between the two areas.
   */
  .v-tabs[data-variant='outlined'][data-orientation='vertical'] > .v-tabs-bar {
    border-inline-start: none;
    border-inline-end: 1px solid var(--vectis-color-border);
  }

  .v-tabs-list {
    display: flex;
    align-items: center;
    /* Held in a variable because the sentinels cancel it beside themselves. */
    --tabs-list-gap: var(--vectis-space-1);
    gap: var(--tabs-list-gap);
    overflow: auto;
    /* Without these the row refuses to shrink below the width of its tabs, and it
       would widen the whole bar instead of scrolling. */
    min-inline-size: 0;
    min-block-size: 0;
    scrollbar-width: none;
    scroll-behavior: smooth;
  }

  .v-tabs[data-orientation='vertical'] > .v-tabs-bar > .v-tabs-list {
    flex-direction: column;
    align-items: stretch;
  }

  /* Pulling the row one pixel into the track is what lets the selected tab's indicator
     COVER that line rather than sit on top of it, which would read as a thicker rule.
   */
  .v-tabs:is([data-variant='flat'], [data-variant='outlined']) > .v-tabs-bar > .v-tabs-list {
    margin-block-end: -1px;
  }

  /* The row is now a pixel taller than the tabs it holds, so they are pushed against
     its end edge; the indicator each tab draws there then falls exactly on the
     track. */
  .v-tabs:is([data-variant='flat'], [data-variant='outlined'])[data-orientation='horizontal']
    > .v-tabs-bar
    > .v-tabs-list {
    align-items: flex-end;
  }

  .v-tabs:is([data-variant='flat'], [data-variant='outlined'])[data-orientation='vertical']
    > .v-tabs-bar
    > .v-tabs-list {
    margin-block-end: 0;
    margin-inline-start: -1px;
  }

  /* Same specificity as the rule above, so again it is the order that decides. */
  .v-tabs[data-variant='outlined'][data-orientation='vertical'] > .v-tabs-bar > .v-tabs-list {
    margin-inline-start: 0;
  }

  /*
   * This is the one place the card may clip, and the one place it must. Nothing is lost to the
   * clip: there is no panel, hence no outer focus ring, and a tab draws its own ring inwards.
   */
  .v-tabs[data-variant='outlined']:not(:has(> .v-tabs-panels)) {
    overflow: clip;
  }

  .v-tabs[data-variant='outlined']:not(:has(> .v-tabs-panels)) > .v-tabs-bar {
    border-block-end: none;
    border-inline-end: none;
  }

  .v-tabs[data-variant='outlined']:not(:has(> .v-tabs-panels)) > .v-tabs-bar > .v-tabs-list {
    margin-block-end: 0;
  }

  /* The hollow track of the segmented variant is drawn on the scrolling row itself,
     and not on the bar around it: its padding is what keeps the raised tab's shadow
     from being clipped as the row scrolls. */
  .v-tabs[data-variant='inset'] > .v-tabs-bar > .v-tabs-list {
    background: var(--vectis-color-surface-sunken);
    padding: var(--vectis-space-1);
    border-radius: var(--vectis-radius-surface);
  }

  .v-tabs[data-full-width] > .v-tabs-bar > .v-tabs-list {
    flex: 1;
  }

  /*
   * A pixel square each, at the very ends of the row. They are items of the row, so its gap
   * opens beside them as it does between two tabs: each pulls its neighbour back over that gap
   * and over its own pixel, so the first and last tabs sit exactly where the row's padding puts
   * them.
   */
  .v-tabs-sentinel {
    flex: 0 0 1px;
    align-self: flex-start;
    inline-size: 1px;
    block-size: 1px;
  }

  .v-tabs-sentinel:first-child {
    margin-inline-end: calc(-1px - var(--tabs-list-gap));
    margin-block-end: calc(-1px - var(--tabs-list-gap));
  }

  .v-tabs-sentinel:last-child {
    margin-inline-start: calc(-1px - var(--tabs-list-gap));
    margin-block-start: calc(-1px - var(--tabs-list-gap));
  }

  .v-tabs-scroll {
    flex: none;
    /*
     * The bar stretches its children for the track's sake, so the scroll buttons have to
     * re-centre themselves on the row; which in the segmented variant is taller than they are.
     */
    align-self: center;
  }

  .v-tabs-panels {
    min-inline-size: 0;
  }

  /*
   * The axis follows the ORIENTATION and not the writing mode, so it cannot be a single logical
   * declaration: the bar is above the panels when horizontal and beside them when vertical.
   * Both variants are named explicitly rather than excluding the framed one, as in the track
   * rules above: a fourth frame opts in by hand.
   */
  .v-tabs:is([data-variant='flat'], [data-variant='inset'])[data-orientation='horizontal']
    > .v-tabs-panels {
    padding-block-start: var(--tabs-panels-pad);
  }

  .v-tabs:is([data-variant='flat'], [data-variant='inset'])[data-orientation='vertical']
    > .v-tabs-panels {
    padding-inline-start: var(--tabs-panels-pad);
  }

  /* Inside a card the gutter is the panels' alone, on all four sides: the bar spends
     none, so the tabs and their track reach the frame and the content is the only thing
     set back from it. */
  .v-tabs[data-variant='outlined'] > .v-tabs-panels {
    padding: var(--tabs-panels-pad);
  }

  .v-tabs[data-orientation='vertical'] > .v-tabs-panels {
    flex: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    .v-tabs-list {
      scroll-behavior: auto;
    }
  }
}
</style>
