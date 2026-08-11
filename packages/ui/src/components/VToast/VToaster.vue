<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { usePopover } from '../../composables/usePopover'
import VToast from './VToast.vue'
import { dismissToast, toasts, type ToastItem, type ToastPlacement } from './state'

import { useAriaLabel } from '../../composables/useAriaLabel'
import { useMessages } from '../../i18n/state'

// @a11y @core
/**
 * Where notifications appear. It is mounted ONCE, at the root of the application, and
 * from then on any call to `toast()` shows up here.
 *
 * It renders one container per corner of the screen rather than one floating box per
 * notification, and each container simply stacks its notifications with CSS. The
 * reason is that these boxes are drawn above the whole page, at fixed coordinates and
 * anchored to nothing: individually they would all land on the same spot, and keeping
 * them apart would mean measuring and offsetting each one in code. The six containers
 * exist at all times — empty, they cost nothing and the browser does not display them.
 *
 * The JavaScript covers three things the platform does not: putting the queue and the
 * containers in step, since drawing above the page can only be asked for by calling a
 * method; the timers that dismiss a notification when its time is up; and pausing
 * those timers while the pointer rests on a stack, so that something disappearing on a
 * clock can be held in place long enough to read (WCAG 2.2.1).
 */
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
    const placement = item.placement ?? props.placement
    const list = map.get(placement)
    if (list) list.push(item)
    else map.set(placement, [item])
  }
  return map
})

/*
 * One instance of the popover plumbing PER corner. Each carries its own element, its
 * own open state — fed by that element's events — and the guards that make opening and
 * closing safe to call twice: asking the browser to show an already-shown popover
 * throws.
 *
 * The containers being permanent, this runs once and never again.
 */
const stacks = new Map(
  PLACEMENTS.map((placement) => {
    const el = ref<HTMLElement | null>(null)
    return [placement, { el, ...usePopover(el) }] as const
  }),
)

function setStackEl(placement: ToastPlacement, el: unknown) {
  const stack = stacks.get(placement)
  if (stack) stack.el.value = (el as HTMLElement | null) ?? null
}

function syncStack(placement: ToastPlacement, event: Event) {
  stacks.get(placement)?.syncShown(event)
}

/* The running countdowns, and the notifications already given one — a notification is
   armed once and only once, however many times the queue changes around it. */
const timers = new Map<number, ReturnType<typeof setTimeout>>()
const armed = new Set<number>()
/* The corners the pointer is currently resting on, whose countdowns are suspended. */
const paused = new Set<ToastPlacement>()

function effectivePlacement(item: ToastItem): ToastPlacement {
  return item.placement ?? props.placement
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
 * Brings the page into line with the queue: it starts the countdown of every
 * notification that has just arrived, throws away the countdowns of those that have
 * gone, and then shows the corners holding something while hiding the empty ones.
 *
 * It runs once on mount — which is what makes a notification raised before this
 * component existed appear all the same — and after that on every change to the queue.
 */
function sync() {
  const alive = new Set(toasts.map((item) => item.id))
  for (const [id, timer] of timers) {
    if (!alive.has(id)) {
      clearTimeout(timer)
      timers.delete(id)
    }
  }
  for (const id of armed) if (!alive.has(id)) armed.delete(id)
  for (const item of toasts) {
    if (armed.has(item.id)) continue
    armed.add(item.id)
    if (!paused.has(effectivePlacement(item))) startTimer(item)
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
 * Resting the pointer on a corner suspends its countdowns. Leaving restarts them from
 * the FULL duration rather than from what was left: simpler, and more generous to the
 * reader who has just interrupted themselves.
 */
function pause(placement: ToastPlacement) {
  paused.add(placement)
  for (const item of toasts) {
    if (effectivePlacement(item) !== placement) continue
    const timer = timers.get(item.id)
    if (timer !== undefined) {
      clearTimeout(timer)
      timers.delete(item.id)
    }
  }
}

function resume(placement: ToastPlacement) {
  paused.delete(placement)
  for (const item of toasts) {
    if (effectivePlacement(item) === placement) startTimer(item)
  }
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
    :ref="(el) => setStackEl(p, el)"
    class="v-overlay v-toast-stack"
    popover="manual"
    :data-placement="p"
    role="region"
    :aria-label="ariaLabel"
    @pointerenter="pause(p)"
    @pointerleave="resume(p)"
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
  /* The fixed positioning and the guard hiding a closed container come from the shared
     `.v-overlay` class, set on this same element. What stays here is the browser's own
     popover decoration to undo — its border, its padding, its opaque background — and
     the stack's own layout. */
  .v-toast-stack {
    margin: 0;
    border: none;
    padding: 0;
    background: transparent;
    overflow: visible;
    width: fit-content;
    display: flex;
    flex-direction: column;
    gap: var(--vectis-space-3);
  }

  /*
   * These coordinates are deliberately PHYSICAL rather than logical: a notification
   * appears at a place on the screen, and that place does not flip with the reading
   * direction — the operating system's own notifications behave the same way.
   */
  .v-toast-stack[data-placement^='top-'] {
    top: var(--vectis-space-4);
    /* The newest notification should sit nearest the screen edge. The queue only ever
       grows at the end, so the stack is simply drawn in reverse. */
    flex-direction: column-reverse;
    --toast-enter-y: calc(-1 * var(--vectis-space-4));
  }

  .v-toast-stack[data-placement^='bottom-'] {
    bottom: var(--vectis-space-4);
    --toast-enter-y: var(--vectis-space-4);
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

  /* The stack fades in and out. Animating an element that is being added to or removed
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
}
</style>
