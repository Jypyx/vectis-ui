<script setup lang="ts">
// @a11y @core
/**
 * Where notifications appear: mounted ONCE at the root, after which every `toast()` call
 * shows up here.
 *
 * One container per placement rather than one popover per notification, each stacking its
 * own with CSS. These boxes are drawn above the page at physical coordinates, anchored to
 * nothing, so individually they would all land on the same spot and keeping them apart would
 * mean measuring and offsetting each in code. The six exist at all times; empty, they cost
 * nothing and are not displayed.
 *
 * The JS covers three things the platform does not: keeping the queue and the containers in
 * step, the popover being imperative; the per-notification dismissal timers; and holding
 * them while the pointer rests on a stack OR the keyboard is inside it, so something that
 * disappears on a clock can be read and closed (WCAG 2.2.1).
 */

import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { usePopover } from '../../composables/usePopover'
import VToast from './VToast.vue'
import { dismissToast, toasts, type ToastItem, type ToastPlacement } from './state'

import { useAriaLabel } from '../../composables/useAriaLabel'
import { useMessages } from '../../i18n/state'

interface ToasterProps {
  /** Which corner notifications appear in, unless one of them asks for another. */
  placement?: ToastPlacement
  /**
   * How long a notification stays, in milliseconds, unless it asks for something else.
   * A notification given 0 stays until it is dismissed.
   */
  duration?: number
  /** What the close cross does, in words. It falls back to the design system dictionary. */
  closeLabel?: string
  /**
   * What screen readers announce for the notification areas themselves, which are
   * landmarks of the page. It falls back to the design system dictionary.
   */
  label?: string
}

const props = withDefaults(defineProps<ToasterProps>(), {
  placement: 'bottom-right',
  duration: 5000,
  closeLabel: undefined,
  label: undefined,
})

const m = useMessages()
const ariaLabel = useAriaLabel(() => props.label ?? m.value.toaster.label)
const resolvedCloseLabel = computed(() => props.closeLabel ?? m.value.common.close)

const PLACEMENTS: ToastPlacement[] = [
  'top-left',
  'top-center',
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
]

/**
 * The queue sorted into the corner each notification actually belongs to: the one it
 * asked for, or failing that the one set on this component.
 */
const groups = computed(() => {
  const map = new Map<ToastPlacement, ToastItem[]>()
  for (const item of toasts) {
    const placement = effectivePlacement(item)
    const list = map.get(placement)
    if (list) list.push(item)
    else map.set(placement, [item])
  }
  return map
})

/* The six containers, collected by the `v-for` itself. A plain template ref rather than a
   function one: a function written inline in the template is a new function on every
   render, which Vue answers by calling the old one with null and the new one with the
   element — twelve calls each time a notification comes or goes. */
const stackEls = ref<HTMLElement[]>([])

/*
 * One instance of the popover plumbing PER corner. Each carries its own element, its
 * own open state — fed by that element's events — and the guards that make opening and
 * closing safe to call twice: asking the browser to show an already-shown popover
 * throws.
 *
 * The element is looked up by its placement rather than by its index: Vue does not
 * promise that a `v-for` ref array follows the order of the list.
 *
 * The containers being permanent, this runs once and never again.
 */
const stacks = new Map(
  PLACEMENTS.map((placement) => {
    const el = computed(
      () => stackEls.value.find((stack) => stack.dataset.placement === placement) ?? null,
    )
    return [placement, { el, ...usePopover(el) }] as const
  }),
)

function syncStack(placement: ToastPlacement, event: Event) {
  stacks.get(placement)?.syncShown(event)
}

/* The running countdowns, one per notification. */
const timers = new Map<number, ReturnType<typeof setTimeout>>()
/* The corners holding their countdowns, one set per reason. Two sets rather than one
   because the reasons overlap and end independently: a reader tabs to a close cross, then
   moves the pointer over the stack and away, and the corner must stay held while the cross
   still has the focus — VSnackbar's two flags, per corner. */
const hovered = new Set<ToastPlacement>()
const focused = new Set<ToastPlacement>()

function effectivePlacement(item: ToastItem): ToastPlacement {
  return item.placement ?? props.placement
}

const isHeld = (placement: ToastPlacement) => hovered.has(placement) || focused.has(placement)

function stopTimer(id: number) {
  const timer = timers.get(id)
  if (timer === undefined) return
  clearTimeout(timer)
  timers.delete(id)
}

function startTimer(item: ToastItem) {
  const duration = item.duration ?? props.duration
  if (duration <= 0 || timers.has(item.id)) return
  timers.set(
    item.id,
    setTimeout(() => {
      timers.delete(item.id)
      dismissToast(item.id)
    }, duration),
  )
}

// @core
/**
 * Brings the page into line with the queue: it throws away the countdowns of the
 * notifications that have gone, gives every other one a countdown exactly when its corner
 * is not held, and then shows the corners holding something while hiding the empty ones.
 *
 * TRAP — the countdown follows the corner a notification is in NOW, re-derived on every
 * pass rather than remembered per notification. The default corner is a prop, so a
 * notification can change corner while the pointer rests on the old one: a memory of
 * "already armed" then outlived the countdown the hold had cancelled, the release looked
 * in the old corner, and the notification never got a countdown again.
 *
 * It runs once on mount — which is what makes a notification raised before this
 * component existed appear all the same — and after that on every change to the queue.
 */
function sync() {
  const alive = new Set(toasts.map((item) => item.id))
  for (const id of timers.keys()) if (!alive.has(id)) stopTimer(id)

  for (const placement of PLACEMENTS) {
    const stackEl = stacks.get(placement)?.el.value
    // TRAP — a hold is dropped here as soon as it can no longer be true, rather than
    // trusted to its closing event. A close cross leaves the page while it has the focus,
    // and an engine that sends no `focusout` for a removed element would keep the corner
    // held for good; an emptied stack is hidden under the pointer, with no `pointerleave`.
    if (!stackEl?.contains(document.activeElement)) focused.delete(placement)
    if ((groups.value.get(placement)?.length ?? 0) === 0) hovered.delete(placement)
  }

  for (const item of toasts) {
    if (isHeld(effectivePlacement(item))) stopTimer(item.id)
    else startTimer(item)
  }

  // Showing and hiding are safe to call on a container already in that state, the
  // guards living in the popover plumbing — so there is no need to remember which
  // corners are currently open.
  for (const placement of PLACEMENTS) {
    const stack = stacks.get(placement)
    if (!stack?.el.value) continue
    if ((groups.value.get(placement)?.length ?? 0) > 0) stack.show()
    else stack.hide()
  }
}

/*
 * Watching the grouped queue covers a change to the notifications AND a change to the
 * default corner. The `post` timing is load-bearing: the notification must already be
 * in the page before its container is told to show itself.
 */
watch(groups, sync, { flush: 'post' })
// @ssr — a watcher does not run during the server render, so a notification raised
// before this component mounted would never be picked up. Running the same
// synchronization on mount is what brings it in.
onMounted(sync)

// @a11y — WCAG 2.2.1: something that disappears on a clock has to be holdable, or a
// slow reader simply never finishes it.
/*
 * Resting the pointer on a corner suspends its countdowns, and so does moving the keyboard
 * into it: each notification carries a close cross, a real button a reader tabs to, which
 * would otherwise vanish from under the focus ring. The same verbs and the same two
 * reasons as VSnackbar.
 *
 * Leaving restarts them from the FULL duration rather than from what was left: simpler,
 * and more generous to the reader who has just interrupted themselves.
 */
function hold(placement: ToastPlacement, which: 'pointer' | 'focus') {
  const reason = which === 'pointer' ? hovered : focused
  reason.add(placement)
  for (const item of groups.value.get(placement) ?? []) stopTimer(item.id)
}

function release(placement: ToastPlacement, which: 'pointer' | 'focus') {
  const reason = which === 'pointer' ? hovered : focused
  reason.delete(placement)
  if (isHeld(placement)) return
  for (const item of groups.value.get(placement) ?? []) startTimer(item)
}

/* The queue lives outside this component and survives it being unmounted and mounted
   again; only the countdowns are cleared here, and they are started afresh next time. */
onBeforeUnmount(() => {
  for (const timer of timers.values()) clearTimeout(timer)
  timers.clear()
})
</script>

<template>
  <div
    v-for="p in PLACEMENTS"
    :key="p"
    ref="stackEls"
    class="v-overlay v-toast-stack"
    popover="manual"
    :data-placement="p"
    role="region"
    :aria-label="ariaLabel"
    @pointerenter="hold(p, 'pointer')"
    @pointerleave="release(p, 'pointer')"
    @focusin="hold(p, 'focus')"
    @focusout="release(p, 'focus')"
    @beforetoggle="syncStack(p, $event)"
    @toggle="syncStack(p, $event)"
  >
    <VToast
      v-for="item in groups.get(p) ?? []"
      :key="item.id"
      :item="item"
      :close-label="resolvedCloseLabel"
      @close="dismissToast($event)"
    />
  </div>
</template>

<style>
@layer vectis.components {
  /*
   * The container. Its rules are an ALIGNED COPY of VSnackbar's host: the two containers are the
   * same object, a popover at a physical corner that fades when it empties, and the copy is
   * kept line for line, the one difference being the top edge, which a confirmation never takes.
   * They are not factored into styles/banner.css because that sheet is paid for by every
   * consumer, and these rules cost more than the size gate allows; change one, change the other.
   *
   * The fixed positioning and the guard hiding a closed container come from the shared
   * `.v-overlay` class, set on this same element. What is undone here is the browser's own
   * popover decoration: its border, its padding, its opaque background.
   */
  .v-toast-stack {
    margin: 0;
    border: none;
    padding: 0;
    background: transparent;
    overflow: visible;
    width: fit-content;
  }

  /*
   * PHYSICAL coordinates rather than logical ones: a message appears at a place on the
   * screen, and that place does not flip with the reading direction — the operating
   * system's own notifications behave the same way.
   *
   * `--banner-enter-y` is the direction each card slides in from, read by `.v-banner` in
   * styles/banner.css: the container is the only thing that knows which edge of the screen
   * it sits on. That sheet reads it with a `, 0` fallback, so dropping the declaration costs
   * the slide and nothing else, and nothing reports it.
   */
  .v-toast-stack[data-placement^='top-'] {
    top: var(--vectis-space-4);
    --banner-enter-y: calc(-1 * var(--vectis-space-4));
  }

  .v-toast-stack[data-placement^='bottom-'] {
    bottom: var(--vectis-space-4);
    --banner-enter-y: var(--vectis-space-4);
  }

  .v-toast-stack[data-placement$='-left'] {
    left: var(--vectis-space-4);
  }

  .v-toast-stack[data-placement$='-right'] {
    right: var(--vectis-space-4);
  }

  .v-toast-stack[data-placement$='-center'] {
    left: 0;
    right: 0;
    margin-inline: auto;
  }

  /* The container fades in and out. Animating an element that is being added to or removed
     from the page needs the two `allow-discrete` declarations and the starting values
     below; a browser missing either simply shows and hides it at once. */
  .v-toast-stack {
    opacity: 1;
    transition:
      opacity var(--vectis-duration-base) var(--vectis-ease-default),
      overlay var(--vectis-duration-base) allow-discrete,
      display var(--vectis-duration-base) allow-discrete;
  }

  .v-toast-stack:not(:popover-open) {
    opacity: 0;
  }

  @starting-style {
    .v-toast-stack:popover-open {
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .v-toast-stack {
      transition: none;
    }
  }

  /* The stack's own layout, which the snackbar's single bar has no use for. The newest
     notification should sit nearest the screen edge; the queue only ever grows at the end,
     so a stack along the top is simply drawn in reverse. */
  .v-toast-stack {
    display: flex;
    flex-direction: column;
    gap: var(--vectis-space-3);
  }

  .v-toast-stack[data-placement^='top-'] {
    flex-direction: column-reverse;
  }
}
</style>
