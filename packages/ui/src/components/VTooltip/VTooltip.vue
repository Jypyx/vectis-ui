<script setup lang="ts">
import { ref, useId } from 'vue'

import VPopover from '../VPopover/VPopover.vue'

import { useTimer } from '../../composables/useTimer'

/**
 * VTooltip on top of `VPopover` (`mode="manual"`: no light dismiss, the component
 * drives it). Justified JS: no stable HTML primitive covers "show on hover/focus
 * with a delay" (`interestfor` is still experimental) — the JS handles the delay,
 * pointer/focus and Escape (WCAG 1.4.13).
 *
 * 100% CSS anchoring with no unique ID: a static `anchor-name` on the wrapper,
 * confined to its subtree by `anchor-scope`. Without that confinement, a shown
 * panel (in the top layer, hence "after" the whole document for anchor resolution)
 * would attach to the LAST named wrapper on the page. The wrapper stays here (it
 * carries the pointer/focus handlers): VPopover's `#trigger` is not used, since a
 * tooltip trigger is not a `popovertarget` invoker — it would toggle on click — but
 * an element DESCRIBED by the panel.
 */
type Placement =
  'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'right'

interface TooltipProps {
  /** Text content of the tooltip (the #content slot wins when provided). */
  text?: string
  placement?: Placement
  /** Opening delay on hover, in ms (keyboard focus opens immediately). */
  delay?: number
}

const props = withDefaults(defineProps<TooltipProps>(), {
  text: undefined,
  placement: 'top',
  delay: 300,
})

defineSlots<{
  /** Trigger: set `v-bind="triggerProps"` (aria-describedby) on the focusable element. */
  default(props: { triggerProps: { 'aria-describedby': string } }): unknown
  /**
   * Rich content in place of `text`. NON-interactive only (formatting, kbd, icons):
   * the tooltip closes as soon as the pointer leaves the trigger, and
   * `aria-describedby` flattens the content to text — a link or button would be
   * unreachable there. For interactive content, prefer a persistent floating panel
   * (VMenu).
   */
  content?(): unknown
}>()

const tooltipId = useId()
/*
 * VPopover is driven imperatively (and not through `v-model:open`): keyboard focus
 * must open it SYNCHRONOUSLY — a model would go through VPopover's watch, hence
 * through a tick. The tooltip publishes no open state, so it has no use for a
 * model. The idempotence guards live upstream, in usePopover.
 */
const popoverRef = ref<InstanceType<typeof VPopover> | null>(null)

// Appearance delay (see useTimer: re-arming and cancellation on unmount).
const timer = useTimer()

function show(immediate = false) {
  // a delay of 0 = synchronous execution (the useTimer convention)
  timer.start(() => popoverRef.value?.show(), immediate ? 0 : props.delay)
}

function hide() {
  timer.cancel()
  popoverRef.value?.hide()
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') hide()
}
</script>

<template>
  <span
    class="v-tooltip"
    @pointerenter="show()"
    @pointerleave="hide"
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
  .v-tooltip {
    display: inline-block;
    anchor-name: --tooltip-anchor;
    /* confines the anchor name to this subtree: each panel (even in the top layer)
       resolves ITS wrapper, not the last named wrapper on the page */
    anchor-scope: --tooltip-anchor;
  }

  /* `position-anchor` comes from VPopover (the `anchor` prop) */
  .v-tooltip-panel {
    width: max-content;
    max-width: min(18rem, calc(100vw - var(--vectis-space-8)));
    padding: var(--vectis-space-1) var(--vectis-space-2);
    /* inverted contrast: dark grey in both themes (darker in dark) */
    background: var(--vectis-color-surface-inverse);
    color: var(--vectis-color-text-on-inverse);
    border: none;
    border-radius: var(--vectis-radius-sm);
    box-shadow: var(--vectis-shadow-2);
    font-family: var(--vectis-text-family);
    font-size: var(--vectis-text-caption-size);
    line-height: var(--vectis-text-caption-leading);
  }
}
</style>
