<script setup lang="ts">
import { computed, inject, ref } from 'vue'

import { usePopover } from '../../composables/usePopover'
import { menuInvoker, menuKey } from './context'
import type { MenuPanelPlacement } from './context'
import { arrowNavigate } from '../../utils/arrowNav'

// @a11y @keyboard @core
/**
 * The panel a menu is drawn in. It is internal to VMenu and never exported, and the
 * same component serves both levels: the menu itself and every submenu inside it.
 *
 * It rests on the browser's popover support, which gives it dismissal on a click
 * outside, positioning against whatever opened it, and — since a submenu is rendered
 * inside its parent panel — a stack the browser closes from the outside in. The
 * panel's own look comes from the shared `.v-panel` class.
 *
 * The JavaScript is what the platform does not provide, namely the ARIA menu keyboard:
 *
 * - the arrows and Home/End move the focus from item to item, with only one item in
 *   the tab order at a time, and that movement is confined to the panel the focus is
 *   actually in — a keystroke inside a submenu also passes through every panel
 *   containing it, hence the guard on where the event came from;
 * - Escape closes THE CURRENT LEVEL only, as does the left arrow in a submenu,
 *   handing the focus back to the item that opened it;
 * - Tab closes the whole menu, because a menu is not something one tabs through.
 */
interface MenuPanelProps {
  /** The panel's id, set by whoever owns it. It is what the trigger points at. */
  id: string
  /** Where the panel opens relative to whatever opened it. */
  placement?: MenuPanelPlacement
  /**
   * Marks this panel as a submenu, which enables the left arrow as a way back and
   * stops the panel from taking the focus by itself when it opens.
   */
  submenu?: boolean
  /**
   * The row height, set by the ROOT panel only. Submenus receive no value and inherit
   * it through CSS instead.
   */
  size?: 'sm' | 'md' | 'lg'
  /** The reduced density, again set by the ROOT panel only and inherited through CSS. */
  compact?: boolean
  /**
   * An explicit width, set by the ROOT panel only. Submenus render no width attribute
   * and keep the default one, so an inherited value cannot reach them.
   */
  width?: string
  /**
   * Stops the panel from being narrower than its trigger, set by the ROOT panel only:
   * a submenu's trigger is a menu item, not a control worth matching.
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
  /**
   * The panel opened or closed. It is reported by the browser, so it also covers a
   * dismissal nobody asked for in code.
   */
  toggle: [open: boolean]
}>()

defineSlots<{
  /** The contents of the panel: VMenuItem, VMenuGroup and VMenuSeparator. */
  default(): unknown
}>()

const panelEl = ref<HTMLElement | null>(null)
// The open state, the guards keeping the calls idempotent, and the option that gives
// a programmatically opened submenu its anchor, all live in usePopover.
const { shown, syncShown, show, hide } = usePopover(panelEl)

const menu = inject(menuKey, null)

function onToggle(event: Event) {
  syncShown(event)
  emit('toggle', shown.value)
}

// @a11y @keyboard
/**
 * The items the keyboard may move to. Two exclusions matter: `:disabled` only ever
 * matches a `<button>`, so an inert link is recognized by its `aria-disabled`
 * instead; and the final filter keeps only the items of THIS panel, since an open
 * submenu's items are DOM descendants of it and would otherwise join the list.
 */
function items(): HTMLElement[] {
  const panel = panelEl.value
  if (!panel) return []
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
/** Puts the focus on the first item the keyboard can reach, when the menu opens. */
function focusFirst() {
  items()[0]?.focus()
}

// @keyboard @a11y
function onKeydown(event: KeyboardEvent) {
  const panel = panelEl.value
  // A keystroke inside a submenu passes through every panel containing it on its way
  // up, so only the panel the focused item DIRECTLY belongs to acts on it.
  if (!panel || (event.target as Element).closest('[role="menu"]') !== panel) return

  if (event.key === 'Tab') {
    closeAll()
    return
  }
  if (event.key === 'Escape' || (props.submenu && event.key === 'ArrowLeft')) {
    // Escape closes THIS level and no more. The `preventDefault` matters: left to
    // itself the browser would close the popover on its own, without handing the
    // focus back to the item that opened it — and our own hide() would already have
    // closed it anyway. At the top level, VMenu is what returns the focus to the
    // trigger.
    event.preventDefault()
    hide()
    if (props.submenu) menuInvoker(props.id)?.focus()
    return
  }
  // The movement itself is the shared one from `utils/arrowNav`, but it is handed OUR
  // list rather than letting it discover the items: ours also drops the disabled
  // links and stays inside this panel, neither of which the generic selector does.
  arrowNavigate(event, panel, items(), { vertical: true })
}

// The only thing set inline is an explicit width, when the prop asks for one.
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
       * The size class goes on the ROOT panel only. It sets the whole `--control-*`
       * family — height, paddings, gap, type, icon context — and the submenus, being
       * DOM descendants, inherit every one of them.
       *
       * Adding it to the submenus as well would BREAK them: the class recomputes the
       * height from the base one without knowing about the compact attribute, which
       * submenus do not carry, so a compact menu's submenus would silently snap back
       * to full height.
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
  /* The panel's surface, border, shadow and inner rhythm come from the shared
     `.v-panel` class, and its dimensions from the `v-control` class the template sets
     on the root panel — there is no size table here, the rows reading the inherited
     variables directly. Only what is specific to a dropdown menu stays below. */
  .v-menu {
    min-inline-size: var(--vectis-control-size-menu-min);
    max-inline-size: min(var(--vectis-control-size-menu-max), calc(100vw - var(--vectis-space-8)));
  }

  /* Pulls a submenu up so that its first item lines up with the item that opened it,
     by exactly the panel's own padding plus its border. */
  .v-menu .v-menu[data-placement='right-start'] {
    margin-block-start: calc(-1 * (var(--vectis-space-1) + 1px));
  }

  /* An explicit width, which only the ROOT panel ever renders: a submenu sets no such
     attribute, so the variable it inherits stays inert there. The ceiling that keeps
     a panel inside the viewport is untouched. */
  .v-menu[data-width] {
    min-inline-size: 0;
    inline-size: var(--menu-width);
  }

  /* The panel may not be narrower than its trigger. This works with no anchor name of
     any kind, because the button that opened the panel is already its implicit anchor
     — VCombobox and VTimePicker, anchored to a text input, have to name theirs. Like
     the width above, only the ROOT panel renders it.

     It is placed AFTER the width rule, at equal specificity, so that when both are
     given the floor wins. A trigger wider than the ceiling therefore widens the panel
     past it, a minimum width beating a maximum one — which is intended. */
  .v-menu[data-match-trigger] {
    min-inline-size: anchor-size(width);
  }
}
</style>
