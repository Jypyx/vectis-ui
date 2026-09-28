<script setup lang="ts">
// @core
/**
 * Bridge native popover state to v-model while CSS anchors the panel. Roles, keyboard handling
 * and dismissal policy belong to the consuming widget.
 */
import { computed, ref, useId } from 'vue'

import { usePopover, usePopoverModel } from '../../composables/usePopover'

export type PopoverPlacement =
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

/**
 * What the trigger has to carry for the browser to open the panel and for assistive technology
 * to know what it controls.
 */
export type PopoverTriggerProps = {
  popovertarget: string
  'aria-expanded': boolean
  'aria-controls': string
}

/** Whether the browser dismisses the panel on its own. */
export type PopoverMode = 'auto' | 'manual'

interface PopoverProps {
  /**
   * The id of the panel, which the trigger points at. One is generated when none is
   * given, so this is only needed to tie the panel to something outside the
   * component.
   */
  id?: string
  /**
   * Where the panel is placed relative to its trigger. The browser flips it to the
   * opposite side by itself when there is not enough room.
   */
  placement?: PopoverPlacement
  /** How the panel closes. */
  mode?: PopoverMode
  /**
   * The name of an anchor the consumer has set on its own control, written as a CSS
   * dashed identifier such as `--tooltip-anchor`. Supplying it replaces the internal
   * wrapper, which is the required route as soon as the trigger is a text input,
   * where the browser's own `popovertarget` attribute is not allowed.
   */
  anchor?: string
  /**
   * Strips the panel of the design system's surface: no background, no border, no
   * shadow and no rounded corners. It is what a panel whose content brings its own
   * asks for, as VDatePicker does.
   */
  bare?: boolean
  /** Stops the panel being narrower than whatever it is anchored to. */
  matchTrigger?: boolean
}

const props = withDefaults(defineProps<PopoverProps>(), {
  id: undefined,
  placement: 'bottom-start',
  mode: 'auto',
  anchor: undefined,
  bare: false,
  matchTrigger: false,
})

/**
 * Whether the panel is showing. Setting it opens and closes the panel; a consumer needing the
 * change to be synchronous uses the exposed `show`/ `close` instead, which VTooltip and the
 * pickers do.
 */
const open = defineModel<boolean>('open', { default: false })

const slots = defineSlots<{
  /**
   * The element that opens the panel. Bind the `triggerProps` it receives onto a
   * button of your own: that is what wires the two together.
   */
  trigger?(props: { triggerProps: PopoverTriggerProps }): unknown
  /** What the panel contains. */
  default(): unknown
}>()

/*
 * Everything the consumer passes; the ARIA role, the aria-*, the data-*, class, style and the
 * listeners; goes on the PANEL rather than on the anchoring wrapper, because the panel is what
 * the consumer is really describing and styling. This is a deliberate departure from the design
 * system's usual wrapper pattern, which keeps class and style on the root; `useRootAttrs`
 * therefore does not apply here.
 */
defineOptions({ inheritAttrs: false })

const panelEl = ref<HTMLElement | null>(null)
const generatedId = useId()
const panelId = computed(() => props.id ?? generatedId)

// The invariant to respect here: `shown` is fed by the panel's own events and never assigned by
// hand, so the browser stays the source of truth; it can close the panel without asking us.
const { shown, syncShown, show, hide } = usePopover(panelEl)

// A function read by the template, never a `computed`: `slots` is not reactive, so a computed
// would keep its first answer while a slot behind a `v-if` comes and goes.
function hasTrigger() {
  return slots.trigger !== undefined
}

const triggerProps = computed<PopoverTriggerProps>(() => ({
  popovertarget: panelId.value,
  'aria-expanded': open.value,
  'aria-controls': panelId.value,
}))

// Set the anchor explicitly in both trigger modes; an unset custom property would inherit an
// ancestor popover's anchor.
const panelStyle = computed(() => ({
  '--popover-anchor-name': props.anchor ?? '--popover-anchor',
}))

function onToggle(event: Event) {
  syncShown(event)
  open.value = shown.value
}

usePopoverModel(open, () => shown.value, show, hide)

// The imperative counterpart of `v-model:open`, for a consumer whose opening must be
// SYNCHRONOUS: the model would insert a tick, which is exactly what VTooltip's delay and
// the pickers' focus frame cannot afford.
defineExpose({
  /** Opens the panel at once, without waiting for the model to come round. */
  show,
  /** Closes it at once. Safe to call on a panel that is already closed. */
  close: hide,
  /** The panel element itself, which is the popover. */
  el: panelEl,
})
</script>

<template>
  <span class="v-popover" :data-trigger="hasTrigger() ? '' : undefined">
    <slot name="trigger" :trigger-props="triggerProps" />
    <div
      :id="panelId"
      ref="panelEl"
      :popover="mode"
      class="v-overlay v-popover-panel v-floating"
      :class="{ 'v-panel': !bare }"
      :data-placement="placement"
      :data-match-trigger="matchTrigger ? '' : undefined"
      :style="panelStyle"
      v-bind="$attrs"
      @beforetoggle="syncShown"
      @toggle="onToggle"
    >
      <slot />
    </div>
  </span>
</template>

<style>
@layer vectis.components {
  /*
   * Without a trigger the wrapper has nothing to wrap, so `display: contents` takes it out of
   * the layout entirely; the panel is positioned against the viewport and does not depend on
   * it. Left as an empty inline-block it would still create a line box, and therefore add
   * height, inside every component using this route.
   */
  .v-popover {
    display: contents;
  }

  /*
   * With a trigger the wrapper must generate a box, since that box is the ANCHOR; which is why
   * `display: contents` stops at the rule above. It is FLEX rather than inline-block, the
   * `.v-badge-host` and `.v-tooltip` form: both are inline-level atomic boxes, so text flows
   * around them identically, but an inline-block opens an inline formatting context for the
   * trigger, which then lands on a line box and adds the strut's descender to the wrapper.
   */
  .v-popover[data-trigger] {
    display: inline-flex;
    align-items: center;
    anchor-name: --popover-anchor;
    /*
     * Without the confinement every panel on the page would attach itself to the last wrapper
     * carrying this name.
     */
    anchor-scope: --popover-anchor;
  }

  /*
   * Widths, heights and overflow differ from one consumer to the next, and since each component
   * ships its own stylesheet, a declaration here would sit at equal specificity with theirs;
   * leaving the winner to whichever order the consumer's bundler happens to produce.
   */
  .v-popover-panel {
    position-anchor: var(--popover-anchor-name);
  }

  /*
   * `:where()` keeps this at (0,1,0). A bare consumer restyles its panel through the
   * `.v-popover-panel.v-x-panel` compound (VTooltip), at (0,2,0), which must win; a (0,2,0)
   * rule here would tie with it across two sheets.
   */
  .v-popover-panel:where(:not(.v-panel)) {
    border: none;
    padding: 0;
    background: none;
    color: inherit;
    overflow: visible;
  }

  /*
   * It is written here rather than in each consumer because `anchor-size()` resolves against
   * `position-anchor`, which is the declaration above; the same reason the anchoring itself
   * lives here. A minimum beats a maximum, so a consumer's own `max-inline-size` does not clamp
   * it: a trigger wider than the ceiling widens the panel past it, which is intended.
   */
  .v-popover-panel[data-match-trigger] {
    min-inline-size: anchor-size(width);
  }
}
</style>
