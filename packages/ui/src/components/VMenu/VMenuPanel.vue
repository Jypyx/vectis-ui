<script setup lang="ts">
import { computed, inject, ref } from 'vue'

import { usePopover } from '../../composables/usePopover'
import { menuInvoker, menuKey } from './context'
import type { MenuPanelPlacement } from './context'
import { arrowNavigate } from '../../utils/arrowNav'

// @a11y @keyboard @core
/**
 * INTERNAL popover panel (not exported), shared by VMenu (the root panel) and
 * VMenuItem (submenus). Popover API: native light dismiss, the `popovertarget`
 * invoker is the implicit anchor, pure CSS positioning (floating.css), common
 * chrome through `.v-panel` (panel.css).
 *
 * JS justified: the ARIA menu pattern is not covered natively —
 * - roving focus on the arrows/Home/End, confined to the current panel (subpanel
 *   keydowns bubble through the ancestor panels: guard on the event target);
 * - Escape closes THE CURRENT LEVEL (like ArrowLeft in a submenu, returning focus
 *   to the parent item); Tab closes the whole stack — a menu is not traversed
 *   with Tab.
 */
interface MenuPanelProps {
  /** Id of the panel, set by its owner (the target of the `popovertarget`s). */
  id: string
  placement?: MenuPanelPlacement
  /** Submenu panel: enables ArrowLeft, no automatic focus. */
  submenu?: boolean
  /**
   * Set by the root ONLY (no default: subpanels do not render data-size): the
   * subpanels inherit through CSS.
   */
  size?: 'sm' | 'md' | 'lg'
  /** Set by the root ONLY: the subpanels inherit through CSS. */
  compact?: boolean
  /**
   * Width of the panel (any CSS length/keyword, e.g. `max-content`). Set by the
   * root ONLY: the subpanels do not render data-width and keep the default width.
   */
  width?: string
  /**
   * Width floor = the trigger's width. Set by the root ONLY: the subpanels do not
   * render data-match-trigger (their trigger is an item, not a control to match).
   */
  matchTrigger?: boolean
}

const props = withDefaults(defineProps<MenuPanelProps>(), {
  placement: 'bottom-start',
  submenu: false,
  size: undefined,
  compact: false,
  width: undefined,
  matchTrigger: false,
})

const emit = defineEmits<{
  /** Open state of the popover (relayed to the owner). */
  toggle: [open: boolean]
}>()

defineSlots<{
  /** The VMenuItem / VMenuGroup / VMenuSeparator elements. */
  default(): unknown
}>()

const panelEl = ref<HTMLElement | null>(null)
// Open state, idempotence guards and the `source` option: see usePopover.
const { shown, syncShown, show, hide } = usePopover(panelEl)

const menu = inject(menuKey, null)

function onToggle(event: Event) {
  syncShown(event)
  emit('toggle', shown.value)
}

// @a11y @keyboard
function items(): HTMLElement[] {
  const panel = panelEl.value
  if (!panel) return []
  // :disabled only matches <button>; inert <a> items carry aria-disabled. The
  // filter confines the roving to the current panel (the items of open subpanels
  // are DOM descendants too).
  return [
    ...panel.querySelectorAll<HTMLElement>(
      '[role="menuitem"]:not(:disabled):not([aria-disabled="true"])',
    ),
  ].filter((el) => el.closest('[role="menu"]') === panel)
}

function closeAll() {
  if (menu) menu.closeAll()
  else hide()
}

// @a11y
function focusFirst() {
  items()[0]?.focus()
}

// @keyboard @a11y
function onKeydown(event: KeyboardEvent) {
  const panel = panelEl.value
  // only the panel DIRECTLY containing the target handles the event
  if (!panel || (event.target as Element).closest('[role="menu"]') !== panel) return

  if (event.key === 'Tab') {
    closeAll()
    return
  }
  if (event.key === 'Escape' || (props.submenu && event.key === 'ArrowLeft')) {
    // Escape closes THIS level ONLY. preventDefault: the native close request would
    // close the popover without handing focus back to the parent item (and our
    // hide() would already have closed it). At the root, the focus return to the
    // trigger is handled by VMenu's onToggle.
    event.preventDefault()
    hide()
    if (props.submenu) menuInvoker(props.id)?.focus()
    return
  }
  // Shared vertical roving (`utils/arrowNav`) but on OUR list: it also excludes
  // aria-disabled items and confines the roving to the current panel, two things
  // the generic selector does not do.
  arrowNavigate(event, panel, items(), { vertical: true })
}

// Inline style: the explicit width (the width prop) only.
const panelStyle = computed(() => (props.width ? { '--menu-width': props.width } : undefined))

defineExpose({ show, hide, focusFirst, el: panelEl })
</script>

<template>
  <div
    :id="id"
    ref="panelEl"
    popover="auto"
    role="menu"
    class="v-overlay v-panel v-menu v-floating"
    :class="{
      /*
       * `v-control` on the ROOT only: it sets the `--control-*` (height, paddings,
       * gap, typography, VIcon context) from styles/control-size.css, and the
       * subpanels — DOM descendants — inherit them. Setting it on them too would
       * break them: `.v-control` redefines `--control-height` from
       * `--control-height-base` WITHOUT the `[data-compact]` condition (absent from
       * the subpanels), which would therefore snap back to its non-compact value.
       */
      'v-control': !submenu,
    }"
    :data-placement="placement"
    :data-size="size"
    :data-compact="compact ? '' : undefined"
    :data-width="width ? '' : undefined"
    :data-match-trigger="matchTrigger ? '' : undefined"
    :style="panelStyle"
    @beforetoggle="syncShown"
    @toggle="onToggle"
    @keydown="onKeydown"
  >
    <slot />
  </div>
</template>

<style>
@layer vectis.components {
  /* Chrome (surface, border, shadow, internal rhythm): the shared `.v-panel` class
     (styles/panel.css). Sizes: the shared `v-control` class set above on the ROOT
     panel (see the template) — no local table, the items consume the inherited
     `--control-*`. Only the rules specific to the dropdown menu stay here. */
  .v-menu {
    min-inline-size: var(--vectis-control-size-menu-min);
    max-inline-size: min(var(--vectis-control-size-menu-max), calc(100vw - var(--vectis-space-8)));
  }

  /* Aligns the first subitem on the parent item (compensates padding + border) */
  .v-menu .v-menu[data-placement='right-start'] {
    margin-block-start: calc(-1 * (var(--vectis-space-1) + 1px));
  }

  /* Explicit width (the width prop): rendered by the ROOT panel only — the
     subpanels do not set data-width, so the inherited variable is inert there. The
     viewport ceiling of max-inline-size stays. */
  .v-menu[data-width] {
    min-inline-size: 0;
    inline-size: var(--menu-width);
  }

  /* Width floor = the trigger's width (the matchTrigger prop). The panel is
     implicitly anchored to its `popovertarget` invoker, so anchor-size() resolves
     with no anchor-name — where VCombobox and VTimePicker, anchored to an <input>,
     have to name their anchor. Rendered by the ROOT panel only.
     Placed AFTER [data-width] (equal specificity): combined with `width`, this floor
     wins. A trigger wider than the ceiling widens the panel past it
     (min-inline-size beats max-inline-size): intended. */
  .v-menu[data-match-trigger] {
    min-inline-size: anchor-size(width);
  }
}
</style>
