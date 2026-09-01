<script setup lang="ts">
// @a11y @keyboard @core
/**
 * The panel a menu is drawn in. Internal to VMenu, and the same component serves both
 * levels — the root menu and every submenu.
 *
 * It rests on `popover="auto"`, which gives it light dismiss, positioning against its
 * invoker, and — a submenu being rendered inside its parent panel — a native stack the
 * browser closes from the outside in. Its look comes from the shared `.v-panel`.
 *
 * It carries `tabindex="-1"` so it can hold the focus itself, which it does whenever the
 * menu was opened by POINTER: no command is singled out, but the keyboard still has
 * somewhere to arrive, everything below being listened for on this element.
 *
 * The JS is the ARIA menu keyboard, which the platform does not provide:
 *
 * - arrows and Home/End move focus item to item, CONFINED to the panel the focus is in — a
 *   keystroke inside a submenu also bubbles through every panel containing it, hence the
 *   guard on where the event came from;
 * - Escape closes the CURRENT LEVEL only, as does ArrowLeft in a submenu, handing focus
 *   back to the item that opened it;
 * - Tab closes the whole menu, a menu not being something one tabs through.
 */

import { computed, inject, ref } from 'vue'

import { usePopover } from '../../composables/usePopover'
import { menuInvoker, menuKey } from './context'
import type { MenuPanelPlacement } from './context'
import { arrowNavigate } from '../../utils/arrowNav'

interface MenuPanelProps {
  /** The panel's id, set by whoever owns it. It is what the trigger points at. */
  id: string
  /** Where the panel opens relative to whatever opened it. */
  placement?: MenuPanelPlacement
  /**
   * Marks this panel as a submenu, which enables the left arrow as a way back and keeps
   * the row-height settings off it, so that it inherits its parent's instead.
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

// @a11y
/**
 * Puts the focus on the panel itself, singling out no command. This is where a menu
 * opened with a pointer lands: the reader has not asked for a first choice, but the
 * keyboard still has to work from the very next keystroke — and every key below is
 * listened for on this element, so leaving the focus outside would silence all of them.
 */
function focusPanel() {
  panelEl.value?.focus()
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
  // Coming from the panel itself — a menu opened with a pointer, where no command is
  // singled out — the up arrow goes to the LAST item, entering the list from its far
  // end the way a menu is expected to. `utils/arrowNav` starts any arrow at the
  // beginning when nothing in the list has the focus, which is the right answer for the
  // tabs, the pages and the toggle group it also serves: it is this menu that has a
  // convention of its own, so it is handled here rather than in the shared helper.
  // The case only exists BECAUSE of the pointer opening: reached from an item, the
  // arrow never lands here.
  if (event.key === 'ArrowUp' && document.activeElement === panel) {
    const list = items()
    if (list.length > 0) {
      event.preventDefault()
      list[list.length - 1]?.focus()
      return
    }
  }
  // The movement itself is the shared one from `utils/arrowNav`, but it is handed OUR
  // list rather than letting it discover the items: ours also drops the disabled
  // links and stays inside this panel, neither of which the generic selector does.
  arrowNavigate(event, panel, items(), { vertical: true })
}

// The only thing set inline is an explicit width, when the prop asks for one.
const panelStyle = computed(() => (props.width ? { '--menu-width': props.width } : undefined))

// Internal to VMenu, which drives the panel from outside: opening has to be synchronous,
// and where the focus lands depends on whether a pointer or the keyboard asked.
defineExpose({
  /** Opens the panel. Pass the invoker, or the popover has no anchor to position against. */
  show,
  /** Closes it. */
  hide,
  /** Puts the focus on the first reachable item — the keyboard's way in. */
  focusFirst,
  /** Puts the focus on the panel itself — the pointer's way in, singling out no command. */
  focusPanel,
  /** The panel element, which is the popover. */
  el: panelEl,
})
</script>

<template>
  <div
    :id="id"
    ref="panelEl"
    popover="auto"
    role="menu"
    tabindex="-1"
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

  /* The panel is focusable, but only ever from code — its `tabindex` is -1, so the Tab
     key never brings anyone here. It holds the focus when the menu was opened with a
     pointer, and a ring drawn around the whole panel would then read as the reader
     having landed on something, which is the opposite of what that state means: no
     command is singled out. The rows keep their own highlight, `.v-menu-item:focus`. */
  .v-menu:focus {
    outline: none;
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
     — VCombobox and VTimeInput, anchored to a text input, have to name theirs. Like
     the width above, only the ROOT panel renders it.

     It is placed AFTER the width rule, at equal specificity, so that when both are
     given the floor wins. A trigger wider than the ceiling therefore widens the panel
     past it, a minimum width beating a maximum one — which is intended. */
  .v-menu[data-match-trigger] {
    min-inline-size: anchor-size(width);
  }
}
</style>
