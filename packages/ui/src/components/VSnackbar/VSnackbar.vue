<script setup lang="ts">
// @a11y @core
/**
 * A manual popover hosts the current confirmation. JavaScript bridges imperative visibility,
 * announcements and a dismissal timer paused during hover or focus.
 */

import { computed, nextTick, onMounted, ref, watch } from 'vue'

import { usePopover } from '../../composables/usePopover'
import { useTimer } from '../../composables/useTimer'
import { useAriaLabel } from '../../composables/useAriaLabel'
import { useLiveAnnouncer } from '../../composables/useLiveAnnouncer'
import { useMessages } from '../../i18n/state'
import VButton from '../VButton/VButton.vue'
import VIcon from '../VIcon/VIcon.vue'
import { iconProps } from '../VIcon/iconProps'
import { current, dismissSnackbar, type SnackbarPlacement } from './state'

interface SnackbarProps {
  /** Which end of the bottom edge confirmations appear at, unless one of them asks for another. */
  placement?: SnackbarPlacement
  /**
   * How long a confirmation stays, in milliseconds, unless it asks for something else. A
   * confirmation given 0 stays until it is replaced or taken away by hand.
   */
  duration?: number
  /**
   * The word drawn on the single action, when the confirmation does not give one. It is
   * also the button's accessible name, and falls back to the design system dictionary.
   */
  actionText?: string
  /**
   * What screen readers announce for the confirmation area itself, which is a landmark of
   * the page. It falls back to the design system dictionary.
   */
  label?: string
}

const props = withDefaults(defineProps<SnackbarProps>(), {
  placement: 'bottom-center',
  /* Shorter than a notification's five seconds. A confirmation is one short sentence
     about something the reader has just done, so they already know what it says. */
  duration: 4000,
  actionText: undefined,
  label: undefined,
})

defineOptions({ inheritAttrs: false })

const m = useMessages()
const ariaLabel = useAriaLabel(() => props.label ?? m.value.snackbar.label)

const placement = computed(() => current.value?.placement ?? props.placement)
const actionText = computed(
  () => current.value?.actionText ?? props.actionText ?? m.value.snackbar.action,
)
const icon = computed(() => (current.value?.icon ? iconProps(current.value.icon) : undefined))

const hostEl = ref<HTMLElement | null>(null)
const { syncShown, show, hide } = usePopover(hostEl)
const { start, cancel } = useTimer()

/*
 * They are two separate flags rather than one counter because they can be true at the same time
 * and end independently: a reader tabs to the action button, then moves the mouse over the bar,
 * then moves it away; and the bar must not leave while the button still has focus.
 */
let hovered = false
let focused = false

function arm() {
  const bar = current.value
  if (!bar || hovered || focused) return
  const duration = bar.duration ?? props.duration
  /*
   * GUARD, not a default: `useTimer` runs a delay of 0 synchronously, which is the design
   * system's convention for "no deferral at all". Without this test a confirmation asking to be
   * permanent would be taken away in the same tick it was raised.
   */
  if (duration > 0) start(() => dismissSnackbar(bar.id), duration)
}

// @core
/**
 * Brings the page into line with the state: it shows the container when there is a confirmation
 * and hides it when there is none, and restarts the countdown from the top.
 */
const { polite, assertive, announce } = useLiveAnnouncer()
let lastAnnounced: number | undefined

function sync() {
  cancel()
  // Clear hover/focus flags when removing the bar; a removed focused element may emit no
  // focusout and leave future timers permanently held.
  if (!current.value) hovered = focused = false
  // A REPLACEMENT removes the focused action too (the card is keyed on the bar), and the same
  // engine leaves `focused` standing: the new bar then never left. The toaster's test, where
  // the focus actually is, is the one that holds in both cases.
  else if (!hostEl.value?.contains(document.activeElement)) focused = false
  // @a11y
  // Said through the live regions rendered once beside the host: the card is created WITH
  // its message, and a region inserted along with its text is not reliably announced. A
  // failure interrupts; a plain confirmation waits for a pause.
  if (current.value && current.value.id !== lastAnnounced) {
    lastAnnounced = current.value.id
    announce(current.value.message, current.value.tone === 'danger')
  }
  // Showing and hiding are safe to call on a container already in that state, the guards living
  // in the popover plumbing; so there is no need to remember which it is in.
  if (current.value) show()
  else hide()
  arm()
}

/*
 * Watching the resolved bar covers a change of confirmation and its disappearance. The `post`
 * timing is load-bearing: the card must already be in the page before its container is told to
 * show itself.
 */
watch(current, sync, { flush: 'post' })
// @ssr
// A watcher does not run during the server render, so a confirmation raised before
// this component mounted would never be picked up. Running the same synchronization on
// mount is what brings it in.
onMounted(sync)

// @a11y
// WCAG 2.2.1: something that disappears on a clock has to be holdable, or a slow reader simply
// never finishes it; and here they would also never reach the button.
/*
 * Resting the pointer on the bar suspends its countdown, and so does moving the keyboard into
 * it: the action is a real button, so a reader tabbing towards it would otherwise watch it
 * vanish from under the focus ring. VToaster holds its stacks on the same two reasons, with the
 * same verbs, for its close crosses.
 */
function hold(which: 'pointer' | 'focus') {
  if (which === 'pointer') hovered = true
  else focused = true
  cancel()
}

// Where the focus came from when it entered the bar, to hand it back once the action has
// taken the bar, and the focused button with it, away.
let cameFrom: HTMLElement | null = null
function onFocusIn(event: FocusEvent) {
  const from = event.relatedTarget as HTMLElement | null
  if (from && !hostEl.value?.contains(from)) cameFrom = from
  hold('focus')
}

function release(which: 'pointer' | 'focus') {
  if (which === 'pointer') hovered = false
  else focused = false
  arm()
}

/* The action always takes the bar away: it answers the confirmation, so leaving it on
   screen would invite the reader to answer it twice. */
function runAction() {
  const bar = current.value
  if (!bar) return
  const hadFocus = !!hostEl.value?.contains(document.activeElement)
  try {
    bar.action?.()
  } finally {
    // Even when the action throws: the error reaches the application, and the bar it
    // answered does not stay on screen, a permanent one for good.
    dismissSnackbar(bar.id)
    // @a11y
    // The focused button leaves with the bar; the focus goes back where it came from
    // rather than falling to `<body>`.
    if (hadFocus)
      void nextTick(() => {
        if (cameFrom?.isConnected && !current.value) cameFrom.focus()
      })
  }
}
</script>

<template>
  <div
    ref="hostEl"
    v-bind="$attrs"
    class="v-overlay v-snackbar-host"
    popover="manual"
    :data-placement="placement"
    role="region"
    :aria-label="ariaLabel"
    @pointerenter="hold('pointer')"
    @pointerleave="release('pointer')"
    @focusin="onFocusIn"
    @focusout="release('focus')"
    @beforetoggle="syncShown"
    @toggle="syncShown"
  >
    <div
      v-if="current"
      :key="current.id"
      class="v-banner v-snackbar v-tone"
      :data-tone="current.tone"
    >
      <VIcon v-if="icon" class="v-snackbar-icon" v-bind="icon" />
      <p class="v-banner-text v-snackbar-message">{{ current.message }}</p>
      <VButton
        v-if="current.action"
        class="v-banner-control v-snackbar-action"
        variant="ghost"
        tone="neutral"
        size="sm"
        @click="runAction"
      >
        {{ actionText }}
      </VButton>
    </div>
  </div>
  <span class="v-visually-hidden" role="status">{{ polite }}</span>
  <span class="v-visually-hidden" role="alert">{{ assertive }}</span>
</template>

<style>
@layer vectis.components {
  /*
   * They are not factored into styles/banner.css because that sheet is paid for by every
   * consumer, and these rules cost more than the size gate allows; change one, change the
   * other. The fixed positioning and the guard hiding a closed container come from the shared
   * `.v-overlay` class, set on this same element.
   */
  .v-snackbar-host {
    margin: 0;
    border: none;
    padding: 0;
    background: transparent;
    overflow: visible;
    width: fit-content;
  }

  /*
   * Keep screen placement physical in RTL. The host supplies the entry direction because it
   * knows its screen edge.
   */
  .v-snackbar-host[data-placement^='bottom-'] {
    bottom: var(--vectis-space-4);
    --banner-enter-y: var(--vectis-space-4);
  }

  .v-snackbar-host[data-placement$='-left'] {
    left: var(--vectis-space-4);
  }

  .v-snackbar-host[data-placement$='-right'] {
    right: var(--vectis-space-4);
  }

  .v-snackbar-host[data-placement$='-center'] {
    left: 0;
    right: 0;
    margin-inline: auto;
  }

  /* The container fades in and out. Animating an element that is being added to or removed
     from the page needs the two `allow-discrete` declarations and the starting values
     below; a browser missing either simply shows and hides it at once. */
  .v-snackbar-host {
    opacity: 1;
    transition:
      opacity var(--vectis-duration-base) var(--vectis-ease-default),
      overlay var(--vectis-duration-base) allow-discrete,
      display var(--vectis-duration-base) allow-discrete;
  }

  .v-snackbar-host:not(:popover-open) {
    opacity: 0;
  }

  @starting-style {
    .v-snackbar-host:popover-open {
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .v-snackbar-host {
      transition: none;
    }
  }

  /*
   * Shared banner chrome supplies decoration and motion; snackbar owns alignment, dimensions
   * and tone painting.
   */
  .v-snackbar {
    /*
     * Centred, where the notification hooks to its first line. A confirmation is ONE short
     * sentence and it carries a real button: on a message that wraps, aligning to the start
     * would park that button in the top corner, away from the text it answers.
     */
    align-items: center;
    padding-block: var(--vectis-space-3);
    /* The action pulls back into this gutter with a negative margin (`.v-banner-control`),
       rather than the bar declaring a smaller padding at its end. */
    padding-inline: var(--vectis-space-4);
    min-inline-size: var(--vectis-control-size-snackbar-min);
    /* Wide enough for a sentence, never wider than the viewport with the container's own
       margins deducted. */
    max-inline-size: min(
      var(--vectis-control-size-snackbar-max),
      calc(100dvi - 2 * var(--vectis-space-4))
    );
  }

  /*
   * Both tones are painted SOLID, and there is deliberately no soft variant: a confirmation is
   * a short-lived object laid over arbitrary content, so it has to read at a glance rather than
   * tint into the page. The tone table itself lives in styles/tones.css, in a layer below the
   * components, and is shared with VButton, VChip and VToast.
   */
  .v-snackbar {
    background: var(--tone-bg-solid);
    color: var(--tone-text-solid);
  }

  /*
   * No alignment margin here, unlike the notification: `align-items: center` above already puts
   * the icon on the row's centre line, and an equal margin on a centred item changes nothing at
   * all; it would be a declaration that does no work.
   */
  .v-snackbar-icon {
    --vectis-icon-size: var(--vectis-icon-size-md);
  }

  /* An outline draws one without moving the layout by a pixel. */
  @media (forced-colors: active) {
    .v-snackbar {
      outline: 1px solid CanvasText;
    }
  }
}
</style>
