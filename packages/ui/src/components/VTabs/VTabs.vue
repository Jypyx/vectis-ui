<script setup lang="ts">
import { computed, nextTick, provide, ref, useId, useSlots, watch } from 'vue'

import VIcon from '../VIcon/VIcon.vue'
import { iconProps } from '../VIcon/iconProps'
import type { IconSource } from '../VIcon/types'
import VIconButton from '../VIconButton/VIconButton.vue'
import { panelIdFor, tabIdFor, tabsKey } from './context'

import { arrowNavigate, navigableItems } from '../../utils/arrowNav'

import { useRootAttrs } from '../../composables/useRootAttrs'
import { useAriaLabel } from '../../composables/useAriaLabel'
import { useMessages } from '../../i18n/state'

export type TabsVariant = 'flat' | 'outlined' | 'inset'
export type TabsTone = 'accent' | 'neutral' | 'danger' | 'success' | 'warning'
export type TabsSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type TabsOrientation = 'horizontal' | 'vertical'
export type TabsAlign = 'start' | 'center' | 'end'
export type TabsActivation = 'manual' | 'automatic'

/**
 * Tab bar (the ARIA tabs pattern) and, optionally, its panels.
 *
 * The component invents no button: every tab is a `VButton` (ghost, or elevated
 * when active in the `inset` variant), and the scroll controls are `VIconButton`.
 * Hover, focus, disabling and `prefers-reduced-motion` therefore come from
 * `VButton`, with no state rule redefined here.
 *
 * SSR-safe: no DOM access outside handlers and `watch({ flush: 'post' })`.
 */
interface TabsProps {
  /**
   * `flat`: underlined ghost tabs, no decoration. `outlined`: `flat` inside a card
   * (bar AND panels). `inset`: a segmented control in a hollow track.
   */
  variant?: TabsVariant
  /** Colours the active tab; the inactive ones stay neutral. */
  tone?: TabsTone
  size?: TabsSize
  /** Height reduced by 4px (propagated to every button). */
  compact?: boolean
  orientation?: TabsOrientation
  /** Left/centre/right when horizontal, top/middle/bottom when vertical. */
  align?: TabsAlign
  /** The tabs share the whole available width (or height). */
  grow?: boolean
  /** Shows two scroll buttons, disabled at the ends. */
  scrollButtons?: boolean
  /** Icon of the upstream scroll button. Default depends on the orientation. */
  prevIcon?: IconSource
  /** Icon of the downstream scroll button. Default depends on the orientation. */
  nextIcon?: IconSource
  /** Accessible label of the upstream scroll button. Default: the DS dictionary. */
  prevLabel?: string
  /** Accessible label of the downstream scroll button. Default: the DS dictionary. */
  nextLabel?: string
  /** `automatic`: selection follows focus (the APG recommendation for instant panels). */
  activation?: TabsActivation
  /** Accessible name of the tab list. Default: the DS dictionary. */
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
  /** The <VTab> elements */
  default(): unknown
  /** The <VTabPanel> elements; when absent, no panel container is rendered. */
  panels?(): unknown
}>()

const model = defineModel<string | number>()

// Wrapper-root pattern: the root is only a container, and the functional element
// is the list. class/style stay on the root, everything else (aria-labelledby, id,
// data-*) goes down onto the [role="tablist"].
defineOptions({ inheritAttrs: false })
const { rootClass, rootStyle, forwardedAttrs: listAttrs } = useRootAttrs()
// Cascade prop > dictionary; for the tablist's name, `useAriaLabel` still places
// the consumer's `aria-labelledby` and `aria-label` above it.
const m = useMessages()
const ariaLabel = useAriaLabel(() => props.label ?? m.value.tabs.label)
const resolvedPrevLabel = computed(() => props.prevLabel ?? m.value.tabs.previous)
const resolvedNextLabel = computed(() => props.nextLabel ?? m.value.tabs.next)

const slots = useSlots()
const baseId = useId()

// Getters: the root's props stay reactive across the injection.
provide(tabsKey, {
  get value() {
    return model.value
  },
  select(value: string | number) {
    model.value = value
  },
  tabId: (value: string | number) => tabIdFor(baseId, value),
  panelId: (value: string | number) => panelIdFor(baseId, value),
  /*
   * A slot's presence is decided by the parent's vnode: identical on the server
   * and client renders, so there is no hydration mismatch — where a registry fed
   * by the panels' mounting would produce one. The trade-off is that `slots` is
   * not reactive: the #panels slot must be statically present or absent.
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
  () => props.prevIcon ?? (isVertical.value ? 'expand_less' : 'chevron_left'),
)
const resolvedNextIcon = computed(
  () => props.nextIcon ?? (isVertical.value ? 'expand_more' : 'chevron_right'),
)

const listEl = ref<HTMLElement | null>(null)

/*
 * Keyboard navigation (shared implementation: `utils/arrowNav`). The handler ONLY
 * moves focus: selection on focus (`automatic` mode) is set by VTab, which knows
 * its typed value and therefore does not have to route it through a DOM attribute.
 * A tab hidden by the consumer is excluded by the helper's `display` filter.
 */
function onKeydown(event: KeyboardEvent) {
  const list = listEl.value
  if (!list) return
  arrowNavigate(event, list, navigableItems(list, '[role="tab"]:not(:disabled)'), {
    vertical: isVertical.value,
  })
}

/*
 * Ends of the scroll buttons — no CSS primitive can DISABLE a button based on the
 * scroll position (`::scroll-button()` will do it natively, but only from Chrome
 * 135+, and its icon would go through `content`, hence through a font loaded by
 * the consumer).
 *
 * Two 1px sentinels observed inside the list cover scrolling, container resizing
 * and the addition or removal of tabs with a single observer — where a
 * ResizeObserver would impose a second mechanism for the same signal. Defaults to
 * `true`: buttons disabled on the first render and in SSR, never a wrong state.
 * Nothing overflows ⇒ both sentinels are visible ⇒ both buttons disabled, with no
 * separate test.
 */
const startSentinelEl = ref<HTMLElement | null>(null)
const endSentinelEl = ref<HTMLElement | null>(null)
const atStart = ref(true)
const atEnd = ref(true)

watch(
  [listEl, startSentinelEl, endSentinelEl],
  ([root, start, end], _previous, onCleanup) => {
    // IntersectionObserver exists neither in SSR nor in jsdom: the ends are
    // verified in the browser (play functions).
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
  { flush: 'post' },
)

/** `behavior` omitted: scrolling follows `scroll-behavior`, hence reduced-motion. */
function scrollStep(direction: -1 | 1) {
  const list = listEl.value
  if (!list) return
  // optional call: jsdom does not implement scrolling
  if (isVertical.value) {
    list.scrollBy?.({ top: direction * list.clientHeight * 0.8 })
    return
  }
  // `left` is physical: in RTL, "next" goes to the left.
  const rtl = getComputedStyle(list).direction === 'rtl'
  list.scrollBy?.({ left: direction * list.clientWidth * 0.8 * (rtl ? -1 : 1) })
}

/*
 * Scrolls the active tab back into view after a programmatic v-model change
 * (keyboard navigation calls `focus()` instead: the browser scrolls on its own).
 * The scrolling is bounded to the list. The deltas come from the rects, hence
 * physical: valid in LTR, RTL and vertical with no direction test.
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
        <!-- end sentinels: outside the accessibility tree, since a `tablist` owns
             nothing but `tab` children -->
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
     * Frame gutter: zero when flat (bar and panels flush with the host container),
     * set by `outlined` — VDataTable's `--table-frame-pad` idiom. Fixed, NOT indexed
     * on `data-size`/`compact`: it is a card measurement
     * de carte, et les `--control-*` vivent sur les VButton descendants (chaque
     * (VTab sets its own `v-control`), hence out of the root's reach.
     */
    --tabs-frame-pad: 0px;

    display: flex;
    flex-direction: column;
    font-family: var(--vectis-text-family);
  }

  /* Vertical: the bar and the panels sit side by side */
  .v-tabs[data-orientation='vertical'] {
    flex-direction: row;
  }

  /*
   * Bordered card — the decoration scale shared with VAccordion and VDataTable;
   * `flat` (the default) has nothing to cancel. The frame is on the ROOT, hence around
   * de la barre ET des panneaux : la piste de la barre devient le filet de
   * separator between the two, inside the frame.
   *
   * No `overflow: clip`, unlike VDataTable whose table is edge-to-edge by
   * construction: here the gutter always leaves a band at least equal to the inner
   * radius (no box reaches a corner, so no nested `calc()` radius is needed), the
   * list already crops its own overflow, and clipping would crop the VTabPanel's
   * OUTER focus ring — the only one leaving the component — as well as forbidding
   * the consumer any edge-to-edge panel content.
   */
  .v-tabs[data-variant='outlined'] {
    --tabs-frame-pad: var(--vectis-space-3);

    background: var(--vectis-color-surface-raised);
    border: 1px solid var(--vectis-color-border);
    border-radius: var(--vectis-radius-surface);
  }

  .v-tabs-bar {
    display: flex;
    /* stretch, not center: the list overflows 1px into the track through a negative
       margin, and centring would offset it by half a pixel */
    align-items: stretch;
    /*
     * The alignment lives on the BAR, not on the list: the latter shrinks
     * (min-size: 0) as soon as the tabs overflow, leaving no room to distribute. A
     * `justify-content` set on a scrolling container would instead make the part
     * overflowing past the start edge permanently unreachable — `scrollLeft` cannot
     * be negative in LTR.
     */
    justify-content: flex-start;
    gap: var(--vectis-space-1);
    /* Frame gutter (0 when flat). Nothing on the END edge: that is the one the
       track occupies, and the tabs must stay sitting on it. */
    padding-block-start: var(--tabs-frame-pad);
    padding-inline: var(--tabs-frame-pad);
  }

  .v-tabs[data-orientation='vertical'] .v-tabs-bar {
    flex-direction: column;
    align-items: stretch;
    /* the track's axis switches: the inline END edge is the one left flush */
    padding-block: var(--tabs-frame-pad);
    padding-inline-end: 0;
  }

  .v-tabs[data-align='center'] .v-tabs-bar {
    justify-content: center;
  }

  .v-tabs[data-align='end'] .v-tabs-bar {
    justify-content: flex-end;
  }

  /* Piste des variantes `flat` et `outlined` : sur la barre, pour courir aussi
     under the scroll buttons (siblings of the list). When framed, it is what
     separates the bar from the panels — hence the end edge left without a gutter,
     since otherwise it would separate nothing. */
  .v-tabs:is([data-variant='flat'], [data-variant='outlined']) .v-tabs-bar {
    border-block-end: 1px solid var(--vectis-color-border);
  }

  .v-tabs:is([data-variant='flat'], [data-variant='outlined'])[data-orientation='vertical']
    .v-tabs-bar {
    border-block-end: none;
    border-inline-start: 1px solid var(--vectis-color-border);
  }

  /*
   * Framed and vertical: the track MIGRATES to the end edge. When flat it delimits
   * the tab column, hence the start edge; inside a card that edge is already held by
   * the frame's border (two parallel rules otherwise) and what is missing is the
   * bar/panels boundary. Specificity EQUAL to the rule above
   * (0,4,0) : l'ordre tranche, ne pas remonter ce bloc.
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
    /* la liste doit pouvoir passer sous sa taille de contenu, sinon elle
       pushes the bar instead of scrolling */
    min-inline-size: 0;
    min-block-size: 0;
    scrollbar-width: none;
    scroll-behavior: smooth;
  }

  .v-tabs[data-orientation='vertical'] .v-tabs-list {
    flex-direction: column;
    align-items: stretch;
  }

  /* L'indicateur de 2px recouvre la piste de 1px au lieu de s'empiler dessus
     (negative margins) */
  .v-tabs:is([data-variant='flat'], [data-variant='outlined']) .v-tabs-list {
    margin-block-end: -1px;
    /* contiguous tabs: on a track they form a row of segments (see the zero radius
       set by VTab.vue), not a queue of buttons */
    gap: 0;
  }

  /* since the list is 1px taller than the tabs, they rest on its
     bord de fin : l'indicateur tombe alors pile sur la piste */
  .v-tabs:is([data-variant='flat'], [data-variant='outlined'])[data-orientation='horizontal']
    .v-tabs-list {
    align-items: flex-end;
  }

  .v-tabs:is([data-variant='flat'], [data-variant='outlined'])[data-orientation='vertical']
    .v-tabs-list {
    margin-block-end: 0;
    margin-inline-start: -1px;
  }

  /* Framed and vertical: there is no longer any track at the start edge to cover —
     the 1px overflow would slide the list under the frame's border. Same specificity
     as the rule above: order decides. */
  .v-tabs[data-variant='outlined'][data-orientation='vertical'] .v-tabs-list {
    margin-inline-start: 0;
  }

  /*
   * Edge case: `outlined` with no #panels slot — the card reduces to the bar. There
   * is no boundary left to mark and the track would double the frame's border,
   * flush against it: the frame replaces it, the gutter closes on the end edge and
   * the list stops overflowing.
   */
  .v-tabs[data-variant='outlined']:not(:has(> .v-tabs-panels)) .v-tabs-bar {
    border-block-end: none;
    border-inline-end: none;
    padding-block-end: var(--tabs-frame-pad);
    padding-inline-end: var(--tabs-frame-pad);
  }

  .v-tabs[data-variant='outlined']:not(:has(> .v-tabs-panels)) .v-tabs-list {
    margin-block-end: 0;
  }

  /* Hollow track of the `inset` variant: carried by the scrolling container itself,
     otherwise its padding does not protect the active tab's shadow */
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
    /* the bar is stretch for the track's sake: the controls centre themselves
       sur la liste (qui est plus haute qu'eux en variante inset) */
    align-self: center;
  }

  /* chevrons: the direction is physical, so the icon flips in RTL */
  [dir='rtl'] .v-tabs[data-orientation='horizontal'] .v-tabs-scroll .v-icon {
    scale: -1 1;
  }

  .v-tabs-panels {
    min-inline-size: 0;
    /* frame gutter (0 when flat): the panel is the card's content area, so it takes
       it on all four sides */
    padding: var(--tabs-frame-pad);
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
