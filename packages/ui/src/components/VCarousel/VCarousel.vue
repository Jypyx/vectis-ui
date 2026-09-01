<script setup lang="ts">
// @keyboard @a11y @ssr @core — the DS's densest script; every block below carries
// its own tag.
/**
 * Content the reader moves through one screenful at a time — images, cards, text — across
 * the page or down it.
 *
 * ONE mechanism: a native `scroll-snap` scroller. Touch, the trackpad, the scrollbar and the
 * snapping all come from the browser, so there is no `transform` track and no cloned slide
 * anywhere — `loop` included, where going past the last slide scrolls the real track back to
 * the first.
 *
 * Responsiveness is 100% CSS with no breakpoint and no observer: `itemsPerView` is a MAXIMUM,
 * `itemMinSize` a floor, and `max()` between them inside the slide's `flex-basis` IS the
 * query. The `peek` strip falls out of the same formula.
 *
 * The effects are scroll-driven animations, so they follow the finger and reverse with it.
 * They are progressive enhancement: without support the carousel simply slides.
 *
 * The JS is limited to what nothing else can do — scrolling to the Nth child, reading back
 * which page the reader landed on and measuring how many pages there are (subtler than it
 * sounds: not every slide can lead, and the last position is the END of the track), the
 * autoplay timer, and the arrow keys, which a focused scroller answers with a fixed pixel
 * step that snapping immediately undoes.
 */

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
import { flattenSlot } from '../../utils/vnode'

import { useAriaLabel } from '../../composables/useAriaLabel'
import { useTimer } from '../../composables/useTimer'
import { useMessages } from '../../i18n/state'

export type CarouselEffect = 'slide' | 'fade' | 'scale' | 'cover'
export type CarouselOrientation = 'horizontal' | 'vertical'
/** Where the position dots go: nowhere, over the slides, or after them. */
export type CarouselIndicators = false | 'inside' | 'outside'
/** Where the previous and next buttons go: nowhere, over the slides, or beside them. */
export type CarouselControls = false | 'inside' | 'outside'
/**
 * When those buttons are visible. It is a named choice rather than a yes-or-no, because
 * "on hover" would misname what actually happens: they also appear on keyboard focus, and
 * they stay permanently visible where there is no pointer to hover with.
 */
export type CarouselControlsVisibility = 'always' | 'hover'

interface CarouselProps {
  /**
   * How many slides may be visible at once. It is a MAXIMUM and not a target: the floor
   * below decides how many actually fit, which is what makes the whole thing responsive
   * without a single breakpoint.
   */
  itemsPerView?: number
  /**
   * How small a slide is allowed to get. Once an equal share would fall below this, fewer
   * slides fit and the carousel simply scrolls further instead. A number is read as
   * pixels; anything else is used as given, so `'20vw'` works.
   */
  itemMinSize?: number | string
  /**
   * How much of the NEXT slide is left showing, as a hint that there is more. It includes
   * the gap before it, which is what keeps the sizing formula free of special cases.
   *
   * It cannot be combined with the fade transition: fading assumes a slide exactly fills
   * the view.
   */
  peek?: number | string
  /** The space between two slides. */
  gap?: number | string
  /** Whether the carousel scrolls across the page or down it. */
  orientation?: CarouselOrientation
  /**
   * How one slide gives way to the next, driven by the scroll itself. Sliding means no
   * animation at all.
   *
   * Fading requires ONE slide at a time and no peek — it works by holding each slide in
   * place while the scroll moves under it, which only lands correctly when a slide fills
   * the view exactly. Asked for otherwise, it falls back to sliding rather than degrading.
   */
  effect?: CarouselEffect
  /**
   * The height of the visible area.
   *
   * GIVE ONE when the carousel scrolls downwards: a slide sized as a share of the height
   * needs a height to take a share OF, and without it every slide collapses onto its own
   * content. Scrolling across the page, the height comes from the slides themselves.
   */
  height?: number | string
  /**
   * Whether the carousel comes back round: past the last position it returns to the first,
   * and before the first it goes to the last. Off by default, which stops it at both ends.
   *
   * Nothing is cloned to achieve it. Coming back round scrolls the REAL track back, so the
   * reader sees it rewind — over several slides that is a visible movement, and it is the
   * honest one: the carousel really is returning to where it started.
   *
   * It has no effect where there is only one position to rest on, and the buttons stay
   * disabled there rather than becoming two controls that do nothing. The dots always go
   * straight to the position they name, and so do the Home and End keys.
   */
  loop?: boolean
  /**
   * How long each slide is shown before the next one, in milliseconds; zero means it does
   * not advance by itself. It stops at the last page unless the carousel loops — in which
   * case it goes round for as long as the page is open — pauses while the pointer rests on
   * it or the KEYBOARD focus is inside it, and never runs at all for a reader who has asked
   * for less motion.
   *
   * The component deliberately renders NO pause button. This prop is reactive and setting
   * it to zero cancels the timer at once, so a stop control is a one-line binding on your
   * side — and it is worth adding: the guideline asks for a way to stop content that moves
   * on its own, and hover and focus leave a touch user with none. Looping makes that
   * binding MANDATORY rather than advisable, the movement no longer ending on its own.
   */
  autoplay?: number
  /**
   * Where the previous and next buttons go: over the slides, beside them, or nowhere.
   *
   * Placed beside, they sit at the ends of the scrolling axis and their room is reserved
   * as padding, so the component's footprint is unchanged and the slides narrow instead.
   * Either way they are centred on the SLIDES and never on the slides plus the dots.
   */
  controls?: CarouselControls
  /**
   * Where the position dots go: over the slides, after them, or nowhere. After them means
   * below when the carousel scrolls across the page, and beside it when it scrolls down.
   */
  indicators?: CarouselIndicators
  /**
   * Whether those buttons are always visible, or appear when the pointer is over the
   * carousel or the keyboard focus is inside it. Where there is no pointer to hover with,
   * they stay visible whatever this says. The dots are never hidden.
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
  /**
   * What screen readers announce for the carousel as a whole.
   *
   * Give a DISTINCT one to every carousel on a page: this is a landmark of the page, and
   * two landmarks bearing the same name cannot be told apart by someone navigating between
   * them.
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
  loop: false,
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

const slots = useSlots()

defineSlots<{
  /**
   * The slides. How many there are is read from what this slot RENDERS, so a `v-for` is
   * perfectly fine — but the slot must not depend on something only true in a browser, or
   * the server and the client would count differently.
   */
  default(): unknown
  /**
   * Replaces the previous and next buttons entirely, their placement included — so custom
   * content positions itself, and the visibility setting no longer applies to it.
   */
  controls?(props: {
    previous: () => void
    next: () => void
    atStart: boolean
    atEnd: boolean
    index: number
    /** How many slides there are. */
    count: number
    /** How many positions the carousel can actually rest on, which is usually fewer. */
    pageCount: number
    /** Which way it scrolls — a bar of your own cannot choose its icons without knowing. */
    orientation: CarouselOrientation
  }): unknown
  /**
   * Replaces the whole bar of dots.
   *
   * TRAP — render one control per POSITION and not per slide. A position past the last one
   * cannot be reached, so a bar built on the number of slides offers dots that scroll
   * nowhere. The slide count is passed as well, for wording such as "3 of 8".
   */
  indicators?(props: {
    index: number
    count: number
    pageCount: number
    goTo: (index: number) => void
    orientation: CarouselOrientation
  }): unknown
  /**
   * Replaces what is drawn INSIDE one dot. The button itself, and everything that makes it
   * announce and behave correctly, stays the design system's.
   */
  indicator?(props: { index: number; active: boolean }): unknown
}>()

/**
 * Which slide is current: the first one fully visible when several fit at once, which is
 * also the position the carousel has come to rest on.
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
 * Raised while a programmatic scroll is in flight, so the read-back does not fight the
 * request: without it, asking for slide 4 is overwritten by 1, 2 and 3 as they pass under
 * the port.
 *
 * A `ref` and NOT a plain `let`, because LOWERING it must be able to re-run the sync.
 * `scrollend` and the observer callback race, and a smooth scroll the user interrupts is the
 * losing order: the observer reports the final position while the flag is still up, the flag
 * drops a moment later, and with a `let` nothing ever comes back to write the model —
 * desynchronized for good. Caught by the `Default` play function.
 */
const settling = ref(false)

/*
 * The arrival position, measured AGAIN — that second reading is the whole point. The
 * observer delivers only on a threshold crossing, so after a backward scroll under a `peek`
 * its last delivery is a MID-FLIGHT one naming the page being left (see `measure`). Lowering
 * the guard alone hands that stale index to the watcher, which writes it while `readBack`
 * suppresses the correcting scroll: the dot then sits one page ahead, for good.
 *
 * It is the CALL that removes the race, not its position — the sync watcher is a `pre` one,
 * so both writes land in the same flush and it runs once on the final values.
 */
const onScrollEnd = () => {
  const port = viewportEl.value
  if (port) measure(port)
  settling.value = false
}

/*
 * Raised around the model write the read-back makes, lowered on the next tick once
 * `watch(model)` has seen it. It is what stops the two directions CHAINING.
 *
 * The bug it fixes is a touch one: DOM → model runs on every frame of a drag, and each of
 * those writes comes back as a programmatic `scrollBy` FIGHTING the finger — the scroller
 * jumps to the slide just named, the release snaps it again, and one gesture plays two
 * animations. A wheel shows it rarely, ending between two snap positions far less often.
 *
 * `scrollToIndex`'s "already there" test does NOT cover it: that holds only at rest, and
 * mid-gesture the delta is real. Nothing needs writing anyway — the scroller is already
 * where the read-back read it.
 *
 * Lowered in a `nextTick` and NOT inside `watch(model)`: a controlled v-model that refuses
 * the value fires no watcher, and the flag would then swallow the consumer's next change.
 */
let readBack = false

/**
 * Writes the DOM from the model. The deltas come from the RECTS, hence physical:
 * LTR, RTL and vertical all fall out with no direction test (the VTabs
 * `watch(model)` idiom). `behavior` is omitted so CSS `scroll-behavior` governs,
 * hence `prefers-reduced-motion`; `scrollBy?.()` is optional-called because jsdom
 * implements no scrolling.
 *
 * The LAST page is the exception it deliberately does not special-case: its index
 * names the slide that leads at the END of the track, whose start edge lies past
 * `scrollWidth - clientWidth`, so the request overshoots and the browser clamps it.
 * What makes the scroller REST there is the end-aligned last slide in the sheet.
 * Writing the clamped offset by hand would mean `scrollTo` and a signed `scrollLeft`,
 * the one thing the rect delta exists to avoid.
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
  // The guard is what stops the two directions chaining: without it the model write the
  // read-back has just made comes straight back as a scroll, fighting the finger mid-drag.
  // See the flag's own declaration for why `scrollToIndex`'s "already there" test does not
  // cover it.
  if (readBack) return
  void nextTick(() => scrollToIndex(index))
})

const observedIndex = ref<number>()
const measuredPages = ref<number>()

/**
 * Slack, in pixels, on every comparison below. `scrollWidth` and `clientWidth` are
 * INTEGERS where the flex layout is fractional, so a position that is exactly
 * reachable can measure a hair short — and symmetrically a sub-pixel leftover must
 * never mint a page, or the dot count would change with the canvas width.
 */
const SLACK = 2

/**
 * Reads the scroller ONCE and answers both questions from the same numbers: how many
 * positions it can rest on, and which one it rests on now. Computing them apart is exactly
 * what let them disagree.
 *
 * A position is a PAGE, not a slide. `scroll-snap-align: start` makes every slide's start
 * edge a position, but one past `scrollWidth - clientWidth` is UNREACHABLE — the scroller
 * clamps short of it — so a `peek` or an active `itemMinSize` costs the last. What replaces
 * it is the END of the track, declared by `.v-carousel-slide:last-child` in the sheet and
 * counted here whenever the leftover exceeds rounding noise. Without that page the last
 * slide is never fully revealed.
 *
 * Page indices ARE slide indices, which is why nothing downstream translates: slide `p`
 * leads at `p · step`, and at the end of the track the leading fully visible slide is
 * `ceil(scrollable / step)` — `pages - 1` in both branches.
 *
 * TRAP — the reading is POSITIONAL, and an `intersectionRatio` would bring back the bug it
 * fixes. A ratio must be DELIVERED to be read and an observer delivers only on a threshold
 * crossing: with a `peek` the outgoing slide keeps the strip's slack and stays fully visible
 * for the WHOLE of a backward scroll, destination included, so every mid-flight reading
 * names the page being LEFT while the incoming slide, parked at 0.997 by a fractional
 * layout, crosses nothing on arrival. Symptom: a dot stuck one page ahead of the content.
 *
 * RECTS and the scroller's own sizes only, never `getComputedStyle` — this runs on every
 * frame of a smooth scroll. `step` and `offset` are rect DELTAS, hence unsigned, so RTL and
 * vertical fall out with no direction test where `scrollLeft` would be negative in RTL.
 *
 * TRAP — `offset` assumes the viewport carries NO padding and NO border, so slide 0's start
 * edge coincides with the port's at rest. That is why the `outside` gutter is padding on the
 * ROOT; give the viewport its own and both this reading and `scrollToIndex`'s delta pick up
 * a constant bias with nothing to report it.
 */
function measure(port: HTMLElement) {
  const boxes = port.querySelectorAll<HTMLElement>('[data-carousel-index]')
  const first = boxes[0]?.getBoundingClientRect()
  const second = boxes[1]?.getBoundingClientRect()
  if (!first || !second) return
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
  const scrollable = vertical
    ? port.scrollHeight - port.clientHeight
    : port.scrollWidth - port.clientWidth

  const starts = Math.floor((scrollable + SLACK) / step)
  const residual = scrollable - starts * step
  const pages = starts + 1 + (residual > SLACK ? 1 : 0)
  // The end of the track is recognized by POSITION and not by rounding: it is the one
  // page that is not a multiple of `step`, so rounding would name the start position
  // it falls short of — the page the user has just left.
  const page = offset >= scrollable - SLACK ? pages - 1 : Math.round(offset / step)

  measuredPages.value = pages
  /*
   * Clamped against `pageCount` and not against the local `pages`, because that is the
   * one which also caps at `count`, and the write above is what makes it fresh. A
   * slide LARGER than the port is the case that needs it: `starts` already reaches the
   * last slide there and the leftover still mints a page, so the raw answer names an
   * index no slide carries — `scrollToIndex` would then silently do nothing and
   * `settling` would never come back down.
   */
  observedIndex.value = clamp(page, 0, pageCount.value - 1)
}

// @ssr @fallback
/**
 * SSR, jsdom and the first paint. `itemsPerView` is not a guess there, and it is exact
 * for a `peek` too: the strip costs the last START-aligned position and gives back the
 * END of the track, so the two cancel and the reachable count is
 * `count - itemsPerView + 1` either way. What still makes this a fallback rather than
 * the answer is an ACTIVE `itemMinSize`: fewer slides then fit than the prop asks for,
 * the flooring form over-counts, and only a measurement can tell. A pure function of
 * the props is also what keeps the dot list identical on the server and on the client —
 * measuring here would be a hydration mismatch.
 *
 * The clamp lives here rather than in `measure` for two reasons: a stale measurement
 * must not outlive the removal of a slide (`count` is reactive, the raw measurement is
 * not), and a slide larger than the port mints one page more than there are slides —
 * see the clamp `measure` takes against this computed.
 */
const pageCount = computed(() =>
  count.value === 0
    ? 0
    : clamp(measuredPages.value ?? count.value - props.itemsPerView + 1, 1, count.value),
)

/*
 * DOM → model, with ONE observer, which also triggers the page measurement.
 *
 * TRAP — `1` must stay in `threshold`. Nothing READS a ratio, but the buckets still decide
 * WHEN this callback runs, and this observer is what makes the component cover a ROOT
 * RESIZE — which an IntersectionObserver does not do on its own, queueing an entry only on a
 * threshold crossing. `pageCount` changes exactly when the number of FULLY visible slides
 * changes, which crosses the 1.0 bucket, which queues the re-measure. Drop the 1 and the
 * page count silently freezes on a resize. Its premise: a slide's box never exceeds the port
 * on the cross axis, so the area ratio equals the scroll-axis ratio and a slide becoming
 * fully visible really does cross 1.0.
 */
watch(
  [viewportEl, count],
  ([port], _previous, onCleanup) => {
    // @fallback
    // IntersectionObserver exists neither in SSR nor in jsdom: `scrollend` still
    // measures there, and the whole loop is verified in the browser (play functions).
    if (!port || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      () => {
        measure(port)
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
  readBack = true
  model.value = index
  /*
   * Lowered here and not inside `watch(model)`: a CONTROLLED v-model that refuses
   * the value fires no watcher at all, and the flag would then swallow the
   * consumer's next legitimate change. The pre-flush watcher runs inside the flush
   * this write schedules, a `nextTick` callback only after it — so it has read the
   * flag by the time this lands.
   */
  void nextTick(() => (readBack = false))
})

/*
 * The `loop` prop, resolved ONCE against what there is to loop through, because below
 * two positions it is not merely pointless but wrong twice over: the modulo would divide
 * by zero on an empty carousel, and on a single page it would hand the reader two enabled
 * buttons that move nothing — where the disabled pair says the truth. So the prop asks,
 * and this is the answer every consumer below reads.
 */
const looping = computed(() => props.loop && pageCount.value > 1)

/*
 * Pure derivations, and they may be ONLY because `pageCount` never over-counts: index 0 is
 * always reachable and so is `pageCount - 1`, by construction. That is the load-bearing
 * premise — an over-count makes `atEnd` false at the real end, and autoplay then re-arms its
 * timer on every bounce, forever. The `Pages` play function is what keeps it honest.
 *
 * Once a `peek` or an active floor makes the fit fractional, `pageCount - 1` is the END of
 * the track rather than a slide's start edge — a page all the same: `goTo` and `End` reach
 * it and `measure` reads it back.
 *
 * A looping carousel HAS no ends, which is all the prop changes here — and, through `atEnd`,
 * all it changes for autoplay: `rotating` already reads this, so the timer keeps re-arming
 * with not a line of its own. Endless re-arming is only a bug where the movement has nowhere
 * to go; here each one advances a page.
 */
const atStart = computed(() => !looping.value && model.value <= 0)
const atEnd = computed(() => !looping.value && model.value >= pageCount.value - 1)

function goTo(index: number) {
  const pages = pageCount.value
  /*
   * TRAP — the DOUBLE modulo. JS `%` keeps the sign of the dividend, so `previous()` at 0
   * gives `-1 % 5 === -1`; a single one hands the model an index no slide carries,
   * `scrollToIndex` finds nothing, and the carousel stops dead with no error anywhere.
   *
   * Home, End and every dot pass an index already in range, where the modulo is the
   * identity — which is why they stay absolute with no guard of their own. Only a STEP off
   * an edge ever has anything to wrap. `clamp` returns `min` on an empty interval, the
   * right answer with no slides at all.
   */
  model.value = looping.value ? ((index % pages) + pages) % pages : clamp(index, 0, pages - 1)
}
const previous = () => goTo(model.value - 1)
const next = () => goTo(model.value + 1)

// @keyboard
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
  const rtl = !isVertical.value && isRtl(port)
  goTo(model.value + (rtl ? -step : step))
}

const { start, cancel } = useTimer()
const hovered = ref(false)
// @a11y
// KEYBOARD focus, not any focus, hence `isKeyboardFocus` rather than a bare `focusin` flag.
// Clicking `next` leaves the focus on it, and a plain flag would then pause the rotation for
// good — the user has to click outside the carousel to get it going again, which is not a
// pause, it is a trap. What the pause is FOR is the keyboard user reading a slide.
const focused = ref(false)

const reducedMotion = ref(false)

/*
 * Every reason to stop, gathered in ONE computed so a single watch re-arms the
 * timer (the single-instance idiom of VTooltip and VMenuItem).
 *
 * `autoplay > 0` is a GUARD, not a default: `useTimer` runs a delay ≤ 0
 * SYNCHRONOUSLY (the DS convention), and a synchronous callback bumping the model
 * would recurse until the stack blows. It is ALSO the consumer's stop control —
 * the prop is reactive, so binding it to `0` cancels the timer on the spot, which
 * is what a pause button of your own would drive.
 */
const rotating = computed(
  () =>
    props.autoplay > 0 && !hovered.value && !focused.value && !reducedMotion.value && !atEnd.value,
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

// @a11y @ssr — WCAG 2.2.2. Client-only: the server has no `matchMedia`.
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
 * Announced only at rest: narrating an auto-rotating carousel floods the screen
 * reader (APG). The region itself stays mounted — a live container inserted at
 * the same time as its text is not announced (the VDataTable footer rule).
 */
const liveMessage = computed(() =>
  rotating.value || count.value === 0 ? '' : m.value.carousel.slide(model.value + 1, count.value),
)

// @devwarn
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
    /*
     * Not a misuse — the combination is supported and does exactly what it says. What it
     * costs is the exemption the component leans on everywhere else: content that moves on
     * its own needs a way to stop it, and the five-second grace only ever applied because
     * the rotation ENDED. Looping, it does not, and hover and focus leave a touch user with
     * nothing. Hence a warning where the fix is a one-line binding rather than a button
     * this component would have to render for everyone.
     */
    if (props.loop && props.autoplay > 0)
      console.warn(
        '[VCarousel] `loop` with `autoplay` rotates for as long as the page is open, so WCAG 2.2.2 asks for a way to stop it. Bind `autoplay` to 0 from a control of your own.',
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
    @focusin="focused = isKeyboardFocus($event.target)"
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
            shape="circular"
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
            shape="circular"
            elevated
            :disabled="atEnd"
            @click="next"
          >
            <VIcon v-bind="iconProps(resolvedNextIcon)" />
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
            One control per REACHABLE position, not per slide: with 6 slides three at
            a time the scroller can only lead with 1 to 4, and dots 5 and 6 would
            scroll nowhere. With a `peek` the last of them parks the scroller at the
            END of the track rather than on a slide's start edge. Either way the label
            stays slide-based ("4 of 6"), naming the slide that LEADS there — which is
            what the control does — and it then agrees with the slide's own name and
            with the live region.
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
    /*
     * LONGHANDS, never the `flex` shorthand — the `animation` rule further down, for
     * the same reason. A shorthand whose value contains `var()` becomes a PENDING
     * SUBSTITUTION value: it cannot be expanded until computed-value time, and if any
     * one of the four custom properties then resolves to something invalid the WHOLE
     * declaration is dropped and `flex` reverts to its initial `0 1 auto` — shrink 1
     * and basis auto, which sizes every slide on its content and destroys the snap
     * grid. As longhands a bad value can only cost the basis. It also stops devtools
     * showing the declaration struck through, since a pending shorthand is what it
     * cannot expand.
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
   * TRAP — the LAST slide is aligned on its END edge, and that is what declares the end
   * of the track as a snap position in its own right. As soon as a `peek` or an active
   * `itemMinSize` makes the fit fractional, that slide's START-aligned position lies
   * past `scrollWidth - clientWidth`, so the only position left near the end is a strip
   * short of it and the last slide is never fully revealed. `measure()` counts the end
   * of the track as its final page: delete this rule and the JS keeps offering a page
   * the scroller is no longer told it may hold.
   *
   * It is INSURANCE rather than the mechanism — Chromium clamps an out-of-range snap
   * position into the scrollable range anyway — but a measurement resting on a clamping
   * artefact instead of a declared position is the kind of implicit contract that breaks
   * silently in another engine.
   *
   * It costs nothing in the other two regimes: with a slide exactly the size of the port the
   * start- and end-aligned offsets are the SAME number, and with a slide LARGER than the
   * port the alignment is ignored, an oversized snap area making every covering position
   * valid.
   *
   * `end` is logical, so RTL and vertical need no second declaration.
   */
  .v-carousel-slide:last-child {
    scroll-snap-align: end;
  }

  .v-carousel-effect {
    block-size: 100%;
  }

  /*
   * Effects — progressive enhancement. Without scroll-driven animations nothing
   * below is declared and the carousel is a plain `slide`; Firefox lands there.
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
   * An arrow points at a physical direction, so the icon flips in RTL (the VTabs and
   * VPagination rule, word for word — what they share is the rule, not the glyph).
   * Horizontal only: the block axis does not mirror, so the vertical arrows are
   * already right.
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
   * `hover` REVEALS the pair, it never removes it: `display: none` and `visibility: hidden`
   * would drop the buttons from the tab order and the a11y tree, where `opacity: 0` keeps
   * both — the hidden-input rule. It costs no layout, so nothing shifts.
   *
   * The focus branch is read on the ROOT, so a keyboard user who has tabbed into the track
   * sees the navigation before deciding whether to use it. Same boundary autoplay pauses on.
   *
   * TRAP — `:has(:focus-visible)` and NEVER `:focus-within`. A pointer click LEAVES focus on
   * the control it hit, so reading any focus pins the pair revealed until the reader clicks
   * outside the carousel entirely, long after the pointer has gone. A click does not match
   * `:focus-visible`; a Tab does, which is the only case the focus branch is for.
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
    .v-carousel[data-controls-visibility='hover']:has(:focus-visible) .v-carousel-controls {
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
   * `inside` dots sit on the SLIDE rather than on the page, so they are deliberately
   * theme-independent: their backdrop is arbitrary media, and `text-on-accent` is the
   * library's "drawn on a coloured surface" colour, white in both themes.
   *
   * There is no bar behind them — a pill would cover a slice of the media permanently — so
   * the legibility lives in the dot itself, which carries both halves of the classic pair:
   * a light fill for dark media and a dark hairline for light media. `surface-inverse` is
   * the ring colour because it is dark in BOTH themes, which is the property needed here.
   * Drawn as a `box-shadow`, so it costs no layout and the dots stay 8px.
   *
   * Translucency is safe on a dot: it holds no text, so `color-contrast` never runs on it.
   * What the ring answers is WCAG 1.4.11, on any backdrop rather than on a judged one.
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
