<script setup lang="ts">
// @a11y @core
/**
 * Where confirmations appear: mounted ONCE at the root, after which every `snackbar()` call
 * shows up here.
 *
 * A confirmation answers something the reader just did — "Message deleted" — usually with
 * one button to take it back. Everything that separates it from a notification follows from
 * ONE idea: only the LAST action is worth offering to undo. Hence a single bar at a time (a
 * new one replaces it), hence no close cross (a bar that tidies itself must not ask the
 * reader to), hence the bottom edge alone and a shorter delay.
 *
 * That "one at a time" is also why this is a single SFC where the notifications need two:
 * one container, one card, and no book-keeping to tell several countdowns apart.
 *
 * The JS covers three things the platform does not: keeping the state and the container in
 * step, the popover being imperative; the auto-dismiss countdown; and HOLDING that countdown
 * while the pointer rests on the bar OR the keyboard is inside it, so something that
 * disappears on a clock can be read and acted on (WCAG 2.2.1).
 */

import { computed, onMounted, ref, watch } from 'vue'

import { usePopover } from '../../composables/usePopover'
import { useTimer } from '../../composables/useTimer'
import { useAriaLabel } from '../../composables/useAriaLabel'
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
   * What the single action is called, when the confirmation does not name it. It falls
   * back to the design system dictionary.
   */
  actionLabel?: string
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
  actionLabel: undefined,
  label: undefined,
})

const m = useMessages()
const ariaLabel = useAriaLabel(() => props.label ?? m.value.snackbar.label)

const placement = computed(() => current.value?.placement ?? props.placement)
/* A failure interrupts whatever a screen reader is saying; a plain confirmation waits for
   a pause, the reader having asked for the action it reports. */
const role = computed(() => (current.value?.tone === 'danger' ? 'alert' : 'status'))
const actionLabel = computed(
  () => current.value?.actionLabel ?? props.actionLabel ?? m.value.snackbar.action,
)
const icon = computed(() => (current.value?.icon ? iconProps(current.value.icon) : undefined))

const hostEl = ref<HTMLElement | null>(null)
const { syncShown, show, hide } = usePopover(hostEl)
const { start, cancel } = useTimer()

/* The reasons to hold the countdown, each set by its own pair of events. They are two
   separate flags rather than one counter because they can be true at the same time and
   end independently: a reader tabs to the action button, then moves the mouse over the
   bar, then moves it away — and the bar must not leave while the button still has focus. */
let hovered = false
let focused = false

function arm() {
  const bar = current.value
  if (!bar || hovered || focused) return
  const duration = bar.duration ?? props.duration
  /* GUARD, not a default: `useTimer` runs a delay of 0 SYNCHRONOUSLY, which is the design
     system's convention for "no deferral at all". Without this test a confirmation asking
     to be permanent would be taken away in the same tick it was raised. */
  if (duration > 0) start(() => dismissSnackbar(bar.id), duration)
}

// @core
/**
 * Brings the page into line with the state: it shows the container when there is a
 * confirmation and hides it when there is none, and restarts the countdown from the top.
 *
 * Restarting unconditionally is what makes a replacement correct — the outgoing bar's
 * countdown must not be allowed to take the incoming one away — and it is safe precisely
 * because this runs only when the bar itself changes.
 *
 * It runs once on mount, which is what makes a confirmation raised before this component
 * existed appear all the same, and after that on every change.
 */
function sync() {
  cancel()
  // TRAP — with no bar left, nothing can still be hovered or focused, so both flags are
  // dropped here rather than trusted to their events. The action button leaves the page
  // WITH the bar while it holds the focus, and an engine that sends no `focusout` for a
  // removed element would leave `focused` standing: every later confirmation would then
  // stay on screen for good, far from the gesture that caused it.
  if (!current.value) hovered = focused = false
  // Showing and hiding are safe to call on a container already in that state, the guards
  // living in the popover plumbing — so there is no need to remember which it is in.
  if (current.value) show()
  else hide()
  arm()
}

/*
 * Watching the resolved bar covers a change of confirmation AND its disappearance. The
 * `post` timing is load-bearing: the card must already be in the page before its container
 * is told to show itself.
 */
watch(current, sync, { flush: 'post' })
// @ssr — a watcher does not run during the server render, so a confirmation raised before
// this component mounted would never be picked up. Running the same synchronization on
// mount is what brings it in.
onMounted(sync)

// @a11y — WCAG 2.2.1: something that disappears on a clock has to be holdable, or a slow
// reader simply never finishes it — and here they would also never reach the button.
/*
 * Resting the pointer on the bar suspends its countdown, and so does moving the keyboard
 * into it: the action is a real button, so a reader tabbing towards it would otherwise
 * watch it vanish from under the focus ring. VToaster holds its stacks on the same two
 * reasons, with the same verbs, for its close crosses.
 *
 * Any focus counts, not just a keyboard one: a pointer landing on the button is about to
 * run the action anyway, so there is nothing to lose by holding as well.
 *
 * Leaving restarts the countdown from the FULL duration rather than from what was left:
 * simpler, and more generous to the reader who has just interrupted themselves.
 */
function hold(which: 'pointer' | 'focus') {
  if (which === 'pointer') hovered = true
  else focused = true
  cancel()
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
  bar.action?.()
  dismissSnackbar(bar.id)
}
</script>

<template>
  <div
    ref="hostEl"
    class="v-overlay v-snackbar-host"
    popover="manual"
    :data-placement="placement"
    role="region"
    :aria-label="ariaLabel"
    @pointerenter="hold('pointer')"
    @pointerleave="release('pointer')"
    @focusin="hold('focus')"
    @focusout="release('focus')"
    @beforetoggle="syncShown"
    @toggle="syncShown"
  >
    <div
      v-if="current"
      :key="current.id"
      class="v-banner v-snackbar v-tone"
      :data-tone="current.tone"
      :role="role"
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
        {{ actionLabel }}
      </VButton>
    </div>
  </div>
</template>

<style>
@layer vectis.components {
  /*
   * The container. Its rules are an ALIGNED COPY of VToaster's stacks: the two containers are the
   * same object, a popover at a physical corner that fades when it empties, and the copy is
   * kept line for line, the one difference being the top edge, which only the notifications take.
   * They are not factored into styles/banner.css because that sheet is paid for by every
   * consumer, and these rules cost more than the size gate allows; change one, change the other.
   *
   * The fixed positioning and the guard hiding a closed container come from the shared
   * `.v-overlay` class, set on this same element. What is undone here is the browser's own
   * popover decoration: its border, its padding, its opaque background.
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
   * PHYSICAL coordinates rather than logical ones: a message appears at a place on the
   * screen, and that place does not flip with the reading direction — the operating
   * system's own notifications behave the same way.
   *
   * `--banner-enter-y` is the direction each card slides in from, read by `.v-banner` in
   * styles/banner.css: the container is the only thing that knows which edge of the screen
   * it sits on. That sheet reads it with a `, 0` fallback, so dropping the declaration costs
   * the slide and nothing else, and nothing reports it.
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

  /* The box, the decoration, the typography and the entry motion come from the shared
     `.v-banner` class set on this same element — the chassis this bar has in common with
     the notification card, in `styles/banner.css`, along with the message block and the
     trailing control. What stays here is what the two genuinely differ on: the alignment,
     the padding, the width, and the tone painting. */
  .v-snackbar {
    /* Centred, where the notification hooks to its first line. A confirmation is ONE
       short sentence and it carries a real button: on a message that wraps, aligning to
       the start would park that button in the top corner, away from the text it answers.
       Centring also puts the icon in the middle, which is what keeps the two ends of the
       bar reading as one row. */
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
      calc(100vw - 2 * var(--vectis-space-4))
    );
  }

  /*
   * Both tones are painted SOLID, and there is deliberately no soft variant: a
   * confirmation is a short-lived object laid over arbitrary content, so it has to read at
   * a glance rather than tint into the page.
   *
   * The tone table itself lives in styles/tones.css, in a layer below the components, and
   * is shared with VButton, VChip and VToast. Neutral needs no override here — its solid
   * pair IS the design system's canonical text/surface inversion, dark on a light theme
   * and light on a dark one, which is exactly what a snackbar wants and is why it is
   * expressed there rather than restated here. The action button reads on both through
   * the rebind `.v-banner-control` carries.
   */
  .v-snackbar {
    background: var(--tone-bg-solid);
    color: var(--tone-text-solid);
  }

  /* No alignment margin here, unlike the notification: `align-items: center` above already
     puts the icon on the row's centre line, and an equal margin on a centred item changes
     nothing at all — it would be a declaration that does no work. */
  .v-snackbar-icon {
    --vectis-icon-size: var(--vectis-icon-size-md);
  }
}
</style>
