<script setup lang="ts">
// @a11y @core
/**
 * Manual popovers host notification stacks. JavaScript maintains queues, announcements and
 * per-item timers paused during hover or keyboard focus.
 */

import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { usePopover } from '../../composables/usePopover'
import VToast from './VToast.vue'
import { dismissToast, toasts, type ToastItem, type ToastPlacement } from './state'

import { useAriaLabel } from '../../composables/useAriaLabel'
import { useLiveAnnouncer } from '../../composables/useLiveAnnouncer'
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

/*
 * The six containers, collected by the `v-for` itself. A plain template ref rather than a
 * function one: a function written inline in the template is a new function on every render,
 * which Vue answers by calling the old one with null and the new one with the element; twelve
 * calls each time a notification comes or goes.
 */
const stackEls = ref<HTMLElement[]>([])

/*
 * The element is looked up by its placement rather than by its index: Vue does not promise that
 * a `v-for` ref array follows the order of the list. The containers being permanent, this runs
 * once and never again.
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

const timers = new Map<number, ReturnType<typeof setTimeout>>()
/*
 * Two sets rather than one because the reasons overlap and end independently: a reader tabs to
 * a close cross, then moves the pointer over the stack and away, and the corner must stay held
 * while the cross still has the focus; VSnackbar's two flags, per corner.
 */
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
 * Recompute each toast's corner before arming timers: moving a held toast must not leave it
 * without a countdown after release.
 */
function sync() {
  const alive = new Set(toasts.map((item) => item.id))
  for (const id of timers.keys()) if (!alive.has(id)) stopTimer(id)
  for (const id of announced) if (!alive.has(id)) announced.delete(id)
  for (const item of toasts) {
    if (announced.has(item.id)) continue
    announced.add(item.id)
    announce(
      [item.title, item.message].filter(Boolean).join('. '),
      item.tone === 'danger' || item.tone === 'warning',
    )
  }

  for (const placement of PLACEMENTS) {
    const stackEl = stacks.get(placement)?.el.value
    // A close cross leaves the page while it has the focus, and an engine that sends no
    // `focusout` for a removed element would keep the corner held for good; an emptied stack is
    // hidden under the pointer, with no `pointerleave`.
    if (!stackEl?.contains(document.activeElement)) focused.delete(placement)
    if ((groups.value.get(placement)?.length ?? 0) === 0) hovered.delete(placement)
  }

  for (const item of toasts) {
    if (isHeld(effectivePlacement(item))) stopTimer(item.id)
    else startTimer(item)
  }

  // Showing and hiding are safe to call on a container already in that state, the guards living
  // in the popover plumbing; so there is no need to remember which corners are currently open.
  for (const placement of PLACEMENTS) {
    const stack = stacks.get(placement)
    if (!stack?.el.value) continue
    if ((groups.value.get(placement)?.length ?? 0) > 0) stack.show()
    else stack.hide()
  }
}

/*
 * The `post` timing is load-bearing: the notification must already be in the page before its
 * container is told to show itself.
 */
watch(groups, sync, { flush: 'post' })
// @ssr
// A watcher does not run during the server render, so a notification raised
// before this component mounted would never be picked up. Running the same
// synchronization on mount is what brings it in.
onMounted(sync)

// @a11y
// WCAG 2.2.1: something that disappears on a clock has to be holdable, or a
// slow reader simply never finishes it.
/*
 * Resting the pointer on a corner suspends its countdowns, and so does moving the keyboard into
 * it: each notification carries a close cross, a real button a reader tabs to, which would
 * otherwise vanish from under the focus ring. The same verbs and the same two reasons as
 * VSnackbar.
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

// @a11y
// Every notification is said through two live regions rendered once, outside the stacks
// (composables/useLiveAnnouncer): a card is created WITH its message, and a live region
// inserted along with its text is not reliably announced.
const { polite, assertive, announce } = useLiveAnnouncer()
const announced = new Set<number>()

// @a11y
/*
 * A notification closed from its own cross takes the focused button with it, which would
 * drop the focus on `<body>`: it goes to the next cross of the same corner, or back to
 * where it was before the reader entered the corner. `cameFrom` is that element, taken
 * from the `focusin` that entered it.
 */
const cameFrom = new Map<ToastPlacement, HTMLElement>()

function onStackFocusIn(placement: ToastPlacement, event: FocusEvent) {
  const from = event.relatedTarget as HTMLElement | null
  const stackEl = stacks.get(placement)?.el.value
  if (from && !stackEl?.contains(from)) cameFrom.set(placement, from)
  hold(placement, 'focus')
}

function closeFromCross(id: number) {
  const item = toasts.find((entry) => entry.id === id)
  const placement = item ? effectivePlacement(item) : undefined
  const stackEl = placement ? stacks.get(placement)?.el.value : null
  const hadFocus = !!stackEl?.contains(document.activeElement)
  dismissToast(id)
  if (!hadFocus || !placement) return
  void nextTick(() => {
    const next = stackEl?.querySelector<HTMLElement>('.v-toast-close')
    const back = cameFrom.get(placement)
    if (next) next.focus()
    else if (back?.isConnected) back.focus()
  })
}

/*
 * Two corners open at once are two landmarks, and two landmarks under one name are two
 * areas a screen reader cannot tell apart (axe `landmark-unique`). The name is then
 * numbered, in the order the corners are listed; alone on the page a corner keeps it bare.
 */
const openPlacements = computed(() =>
  PLACEMENTS.filter((placement) => (groups.value.get(placement)?.length ?? 0) > 0),
)
function stackLabel(placement: ToastPlacement) {
  const open = openPlacements.value
  if (open.length < 2) return ariaLabel.value
  return `${ariaLabel.value} (${open.indexOf(placement) + 1})`
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
    :aria-label="stackLabel(p)"
    @pointerenter="hold(p, 'pointer')"
    @pointerleave="release(p, 'pointer')"
    @focusin="onStackFocusIn(p, $event)"
    @focusout="release(p, 'focus')"
    @beforetoggle="syncStack(p, $event)"
    @toggle="syncStack(p, $event)"
  >
    <VToast
      v-for="item in groups.get(p) ?? []"
      :key="item.id"
      :item="item"
      :close-label="resolvedCloseLabel"
      @close="closeFromCross"
    />
  </div>
  <span class="v-visually-hidden" role="status">{{ polite }}</span>
  <span class="v-visually-hidden" role="alert">{{ assertive }}</span>
</template>

<style>
@layer vectis.components {
  /*
   * Keep host rules aligned with VSnackbar; toaster also supports top placements. Sharing this
   * layout in core CSS would increase every consumer's size cost.
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
   * Keep screen placement physical in RTL. The host supplies each card's entry direction from
   * its screen edge.
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
