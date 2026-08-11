<script setup lang="ts">
// @core
/**
 * A panel that floats above the page, next to whatever opened it. It is built on the
 * browser's own popover support and positions itself entirely in CSS, so there is no
 * positioning library involved and no JavaScript measuring anything.
 *
 * What it carries is deliberately only the PLUMBING every panel of the design system
 * needs: the popover element and how it opens, the bridge between the browser's own
 * open state and `v-model:open`, the anchoring and the placement, and an optional
 * surface — the background, border and shadow of a panel.
 *
 * What it carries NOT is just as deliberate: no ARIA role, no keyboard, no focus
 * management and no rule about when to close. Those are exactly what makes a menu
 * different from a listbox or a tooltip, and they stay with the components building
 * on it — VTooltip, VCombobox, VDatePicker, VTimePicker. Turning this into one panel
 * with a `role` prop would put all four sets of behaviour back into a single file.
 *
 * There are two ways of anchoring it, and they exclude one another:
 *
 * - the `#trigger` slot, where the component wraps the trigger and names that
 *   wrapper as the anchor. The name is shared by every instance and confined to each
 *   wrapper's own subtree, which is what makes a panel resolve ITS trigger rather
 *   than the last one named on the page — a real risk, since an open panel moves to
 *   the top layer and counts as coming after the whole document.
 * - the `anchor` prop, for a consumer that already owns its root and its control —
 *   VCombobox and the pickers do. They name the anchor themselves and pass the name
 *   in, and the wrapper then disappears from the layout entirely.
 *
 * The only JavaScript is the bridge between `v-model:open` and the browser's own
 * imperative popover methods.
 */
import { computed, onMounted, ref, useId, watch } from 'vue'

import { usePopover } from '../../composables/usePopover'

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
 * What the trigger has to carry for the browser to open the panel and for assistive
 * technology to know what it controls. It is the disclosure pattern and nothing more:
 * no role and no `aria-haspopup` are imposed, since only the consumer knows what kind
 * of panel it is opening.
 */
export type PopoverTriggerProps = {
  popovertarget: string
  'aria-expanded': boolean
  'aria-controls': string
}

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
  /**
   * How the panel closes. `auto` lets the browser dismiss it on a click outside or on
   * Escape, and stack it with other panels; `manual` leaves everything to the
   * consumer, which is what a panel with its own focus and dismissal rules needs.
   */
  mode?: 'auto' | 'manual'
  /**
   * The name of an anchor the consumer has set on its own control, written as a CSS
   * dashed identifier such as `--tooltip-anchor`. Supplying it replaces the internal
   * wrapper, which is the required route as soon as the trigger is a text input,
   * where the browser's own `popovertarget` attribute is not allowed.
   */
  anchor?: string
  /**
   * Gives the panel the look of a surface: background, border, shadow and rounded
   * corners. Turn it off for a panel that brings its own, as VCalendar does.
   */
  surface?: boolean
}

const props = withDefaults(defineProps<PopoverProps>(), {
  id: undefined,
  placement: 'bottom-start',
  mode: 'auto',
  anchor: undefined,
  surface: true,
})

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
 * Everything the consumer passes — the ARIA role, the aria-*, the data-*, class,
 * style and the listeners — goes on the PANEL rather than on the anchoring wrapper,
 * because the panel is what the consumer is really describing and styling.
 *
 * This is a deliberate departure from the design system's usual wrapper pattern,
 * which keeps class and style on the root; `useRootAttrs` therefore does not apply
 * here.
 */
defineOptions({ inheritAttrs: false })

const panelEl = ref<HTMLElement | null>(null)
const generatedId = useId()
const panelId = computed(() => props.id ?? generatedId)

// The open state and the guards that keep the calls idempotent live in usePopover.
// The invariant to respect here: `shown` is fed by the panel's own events and never
// assigned by hand, so the browser stays the source of truth — it can close the panel
// without asking us.
const { shown, syncShown, show, hide } = usePopover(panelEl)

const hasTrigger = computed(() => slots.trigger !== undefined)

const triggerProps = computed<PopoverTriggerProps>(() => ({
  popovertarget: panelId.value,
  'aria-expanded': open.value,
  'aria-controls': panelId.value,
}))

// Both anchoring modes are served by one CSS declaration: the panel reads this
// variable, and falls back to the wrapper's own anchor name when it is not set.
const panelStyle = computed(() => (props.anchor ? { '--anchor-name': props.anchor } : undefined))

function onToggle(event: Event) {
  syncShown(event)
  open.value = shown.value
}

// Opening and closing from the model. The guard is what keeps the two directions
// from chasing each other: a panel closed by the browser has already updated `shown`,
// and calling hide() again would be pointless at best.
watch(open, (value) => {
  if (value === shown.value) return
  if (value) show()
  else hide()
})

// @ssr — a watcher does not run during the server render, so a panel asked to be
// open from the start would never be told to open. Replaying the initial state on
// mount is what covers that case.
onMounted(() => {
  if (open.value) show()
})

defineExpose({ show, hide, el: panelEl })
</script>

<template>
  <span class="v-popover" :data-trigger="hasTrigger ? '' : undefined">
    <slot name="trigger" :trigger-props="triggerProps" />
    <div
      :id="panelId"
      ref="panelEl"
      :popover="mode"
      class="v-overlay v-popover-panel v-floating"
      :class="{ 'v-panel': surface }"
      :data-placement="placement"
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
   * Without a trigger the wrapper has nothing to wrap, so `display: contents` takes
   * it out of the layout entirely — the panel is positioned against the viewport and
   * does not depend on it. Left as an empty inline-block it would still create a line
   * box, and therefore add height, inside every component using this route.
   */
  .v-popover {
    display: contents;
  }

  .v-popover[data-trigger] {
    display: inline-block;
    anchor-name: --popover-anchor;
    /* Confining the name to this subtree is indispensable, not tidy: an open panel
       moves to the top layer, where anchor resolution treats it as coming after the
       whole document. Without the confinement every panel on the page would attach
       itself to the LAST wrapper carrying this name. */
    anchor-scope: --popover-anchor;
  }

  /*
   * The panel gets this one declaration and no dimension whatsoever. Widths, heights
   * and overflow differ from one consumer to the next, and since each component ships
   * its own stylesheet, a declaration here would sit at equal specificity with theirs
   * — leaving the winner to whichever order the consumer's bundler happens to
   * produce.
   */
  .v-popover-panel {
    position-anchor: var(--anchor-name, --popover-anchor);
  }
}
</style>
