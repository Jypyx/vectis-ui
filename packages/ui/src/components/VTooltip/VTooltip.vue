<script setup lang="ts">
/**
 * A short explanation appearing beside an element on hover or keyboard focus. A VPopover in
 * `mode="manual"`, a tooltip having its own rules about when to appear and when to go.
 *
 * Those rules are why there is JS here at all: HTML has no stable way to say "show this
 * after a delay on hover or focus", so the component handles the delay, the pointer, the
 * focus, a press on the trigger, and Escape — which must dismiss without moving the focus
 * (WCAG 1.4.13).
 *
 * Four ways out, each covering what the others do not: the pointer leaves, the focus leaves,
 * Escape, or the trigger is PRESSED — that last for a trigger opening a panel, where the
 * tooltip would otherwise stand over what it just opened.
 *
 * Positioning is pure CSS with no generated id: the wrapper names itself as the anchor and
 * confines that name to its own subtree. The confinement is essential — a shown panel moves
 * to the top layer, which anchor resolution treats as coming after the whole document, so
 * without it every tooltip would attach to the last wrapper named on the page.
 *
 * The wrapper stays HERE rather than going through VPopover's `#trigger`: a tooltip trigger
 * is not a `popovertarget` invoker, which would toggle on click, but an element the panel
 * DESCRIBES.
 */

import { ref, useId } from 'vue'

import VPopover from '../VPopover/VPopover.vue'

import { useTimer } from '../../composables/useTimer'

type Placement =
  'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'right'

interface TooltipProps {
  /** What the tooltip says. The `#content` slot replaces it when both are given. */
  text?: string
  /**
   * Which side of the element the tooltip appears on. The browser flips it to the
   * opposite side by itself when there is not enough room.
   */
  placement?: Placement
  /**
   * How long the pointer must rest on the element before the tooltip appears, in
   * milliseconds. Keyboard focus opens it at once — the intent is not in doubt there
   * — and a delay of 0 disables the wait entirely.
   */
  delay?: number
}

const props = withDefaults(defineProps<TooltipProps>(), {
  text: undefined,
  placement: 'top',
  delay: 300,
})

defineSlots<{
  /**
   * The element the tooltip describes. Bind the `triggerProps` it receives onto it —
   * that is what ties the two together for assistive technology — and make sure it is
   * something that can take focus, or keyboard users will never see the tooltip.
   */
  default(props: { triggerProps: { 'aria-describedby': string } }): unknown
  /**
   * Content richer than a plain string: formatting, a keyboard shortcut, an icon. It
   * must stay NON-interactive. The tooltip closes as soon as the pointer leaves the
   * element, so a link or a button inside could never be reached, and the description
   * is flattened to plain text for screen readers anyway. Content one can interact
   * with belongs in a panel that stays open, such as VMenu.
   */
  content?(): unknown
}>()

const tooltipId = useId()
// @a11y
/*
 * The panel is opened and closed by calling it directly rather than through
 * `v-model:open`. Keyboard focus has to open it SYNCHRONOUSLY, and a model would go
 * through VPopover's watcher, hence through a tick. There is nothing lost either way:
 * a tooltip publishes no open state anyone needs to read.
 *
 * Calling twice is harmless — the guards for that live upstream in usePopover.
 */
const popoverRef = ref<InstanceType<typeof VPopover> | null>(null)

// The delay before appearing. useTimer is what makes it re-armable and cancels it
// when the component goes away.
const timer = useTimer()

// @core
function show(immediate = false) {
  // A delay of 0 runs the callback synchronously — the design system's convention,
  // and what lets keyboard focus share this code path without waiting a tick.
  timer.start(() => popoverRef.value?.show(), immediate ? 0 : props.delay)
}

function hide() {
  timer.cancel()
  popoverRef.value?.hide()
}

// @keyboard @a11y — Escape must dismiss a tooltip opened by hover or focus without
// moving the focus anywhere (WCAG 1.4.13): content appearing on hover has to be
// dismissible, for a magnifier user whose view it may be covering.
function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') hide()
}
</script>

<template>
  <!--
    TRAP — `pointerdown` is what stops a tooltip from surviving the click that acted on its
    trigger, and the case it really covers is a trigger that OPENS something: a menu, a
    dialog, a popover of any kind. The tooltip would then stand over what it opened, and
    none of the other three exits applies — the pointer has not left, the focus has not
    moved out on its own, and nobody pressed Escape.

    It looks redundant on Chromium and Firefox, where a click focuses the button and the
    panel then takes the focus, which fires this wrapper's `focusout`. Safari on macOS does
    NOT focus a button on click, so nothing leaves the wrapper and the tooltip stays up,
    behind the panel, until the pointer moves. Delete this line and that is the bug that
    comes back, on one browser only.

    It is `pointerdown` and not `click`, so the tooltip is gone BEFORE the panel appears
    rather than overlapping it for a frame. Keyboard activation sends no `pointerdown` at
    all, and needs none: focus moving into the panel closes the tooltip everywhere.
  -->
  <span
    class="v-tooltip"
    @pointerenter="show()"
    @pointerleave="hide"
    @pointerdown="hide"
    @focusin="show(true)"
    @focusout="hide"
    @keydown="onKeydown"
  >
    <slot :trigger-props="{ 'aria-describedby': tooltipId }" />
    <VPopover
      :id="tooltipId"
      ref="popoverRef"
      mode="manual"
      anchor="--tooltip-anchor"
      :placement="placement"
      :surface="false"
      role="tooltip"
      class="v-tooltip-panel"
    >
      <slot name="content">{{ text }}</slot>
    </VPopover>
  </span>
</template>

<style>
@layer vectis.components {
  /* The wrapper is FLEX and not inline-block, for the same reason as `.v-badge-host`:
     both are inline-level atomic boxes, so the surrounding text flows identically, but
     an inline-block establishes an inline formatting context for the trigger — which
     then sits on a line box and adds the strut's descender to the wrapper's height.
     That is not only a couple of pixels in a flex row: this wrapper is also the ANCHOR,
     so the panel is offset by them too.

     `align-items: center` covers what is left. A wrapper stretched by a parent in
     `align-items: stretch` would otherwise stretch the trigger with it, where the
     inline-block form left it at its natural height. */
  .v-tooltip {
    display: inline-flex;
    align-items: center;
    anchor-name: --tooltip-anchor;
    /* Confining the name to this subtree is indispensable: a visible panel moves to
       the top layer, where anchor resolution treats it as coming after the whole
       document, so without it every tooltip would attach to the LAST wrapper carrying
       this name. */
    anchor-scope: --tooltip-anchor;
  }

  /* The anchoring itself comes from VPopover, through the `anchor` prop.

     The selector is written as a compound of two classes that both land on this same
     element, even though the panel class it guards against — `.v-panel` — is never
     present here, VTooltip asking for no surface. It is written that way so it cannot
     break the day that prop changes: at equal specificity the winner between two
     component sheets is decided by the order the consumer's bundler happens to
     produce, which is nobody's decision. */
  .v-popover-panel.v-tooltip-panel {
    width: max-content;
    max-width: min(18rem, calc(100vw - var(--vectis-space-8)));
    padding: var(--vectis-space-1) var(--vectis-space-2);
    /* The tooltip is painted against the page rather than with it: a dark surface in
       both themes, darker still in the dark one, so it reads as an overlay whatever
       it happens to cover. */
    background: var(--vectis-color-surface-inverse);
    color: var(--vectis-color-text-on-inverse);
    border: none;
    border-radius: var(--vectis-radius-sm);
    box-shadow: var(--vectis-shadow-sm);
    font-family: var(--vectis-text-family);
    font-size: var(--vectis-text-caption-size);
    line-height: var(--vectis-text-caption-leading);
  }
}
</style>
