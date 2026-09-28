<script setup lang="ts">
// @keyboard @a11y @ssr @core
/**
 * Native scroll snapping and CSS timelines drive slides. JavaScript supplies page measurements,
 * keyboard controls, autoplay and effects where browser support is absent.
 */

import {
  cloneVNode,
  computed,
  onBeforeUnmount,
  onMounted,
  nextTick,
  ref,
  provide,
  watch,
  watchEffect,
} from 'vue'
import type { StyleValue } from 'vue'

import VIcon from '../VIcon/VIcon.vue'
import { iconProps } from '../VIcon/iconProps'
import { arrow_downward_alt as arrowDownwardAltIcon } from '../VIcon/icons/arrow_downward_alt'
import { arrow_left_alt as arrowLeftAltIcon } from '../VIcon/icons/arrow_left_alt'
import { arrow_right_alt as arrowRightAltIcon } from '../VIcon/icons/arrow_right_alt'
import { arrow_upward_alt as arrowUpwardAltIcon } from '../VIcon/icons/arrow_upward_alt'
import type { IconSource } from '../VIcon/types'
import VIconButton from '../VIconButton/VIconButton.vue'
import { carouselKey } from './context'

import { cssSize } from '../../utils/css'
import { isRtl } from '../../utils/direction'
import { isDev } from '../../utils/env'
import { isKeyboardFocus } from '../../utils/focus'
import { clamp } from '../../utils/number'

import { useAriaLabel } from '../../composables/useAriaLabel'
import { useSlotNodes } from '../../composables/useSlotNodes'
import { useTimer } from '../../composables/useTimer'
import { useMessages } from '../../i18n/state'

/** How one slide gives way to the next: sliding, fading in place, or scaling down. */
export type CarouselEffect = 'slide' | 'fade' | 'scale'
/** Whether the carousel scrolls across the page or down it. */
export type CarouselOrientation = 'horizontal' | 'vertical'

/** What the `#controls` slot receives. */
export interface CarouselControlsSlotProps {
  /** Moves one position back. */
  previous: () => void
  /** Moves one position forward. */
  next: () => void
  /** Whether there is no position before this one (always false when looping). */
  atStart: boolean
  /** Whether there is no position after this one (always false when looping). */
  atEnd: boolean
  /** The current position, from 0. */
  index: number
  /** How many slides there are. */
  count: number
  /** How many positions the carousel can actually rest on, which is usually fewer. */
  pageCount: number
  /** Which way it scrolls: a bar of your own cannot choose its icons without knowing. */
  orientation: CarouselOrientation
}

/** What the `#indicators` slot receives. */
export interface CarouselIndicatorsSlotProps {
  /** The current position, from 0. */
  index: number
  /** How many slides there are. */
  count: number
  /** How many positions there are: render one control per position, not per slide. */
  pageCount: number
  /** Moves to a position. */
  goTo: (index: number) => void
  /** Which way the carousel scrolls. */
  orientation: CarouselOrientation
}

/** What the `#indicator` slot receives. */
export interface CarouselIndicatorSlotProps {
  /** The position this dot stands for, from 0. */
  index: number
  /** Whether it is the current one. */
  active: boolean
}
/** Where the position dots go: nowhere, over the slides, or after them. */
export type CarouselIndicators = false | 'inside' | 'outside'
/** Where the previous and next buttons go: nowhere, over the slides, or beside them. */
export type CarouselControls = false | 'inside' | 'outside'
/** When those buttons are visible. */
export type CarouselControlsVisibility = 'always' | 'hover'

interface CarouselProps {
  /**
   * How many slides may be visible at once. It is a MAXIMUM and not a target: the floor below
   * decides how many actually fit, which makes the whole thing responsive without a single
   * breakpoint.
   */
  itemsPerView?: number
  /**
   * How small a slide is allowed to get. Once an equal share would fall below this, fewer
   * slides fit and the carousel simply scrolls further instead.
   */
  itemMinSize?: number | string
  /** How much of the NEXT slide is left showing, as a hint that there is more. */
  peek?: number | string
  /** The space between two slides. */
  gap?: number | string
  /** Whether the carousel scrolls across the page or down it. */
  orientation?: CarouselOrientation
  /**
   * How one slide gives way to the next, driven by the scroll itself. Asked for otherwise, it
   * falls back to sliding rather than degrading.
   */
  effect?: CarouselEffect
  /** The height of the visible area. */
  height?: number | string
  /**
   * Whether the carousel comes back round: past the last position it returns to the first, and
   * before the first it goes to the last. Off by default, which stops it at both ends.
   */
  loop?: boolean
  /**
   * Whether a move of more than one page keeps the whole scroll instead of going straight
   * there. Off by default: a dot five pages away lands at once and plays the transition once,
   * on arrival.
   */
  noJump?: boolean
  /**
   * How long each slide is shown before the next one, in milliseconds; zero means it does not
   * advance by itself.
   */
  autoplay?: number
  /**
   * Where the previous and next buttons go: over the slides, beside them, or nowhere. Placed
   * beside, they sit at the ends of the scrolling axis and their room is reserved as padding,
   * so the component's footprint is unchanged and the slides narrow instead.
   */
  controls?: CarouselControls
  /**
   * Where the position dots go: over the slides, after them, or nowhere. After them means
   * below when the carousel scrolls across the page, and beside it when it scrolls down.
   */
  indicators?: CarouselIndicators
  /**
   * Whether those buttons are always visible, or appear when the pointer is over the carousel
   * or the keyboard focus is inside it.
   */
  controlsVisibility?: CarouselControlsVisibility
  /** The icon of the previous button. It follows the orientation by default. */
  prevIcon?: IconSource
  /** The icon of the next button. It follows the orientation by default. */
  nextIcon?: IconSource
  /** What the previous button does, in words. It falls back to the dictionary. */
  prevLabel?: string
  /** What the next button does, in words. It falls back to the dictionary. */
  nextLabel?: string
  /** What screen readers announce for the carousel as a whole. */
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
  loop: false,
  noJump: false,
  autoplay: 0,
  controls: 'inside',
  indicators: 'outside',
  controlsVisibility: 'always',
  prevIcon: undefined,
  nextIcon: undefined,
  prevLabel: undefined,
  nextLabel: undefined,
  label: undefined,
})

defineSlots<{
  /** The slides. */
  default(): unknown
  controls?(props: CarouselControlsSlotProps): unknown
  /** Replaces the whole bar of dots. */
  indicators?(props: CarouselIndicatorsSlotProps): unknown
  /**
   * Replaces what is drawn INSIDE one dot. The button itself, and everything that makes it
   * announce and behave correctly, stays the design system's.
   */
  indicator?(props: CarouselIndicatorSlotProps): unknown
}>()

/**
 * Which slide is current: the first one fully visible when several fit at once, which is also
 * the position the carousel has come to rest on.
 */
const model = defineModel<number>({ default: 0 })

const m = useMessages()
const ariaLabel = useAriaLabel(() => props.label ?? m.value.carousel.label)
const resolvedPrevLabel = computed(() => props.prevLabel ?? m.value.carousel.previous)
const resolvedNextLabel = computed(() => props.nextLabel ?? m.value.carousel.next)
const isVertical = computed(() => props.orientation === 'vertical')
/* Arrows with a shaft rather than the chevrons VTabs and VPagination use, and the
   difference is the surface they sit on: those two put their control in a dense bar,
   where a chevron is exactly the right weight, while this pair is a round button laid
   over whatever media the slides carry. A hairline chevron dissolves at the centre of
   a 40px disc; a shaft fills it and reads at a glance. */
const resolvedPrevIcon = computed(
  () => props.prevIcon ?? (isVertical.value ? arrowUpwardAltIcon : arrowLeftAltIcon),
)
const resolvedNextIcon = computed(
  () => props.nextIcon ?? (isVertical.value ? arrowDownwardAltIcon : arrowRightAltIcon),
)

// @ssr
/*
 * The count comes from the slot's VNODES, never from a registry the items feed at mount: a
 * registry renders 0 slides on the server and N on the client; a guaranteed hydration mismatch,
 * and the very reason VTabs derives `hasPanels` from `slots` too. `cloneVNode` is then what
 * carries each slide its position: `setup()` order is deterministic on the first render but not
 * on a later insertion, so a self-incrementing counter would drift.
 */
const slides = useSlotNodes()
const count = computed(() => slides.value.length)

// A functional component: it renders already-captured VNodes, which
// <component :is> cannot do (it expects a definition). The VAvatarGroup idiom.
const Slides = () =>
  slides.value.map((node, index) => cloneVNode(node, { index, key: node.key ?? index }))

/*
 * A peek of ZERO is no peek: the sizing formula collapses exactly to the peekless one, so
 * `peek: 0` (or `'0px'`) must not cost the effect. A length `parseFloat` cannot read; a
 * `calc()`; is taken as a real strip, the side that never piles slides up.
 */
const hasPeek = computed(
  () => props.peek !== undefined && Number.parseFloat(String(props.peek)) !== 0,
)
const resolvedEffect = computed<CarouselEffect>(() =>
  props.effect === 'fade' && (props.itemsPerView > 1 || hasPeek.value) ? 'slide' : props.effect,
)

provide(carouselKey, {
  get slideRoleDescription() {
    return m.value.carousel.slideRoleDescription
  },
  slideLabel: (index: number) => m.value.carousel.slide(index + 1, count.value),
})

/*
 * The jump one-shot, which replaces the travel whenever the model moves by more than one page
 * (see `scrollToIndex`). Two pieces of state, both read from the sheet: `jumpPhase` alternates
 * between two IDENTICAL keyframe names, and that is the whole reason there are two.
 */
const jumpPhase = ref<'a' | 'b'>()
const jumpDirection = ref(1)

/*
 * The one-shot is taken off once it has played. Left on the root, it would play again on every
 * slide mounted LATER (a lazy page, a re-keyed list): an animation starts when its element is
 * created with a name, and in `fade` the newcomers would flash in from zero.
 */
function onAnimationEnd(event: AnimationEvent) {
  if (!event.animationName.startsWith('v-carousel-jump-')) return
  const owner = (event.target as Element | null)?.closest('.v-carousel')
  if (owner === event.currentTarget) jumpPhase.value = undefined
}

const rootStyle = computed<StyleValue>(() => ({
  '--carousel-per-view': String(props.itemsPerView),
  '--carousel-item-min': cssSize(props.itemMinSize),
  '--carousel-peek': cssSize(props.peek),
  '--carousel-gap': cssSize(props.gap),
  '--carousel-viewport-block': cssSize(props.height),
  '--carousel-jump-dir': String(jumpDirection.value),
}))

const viewportEl = ref<HTMLElement | null>(null)

/*
 * Raised while a programmatic scroll is in flight, so the read-back does not fight the request:
 * without it, asking for slide 4 is overwritten by 1, 2 and 3 as they pass under the port. A
 * `ref` and not a plain `let`, because LOWERING it must be able to re-run the sync.
 */
const settling = ref(false)

/*
 * Lowering the guard alone hands that stale index to the watcher, which writes it while
 * `readBack` suppresses the correcting scroll: the dot then sits one page ahead, for good. It
 * is the CALL that removes the race, not its position; the sync watcher is a `pre` one, so both
 * writes land in the same flush and it runs once on the final values.
 */
const onScrollEnd = () => {
  const port = viewportEl.value
  if (port) measure(port)
  settling.value = false
}

/*
 * `scrollToIndex`'s "already there" test does not cover it: that holds only at rest, and
 * mid-gesture the delta is real. Nothing needs writing anyway; the scroller is already where
 * the read-back read it.
 */
let readBack = false

/**
 * How far slide `index`'s start edge sits from the port's, right now. `undefined` when
 * the slide is gone, which the deferred correction below has to ask again about: it runs
 * a frame later, and a consumer is free to have changed the slides in between.
 */
function deltaTo(port: HTMLElement, index: number) {
  const slide = port.querySelector<HTMLElement>(`:scope > [data-carousel-index='${index}']`)
  if (!slide) return
  const target = slide.getBoundingClientRect()
  // The VIEWPORT's rect, not the stage's: every DOM read in this component is
  // viewport-scoped, and the `outside` gutter is padding on the root, so nothing here
  // has to know about it.
  const origin = port.getBoundingClientRect()
  return { left: target.left - origin.left, top: target.top - origin.top }
}

/** Under a pixel on both axes is the scroller already being where it was asked to go. */
const arrived = (delta: { left: number; top: number }) =>
  Math.abs(delta.left) < 1 && Math.abs(delta.top) < 1

/**
 * Writes the DOM from the model. A move of MORE than one is a JUMP: it scrolls `instant` and
 * plays a one-shot instead.
 */
function scrollToIndex(index: number, from = index) {
  const port = viewportEl.value
  if (!port) return
  const delta = deltaTo(port, index)
  if (!delta) return
  const { left, top } = delta
  /*
   * Already there; which a model change coming FROM the read-back looks like. Arming the guard
   * here would be the other way to strand it: no movement means no `scrollend` to lower it
   * again.
   */
  if (arrived(delta)) return

  // `noJump` cancels the one-shot along with the cut, and has to: played over a travel
  // still in flight it would hold `fade`'s opacity at its own value for 200ms while the
  // scroller was several slides from where the animation says it has arrived.
  const jump = !props.noJump && Math.abs(index - from) > 1
  /*
   * Armed after the guards, so a jump that scrolls nothing animates nothing; and armed here
   * rather than in the watcher because the flush that carries these two writes to the DOM is a
   * microtask, hence still ahead of the paint that shows the new position. Set them a frame
   * later and `fade` flashes its destination at full opacity before dropping to zero to fade it
   * back in.
   */
  if (jump) {
    jumpDirection.value = index > from ? 1 : -1
    jumpPhase.value = jumpPhase.value === 'a' ? 'b' : 'a'
  }
  settling.value = true
  port.scrollBy?.(jump ? { left, top, behavior: 'instant' } : { left, top })

  /*
   * A jump measures once more, a frame later, and corrects. A relative delta read while another
   * scroll is in flight is already stale: a smooth scroll is driven off the main thread, so the
   * rects above lag the position the delta lands on by a frame or two, and `instant` then
   * freezes the error in; the browser does not re-snap after an explicit programmatic scroll.
   */
  if (jump)
    requestAnimationFrame(() => {
      const again = deltaTo(port, index)
      if (again && !arrived(again)) port.scrollBy?.({ ...again, behavior: 'instant' })
    })
}

watch(model, (index, previous) => {
  // The guard is what stops the two directions chaining: without it the model write the
  // read-back has just made comes straight back as a scroll, fighting the finger mid-drag.
  // See the flag's own declaration for why `scrollToIndex`'s "already there" test does not
  // cover it.
  if (readBack) return
  // The watcher's own previous value and not `observedIndex`: it is the last COMMITTED page,
  // defined before the first measurement and immune to a reading in flight.
  void nextTick(() => scrollToIndex(index, previous))
})

const observedIndex = ref<number>()
const measuredPages = ref<number>()

/** Slack, in pixels, on every comparison below. */
const SLACK = 2

/*
 * The slides are the viewport's children, never its descendants. A carousel placed in a slide
 * carries the same attribute on its own slides, and a descendant query then reads the inner
 * slide 0 as the outer slide 1: the step measures 0, the page count and the read-back freeze,
 * and "next" scrolls to the inner slide.
 */
const SLIDES = ':scope > [data-carousel-index]'

/**
 * Read slide positions directly: IntersectionObserver reports threshold crossings, so peek and
 * fractional layouts can leave ratios stale throughout a backward scroll.
 */
function measure(port: HTMLElement) {
  const boxes = port.querySelectorAll<HTMLElement>(SLIDES)
  const first = boxes[0]?.getBoundingClientRect()
  const second = boxes[1]?.getBoundingClientRect()
  const last = boxes[boxes.length - 1]?.getBoundingClientRect()
  if (!first || !second || !last) return
  const origin = port.getBoundingClientRect()
  const vertical = isVertical.value
  const step = vertical ? Math.abs(second.top - first.top) : Math.abs(second.left - first.left)
  // No layout at all (jsdom, a display:none ancestor). Writing a 0 here would drag
  // every clamp down with it; the prop-derived fallback stays the answer until there
  // IS a layout.
  if (step <= 0) return
  // How far the scroller has travelled: the first slide's start edge has left the
  // port's by exactly that much.
  const offset = vertical ? Math.abs(first.top - origin.top) : Math.abs(first.left - origin.left)
  // Outer edge to outer edge, picked by comparison rather than by index: in RTL the last
  // slide is the LEFTMOST box, so naming the sides would need a direction test.
  const span = vertical
    ? Math.max(first.bottom, last.bottom) - Math.min(first.top, last.top)
    : Math.max(first.right, last.right) - Math.min(first.left, last.left)
  const scrollable = span - (vertical ? port.clientHeight : port.clientWidth)

  const starts = Math.floor((scrollable + SLACK) / step)
  const residual = scrollable - starts * step
  const pages = starts + 1 + (residual > SLACK ? 1 : 0)
  // The end of the track is recognized by POSITION and not by rounding: it is the one page that
  // is not a multiple of `step`, so rounding would name the start position it falls short of;
  // the page the user has just left.
  const page = offset >= scrollable - SLACK ? pages - 1 : Math.round(offset / step)

  measuredPages.value = pages
  /*
   * Clamped against `pageCount` and not against the local `pages`, because that is the one
   * which also caps at `count`, and the write above is what makes it fresh. A slide LARGER than
   * the port is the case that needs it: `starts` already reaches the last slide there and the
   * leftover still mints a page, so the raw answer names an index no slide carries;
   * `scrollToIndex` would then silently do nothing and `settling` would never come back down.
   */
  observedIndex.value = clamp(page, 0, pageCount.value - 1)
}

// @ssr @fallback
/** SSR, jsdom and the first paint. */
const pageCount = computed(() =>
  count.value === 0
    ? 0
    : clamp(measuredPages.value ?? count.value - props.itemsPerView + 1, 1, count.value),
)

/*
 * Re-arm observers when slide keys change, even if the count stays equal: Vue replaces those
 * elements and observers on detached nodes stop reporting.
 */
const slideKeys = computed(() =>
  JSON.stringify(slides.value.map((node, index) => String(node.key ?? index))),
)

/*
 * `1` must stay in `threshold`. Nothing READS a ratio, but the buckets still decide WHEN this
 * callback runs, and this observer is what makes the component cover a ROOT RESIZE; which an
 * IntersectionObserver does not do on its own, queueing an entry only on a threshold crossing.
 */
/*
 * Started in `onMounted`, and so are the two watches further down that read the page count. A
 * watch evaluates its source at once, and every one of these reaches the slot through `slides`:
 * at setup that is a slot call outside the render, which Vue warns about for every slot passed
 * as a function (a render function, JSX).
 */
onMounted(() =>
  watch(
    [viewportEl, slideKeys],
    ([port], _previous, onCleanup) => {
      // @fallback
      // IntersectionObserver exists neither in SSR nor in jsdom: `scrollend` still
      // measures there, and the whole loop is verified in the browser (play functions).
      if (!port || typeof IntersectionObserver === 'undefined') return
      const observer = new IntersectionObserver(
        () => {
          measure(port)
          // The request has arrived, so there is nothing left to protect. This is also the only
          // exit when the browser clamps a programmatic scroll to no movement at all;
          // `scrollend` never fires there.
          if (observedIndex.value === model.value) settling.value = false
        },
        { root: port, threshold: [0, 0.25, 0.5, 0.75, 1] },
      )
      for (const slide of port.querySelectorAll(SLIDES)) observer.observe(slide)
      onCleanup(() => observer.disconnect())
    },
    { flush: 'post', immediate: true },
  ),
)

// Watching `settling` as well as the reading is the whole point of making it a ref:
// whichever of the two lands last, the sync runs.
watch([observedIndex, settling], () => {
  const index = observedIndex.value
  if (settling.value || index === undefined || index === model.value) return
  readBack = true
  model.value = index
  /*
   * The pre-flush watcher runs inside the flush this write schedules, a `nextTick` callback
   * only after it; so it has read the flag by the time this lands.
   */
  void nextTick(() => (readBack = false))
})

/*
 * The `loop` prop, resolved once against what there is to loop through, because below two
 * positions it is not merely pointless but wrong twice over: the modulo would divide by zero on
 * an empty carousel, and on a single page it would hand the reader two enabled buttons that
 * move nothing; where the disabled pair says the truth. So the prop asks, and this is the
 * answer every consumer below reads.
 */
const looping = computed(() => props.loop && pageCount.value > 1)

/*
 * Pure derivations, and they may be only because `pageCount` never over-counts: index 0 is
 * always reachable and so is `pageCount - 1`, by construction. That is the load-bearing
 * premise; an over-count makes `atEnd` false at the real end, and autoplay then re-arms its
 * timer on every bounce, forever.
 */
const atStart = computed(() => !looping.value && model.value <= 0)
const atEnd = computed(() => !looping.value && model.value >= pageCount.value - 1)

function goTo(index: number) {
  const pages = pageCount.value
  /*
   * The DOUBLE modulo. JS `%` keeps the sign of the dividend, so `previous()` at 0 gives
   * `-1 % 5 === -1`; a single one hands the model an index no slide carries, `scrollToIndex`
   * finds nothing, and the carousel stops dead with no error anywhere.
   */
  model.value = looping.value ? ((index % pages) + pages) % pages : clamp(index, 0, pages - 1)
}
// @core
/*
 * Out of range, no dot is current, the live region announces a slide that does not exist, and
 * past the last page `settling` never comes back down: the browser clamps the scroll to no
 * movement, so no `scrollend` arrives to lower it.
 */
onMounted(() =>
  watch(
    [model, pageCount],
    ([index, pages]) => {
      if (pages === 0) return
      const bounded = Number.isFinite(index) ? clamp(Math.round(index), 0, pages - 1) : 0
      if (bounded !== index) model.value = bounded
    },
    { immediate: true },
  ),
)

const previous = () => goTo(model.value - 1)
const next = () => goTo(model.value + 1)

// @keyboard
/** The one keyboard concession, and it is not the one it looks like. */
function onKeydown(event: KeyboardEvent) {
  const port = viewportEl.value
  if (!port || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
  // A key typed INSIDE a slide belongs to what holds the focus there: a caret in a field,
  // a nested VTabs or VSlider, another carousel. Only the viewport itself is ours.
  if (event.target !== event.currentTarget || event.defaultPrevented) return

  if (event.key === 'Home' || event.key === 'End') {
    event.preventDefault()
    goTo(event.key === 'Home' ? 0 : pageCount.value - 1)
    return
  }

  // Only the axis the carousel actually scrolls: the other one must stay with the browser,
  // which still scrolls a slide taller than the viewport.
  const steps: Record<string, number | undefined> = isVertical.value
    ? { ArrowUp: -1, ArrowDown: 1 }
    : { ArrowLeft: -1, ArrowRight: 1 }
  const step = steps[event.key]
  if (step === undefined) return
  event.preventDefault()
  // The inline arrows are physical, hence inverted in RTL (the `arrowNav` rule); the block axis
  // does not flip.
  const rtl = !isVertical.value && isRtl(port)
  goTo(model.value + (rtl ? -step : step))
}

// @a11y
/*
 * A control that disables itself under the keyboard focus would drop it on `<body>`. It is
 * handed to the opposite control, or to the viewport when both ends are reached (a single
 * page).
 */
onMounted(() =>
  watch([atStart, atEnd], ([start, end], [wasStart, wasEnd]) => {
    const port = viewportEl.value
    const stage = port?.parentElement
    if (!port || !stage) return
    const [back, forward] = stage.querySelectorAll<HTMLElement>(
      ':scope > .v-carousel-controls > .v-carousel-control',
    )
    const active = document.activeElement
    if (start && !wasStart && active === back) (end ? port : forward)?.focus()
    else if (end && !wasEnd && active === forward) (start ? port : back)?.focus()
  }),
)

const { start, cancel } = useTimer()
const hovered = ref(false)
// @a11y
// KEYBOARD focus, not any focus, hence `isKeyboardFocus` rather than a bare `focusin` flag.
// Clicking `next` leaves the focus on it, and a plain flag would then pause the rotation for
// good; the user has to click outside the carousel to get it going again, which is not a pause,
// it is a trap.
const focused = ref(false)

const reducedMotion = ref(false)

/*
 * `autoplay > 0` is a GUARD, not a default: `useTimer` runs a delay ≤ 0 synchronously (the DS
 * convention), and a synchronous callback bumping the model would recurse until the stack
 * blows. It is ALSO the consumer's stop control; the prop is reactive, so binding it to `0`
 * cancels the timer on the spot, which a pause button of your own would drive.
 */
const rotating = computed(
  () =>
    props.autoplay > 0 && !hovered.value && !focused.value && !reducedMotion.value && !atEnd.value,
)

// `immediate`: without it the first delay would only be armed by a LATER change,
// so an autoplay that nobody touches would never advance at all. Started on MOUNT: a
// server render never unmounts, so a timer armed there would outlive the request and
// fire `next` on a dead instance.
onMounted(() =>
  watch(
    [rotating, model],
    () => {
      cancel()
      if (rotating.value) start(next, props.autoplay)
    },
    { immediate: true },
  ),
)

// @a11y @ssr
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

// @a11y
/*
 * Announced only at rest: narrating an auto-rotating carousel floods the screen reader, so the
 * region is `aria-live="off"` while it rotates (APG). The TEXT always follows the model:
 * emptied while rotating instead, a hover that pauses the rotation would write it back and be
 * announced with nothing having moved.
 */
const liveMessage = computed(() =>
  count.value === 0 ? '' : m.value.carousel.slide(model.value + 1, count.value),
)

// @devwarn
if (isDev) {
  // Once per instance each: the loop warning names the very binding it recommends, and
  // that binding re-runs this effect on every pause and resume.
  const warned = new Set<string>()
  const warn = (id: string, message: string) => {
    if (warned.has(id)) return
    warned.add(id)
    console.warn(message)
  }
  watchEffect(() => {
    if (props.effect !== resolvedEffect.value)
      warn(
        'fade',
        props.itemsPerView > 1
          ? '[VCarousel] `fade` needs one item per view: over a single view timeline every slide is counter-translated onto the same spot, so they would pile up. Downgraded to `slide`.'
          : '[VCarousel] `fade` and `peek` are mutually exclusive: the counter-translate parks every slide over the viewport, so the peeked strip is covered. Downgraded to `slide`.',
      )
    /*
     * What it costs is the exemption the component leans on everywhere else: content that moves
     * on its own needs a way to stop it, and the five-second grace only ever applied because
     * the rotation ENDED. Looping, it does not, and hover and focus leave a touch user with
     * nothing.
     */
    if (props.loop && props.autoplay > 0)
      warn(
        'loop',
        '[VCarousel] `loop` with `autoplay` rotates for as long as the page is open, so WCAG 2.2.2 asks for a way to stop it. Bind `autoplay` to 0 from a control of your own.',
      )
    if (isVertical.value && props.height === undefined)
      warn(
        'height',
        '[VCarousel] a vertical carousel needs a `height`: a percentage flex-basis has no definite reference on the block axis. Falling back to --vectis-control-size-carousel-block.',
      )
    if (!Number.isInteger(props.itemsPerView) || props.itemsPerView < 1)
      warn(
        'itemsPerView',
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
    :data-jump="jumpPhase"
    :data-controls="controls || undefined"
    :data-indicators="indicators || undefined"
    :data-controls-visibility="controlsVisibility"
    @pointerenter="hovered = true"
    @pointerleave="hovered = false"
    @focusin="focused = isKeyboardFocus($event.target)"
    @focusout="focused = false"
    @animationend="onAnimationEnd"
  >
    <!--
      The stage holds the viewport and the controls; and NOTHING else. The indicator bar is a
      sibling on purpose: inside this box it would join the height the controls are centred on,
      and the pair would sit visibly below the middle of the slides.
    -->
    <div class="v-carousel-stage">
      <!--
        It is also what makes the track the keyboard target of `onKeydown`; the browser's own
        arrow scrolling is real, but mandatory snapping undoes it, see there. A focusable box
        with an aria-label must carry a role, or axe reports `aria-prohibited-attr`.
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
            shape="circular"
            elevated
            :disabled="atStart"
            @click="previous"
          >
            <VIcon v-bind="iconProps(resolvedPrevIcon)" :mirrored="!isVertical" />
          </VIconButton>
          <VIconButton
            class="v-carousel-control"
            :label="resolvedNextLabel"
            variant="ghost"
            tone="neutral"
            shape="circular"
            elevated
            :disabled="atEnd"
            @click="next"
          >
            <VIcon v-bind="iconProps(resolvedNextIcon)" :mirrored="!isVertical" />
          </VIconButton>
        </div>
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
          One control per REACHABLE position, not per slide: with 6 slides three at a time the
          scroller can only lead with 1 to 4, and dots 5 and 6 would scroll nowhere. With a
          `peek` the last of them parks the scroller at the END of the track rather than on a
          slide's start edge.
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

    <span class="v-visually-hidden" role="status" :aria-live="rotating ? 'off' : 'polite'">{{
      liveMessage
    }}</span>
  </div>
</template>

<style>
@layer vectis.components {
  .v-carousel {
    /*
     * Geometry vector and direction sign. The effect keyframes are written on them once instead
     * of being duplicated per orientation and per direction: `translate` is physical, and
     * `calc(0 * -100%)` is a valid zero.
     */
    --carousel-axis-x: 1;
    --carousel-axis-y: 0;
    --carousel-dir: 1;

    /*
     * Effect constants: private, non-contractual geometry with no theming story,
     * hence no --vectis-* token (the qualification rule still applies).
     */
    --carousel-scale-min: 0.75;

    /*
     * The jump one-shot's starting point, NEUTRAL on all three axes here: each effect below
     * turns on the one dimension it owns, which lets a single pair of keyframes serve `slide`,
     * `fade` and `scale` instead of one block each. The direction sign is written from the
     * script, alongside the axis vector above.
     */
    --carousel-jump-opacity: 1;
    --carousel-jump-scale: 1;
    --carousel-jump-shift: 0%;
    --carousel-jump-dir: 1;

    /*
     * Both names are re-set on every root, to `none`, because a custom property inherits: a
     * carousel placed inside another's slide would otherwise play its host's effect and replay
     * its host's jump. Each effect and each jump phase below sets them again on the root that
     * carries the attribute.
     */
    --carousel-effect-name: none;
    --carousel-jump-name: none;

    --carousel-gap: var(--vectis-space-3);
    --carousel-item-min: 0px;
    --carousel-peek: 0px;
    --carousel-viewport-block: var(--vectis-control-size-carousel-block);
    /*
     * Room reserved on the SCROLL axis for the `outside` controls. `0px` and never `0`: it
     * feeds a `padding-*`, where a unitless zero is invalid; the `--carousel-peek` precedent
     * three lines up.
     */
    --carousel-outset: 0px;

    /*
     * Positioning context of the `inside` indicator bar, which is deliberately not a child of
     * the stage; see .v-carousel-stage.
     */
    position: relative;
    display: flex;
    flex-direction: column;
    gap: var(--vectis-space-3);
    font-family: var(--vectis-text-family);
  }

  /*
   * That is what lets every `inside` inset below be written against the stage's edges with no
   * compensation: an absolutely positioned box resolves against the PADDING box, the edges
   * those insets pin to are on the cross axis (which this never touches), and the axis they
   * centre on stays symmetric. Make this one-sided and the `inside` indicator bar goes
   * off-centre with nothing to report it.
   */
  .v-carousel[data-orientation='horizontal'] {
    padding-inline: var(--carousel-outset);
  }

  .v-carousel[data-orientation='vertical'] {
    --carousel-axis-x: 0;
    --carousel-axis-y: 1;

    flex-direction: row;
    padding-block: var(--carousel-outset);
  }

  /*
   * `control-height-md` is the size the two VIconButtons actually render at: they pass no
   * `size`, so they take VIconButton's own `md` default and their width is `--control-height`.
   * The gutter is that button plus one gap, so the pair lands flush inside the root's border
   * box and never covers a slide.
   */
  .v-carousel[data-controls='outside']:has(> .v-carousel-stage > .v-carousel-controls) {
    --carousel-outset: calc(var(--vectis-control-height-md) + var(--vectis-space-2));
  }

  /*
   * Scoped to `horizontal`: the block axis does not flip. `:dir()` and not a `[dir]` ancestor,
   * so an LTR subtree inside an RTL page reads its own direction.
   */
  .v-carousel[data-orientation='horizontal']:dir(rtl) {
    --carousel-dir: -1;
  }

  /*
   * Positioning context of the controls; and of NOTHING else. The indicator bar is a SIBLING on
   * purpose: inside this box it would join the height the controls are centred on, and an
   * `inside` pair would sit visibly below the middle of the slides.
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
   * Vertical only. The root is a `row` there, so the inline axis is the flex MAIN axis and the
   * stage would shrink-wrap the widest slide's content; an `inside` bar's `inset-inline-end`
   * would then land on the ROOT's edge instead of the slides'.
   */
  .v-carousel[data-orientation='vertical'] > .v-carousel-stage {
    flex-grow: 1;
  }

  .v-carousel-viewport {
    display: flex;
    gap: var(--carousel-gap);
    /*
     * `auto` on both axes, never `auto hidden`: clipping the cross axis would crop the focus
     * ring of any focusable slide content.
     */
    overflow: auto;
    overscroll-behavior: contain;
    /* Logical keyword: RTL and vertical need no second declaration. */
    scroll-snap-type: inline mandatory;
    scroll-behavior: smooth;
    scrollbar-width: none;
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

  .v-carousel[data-orientation='vertical'] > .v-carousel-stage > .v-carousel-viewport {
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
     * `max()` makes itemMinSize a floor, never a cap, and IS the responsiveness: no breakpoint,
     * no @container.
     */
    /*
     * LONGHANDS, never the `flex` shorthand; the `animation` rule further down, for the same
     * reason. A shorthand whose value contains `var()` becomes a PENDING SUBSTITUTION value: it
     * cannot be expanded until computed-value time, and if any one of the four custom
     * properties then resolves to something invalid the whole declaration is dropped and `flex`
     * reverts to its initial `0 1 auto`; shrink 1 and basis auto, which sizes every slide on
     * its content and destroys the snap grid.
     */
    flex-grow: 0;
    flex-shrink: 0;
    flex-basis: max(
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

  /*
   * The last slide is aligned on its END edge, and that is what declares the end of the track
   * as a snap position in its own right. As soon as a `peek` or an active `itemMinSize` makes
   * the fit fractional, that slide's START-aligned position lies past
   * `scrollWidth - clientWidth`, so the only position left near the end is a strip short of it
   * and the last slide is never fully revealed.
   */
  .v-carousel-slide:last-child {
    scroll-snap-align: end;
  }

  /*
   * Each effect names the keyframes it is written on, and the two mechanisms that play them
   * read the name from here rather than from a selector of their own; which keeps the animation
   * LISTS below written exactly once.
   */
  .v-carousel[data-effect='fade'] {
    --carousel-effect-name: v-carousel-fade;
    --carousel-jump-opacity: 0;
  }

  .v-carousel[data-effect='scale'] {
    --carousel-effect-name: v-carousel-scale;
    /* Exactly where the scroll-driven effect holds a slide off the centre, so the
       one-shot ends on the value that takes over from it. */
    --carousel-jump-scale: var(--carousel-scale-min);
  }

  .v-carousel[data-effect='slide'] {
    /*
     * A FIFTH of the slide, not its width. Every inner box shifts at once, so a full one would
     * park each over its neighbour and the overlap would paint the wrong slide for the length
     * of the run; invisible at one item per view, plain at three.
     */
    --carousel-jump-shift: 20%;
  }

  /*
   * The pair of names. `jumpPhase` alternates between two identical keyframe blocks because
   * re-setting an attribute does not restart a running animation, and `animation-name` is the
   * one thing that does.
   */
  .v-carousel-effect {
    block-size: 100%;
    animation-name: var(--carousel-jump-name, none);
    animation-duration: var(--vectis-duration-base);
    animation-timing-function: var(--vectis-ease-out);
  }

  .v-carousel[data-jump='a'] {
    --carousel-jump-name: v-carousel-jump-a;
  }

  .v-carousel[data-jump='b'] {
    --carousel-jump-name: v-carousel-jump-b;
  }

  /*
   * Progressively enhance supported scroll timelines. Animate the inner box, never the snap
   * area: transformed snap geometry would create a scroll-position feedback loop.
   */
  @supports (view-timeline-name: --v) and (animation-range: cover) {
    .v-carousel:not([data-effect='slide'])
      > .v-carousel-stage
      > .v-carousel-viewport
      > .v-carousel-slide {
      view-timeline: --carousel-view inline;
    }

    .v-carousel[data-orientation='vertical']:not([data-effect='slide'])
      > .v-carousel-stage
      > .v-carousel-viewport
      > .v-carousel-slide {
      view-timeline: --carousel-view block;
    }

    .v-carousel-effect {
      /*
       * Longhands, never the `animation` shorthand: `animation-timeline` and
       * `animation-duration` are reset-only sub-properties, so a shorthand written afterwards
       * would silently put the timeline back to `auto` and the duration to 0s, and every effect
       * would vanish with no error. six parallel lists, and their order is the arbitration.
       */
      animation-name: var(--carousel-effect-name, none), var(--carousel-jump-name, none);
      animation-timeline: --carousel-view, auto;
      animation-range: cover, normal;
      animation-fill-mode: both, none;
      animation-timing-function: linear, var(--vectis-ease-out);
      /* `auto` is the whole timeline. A duration in seconds would be taken as a
         PROPORTION of it, and the effect would end a fraction of the way in. */
      animation-duration: auto, var(--vectis-duration-base);
    }
  }

  /*
   * Over the `cover` range a slide's origin travels the whole viewport+slide distance, so a
   * counter-translate of ±100% of the slide's own size pins it on the scrollport when the two
   * are equal; which is why `fade` is defined at one item per view only. The result is a true
   * dissolve in place, gap included.
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
   * Geometry only, no opacity dimming; and that is an accessibility decision, not a taste one:
   * a slide off the centre still holds real text, and fading it is a measurable contrast loss
   * that axe rightly reports. The scale alone carries the depth.
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
   * Two IDENTICAL BLOCKS, and the duplication is the mechanism rather than an oversight:
   * `jumpPhase` alternates between these names, because a CSS animation restarts on a change of
   * `animation-name` and on nothing else. Edit one, edit both.
   */
  @keyframes v-carousel-jump-a {
    from {
      opacity: var(--carousel-jump-opacity);
      scale: var(--carousel-jump-scale);
      translate: calc(
          var(--carousel-axis-x) * var(--carousel-dir) * var(--carousel-jump-dir) *
            var(--carousel-jump-shift)
        )
        calc(var(--carousel-axis-y) * var(--carousel-jump-dir) * var(--carousel-jump-shift));
    }
    to {
      opacity: 1;
      scale: 1;
      translate: 0 0;
    }
  }

  @keyframes v-carousel-jump-b {
    from {
      opacity: var(--carousel-jump-opacity);
      scale: var(--carousel-jump-scale);
      translate: calc(
          var(--carousel-axis-x) * var(--carousel-dir) * var(--carousel-jump-dir) *
            var(--carousel-jump-shift)
        )
        calc(var(--carousel-axis-y) * var(--carousel-jump-dir) * var(--carousel-jump-shift));
    }
    to {
      opacity: 1;
      scale: 1;
      translate: 0 0;
    }
  }

  .v-carousel-controls {
    display: flex;
    /*
     * A floor, not the layout; `space-between` places the pair. It only ever shows on a stage
     * narrow enough to bring the two buttons together.
     */
    gap: var(--vectis-space-2);
    transition: opacity var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  .v-carousel[data-orientation='vertical'] > .v-carousel-stage > .v-carousel-controls {
    flex-direction: column;
  }

  /*
   * `pointer-events` is handed back to the buttons alone, so the strip does not swallow a drag
   * over the slides. Enumerated rather than a bare `[data-controls]`: a third placement has to
   * opt in by hand (the VTabs `:is()` rule).
   */
  .v-carousel:is([data-controls='inside'], [data-controls='outside'])
    > .v-carousel-stage
    > .v-carousel-controls {
    position: absolute;
    inset: 0;
    align-items: center;
    justify-content: space-between;
    pointer-events: none;
  }

  .v-carousel[data-controls='inside'] > .v-carousel-stage > .v-carousel-controls {
    inset: var(--vectis-space-2);
  }

  /*
   * `outside`: the pair is pulled out of the stage by exactly the gutter the root reserved, so
   * each button sits in that padding, one gap clear of the slides, still centred on the stage's
   * cross axis. RTL is FREE and needs no `--carousel-dir`: `inset-inline` is logical, the two
   * insets are equal so the box is direction-symmetric, and `space-between` puts `previous` at
   * the inline START; the right-hand side in RTL, where it belongs.
   */
  .v-carousel[data-controls='outside'] > .v-carousel-stage > .v-carousel-controls {
    inset-inline: calc(-1 * var(--carousel-outset));
  }

  .v-carousel[data-orientation='vertical'][data-controls='outside']
    > .v-carousel-stage
    > .v-carousel-controls {
    inset-inline: 0;
    inset-block: calc(-1 * var(--carousel-outset));
  }

  /*
   * `:has(:focus-visible)` and never `:focus-within`. A pointer click LEAVES focus on the
   * control it hit, so reading any focus pins the pair revealed until the reader clicks outside
   * the carousel entirely, long after the pointer has gone.
   */
  @media (hover: hover) {
    .v-carousel[data-controls-visibility='hover'] > .v-carousel-stage > .v-carousel-controls {
      opacity: 0;
    }

    .v-carousel[data-controls-visibility='hover']:hover > .v-carousel-stage > .v-carousel-controls,
    .v-carousel[data-controls-visibility='hover']:has(:focus-visible)
      > .v-carousel-stage
      > .v-carousel-controls {
      opacity: 1;
    }
  }

  .v-carousel-control {
    pointer-events: auto;
  }

  .v-carousel-indicators {
    display: flex;
    gap: var(--vectis-space-1);
    align-items: center;
    justify-content: center;
  }

  .v-carousel[data-orientation='vertical'] > .v-carousel-indicators {
    flex-direction: column;
  }

  /*
   * `inside`: centred on the block-end edge, with no surface of its own; a pill behind the dots
   * covers a slice of the slide the whole time, which is a lot of media to spend on six 8px
   * marks. The legibility moves into the dots instead (see below), where it costs their own
   * footprint and nothing more.
   */
  .v-carousel[data-indicators='inside'] > .v-carousel-indicators {
    position: absolute;
    inset-block-end: var(--vectis-space-3);
    inset-inline: 0;
    margin-inline: auto;
    inline-size: fit-content;
  }

  .v-carousel[data-orientation='vertical'][data-indicators='inside'] > .v-carousel-indicators {
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

  .v-carousel-indicator[aria-current] .v-carousel-dot {
    inline-size: var(--vectis-control-size-carousel-indicator-active);
    background: var(--vectis-color-accent);
  }

  .v-carousel[data-orientation='vertical']
    > .v-carousel-indicators
    > .v-carousel-indicator[aria-current]
    .v-carousel-dot {
    inline-size: var(--vectis-control-size-carousel-indicator);
    block-size: var(--vectis-control-size-carousel-indicator-active);
  }

  /*
   * `surface-inverse` is the ring colour because it is dark in both themes, which is the
   * property needed here. Drawn as a `box-shadow`, so it costs no layout and the dots stay 8px.
   */
  .v-carousel[data-indicators='inside'] > .v-carousel-indicators .v-carousel-dot {
    background: color-mix(in oklab, var(--vectis-color-text-on-accent) 55%, transparent);
    box-shadow: 0 0 0 1px color-mix(in oklab, var(--vectis-color-surface-inverse) 45%, transparent);
  }

  .v-carousel[data-indicators='inside']
    > .v-carousel-indicators
    > .v-carousel-indicator:hover
    .v-carousel-dot,
  .v-carousel[data-indicators='inside']
    > .v-carousel-indicators
    > .v-carousel-indicator[aria-current]
    .v-carousel-dot {
    background: var(--vectis-color-text-on-accent);
  }

  /*
   * Forced colours flatten a background to `Canvas` and drop every shadow, and a dot is made of
   * nothing else: left alone, every dot and the current page's pill vanish. Each dot draws its
   * own edge and the current one the system selection colour.
   */
  @media (forced-colors: active) {
    .v-carousel-indicator
      .v-carousel-dot.v-carousel-dot.v-carousel-dot.v-carousel-dot.v-carousel-dot {
      forced-color-adjust: none;
      background: Canvas;
      box-shadow: inset 0 0 0 1px CanvasText;
    }

    .v-carousel-indicator:hover
      .v-carousel-dot.v-carousel-dot.v-carousel-dot.v-carousel-dot.v-carousel-dot {
      box-shadow: inset 0 0 0 1px Highlight;
    }

    .v-carousel-indicator[aria-current]
      .v-carousel-dot.v-carousel-dot.v-carousel-dot.v-carousel-dot.v-carousel-dot {
      background: Highlight;
      box-shadow: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    /*
     * `animation: none` and not `animation-name: none`: it also drops the timeline binding, so
     * the effect stops sampling the scroller altogether. Being the shorthand is also what takes
     * the jump one-shot with it, both animations living in the same list; a jump then simply
     * lands, which the preference asks for and what `scroll-behavior: auto` below already does
     * to the travel.
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
