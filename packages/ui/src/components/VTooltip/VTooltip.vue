<script setup lang="ts">
/**
 * Use a manual VPopover because tooltip hover, focus, delay and Escape policies differ from
 * native light dismissal. Pointer movement may require keeping the bubble open.
 */

import { computed, onBeforeUnmount, ref, useId } from 'vue'

import VPopover from '../VPopover/VPopover.vue'

import { useTimer } from '../../composables/useTimer'
import { isKeyboardFocus } from '../../utils/focus'

/** Which side of the element the tooltip appears on. */
export type TooltipPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end'

/** What the described element has to carry: the link to the tooltip that describes it. */
export type TooltipTriggerProps = {
  'aria-describedby': string
}

interface TooltipProps {
  /** What the tooltip says. The `#content` slot replaces it when both are given. */
  text?: string
  /**
   * Which side of the element the tooltip appears on. The browser flips it to the
   * opposite side by itself when there is not enough room.
   */
  placement?: TooltipPlacement
  /** How long the pointer must rest on the element before the tooltip appears, in milliseconds. */
  delay?: number
}

const props = withDefaults(defineProps<TooltipProps>(), {
  text: undefined,
  placement: 'top',
  delay: 300,
})

defineSlots<{
  /** The element the tooltip describes. */
  default(props: { triggerProps: TooltipTriggerProps }): unknown
  /** Content richer than a plain string: formatting, a keyboard shortcut, an icon. */
  content?(): unknown
}>()

const tooltipId = useId()
// @a11y
/*
 * Keyboard focus has to open it synchronously, and a model would go through VPopover's watcher,
 * hence through a tick. There is nothing lost either way: a tooltip publishes no open state
 * anyone needs to read.
 */
const popoverRef = ref<InstanceType<typeof VPopover> | null>(null)

// The delay before appearing. useTimer is what makes it re-armable and cancels it
// when the component goes away.
const timer = useTimer()

/**
 * How long a tooltip the pointer has left waits before going: the time to cross the gap between
 * the trigger and the bubble, which the margin leaves empty and which no pointer event covers.
 */
const LEAVE_GRACE = 100

let hovered = false
let focused = false

// @core
function show(immediate = false) {
  // A delay of 0 runs the callback synchronously; the design system's convention, and what lets
  // keyboard focus share this code path without waiting a tick.
  timer.start(() => popoverRef.value?.show(), immediate ? 0 : props.delay)
}

function hide() {
  timer.cancel()
  popoverRef.value?.close()
}

function onPointerEnter() {
  hovered = true
  show()
}

function onPointerLeave() {
  hovered = false
  if (focused) return
  timer.start(() => popoverRef.value?.close(), LEAVE_GRACE)
}

function onPointerDown() {
  hovered = false
  focused = false
  hide()
}

function onFocusOut() {
  focused = false
  if (!hovered) hide()
}

// @a11y
/*
 * The tooltip belongs to the KEYBOARD focus, and a `focusin` says the focus arrived, never how
 * it got there. `:focus-visible` is the browser's own answer to the question, the same one
 * VMenu asks to decide where a menu's focus lands.
 */
function onFocusIn(event: FocusEvent) {
  if (!isKeyboardFocus(event.target)) return
  focused = true
  show(true)
}

// @keyboard @a11y
// Escape must dismiss a tooltip opened by hover or focus without moving the focus anywhere
// (WCAG 1.4.13), for a magnifier user whose view it may be covering. It is heard on the
// DOCUMENT while the tooltip shows, since a hovered tooltip rarely holds the focus, and it
// is SPENT on it: inside a VDialog the same key would otherwise also be the dialog's close
// request.
function onDocumentKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape' || event.defaultPrevented) return
  event.preventDefault()
  hovered = false
  focused = false
  hide()
}

const listening = ref(false)
function onOpenChange(open: boolean) {
  if (open === listening.value) return
  listening.value = open
  if (open) document.addEventListener('keydown', onDocumentKeydown)
  else document.removeEventListener('keydown', onDocumentKeydown)
}
onBeforeUnmount(() => onOpenChange(false))

defineExpose({
  /** Shows the tooltip at once, without the hover delay. */
  show: () => show(true),
  /** Hides the tooltip. */
  close: hide,
  /** The tooltip bubble. */
  el: computed(() => popoverRef.value?.el ?? null),
})
</script>

<template>
  <!--
    Close on pointerdown so a tooltip cannot remain above a dialog or menu opened by its
    trigger.
  -->
  <span
    class="v-tooltip"
    @pointerenter="onPointerEnter"
    @pointerleave="onPointerLeave"
    @pointerdown="onPointerDown"
    @focusin="onFocusIn"
    @focusout="onFocusOut"
  >
    <slot :trigger-props="{ 'aria-describedby': tooltipId }" />
    <VPopover
      :id="tooltipId"
      ref="popoverRef"
      mode="manual"
      anchor="--tooltip-anchor"
      :placement="placement"
      bare
      role="tooltip"
      class="v-tooltip-panel"
      @update:open="onOpenChange"
    >
      <slot name="content">{{ text }}</slot>
    </VPopover>
  </span>
</template>

<style>
@layer vectis.components {
  /*
   * A wrapper stretched by a parent in `align-items: stretch` would otherwise stretch the
   * trigger with it, where the inline-block form left it at its natural height.
   */
  .v-tooltip {
    display: inline-flex;
    align-items: center;
    anchor-name: --tooltip-anchor;
    /*
     * Confining the name to this subtree is indispensable: a visible panel moves to the top
     * layer, where anchor resolution treats it as coming after the whole document, so without
     * it every tooltip would attach to the last wrapper carrying this name.
     */
    anchor-scope: --tooltip-anchor;
  }

  /*
   * Compound the panel classes so chrome overrides remain independent of VPopover stylesheet
   * order, including if bare changes.
   */
  .v-popover-panel.v-tooltip-panel {
    inline-size: max-content;
    max-inline-size: min(
      var(--vectis-control-size-tooltip-max),
      calc(100dvi - var(--vectis-space-8))
    );
    padding: var(--vectis-space-1) var(--vectis-space-2);
    /* The tooltip is painted against the page rather than with it: a dark surface in
       both themes, darker still in the dark one, so it reads as an overlay whatever
       it happens to cover. */
    background: var(--vectis-color-surface-inverse);
    color: var(--vectis-color-text-on-inverse);
    border: none;
    /* The control radius capped at half the height of a ONE-line bubble, the row recipe
       of VSideNavigationItem: a tooltip wraps past its max-inline-size, and under a pill
       override a two-line bubble would otherwise round to half of its own height. */
    border-radius: min(var(--vectis-radius-interactive), calc(0.5lh + var(--vectis-space-1)));
    box-shadow: var(--vectis-shadow-sm);
    font-family: var(--vectis-text-family);
    font-size: var(--vectis-text-caption-size);
    line-height: var(--vectis-text-caption-leading);
  }

  /* An outline draws one without moving the layout by a pixel. */
  @media (forced-colors: active) {
    .v-popover-panel.v-tooltip-panel {
      outline: 1px solid CanvasText;
    }
  }
}
</style>
