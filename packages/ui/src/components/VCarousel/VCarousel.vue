<script setup lang="ts">
import {
  cloneVNode,
  computed,
  onBeforeUnmount,
  onMounted,
  nextTick,
  ref,
  provide,
  useSlots,
  watch,
  watchEffect,
} from 'vue'
import type { StyleValue } from 'vue'

import VIcon from '../VIcon/VIcon.vue'
import { iconProps } from '../VIcon/iconProps'
import type { IconSource } from '../VIcon/types'
import VIconButton from '../VIconButton/VIconButton.vue'
import { carouselKey } from './context'

import { cssSize } from '../../utils/css'
import { isDev } from '../../utils/env'
import { clamp } from '../../utils/number'
import { flattenSlot } from '../../utils/vnode'

import { useAriaLabel } from '../../composables/useAriaLabel'
import { useTimer } from '../../composables/useTimer'
import { useMessages } from '../../i18n/state'

export type CarouselEffect = 'slide' | 'fade' | 'scale' | 'cover'
export type CarouselOrientation = 'horizontal' | 'vertical'
/** Three states, the VFileUpload `preview` precedent: nowhere / over the slides / after them. */
export type CarouselIndicators = false | 'inside' | 'outside'
export type CarouselControls = false | 'inside' | 'outside'
/** A mode, not a boolean: the reveal is hover OR focus, and never on a coarse pointer. */
export type CarouselControlsVisibility = 'always' | 'hover'

/**
 * Scrolls through content — images or text — horizontally or vertically.
 *
 * ONE mechanism: a native `scroll-snap` scroller. Touch, trackpad, scrollbar,
 * keyboard and snapping all come from the browser, not from a JS-driven
 * `transform` track and not from cloned slides. Responsiveness is 100% CSS —
 * `itemsPerView` is a maximum, `itemMinSize` a floor, and the `max()` in the
 * slide's flex-basis IS the container query: no breakpoint, no `@container`, no
 * ResizeObserver. The peek strip falls out of the same formula.
 *
 * The `fade`/`scale`/`cover` effects are CSS SCROLL-DRIVEN animations
 * (`view-timeline` + `animation-range: cover`), so they follow the finger during
 * a drag instead of playing a fixed-duration transition. They are progressive
 * enhancement behind `@supports`: without scroll-driven animations the carousel
 * is a plain `slide`, and `prefers-reduced-motion` cancels them everywhere.
 *
 * Behavioural JS, in full — nothing else:
 * - `scrollToIndex`, the v-model → DOM write. No CSS primitive scrolls a
 *   container to its Nth child from a VALUE (`::scroll-button()` is user-driven,
 *   and Chrome 135+, above this repo's floor).
 * - ONE IntersectionObserver, carrying the DOM → v-model read-back AND the page
 *   measurement. Arithmetic on `scrollLeft` would need the slide sizes (JS
 *   anyway) and is signed in RTL; a ratio is direction- and orientation-agnostic.
 *   Not every slide can lead: see `measurePages`.
 * - autoplay, because no CSS advances a value on a clock, plus ONE `matchMedia`
 *   read: a media query stops the CSS, never a timer, and WCAG 2.2.2 is about
 *   the content moving.
 * - the arrows and Home/End. A focused scroll container does move natively, but
 *   Chromium scrolls it a fixed pixel step that mandatory snapping then undoes —
 *   see `onKeydown`.
 *
 * `translate`/`rotate3d`/`translateZ` are physical, hence the `--carousel-dir`
 * sign flipped in RTL; depth has no logical mirror and stays physical, the
 * VTimePickerDial precedent.
 *
 * SSR-safe: no DOM access outside handlers, `onMounted` and
 * `watch({ flush: 'post' })`.
 */
interface CarouselProps {
  /**
   * MAXIMUM number of slides visible at once. A maximum and not a target:
   * `itemMinSize` is the floor that decides how many actually fit, so the
   * responsiveness is entirely CSS.
   */
  itemsPerView?: number
  /**
   * Floor on a slide's size along the scroll axis. Below it the `100% /
   * itemsPerView` share loses, fewer slides fit and the scroller simply scrolls
   * further. A number is read as px; a string passes through (`'20vw'`).
   */
  itemMinSize?: number | string
  /**
   * Strip reserved past the last fully visible slide, so the next one shows
   * through. It INCLUDES the gap that precedes it — that is what keeps the
   * sizing formula branch-free. Incompatible with `fade`.
   */
  peek?: number | string
  /** Space between two slides. Default: `--vectis-space-3`. */
  gap?: number | string
  /** Vertical scrolls on the block axis; the effects follow and the transforms flip. */
  orientation?: CarouselOrientation
  /**
   * Transition between slides, a 100% CSS scroll-driven animation. `slide` is no
   * animation at all. `fade` needs `itemsPerView: 1` and no `peek` — every slide
   * is counter-translated onto the same spot, so past that it downgrades.
   */
  effect?: CarouselEffect
  /**
   * Block size of the viewport. **Give one in the vertical orientation**: a
   * percentage flex-basis needs a definite main size, and without it every slide
   * collapses onto its content. Horizontal takes its height from the slides.
   */
  height?: number | string
  /**
   * Milliseconds between two automatic advances; `0` disables it. Autoplay stops
   * on the last PAGE (there is no loop), pauses on hover and on focus-within,
   * and is fully disabled under `prefers-reduced-motion`. A pause control is
   * always rendered while it is on — WCAG 2.2.2 is not a styling option.
   */
  autoplay?: number
  /**
   * Previous/next buttons: over the slides, beside them, or not at all. `outside`
   * puts them at the inline edges when horizontal and at the block edges when
   * vertical, reserving their room as padding — the component's footprint is
   * unchanged and the slides narrow instead. Either way they are centred on the
   * SLIDES, never on the slides plus the indicators.
   */
  controls?: CarouselControls
  /**
   * Position indicators: over the slides, after them, or not at all. `outside`
   * sits below when horizontal and at the inline end when vertical.
   */
  indicators?: CarouselIndicators
  /**
   * `hover` fades the previous/next pair in on hover or on focus anywhere in the
   * carousel; `always` (the default) keeps it permanently visible. A coarse
   * pointer has no hover to give, so `hover` is inert there and the pair stays
   * visible. The indicators are never hidden, whatever this says.
   */
  controlsVisibility?: CarouselControlsVisibility
  /** Icon of the previous button. Default depends on the orientation. */
  prevIcon?: IconSource
  /** Icon of the next button. Default depends on the orientation. */
  nextIcon?: IconSource
  /** Icon of the autoplay control while it is stopped. */
  playIcon?: IconSource
  /** Icon of the autoplay control while it is running. */
  pauseIcon?: IconSource
  /** Accessible name of the previous button. Default: the DS dictionary. */
  prevLabel?: string
  /** Accessible name of the next button. Default: the DS dictionary. */
  nextLabel?: string
  /** Accessible name of the autoplay control while stopped. Default: the dictionary. */
  playLabel?: string
  /** Accessible name of the autoplay control while running. Default: the dictionary. */
  pauseLabel?: string
  /**
   * Accessible name of the region. Give a DISTINCT one to every carousel on a
   * page: `role="region"` is a landmark, and two identically named landmarks are
   * an axe `landmark-unique` violation.
   */
  label?: string
}

const props = withDefaults(defineProps<CarouselProps>(), {
  itemsPerView: 1,
  itemMinSize: undefined,
  peek: undefined,
  gap: undefined,
  orientation: 'horizontal',
  effect: 'slide',
  height: undefined,
  autoplay: 0,
  controls: 'inside',
  indicators: 'outside',
  controlsVisibility: 'always',
  prevIcon: undefined,
  nextIcon: undefined,
  playIcon: 'play_arrow',
  pauseIcon: 'pause',
  prevLabel: undefined,
  nextLabel: undefined,
  playLabel: undefined,
  pauseLabel: undefined,
  label: undefined,
})

const slots = useSlots()

defineSlots<{
  /**
   * The <VCarouselItem> elements. Their COUNT is read off the VNodes, so a
   * `v-for` is fine — but the slot must not depend on a client-only condition.
   */
  default(): unknown
  /**
   * Replaces the whole previous/next pair — its placement CSS included, so custom
   * content lays itself out inside the stage and `controlsVisibility` is inert on it.
   */
  controls?(props: {
    previous: () => void
    next: () => void
    atStart: boolean
    atEnd: boolean
    index: number
    /** Number of slides. */
    count: number
    /** Number of positions the scroller can rest on — see `pageCount`. */
    pageCount: number
    /** Which axis scrolls: a custom bar cannot pick its icons or its own axis without it. */
    orientation: CarouselOrientation
  }): unknown
  /**
   * Replaces the whole indicator bar, its group role included. Render one control per
   * `pageCount`, NOT per `count`: a position past the last page is unreachable, and a
   * bar built on the slide count offers dots that scroll nowhere. `count` is still
   * given, for "N of M" labels.
   */
  indicators?(props: {
    index: number
    count: number
    pageCount: number
    goTo: (index: number) => void
    orientation: CarouselOrientation
  }): unknown
  /** Replaces ONE indicator's contents; the <button> and its ARIA stay the DS's. */
  indicator?(props: { index: number; active: boolean }): unknown
  /** Replaces the autoplay control. */
  autoplay?(props: { playing: boolean; toggle: () => void }): unknown
}>()

/** Index of the current slide — the FIRST visible one when several fit. */
const model = defineModel<number>({ default: 0 })

const m = useMessages()
const ariaLabel = useAriaLabel(() => props.label ?? m.value.carousel.label)
const resolvedPrevLabel = computed(() => props.prevLabel ?? m.value.carousel.previous)
const resolvedNextLabel = computed(() => props.nextLabel ?? m.value.carousel.next)
const isVertical = computed(() => props.orientation === 'vertical')
const resolvedPrevIcon = computed(
  () => props.prevIcon ?? (isVertical.value ? 'expand_less' : 'chevron_left'),
)
const resolvedNextIcon = computed(
  () => props.nextIcon ?? (isVertical.value ? 'expand_more' : 'chevron_right'),
)

/*
 * The count comes from the slot's VNODES, never from a registry the items feed at
 * mount: a registry renders 0 slides on the server and N on the client — a
 * guaranteed hydration mismatch, and the very reason VTabs derives `hasPanels`
 * from `slots` too. `cloneVNode` is then what carries each slide its position:
 * `setup()` order is deterministic on the first render but not on a later
 * insertion, so a self-incrementing counter would drift.
 */
const slides = computed(() => flattenSlot(slots.default?.()))
const count = computed(() => slides.value.length)

// A functional component: it renders already-captured VNodes, which
// <component :is> cannot do (it expects a definition). The VAvatarGroup idiom.
const Slides = () =>
  slides.value.map((node, index) => cloneVNode(node, { index, key: node.key ?? index }))

/*
 * `fade` counter-translates every slide onto the same spot, so past one item per
 * view — or with a peek strip — the slides do not merely look degraded, they pile
 * up. The downgrade makes the combination unrepresentable; the dev warn explains.
 */
const resolvedEffect = computed<CarouselEffect>(() =>
  props.effect === 'fade' && (props.itemsPerView > 1 || props.peek !== undefined)
    ? 'slide'
    : props.effect,
)

provide(carouselKey, {
  get count() {
    return count.value
  },
  get slideRoleDescription() {
    return m.value.carousel.slideRoleDescription
  },
  slideLabel: (index: number) => m.value.carousel.slide(index + 1, count.value),
})

const rootStyle = computed<StyleValue>(() => ({
  '--carousel-per-view': String(props.itemsPerView),
  '--carousel-item-min': cssSize(props.itemMinSize),
  '--carousel-peek': cssSize(props.peek),
  '--carousel-gap': cssSize(props.gap),
  '--carousel-viewport-block': cssSize(props.height),
}))

const viewportEl = ref<HTMLElement | null>(null)

/*
 * Raised while a programmatic scroll is in flight, so the read-back does not fight
 * the request: without it, asking for slide 4 would be overwritten by slides 1, 2
 * and 3 as they pass under the scrollport.
 *
 * A `ref` and NOT the non-reactive `let` of `useTimer`, because LOWERING it has to
 * be able to re-run the sync. `scrollend` and the observer callback race, and a
 * smooth scroll the user interrupts is exactly the losing order: the observer
 * reports the final position while the flag is still up, the flag drops a moment
 * later, and with a plain `let` nothing would ever come back to write the model —
 * desynchronized for good. Caught by the `Default` play function.
 */
const settling = ref(false)
const onScrollEnd = () => (settling.value = false)

/**
 * Writes the DOM from the model. The deltas come from the RECTS, hence physical:
 * LTR, RTL and vertical all fall out with no direction test (the VTabs
 * `watch(model)` idiom). `behavior` is omitted so CSS `scroll-behavior` governs,
 * hence `prefers-reduced-motion`; `scrollBy?.()` is optional-called because jsdom
 * implements no scrolling.
 */
function scrollToIndex(index: number) {
  const port = viewportEl.value
  const slide = port?.querySelector<HTMLElement>(`[data-carousel-index='${index}']`)
  if (!port || !slide) return
  const target = slide.getBoundingClientRect()
  // The VIEWPORT's rect, not the stage's: every DOM read in this component is
  // viewport-scoped, and the `outside` gutter is padding on the root, so nothing here
  // has to know about it.
  const origin = port.getBoundingClientRect()
  const left = target.left - origin.left
  const top = target.top - origin.top
  /*
   * Already there — which is what a model change coming FROM the read-back looks
   * like. Arming the guard here would be the other way to strand it: no movement
   * means no `scrollend` to lower it again.
   */
  if (Math.abs(left) < 1 && Math.abs(top) < 1) return
  settling.value = true
  port.scrollBy?.({ left, top })
}

watch(model, (index) => {
  void nextTick(() => scrollToIndex(index))
})

/** Ratio at which a slide counts as fully visible — the sub-pixel slack of a
    fractional flex layout. */
const FULL = 0.99

const ratios = new Map<number, number>()
const observedIndex = ref<number>()
const measuredPages = ref<number>()

/**
 * How many LEADING positions the scroller can actually rest on. `scroll-snap-align:
 * start` makes every slide's start edge a snap position, but one lying past
 * `scrollWidth - clientWidth` is UNREACHABLE — the scroller clamps short of it. One
 * dot per slide would therefore offer indices the DOM can never satisfy.
 *
 * Measured from the scroller itself, and NOT computed as `count - itemsPerView + 1`:
 * the reachable count is `count - CEIL(slides per view) + 1`, so as soon as `peek` or
 * an active `itemMinSize` makes that number fractional, the flooring form hands back
 * one position too many — reintroducing the bug in the two configurations that
 * motivated measuring at all.
 *
 * RECTS and the scroller's own sizes only, never `getComputedStyle`: this runs on
 * every frame of a smooth scroll. `step` is the delta between the first two slides,
 * hence physical — RTL and vertical fall out with no direction test, the
 * `scrollToIndex` idiom.
 */
function measurePages(port: HTMLElement) {
  const boxes = port.querySelectorAll<HTMLElement>('[data-carousel-index]')
  const first = boxes[0]?.getBoundingClientRect()
  const second = boxes[1]?.getBoundingClientRect()
  if (!first || !second) return
  const step = isVertical.value
    ? Math.abs(second.top - first.top)
    : Math.abs(second.left - first.left)
  const scrollable = isVertical.value
    ? port.scrollHeight - port.clientHeight
    : port.scrollWidth - port.clientWidth
  // No layout at all (jsdom, a display:none ancestor). Writing a 0 here would drag
  // every clamp down with it; the prop-derived fallback stays the answer until there
  // IS a layout.
  if (step <= 0) return
  // +1: clientWidth/scrollWidth are integers where the flex layout is fractional, so
  // an exactly reachable last position can measure a hair short.
  measuredPages.value = Math.floor((scrollable + 1) / step) + 1
}

/**
 * SSR, jsdom and the first paint. `itemsPerView` is not a guess there: with no `peek`
 * and no active `itemMinSize` the flex-basis makes a slide plus its gap exactly
 * `(100% + gap) / itemsPerView`, so the fit IS `itemsPerView` at every viewport size.
 * A pure function of the props is also what keeps the dot list identical on the server
 * and on the client — measuring here would be a hydration mismatch.
 *
 * The clamp lives here rather than in `measurePages` so a stale measurement cannot
 * outlive the removal of a slide: `count` is reactive, the raw measurement is not.
 */
const pageCount = computed(() =>
  count.value === 0
    ? 0
    : clamp(measuredPages.value ?? count.value - props.itemsPerView + 1, 1, count.value),
)

/*
 * DOM → model, with ONE observer, which also carries the page measurement.
 *
 * TRAP — `1` must stay in `threshold`. It is what makes this observer cover a ROOT
 * RESIZE, which an IntersectionObserver does NOT do on its own (it queues an entry
 * only when a threshold bucket is crossed): `pageCount` changes exactly when the
 * number of FULLY visible slides changes, which crosses the 1.0 bucket, which queues
 * the callback that re-measures. Drop the 1 and the page count silently freezes.
 * The second premise is that a slide's box never exceeds the port on the cross axis,
 * so the area ratio equals the scroll-axis ratio — the CSS guarantees it today, and
 * the `FULL` test below depends on it too.
 */
watch(
  [viewportEl, count],
  ([port], _previous, onCleanup) => {
    // IntersectionObserver exists neither in SSR nor in jsdom: the read-back and the
    // measurement are verified in the browser (play functions).
    if (!port || typeof IntersectionObserver === 'undefined') return
    ratios.clear()
    const observer = new IntersectionObserver(
      (entries) => {
        measurePages(port)
        for (const entry of entries) {
          const index = Number((entry.target as HTMLElement).dataset.carouselIndex)
          ratios.set(index, entry.intersectionRatio)
        }
        /*
         * NUMERIC order, and the FIRST full slide. `ratios` is a Map iterated in the
         * order the observer first delivered each slide, and when several fit they are
         * all at ratio 1: scanning it with a `>` picks an arbitrary member of the tie —
         * a MIDDLE slide as often as not, which showed up as a wrong active dot AND a
         * `next` that then stepped two slides at once. Mid-scroll nothing is full, and
         * the largest ratio is the best guess: that is the second branch.
         */
        let leading = 0
        let bestRatio = 0
        for (let index = 0; index < count.value; index += 1) {
          const ratio = ratios.get(index) ?? 0
          if (ratio >= FULL) {
            leading = index
            break
          }
          if (ratio > bestRatio) {
            bestRatio = ratio
            leading = index
          }
        }
        /*
         * Clamped, so the model can never leave the reachable range even transiently:
         * at the clamped end every remaining slide is full, and mid-drag the
         * largest-ratio branch can name one past the last page — `watch(model)` fires
         * on read-back writes too, and `scrollToIndex` would then fight the finger.
         */
        observedIndex.value = Math.min(leading, pageCount.value - 1)
        // The request has arrived, so there is nothing left to protect. This is also
        // the ONLY exit when the browser clamps a programmatic scroll to no movement
        // at all — `scrollend` never fires there.
        if (observedIndex.value === model.value) settling.value = false
      },
      { root: port, threshold: [0, 0.25, 0.5, 0.75, 1] },
    )
    for (const slide of port.querySelectorAll('[data-carousel-index]')) observer.observe(slide)
    onCleanup(() => observer.disconnect())
  },
  { flush: 'post' },
)

// Watching `settling` as well as the reading is the whole point of making it a ref:
// whichever of the two lands last, the sync runs.
watch([observedIndex, settling], () => {
  const index = observedIndex.value
  if (settling.value || index === undefined || index === model.value) return
  model.value = index
})

/*
 * Pure derivations, and they can be because `pageCount` never over-counts: index 0 is
 * always reachable, and so is `pageCount - 1` by construction. The observed ends this
 * replaces existed only to survive a model that could request an unreachable index —
 * which, with a correct page count, it no longer can. What that insured against was
 * autoplay-shaped (a false `atEnd` re-arms the timer on every bounce, forever), and
 * the `Pages` play function is what keeps that honest.
 */
const atStart = computed(() => model.value <= 0)
const atEnd = computed(() => model.value >= pageCount.value - 1)

function goTo(index: number) {
  // `clamp` returns `min` on an empty interval, which is the right answer with no slide.
  model.value = clamp(index, 0, pageCount.value - 1)
}
const previous = () => goTo(model.value - 1)
const next = () => goTo(model.value + 1)
const toggleAutoplay = () => (playing.value = !playing.value)

/**
 * The one keyboard concession, and it is not the one it looks like. A focused
 * scroll container DOES move on the arrows — but Chromium scrolls it by a fixed
 * pixel step, and MANDATORY snapping then pulls it straight back to the slide it
 * started on, so the net movement is zero. Home/End behave the same way.
 * (Covered by the `Keyboard` play function, verified red without this handler.)
 *
 * Contract: it moves the MODEL, never the scroller — the scroll then goes through
 * `scrollToIndex` like every other route, so there is a single write path.
 * `arrowNav` is not the tool: its job is moving focus between sibling controls,
 * and slides are neither focusable nor a list.
 */
function onKeydown(event: KeyboardEvent) {
  const port = viewportEl.value
  if (!port || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return

  if (event.key === 'Home' || event.key === 'End') {
    event.preventDefault()
    goTo(event.key === 'Home' ? 0 : pageCount.value - 1)
    return
  }

  // Only the axis the carousel actually scrolls: the other one must stay with the
  // browser, which is what still scrolls a slide taller than the viewport.
  const steps: Record<string, number | undefined> = isVertical.value
    ? { ArrowUp: -1, ArrowDown: 1 }
    : { ArrowLeft: -1, ArrowRight: 1 }
  const step = steps[event.key]
  if (step === undefined) return
  event.preventDefault()
  // The INLINE arrows are physical, hence inverted in RTL (the `arrowNav` rule);
  // the block axis does not flip.
  const rtl = !isVertical.value && getComputedStyle(port).direction === 'rtl'
  goTo(model.value + (rtl ? -step : step))
}

const { start, cancel } = useTimer()
const playing = ref(props.autoplay > 0)
const hovered = ref(false)
const focused = ref(false)
const reducedMotion = ref(false)

/*
 * Every reason to stop, gathered in ONE computed so a single watch re-arms the
 * timer (the single-instance idiom of VTooltip and VMenuItem).
 *
 * `autoplay > 0` is a GUARD, not a default: `useTimer` runs a delay ≤ 0
 * SYNCHRONOUSLY (the DS convention), and a synchronous callback bumping the model
 * would recurse until the stack blows.
 */
const rotating = computed(
  () =>
    playing.value &&
    props.autoplay > 0 &&
    !hovered.value &&
    !focused.value &&
    !reducedMotion.value &&
    !atEnd.value,
)

// `immediate`: without it the first delay would only be armed by a LATER change,
// so an autoplay that nobody touches would never advance at all.
watch(
  [rotating, model],
  () => {
    cancel()
    if (rotating.value) start(next, props.autoplay)
  },
  { immediate: true },
)

/*
 * The DS's second browser-preference read (after VHotkeys' `navigator`), and it
 * is not redundant with the CSS media query: that one stops a transition, never a
 * TIMER, and WCAG 2.2.2 is about the content moving at all. Client only, listener
 * released on unmount.
 */
let releaseMotionQuery: (() => void) | undefined
onMounted(() => {
  const query = window.matchMedia?.('(prefers-reduced-motion: reduce)')
  if (!query) return
  const sync = () => (reducedMotion.value = query.matches)
  sync()
  query.addEventListener('change', sync)
  releaseMotionQuery = () => query.removeEventListener('change', sync)
})
onBeforeUnmount(() => releaseMotionQuery?.())

/*
 * Announced only at rest: narrating an auto-rotating carousel floods the screen
 * reader (APG). The region itself stays mounted — a live container inserted at
 * the same time as its text is not announced (the VDataTable footer rule).
 */
const liveMessage = computed(() =>
  rotating.value || count.value === 0 ? '' : m.value.carousel.slide(model.value + 1, count.value),
)

if (isDev) {
  watchEffect(() => {
    if (props.effect === 'fade' && props.itemsPerView > 1)
      console.warn(
        '[VCarousel] `fade` needs one item per view: over a single view timeline every slide is counter-translated onto the same spot, so they would pile up. Downgraded to `slide`.',
      )
    if (props.effect === 'fade' && props.peek !== undefined)
      console.warn(
        '[VCarousel] `fade` and `peek` are mutually exclusive: the counter-translate parks every slide over the viewport, so the peeked strip is covered. Downgraded to `slide`.',
      )
    if (isVertical.value && props.height === undefined)
      console.warn(
        '[VCarousel] a vertical carousel needs a `height`: a percentage flex-basis has no definite reference on the block axis. Falling back to --vectis-control-size-carousel-block.',
      )
    if (!Number.isInteger(props.itemsPerView) || props.itemsPerView < 1)
      console.warn(
        `[VCarousel] \`itemsPerView\` must be an integer ≥ 1, got ${props.itemsPerView}.`,
      )
  })
}
</script>

<template>
  <div
    class="v-carousel"
    role="region"
    :aria-roledescription="m.carousel.roleDescription"
    :aria-label="ariaLabel"
    :style="rootStyle"
    :data-orientation="orientation"
    :data-effect="resolvedEffect"
    :data-controls="controls || undefined"
    :data-indicators="indicators || undefined"
    :data-controls-visibility="controlsVisibility"
    @pointerenter="hovered = true"
    @pointerleave="hovered = false"
    @focusin="focused = true"
    @focusout="focused = false"
  >
    <!--
      The stage holds the viewport, the controls and the autoplay control — and
      NOTHING else. The indicator bar is a sibling on purpose: inside this box it
      would join the height the controls are centred on, and the pair would sit
      visibly below the middle of the slides.
    -->
    <div class="v-carousel-stage">
      <!--
        tabindex="0" is MANDATORY, not defensive: a scroll container needs a
        TABBABLE descendant (axe `scrollable-region-focusable`) and slide content
        is arbitrary. It is also what makes the track the keyboard target of
        `onKeydown` — the browser's own arrow scrolling is real, but mandatory
        snapping undoes it, see there. A focusable box with an aria-label must
        carry a role, or axe reports `aria-prohibited-attr`.
      -->
      <div
        ref="viewportEl"
        class="v-carousel-viewport"
        role="group"
        tabindex="0"
        :aria-label="m.carousel.slides"
        @keydown="onKeydown"
        @scrollend="onScrollEnd"
      >
        <component :is="Slides" />
      </div>

      <slot
        name="controls"
        :previous="previous"
        :next="next"
        :at-start="atStart"
        :at-end="atEnd"
        :index="model"
        :count="count"
        :page-count="pageCount"
        :orientation="orientation"
      >
        <div v-if="controls" class="v-carousel-controls">
          <VIconButton
            class="v-carousel-control"
            :label="resolvedPrevLabel"
            variant="ghost"
            tone="neutral"
            elevated
            :disabled="atStart"
            @click="previous"
          >
            <VIcon v-bind="iconProps(resolvedPrevIcon)" />
          </VIconButton>
          <VIconButton
            class="v-carousel-control"
            :label="resolvedNextLabel"
            variant="ghost"
            tone="neutral"
            elevated
            :disabled="atEnd"
            @click="next"
          >
            <VIcon v-bind="iconProps(resolvedNextIcon)" />
          </VIconButton>
        </div>
      </slot>

      <!--
        Rendered whatever `controls` says: WCAG 2.2.2 demands a way to stop
        content that moves on its own, and that floor must not be removable
        through a presentational prop.
      -->
      <slot v-if="autoplay > 0" name="autoplay" :playing="playing" :toggle="toggleAutoplay">
        <VIconButton
          class="v-carousel-autoplay"
          :label="playing ? (pauseLabel ?? m.carousel.pause) : (playLabel ?? m.carousel.play)"
          variant="solid"
          tone="neutral"
          size="sm"
          @click="toggleAutoplay"
        >
          <VIcon v-bind="iconProps(playing ? pauseIcon : playIcon)" />
        </VIconButton>
      </slot>
    </div>

    <slot
      name="indicators"
      :index="model"
      :count="count"
      :page-count="pageCount"
      :go-to="goTo"
      :orientation="orientation"
    >
      <div
        v-if="indicators"
        class="v-carousel-indicators"
        role="group"
        :aria-label="m.carousel.indicators"
      >
        <!--
            One control per REACHABLE position, not per slide: with 6 slides three at
            a time the scroller can only lead with 1 to 4, and dots 5 and 6 would
            scroll nowhere. The label stays slide-based ("4 of 6") because that is what
            the control does — it parks that slide at the start edge — and it then
            agrees with the slide's own name and with the live region.
          -->
        <button
          v-for="index in pageCount"
          :key="index"
          type="button"
          class="v-carousel-indicator"
          :aria-label="m.carousel.slide(index, count)"
          :aria-current="index - 1 === model ? 'true' : undefined"
          @click="goTo(index - 1)"
        >
          <slot name="indicator" :index="index - 1" :active="index - 1 === model">
            <span class="v-carousel-dot" />
          </slot>
        </button>
      </div>
    </slot>

    <span class="v-visually-hidden" role="status">{{ liveMessage }}</span>
  </div>
</template>

<style>
@layer vectis.components {
  .v-carousel {
    /*
     * Geometry vector and direction sign. The effect keyframes are written on
     * them ONCE instead of being duplicated per orientation and per direction:
     * `translate` and `rotate3d()` are physical, and `calc(0 * -100%)` is a valid
     * zero.
     */
    --carousel-axis-x: 1;
    --carousel-axis-y: 0;
    --carousel-dir: 1;

    /*
     * Effect constants: private, non-contractual geometry with no theming story,
     * hence no --vectis-* token (the qualification rule still applies).
     */
    --carousel-tilt: 32deg;
    --carousel-depth: -6rem;
    --carousel-perspective: 60rem;
    --carousel-scale-min: 0.86;

    /* A true gutter, which is what --vectis-space-* is for. */
    --carousel-gap: var(--vectis-space-3);
    /* No floor by default: the itemsPerView share alone decides. */
    --carousel-item-min: 0px;
    --carousel-peek: 0px;
    --carousel-viewport-block: var(--vectis-control-size-carousel-block);
    /*
     * Room reserved on the SCROLL axis for the `outside` controls. `0px` and never
     * `0`: it feeds a `padding-*`, where a unitless zero is invalid — the
     * `--carousel-peek` precedent three lines up.
     */
    --carousel-outset: 0px;

    /* Positioning context of the `inside` indicator bar, which is deliberately NOT
       a child of the stage — see .v-carousel-stage. */
    position: relative;
    display: flex;
    flex-direction: column;
    gap: var(--vectis-space-3);
    font-family: var(--vectis-text-family);
  }

  /*
   * The gutter is PADDING on the root: the component's footprint is unchanged and
   * the viewport narrows instead, so the slides' percentage flex-basis follows with
   * no branch and no second measurement.
   *
   * INVARIANT — always on the scroll axis, always SYMMETRIC. That is what lets every
   * `inside` inset below be written against the stage's edges with no compensation:
   * an absolutely positioned box resolves against the PADDING box, the edges those
   * insets pin to are on the cross axis (which this never touches), and the axis they
   * centre on stays symmetric. Make this one-sided and the `inside` indicator bar
   * goes off-centre with nothing to report it.
   */
  .v-carousel[data-orientation='horizontal'] {
    padding-inline: var(--carousel-outset);
  }

  .v-carousel[data-orientation='vertical'] {
    --carousel-axis-x: 0;
    --carousel-axis-y: 1;

    /* The indicator bar sits BESIDE the stage here, so the root's own axis follows
       the scroll axis. */
    flex-direction: row;
    padding-block: var(--carousel-outset);
  }

  /*
   * TRAP — `control-height-md` is the size the two VIconButtons actually render at:
   * they pass no `size`, so they take VIconButton's own `md` default and their width
   * is `--control-height`. The gutter is that button plus one gap, so the pair lands
   * flush inside the root's border box and never covers a slide. Give the buttons a
   * `size` and this line has to follow, or the pair either overlaps the first slide
   * or floats away from it — with no error anywhere.
   *
   * The `:has()` is not decoration: a consumer `#controls` slot replaces the whole
   * bar, and reserving two buttons' worth of padding for a bar nobody rendered would
   * inset the slides for nothing.
   */
  .v-carousel[data-controls='outside']:has(> .v-carousel-stage > .v-carousel-controls) {
    --carousel-outset: calc(var(--vectis-control-height-md) + var(--vectis-space-2));
  }

  /*
   * The scroll axis is physical, so RTL mirrors the transforms — and ONLY the
   * transforms: flex-basis and the logical `scroll-snap-type` keyword handle
   * themselves. One sign flips both the fade counter-translate and the coverflow
   * tilt. Scoped to `horizontal`: the block axis does not flip.
   */
  [dir='rtl'] .v-carousel[data-orientation='horizontal'] {
    --carousel-dir: -1;
  }

  /*
   * Positioning context of the controls and of the autoplay control — and of NOTHING
   * else. The indicator bar is a SIBLING on purpose: inside this box it would join
   * the height the controls are centred on, and an `inside` pair would sit visibly
   * below the middle of the slides. Kept a flex column so a consumer `#controls` slot
   * still stacks under the viewport with a gutter.
   */
  .v-carousel-stage {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: var(--vectis-space-3);
    min-inline-size: 0;
    min-block-size: 0;
  }

  /*
   * Vertical ONLY. The root is a `row` there, so the inline axis is the flex MAIN
   * axis and the stage would shrink-wrap the widest slide's content — an `inside`
   * bar's `inset-inline-end` would then land on the ROOT's edge instead of the
   * slides'. Deliberately NOT applied in horizontal: the main axis is the block one
   * there, and growing into a consumer-set height would push the stage past the
   * viewport and re-centre the controls on empty space — the very bug this split
   * fixes.
   *
   * `flex-grow` and not `flex: 1`: the shorthand's `0` basis, together with the
   * min-size floors above, lets an auto-sized flex container collapse it.
   */
  .v-carousel[data-orientation='vertical'] .v-carousel-stage {
    flex-grow: 1;
  }

  .v-carousel-viewport {
    display: flex;
    gap: var(--carousel-gap);
    /*
     * `auto` on BOTH axes, never `auto hidden`: clipping the cross axis would crop
     * the focus ring of any focusable slide content.
     */
    overflow: auto;
    overscroll-behavior: contain;
    /* Logical keyword: RTL and vertical need no second declaration. */
    scroll-snap-type: inline mandatory;
    scroll-behavior: smooth;
    scrollbar-width: none;
    /* A flex item's automatic minimum would stop the viewport shrinking, hence scrolling. */
    min-inline-size: 0;
    min-block-size: 0;
    border-radius: var(--vectis-radius-surface);
  }

  .v-carousel-viewport::-webkit-scrollbar {
    display: none;
  }

  .v-carousel-viewport:focus-visible {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: var(--vectis-focus-ring-offset);
  }

  .v-carousel[data-orientation='vertical'] .v-carousel-viewport {
    flex-direction: column;
    scroll-snap-type: block mandatory;
    /*
     * A percentage flex-basis resolves against the container's MAIN size, which on
     * the block axis has nothing intrinsic here: without a definite one the basis
     * falls back to `auto` and every slide collapses onto its content.
     */
    block-size: var(--carousel-viewport-block);
  }

  .v-carousel-slide {
    /*
     * `flex-basis` and NOT `inline-size`: it is the one dimension that resolves on
     * the flex MAIN axis, hence on the scroll axis, in both orientations and both
     * directions — a logical property would still need a rule per orientation,
     * since `inline` follows the writing mode and not `flex-direction`.
     *
     * Arithmetic: N slides fully visible cost N-1 INNER gaps. `peek` is the whole
     * strip reserved past the Nth slide, its leading gap included (its JSDoc says
     * so) — that is what keeps the formula branch-free, `peek: 0` collapsing it
     * exactly to (100% - (N-1)·gap) / N. `max()` makes itemMinSize a floor, never
     * a cap, and IS the responsiveness: no breakpoint, no @container.
     */
    flex: 0 0
      max(
        var(--carousel-item-min),
        calc(
          (100% - (var(--carousel-per-view) - 1) * var(--carousel-gap) - var(--carousel-peek)) /
            var(--carousel-per-view)
        )
      );
    /* `auto` is a CONTENT-based floor that can push a flex item past its basis:
       one unbreakable word would desynchronize the whole snap grid. */
    min-inline-size: 0;
    min-block-size: 0;
    scroll-snap-align: start;
    position: relative;
  }

  .v-carousel-effect {
    block-size: 100%;
  }

  /*
   * Effects — progressive enhancement. Without scroll-driven animations nothing
   * below is declared and the carousel is a plain `slide`; Firefox lands there,
   * exactly like anchor positioning.
   *
   * The TIMELINE is declared on the slide and the ANIMATION on its inner box, and
   * that split is load-bearing: a scroll-snap area is the element's TRANSFORMED
   * border box, so animating the slide itself would make its snap position depend
   * on the scroll position — a circular dependency whose symptom is jitter, with
   * no error anywhere. A named timeline is resolved by walking up the tree, so
   * each inner finds ITS OWN slide although they all share the ident.
   */
  @supports (view-timeline-name: --v) and (animation-range: cover) {
    .v-carousel:not([data-effect='slide']) .v-carousel-slide {
      view-timeline: --carousel-view inline;
    }

    .v-carousel[data-orientation='vertical']:not([data-effect='slide']) .v-carousel-slide {
      view-timeline: --carousel-view block;
    }

    .v-carousel:not([data-effect='slide']) .v-carousel-effect {
      /*
       * TRAP — longhands, never the `animation` shorthand: `animation-timeline`
       * and `animation-duration` are reset-only sub-properties, so a shorthand
       * written afterwards would silently put the timeline back to `auto` and the
       * duration to 0s, and every effect would vanish with no error.
       *
       * `cover` is the only range that spans the full viewport+slide traversal and
       * stays defined for a slide narrower, equal to or wider than the scrollport:
       * `contain` has length |V - S|, hence exactly ZERO at one item per view.
       *
       * `linear` is load-bearing too: the default `ease` re-maps the progress and
       * the fade counter-translate would no longer cancel the scroll travel.
       */
      animation-timeline: --carousel-view;
      animation-range: cover;
      animation-fill-mode: both;
      animation-timing-function: linear;
      /* `auto` is the whole timeline. A duration in seconds would be taken as a
         PROPORTION of it, and the effect would end a fraction of the way in. */
      animation-duration: auto;
    }

    .v-carousel[data-effect='fade'] .v-carousel-effect {
      animation-name: v-carousel-fade;
    }

    .v-carousel[data-effect='scale'] .v-carousel-effect {
      animation-name: v-carousel-scale;
    }

    .v-carousel[data-effect='cover'] .v-carousel-effect {
      animation-name: v-carousel-cover;
    }
  }

  /*
   * Over the `cover` range a slide's origin travels the whole viewport+slide
   * distance, so a counter-translate of ±100% of the slide's OWN size pins it on
   * the scrollport when the two are equal — which is why `fade` is defined at one
   * item per view only. The result is a true dissolve in place, gap included.
   */
  @keyframes v-carousel-fade {
    0% {
      opacity: 0;
      translate: calc(var(--carousel-axis-x) * var(--carousel-dir) * -100%)
        calc(var(--carousel-axis-y) * -100%);
    }
    50% {
      opacity: 1;
      translate: 0 0;
    }
    100% {
      opacity: 0;
      translate: calc(var(--carousel-axis-x) * var(--carousel-dir) * 100%)
        calc(var(--carousel-axis-y) * 100%);
    }
  }

  /*
   * Geometry ONLY, no opacity dimming — and that is an accessibility decision, not
   * a taste one: a slide off the centre still holds real text, and fading it is a
   * measurable contrast loss that axe rightly reports. The scale (and the tilt of
   * `cover`) already carries the depth. `fade` keeps its opacity, which IS the
   * effect.
   */
  @keyframes v-carousel-scale {
    0%,
    100% {
      scale: var(--carousel-scale-min);
    }
    50% {
      scale: 1;
    }
  }

  /*
   * `transform` and not the individual rotate/translate properties: perspective()
   * has to sit in the function list. A `perspective` PROPERTY on the viewport
   * would be inert — an `overflow: auto` box is forced to `transform-style: flat`,
   * so it can never be its children's 3D context.
   *
   * The rotation axis is deliberately swapped: a horizontal carousel (axis-x: 1)
   * tilts about Y, a vertical one about X.
   */
  @keyframes v-carousel-cover {
    0% {
      transform: perspective(var(--carousel-perspective)) translateZ(var(--carousel-depth))
        rotate3d(
          var(--carousel-axis-y),
          var(--carousel-axis-x),
          0,
          calc(var(--carousel-dir) * var(--carousel-tilt))
        );
    }
    50% {
      transform: perspective(var(--carousel-perspective)) translateZ(0) rotate3d(0, 1, 0, 0deg);
    }
    100% {
      transform: perspective(var(--carousel-perspective)) translateZ(var(--carousel-depth))
        rotate3d(
          var(--carousel-axis-y),
          var(--carousel-axis-x),
          0,
          calc(var(--carousel-dir) * var(--carousel-tilt) * -1)
        );
    }
  }

  .v-carousel-controls {
    display: flex;
    /* A floor, not the layout — `space-between` places the pair. It only ever shows
       on a stage narrow enough to bring the two buttons together. */
    gap: var(--vectis-space-2);
    transition: opacity var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  .v-carousel[data-orientation='vertical'] .v-carousel-controls {
    flex-direction: column;
  }

  /*
   * chevrons: the direction is physical, so the icon flips in RTL (the VTabs and
   * VPagination rule, word for word). Horizontal only — the block axis does not
   * mirror, so the vertical chevrons are already right.
   */
  [dir='rtl'] .v-carousel[data-orientation='horizontal'] .v-carousel-control .v-icon {
    scale: -1 1;
  }

  /*
   * BOTH placements are laid out of flow against the STAGE, and that is the whole
   * requirement: the pair is then centred on the slides alone, whatever the indicator
   * bar does. One `align-items: center` serves both orientations — it is the cross
   * axis in each. `pointer-events` is handed back to the buttons alone, so the strip
   * does not swallow a drag over the slides.
   *
   * Enumerated rather than a bare `[data-controls]`: a third placement has to opt in
   * by hand (the VTabs `:is()` rule). ORDER IS LOAD-BEARING — the per-placement blocks
   * below are (0,3,0) like this one.
   */
  .v-carousel:is([data-controls='inside'], [data-controls='outside']) .v-carousel-controls {
    position: absolute;
    inset: 0;
    align-items: center;
    justify-content: space-between;
    pointer-events: none;
  }

  .v-carousel[data-controls='inside'] .v-carousel-controls {
    inset: var(--vectis-space-2);
  }

  /*
   * `outside`: the pair is pulled out of the stage by exactly the gutter the root
   * reserved, so each button sits in that padding, one gap clear of the slides, still
   * centred on the stage's cross axis.
   *
   * RTL is FREE and needs no `--carousel-dir`: `inset-inline` is logical, the two
   * insets are equal so the box is direction-symmetric, and `space-between` puts
   * `previous` at the inline START — the right-hand side in RTL, where it belongs.
   */
  .v-carousel[data-controls='outside'] .v-carousel-controls {
    inset-inline: calc(-1 * var(--carousel-outset));
  }

  .v-carousel[data-orientation='vertical'][data-controls='outside'] .v-carousel-controls {
    inset-inline: 0;
    inset-block: calc(-1 * var(--carousel-outset));
  }

  /*
   * `hover` REVEALS the pair, it never removes it. `display: none` and
   * `visibility: hidden` would drop the buttons from the tab order AND from the
   * accessibility tree, where `opacity: 0` keeps both — the hidden-input rule. The
   * reveal costs no layout, so nothing shifts.
   *
   * `:focus-within` on the ROOT, not on the bar: the reveal boundary is then exactly
   * the boundary autoplay already pauses on, and a keyboard user who has tabbed to
   * the track — or into a link inside a slide — sees the navigation before deciding
   * whether to use it.
   *
   * Behind `@media (hover: hover)`: a coarse pointer has no hover to give, so the
   * whole block is inert there and the pair stays permanently visible. NOT
   * `any-hover`, which is true as soon as any pointer capable of hovering is attached
   * and would strand exactly the users this protects.
   */
  @media (hover: hover) {
    .v-carousel[data-controls-visibility='hover'] .v-carousel-controls {
      opacity: 0;
    }

    .v-carousel[data-controls-visibility='hover']:hover .v-carousel-controls,
    .v-carousel[data-controls-visibility='hover']:focus-within .v-carousel-controls {
      opacity: 1;
    }
  }

  .v-carousel-control {
    pointer-events: auto;
  }

  /* Autoplay sits at the start corner, out of the controls' way in either mode. */
  .v-carousel-autoplay {
    position: absolute;
    inset-block-start: var(--vectis-space-2);
    inset-inline-start: var(--vectis-space-2);
  }

  .v-carousel-indicators {
    display: flex;
    gap: var(--vectis-space-1);
    align-items: center;
    justify-content: center;
  }

  .v-carousel[data-orientation='vertical'] .v-carousel-indicators {
    flex-direction: column;
  }

  /*
   * `inside`: centred on the block-end edge, with NO surface of its own — a pill
   * behind the dots covers a slice of the slide the whole time, which is a lot of
   * media to spend on six 8px marks. The legibility moves into the dots instead
   * (see below), where it costs their own footprint and nothing more.
   */
  .v-carousel[data-indicators='inside'] .v-carousel-indicators {
    position: absolute;
    inset-block-end: var(--vectis-space-3);
    inset-inline: 0;
    margin-inline: auto;
    inline-size: fit-content;
  }

  .v-carousel[data-orientation='vertical'][data-indicators='inside'] .v-carousel-indicators {
    inset-block: 0;
    inset-inline: auto var(--vectis-space-3);
    block-size: fit-content;
    margin-block: auto;
    margin-inline: 0;
  }

  /*
   * The dot is 8px but the control is not: a 24px transparent hit area is what
   * satisfies `target-size` without inflating the visual.
   */
  .v-carousel-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    min-inline-size: var(--vectis-control-height-xs);
    min-block-size: var(--vectis-control-height-xs);
    padding: 0;
    cursor: pointer;
    background: none;
    border: 0;
    border-radius: var(--vectis-radius-pill);
  }

  .v-carousel-indicator:focus-visible {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: calc(-1 * var(--vectis-focus-ring-width));
  }

  .v-carousel-dot {
    display: block;
    inline-size: var(--vectis-control-size-carousel-indicator);
    block-size: var(--vectis-control-size-carousel-indicator);
    background: var(--vectis-color-border-strong);
    border-radius: var(--vectis-radius-pill);
    transition:
      inline-size var(--vectis-duration-base) var(--vectis-ease-default),
      block-size var(--vectis-duration-base) var(--vectis-ease-default),
      background var(--vectis-duration-base) var(--vectis-ease-default);
  }

  .v-carousel-indicator:hover .v-carousel-dot {
    background: var(--vectis-color-text-subtle);
  }

  /* The current dot stretches into a pill ALONG THE SCROLL AXIS. */
  .v-carousel-indicator[aria-current] .v-carousel-dot {
    inline-size: var(--vectis-control-size-carousel-indicator-active);
    background: var(--vectis-color-accent);
  }

  .v-carousel[data-orientation='vertical'] .v-carousel-indicator[aria-current] .v-carousel-dot {
    inline-size: var(--vectis-control-size-carousel-indicator);
    block-size: var(--vectis-control-size-carousel-indicator-active);
  }

  /*
   * `inside` dots sit on the SLIDE, not on the page, so they are deliberately
   * theme-independent: their backdrop is arbitrary media, and `text-on-accent` is
   * the DS's "drawn on top of a coloured surface" colour — white in both themes,
   * exactly like the label on an accent button.
   *
   * The ring is what replaces the pill. A flat colour cannot be guaranteed against
   * an unknown image, so the dot carries BOTH halves of the classic pair: a white
   * fill for dark media and a dark hairline for light media. Drawn with
   * `box-shadow`, so it costs no layout and the dots stay 8px.
   *
   * `surface-inverse` for the ring rather than a colour primitive: it is dark in
   * BOTH themes (neutral-900 / neutral-800), which is the property the ring needs,
   * and it keeps this sheet on semantic tokens like every other component.
   *
   * Translucency is safe here where it was not on the bar: a dot holds no text, so
   * `color-contrast` never runs on it — the rule that made the bar opaque was about
   * text drawn OVER the bar, and there is none. What the ring answers is WCAG
   * 1.4.11, and it answers it on any backdrop rather than on a judged one.
   */
  .v-carousel[data-indicators='inside'] .v-carousel-dot {
    background: color-mix(in oklab, var(--vectis-color-text-on-accent) 55%, transparent);
    box-shadow: 0 0 0 1px color-mix(in oklab, var(--vectis-color-surface-inverse) 45%, transparent);
  }

  .v-carousel[data-indicators='inside'] .v-carousel-indicator:hover .v-carousel-dot,
  .v-carousel[data-indicators='inside'] .v-carousel-indicator[aria-current] .v-carousel-dot {
    background: var(--vectis-color-text-on-accent);
  }

  @media (prefers-reduced-motion: reduce) {
    /*
     * `animation: none` and not `animation-name: none`: it also drops the timeline
     * binding, so the effect stops sampling the scroller altogether.
     */
    .v-carousel-effect {
      animation: none;
    }

    .v-carousel-viewport {
      scroll-behavior: auto;
    }

    .v-carousel-controls,
    .v-carousel-dot {
      transition: none;
    }
  }
}
</style>
