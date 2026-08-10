<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { usePopover } from '../../composables/usePopover'
import VToast from './VToast.vue'
import { dismissToast, toasts, type ToastItem, type ToastPlacement } from './state'

import { useAriaLabel } from '../../composables/useAriaLabel'
import { useMessages } from '../../i18n/state'

// @a11y @core
/**
 * The notification host, to be mounted ONCE (at the app root). It renders one
 * popover="manual" PER PLACEMENT (a flex stack — the stacking is pure CSS):
 * individual popovers, fixed and anchorless, would all pile up at the same point of
 * the top layer and would require JS offsets. The six containers exist permanently
 * (stable refs, zero cost: empty divs hidden by the UA style
 * `[popover] { display: none }`, harmless in SSR).
 *
 * JS justified: the bridge between the reactive queue (state.ts) and the imperative
 * popover API (showPopover/hidePopover — the only route to the top layer), the
 * auto-dismiss timers and their pause on hover (WCAG 2.2.1, control of time limits).
 */
interface ToasterProps {
  /** Default placement (overridable per toast). */
  placement?: ToastPlacement
  /** Default display duration in ms (overridable per toast; 0 = persistent). */
  duration?: number
  /** Accessible label of the close cross. Default: the DS dictionary. */
  closeLabel?: string
  /** Accessible label of the notification regions (landmarks). Default: the DS dictionary. */
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

/** The queue grouped by effective placement (the toast's option, else the prop). */
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
 * One usePopover instance PER placement: it carries the element ref, the open state
 * (fed by the popover's events, see syncStack) and the idempotence guards — calling
 * showPopover() again on an already-open popover throws InvalidStateError. Since the
 * six containers are permanent, the factory only runs once at setup.
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

/* Auto-dismiss timers — ids already armed (a toast is armed only once). */
const timers = new Map<number, ReturnType<typeof setTimeout>>()
const armed = new Set<number>()
/* Hovered stacks: timers suspended (they restart at the full duration on leave). */
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
 * Synchronizes queue → DOM: arms the timers of new toasts, purges those of the ones
 * gone, opens the non-empty stacks and closes the empty ones. Called on mount (for
 * toasts emitted before it — they show up) then on every change.
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

  // usePopover's guards make show()/hide() idempotent: no manual tracking of the
  // already-open stacks.
  for (const placement of PLACEMENTS) {
    const stack = stacks.get(placement)
    if (!stack?.el.value) continue
    if ((groups.value.get(placement)?.length ?? 0) > 0) stack.show()
    else stack.hide()
  }
}

/*
 * `groups` covers any change of the queue AND of the default placement; flush post:
 * the toast is in the DOM before showPopover(). onMounted handles the toasts emitted
 * before mounting (watchers do not run in SSR).
 */
watch(groups, sync, { flush: 'post' })
// @ssr — watchers do not run on the server: toasts emitted before mount show up here.
onMounted(sync)

// @a11y — WCAG 2.2.1: a notification that expires on a clock needs a way to hold it.
/*
 * Pause on hover: suspends the stack's timers; on leave they restart at the FULL
 * duration (no accounting of the time left — simpler, and more generous to the
 * user).
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

/* The queue (module state) survives a VToaster unmount/remount — only the timers
   are cleaned up (they will restart on the next mount). */
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
  /* `position: fixed`, `inset: auto` and the closed-popover `display: none` guard
     come from `.v-overlay` (styles/floating.css), set alongside this class. Only the
     UA neutralizations specific to a stack (border, padding, Canvas background,
     overflow) and its layout stay here. */
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
   * PHYSICAL coordinates (top/left…): a notification is a screen position,
   * independent of the reading direction (like the OS notifications).
   */
  .v-toast-stack[data-placement^='top-'] {
    top: var(--vectis-space-4);
    /* The most recent near the edge: the queue is append-only, the CSS reverses it */
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

  /* Animated entry/exit of the stack (allow-discrete + @starting-style) —
     progressive enhancement, as in floating.css */
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
