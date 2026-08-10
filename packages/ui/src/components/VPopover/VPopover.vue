<script setup lang="ts">
// @core
/**
 * Generic floating panel: the native Popover API + 100% CSS anchoring
 * (`position-anchor`), with no dependency and no JS positioning.
 *
 * This component carries ONLY the plumbing common to every panel in the DS: the
 * `[popover]` element and its mode, the DOM ↔ `v-model:open` state bridge (see
 * `usePopover`), the anchoring and placement (`.v-overlay`/`.v-floating`), and
 * the optional surface (`.v-panel`). It carries NO ARIA role, NO keyboard, NO
 * focus management and NO dismissal policy: that is what distinguishes each
 * panel, and it stays with the consumers (VTooltip, VCombobox, VDatePicker,
 * VTimePicker). A panel parameterized by `role` stays forbidden.
 *
 * Two mutually exclusive anchoring modes:
 * - the `#trigger` slot → the `.v-popover` wrapper carries the `anchor-name`,
 *   confined by `anchor-scope` (a shared static name: each panel resolves ITS
 *   wrapper, not the last one named on the page — see VTooltip);
 * - the `anchor` prop → the consumer already owns the root and the control, sets
 *   `anchor-scope`/`anchor-name` itself and supplies only the name. The wrapper
 *   then switches to `display: contents`: no layout node added.
 *
 * Justified JS: the v-model ↔ imperative popover API bridge, nothing else.
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

/** Props to set on the trigger (the disclosure pattern). */
export type PopoverTriggerProps = {
  popovertarget: string
  'aria-expanded': boolean
  'aria-controls': string
}

interface PopoverProps {
  /** Id of the panel (target of `popovertarget`/`aria-controls`). Default: generated. */
  id?: string
  placement?: PopoverPlacement
  /**
   * `auto`: native light dismiss (click outside, Escape) and a popover stack.
   * `manual`: nothing is automatic, the consumer closes it itself.
   */
  mode?: 'auto' | 'manual'
  /**
   * Static anchor (a dashed-ident, e.g. `--tooltip-anchor`) set by the consumer
   * on its control. Takes precedence over the internal wrapper.
   */
  anchor?: string
  /** Surface decoration (`.v-panel`: background, border, shadow, radius). */
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
  /** Trigger: set `v-bind="triggerProps"` on a <VButton>/<button>. */
  trigger?(props: { triggerProps: PopoverTriggerProps }): unknown
  /** Panel content. */
  default(): unknown
}>()

/*
 * The consumer's attributes (ARIA role, aria-*, data-*, class, style, listeners)
 * go on the PANEL, not on the anchoring wrapper: the panel is the visual and
 * semantic subject. A deliberate variant of the DS's wrapper-root pattern, which
 * keeps class/style on the root — so `useRootAttrs` does not apply here.
 */
defineOptions({ inheritAttrs: false })

const panelEl = ref<HTMLElement | null>(null)
const generatedId = useId()
const panelId = computed(() => props.id ?? generatedId)

// Open state and idempotence guards: see usePopover. `shown` is fed by the
// panel's events, never set by hand.
const { shown, syncShown, show, hide } = usePopover(panelEl)

const hasTrigger = computed(() => slots.trigger !== undefined)

const triggerProps = computed<PopoverTriggerProps>(() => ({
  popovertarget: panelId.value,
  'aria-expanded': open.value,
  'aria-controls': panelId.value,
}))

// A single CSS declaration covers both modes: `position-anchor` falls back to the
// wrapper's name when the variable is not set.
const panelStyle = computed(() => (props.anchor ? { '--anchor-name': props.anchor } : undefined))

function onToggle(event: Event) {
  syncShown(event)
  open.value = shown.value
}

// Programmatic open/close through v-model (client only).
watch(open, (value) => {
  if (value === shown.value) return
  if (value) show()
  else hide()
})

// @ssr — watchers do not run on the server: the initial state is replayed on mount.
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
   * With no trigger the wrapper serves no purpose: `display: contents` removes it
   * from the layout (the panel is `position: fixed` and does not depend on it) —
   * an empty `inline-block` would create a line box, hence height, for every
   * internal consumer.
   */
  .v-popover {
    display: contents;
  }

  .v-popover[data-trigger] {
    display: inline-block;
    anchor-name: --popover-anchor;
    /* confines the anchor name to this subtree: each panel (even in the top
       layer) resolves ITS wrapper, not the last named wrapper on the page */
    anchor-scope: --popover-anchor;
  }

  /*
   * The panel's only declaration: NO dimension here. `min/max-inline-size`,
   * `max-block-size` and `overflow` vary from one consumer to the next and would
   * be arbitrated by bundle order at equal specificity (0,1,0).
   */
  .v-popover-panel {
    position-anchor: var(--anchor-name, --popover-anchor);
  }
}
</style>
